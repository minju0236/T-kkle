import { Outlet } from 'react-router-dom';

import Header from '../components/header/Header.jsx';
import Footer from '../components/footer/Footer.jsx';

import styles from './MainLayout.module.css';

function MainLayout() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.body}>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default MainLayout;