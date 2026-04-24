const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'my_super_secret_key';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'testuser',
    password: '1234',
    database: 'minjudb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true
});

// 토큰 기반 인증 미들웨어
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '토큰 없음' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ message: '토큰 오류' });
    }
}

// 로그인
app.post('/api/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        email = email?.trim();
        password = password?.trim();

        if (!email) {
            return res.status(400).json({
                success: false,
                message: '이메일을 입력해야 합니다.'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: '비밀번호를 입력해야 합니다.'
            });
        }

        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '존재하지 않는 이메일입니다.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: '비밀번호가 올바르지 않습니다.'
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                userName: user.name
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            success: true,
            token,
            userId: user.id,
            userName: user.name
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 회원가입
app.post('/api/signup', async (req, res) => {
    try {
        let { email, name, password } = req.body;

        email = email?.trim();
        name = name?.trim();
        password = password?.trim();

        if (!email) {
            return res.status(400).json({ success: false, message: '이메일을 입력해야 합니다.' });
        }

        if (!name) {
            return res.status(400).json({ success: false, message: '이름을 입력해야 합니다.' });
        }

        if (!password) {
            return res.status(400).json({ success: false, message: '비밀번호를 입력해야 합니다.' });
        }

        if (password.length < 4) {
            return res.status(400).json({ success: false, message: '비밀번호는 최소 4자 이상이어야 합니다.' });
        }

        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: '이미 가입된 이메일입니다.'
            });
        }

        const hashed = await bcrypt.hash(password, 10);

        await pool.execute(
            'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
            [email, name, hashed]
        );

        res.status(201).json({ success: true });

    } catch (err) {
        console.error('회원가입 실패:', err);
        res.status(500).json({ success: false });
    }
});

// 지출 조회
app.get('/api/expenses', async (req, res) => {
    try {
        const sql = `
            SELECT
                id,
                created_at AS date,
                category,
                title,
                description,
                amount
            FROM expenses
            ORDER BY id DESC
        `;

        const [rows] = await pool.execute(sql);
        res.json(rows);
    } catch (err) {
        console.error('조회 실패:', err);
        res.status(500).json({ message: '조회 실패' });
    }
});

// 특정 지출 조회 
app.get('/api/expenses/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;

    try {
        const sql = `
            SELECT
                id,
                user_id,
                created_at AS date,
                category,
                title,
                description,
                amount
            FROM expenses
            WHERE id = ?
        `;

        const [rows] = await pool.execute(sql, [id]);

        res.json(rows[0]);
    } catch (err) {
        console.error('조회 실패:', err);
        res.status(500).json({ message: '조회 실패' });
    }
});

// 지출 등록
app.post('/api/expenses', authMiddleware, async (req, res) => {
    const { category, title, description, amount } = req.body;
    const userId = req.user.userId;

    if (!category) {
        return res.status(400).json({ success: false, message: '카테고리를 입력해야 합니다.' });
    }

    if (!title) {
        return res.status(400).json({ success: false, message: '제목을 입력해야 합니다.' });
    }

    if (!description) {
        return res.status(400).json({ success: false, message: '설명을 입력해야 합니다.' });
    }

    if (amount === undefined || amount === null || amount === '') {
        return res.status(400).json({ success: false, message: '금액을 입력해야 합니다.' });
    }

    try {
        await pool.execute(
            `
            INSERT INTO expenses (user_id, category, title, description, amount)
            VALUES (?, ?, ?, ?, ?)
            `,
            [userId, category, title, description, amount]
        );

        res.status(201).json({ success: true, message: '지출이 등록되었습니다.' });
    } catch (err) {
        console.error('등록 실패:', err);
        res.status(500).json({ success: false, message: '지출 등록 중 오류가 발생했습니다.' });
    }
});

// 지출 수정
app.put('/api/expenses/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    const { category, title, description, amount } = req.body;
    const userId = req.body.userId;

    try {
        await pool.execute(
            `
            UPDATE expenses
            SET category = ?, title = ?, description = ?, amount = ?
            WHERE id = ?
            `,
            [category, title, description, amount, id]
        );

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('수정 실패:', err);
        res.status(500).json({ success: false });
    }
});

// 지출 삭제
app.delete('/api/expenses/:id', authMiddleware, async (req, res) => {
    const id = req.params.id;
    const userId = req.user.userId;

    try {
        const [result] = await pool.execute(
            `
            DELETE FROM expenses
            WHERE id = ? AND user_id = ?
            `,
            [id, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(403).json({ message: '삭제 권한이 없습니다.' });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('삭제 실패:', err);
        res.status(500).json({ message: '삭제 실패' });
    }
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.get('/*rest', function (req, res) {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.listen(PORT, function () {
    console.log('서버 실행: http://localhost:' + PORT);
});