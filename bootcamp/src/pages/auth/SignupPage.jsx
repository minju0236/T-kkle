import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from "../../assets/img/logo.png";

import styles from './SignupPage.module.css';

function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    name: '',
    password: ''
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmitBtnClick = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.ok) {
        alert('회원가입이 완료되었습니다.');
        navigate('/login');
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log('회원가입 실패:', error);
      alert('서버 오류가 발생했습니다.');
    }
  }

  return (
    <div className={styles.signupPage}>
      <div className={styles.signup}>
        <img src={logo} className={styles.logoImg} alt='logo-img' />
        <div className={styles.title}>회원가입</div>

        <form>
          <label>이메일</label>
          <input type='email' name='email' placeholder='email@example.com' value={form.email} onChange={handleFormChange}></input>

          <label>이름</label>
          <input type='text' name='name' placeholder='티끌이' value={form.name} onChange={handleFormChange}></input>

          <label>비밀번호</label>
          <input type='password' name='password' placeholder='1234*' value={form.password} onChange={handleFormChange}></input>

          <button className="formBtn" type='submit' onClick={handleSubmitBtnClick}>회원가입</button>
        </form>

        <div className={styles.loginText}>
          이미 계정이 있으신가요? <span onClick={() => navigate('/login')} className={styles.loginLink}>로그인</span>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;