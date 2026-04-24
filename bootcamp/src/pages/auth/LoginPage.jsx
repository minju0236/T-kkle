import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from "../../assets/img/logo.png";

import styles from './LoginPage.module.css';

function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: ''
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    }

    const handleLoginBtnClick = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (res.ok) {
                const token = data.token;
                localStorage.setItem('token', token);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userName', data.userName);

                alert('로그인이 완료되었습니다.');
                navigate('/');
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.log('로그인 실패:', error);
            alert('서버 오류가 발생했습니다.');
        }
    }

    return (
        <div className={styles.loginPage}>
            <div className={styles.login}>
                <img src={logo} className={styles.logoImg} alt='logo-img' />
                <div className={styles.title}>로그인</div>

                <form>
                    <label>이메일</label>
                    <input type='email' name='email' placeholder='email@example.com' onChange={handleFormChange} value={form.email}></input>

                    <label>비밀번호</label>
                    <input type='password' name='password' placeholder='1234*' onChange={handleFormChange} value={form.password}></input>

                    <button className="formBtn" type='submit' onClick={handleLoginBtnClick}>로그인</button>
                </form>

                <div className={styles.signupText}>
                    계정이 없으신가요? <span onClick={() => navigate('/signup')} className={styles.signupLink}>회원가입</span>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;