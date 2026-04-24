import { Link, Outlet, useLocation } from 'react-router-dom';

import logo from "../../assets/img/logo.png";

import styles from "./Footer.module.css"

function Footer() {
  const location = useLocation();

  return (
      <footer>
        <div>© 2026 지출 관리 시스템 - 이민주</div>
      </footer>
  );
}

export default Footer;