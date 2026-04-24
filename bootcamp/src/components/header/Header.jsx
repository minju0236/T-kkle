import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import logo from "../../assets/img/logo.png";

import styles from "./Header.module.css"

function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('사용자');

  const handleLogoutBtnClick = () => {
    localStorage.clear();
    navigate('/');
  }

  useEffect(() => {
    const fetchData = () => {
      try {
        const token = localStorage.getItem('token');

        if (token) {
          setIsAuthenticated(true);

          const userName = localStorage.getItem('userName');
          setUserName(userName);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    }

    fetchData();
  }, [location]);

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={() => navigate('/')}>
        <img src={logo} className={styles.logoImg} />
        <div className={styles.logoName}>T-kkle</div>
      </div>

      {isAuthenticated === false
        ? <div className={styles.startBtn} onClick={() => navigate('/login')}>시작하기</div>
        : <div className={styles.userInfo}>
          <div>{userName}님</div>
          <div className={styles.startBtn} onClick={handleLogoutBtnClick}>로그아웃</div>
        </div>
      }


    </header>
  );
}

export default Header;