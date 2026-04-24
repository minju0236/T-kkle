import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import logo from "../../assets/img/logo.png";

import styles from './ExpensePage.module.css';

function ExpensePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const [mode, setMode] = useState(location.state?.mode || 'read'); // read || create || edit
    const [form, setForm] = useState({
        category: 'food',
        title: '',
        description: '',
        amount: ''
    });
    const [isOwner, setIsOwner] = useState(false);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleEditBtnClick = () => {
        setMode('edit');
    };

    const handleDeleteBtnClick = async () => {
        const ok = window.confirm('해당 지출을 삭제하시겠습니까?');
        if (!ok) return;

        try {
            const token = localStorage.getItem('token');

            const res = await fetch(`http://localhost:3000/api/expenses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                alert('삭제가 완료되었습니다.');
                navigate('/');
            } else {
                console.log(data.message);
            }

        } catch (error) {
            console.log('삭제 실패:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    const handleSubmitBtnClick = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            const url =
                mode === 'edit'
                    ? `http://localhost:3000/api/expenses/${id}`
                    : `http://localhost:3000/api/expenses`;

            const method = mode === 'edit' ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (res.ok) {
                alert(mode === 'edit' ? '수정 완료되었습니다.' : '지출 기록이 완료되었습니다.');
                navigate('/');
            } else {
                console.log(data.message);
            }

        } catch (error) {
            console.log('요청 실패:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log(token);

                const res = await fetch(`http://localhost:3000/api/expenses/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.log('에러 응답:', text);
                    console.log('status:', res.status);
                    return;
                }

                const data = await res.json();

                setForm({
                    category: data.category ?? 'food',
                    title: data.title ?? '',
                    description: data.description ?? '',
                    amount: String(Math.floor(data.amount ?? 0))
                });

                const userId = Number(localStorage.getItem('userId'));
                setIsOwner(Number(data.user_id) === Number(userId));

            } catch (error) {
                console.log('조회 실패:', error);
                alert('서버 오류가 발생했습니다.');
            }
        };

        fetchData();
    }, [id]);

    return (
        <div className={styles.loginPage}>
            <div className={styles.login}>
                <img src={logo} className={styles.logoImg} alt='logo-img' />
                {mode === 'read'
                    ? <div className={styles.title}>지출 기록</div>
                    : mode === 'create'
                        ? <div className={styles.title}>지출 추가</div>
                        : <div className={styles.title}>지출 수정</div>
                }
                <button className={styles.backBtn} onClick={() => navigate(-1)}>뒤로가기</button>

                <form onSubmit={handleSubmitBtnClick}>
                    <label>카테고리</label>
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleFormChange}
                        disabled={mode !== 'edit' && mode !== 'create'}
                    >
                        <option value="food">식비</option>
                        <option value="transport">교통</option>
                        <option value="shopping">쇼핑</option>
                        <option value="housing">주거</option>
                        <option value="beauty">미용</option>
                        <option value="medical">의료</option>
                        <option value="hobby">운동</option>
                        <option value="subscription">구독</option>
                        <option value="saving">저축</option>
                        <option value="etc">기타</option>
                    </select>

                    <label>제목</label>
                    <input
                        type='text'
                        name='title'
                        value={form.title}
                        onChange={handleFormChange}
                        placeholder='점심'
                        disabled={mode !== 'edit' && mode !== 'create'}
                    />

                    <label>설명</label>
                    <input
                        type='text'
                        name='description'
                        value={form.description}
                        onChange={handleFormChange}
                        placeholder='구내식당'
                        disabled={mode !== 'edit' && mode !== 'create'}
                    />

                    <label>금액</label>
                    <input
                        type="text"
                        value={form.amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        placeholder="8,000원"
                        onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            setForm(prev => ({
                                ...prev,
                                amount: raw
                            }));
                        }}
                        disabled={mode !== 'edit' && mode !== 'create'}
                    />

                    {mode === 'read' ? (
                        isOwner && (
                            <div className={styles.actions}>
                                <button
                                    className={styles.deleteBtn}
                                    type="button"
                                    onClick={handleDeleteBtnClick}
                                >
                                    삭제
                                </button>
                                <button
                                    className={styles.editBtn}
                                    type="button"
                                    onClick={handleEditBtnClick}
                                >
                                    수정
                                </button>
                            </div>
                        )
                    ) : (
                        <button className="formBtn" type="submit">완료</button>
                    )}
                </form>
            </div>
        </div>
    );
}

export default ExpensePage;