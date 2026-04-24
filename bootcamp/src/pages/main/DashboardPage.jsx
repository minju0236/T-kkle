import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './DashboardPage.module.css';

function DashboardPage() {
  const navigate = useNavigate();

  const categoryMap = {
    food: '식비',
    transport: '교통',
    shopping: '쇼핑',
    housing: '주거',
    beauty: '미용',
    medical: '의료',
    hobby: '운동',
    subscription: '구독',
    saving: '저축',
    etc: '기타'
  };
  const [rows, setRows] = useState([]);

  const handleExpenseAddBtnClick = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    navigate('/expense', { state: { mode: 'create' } });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/expenses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        console.log(data);

        setRows(data);

      } catch (error) {
        console.log('대시보드 테이블 조회 실패:', error);
        alert('서버 오류가 발생했습니다.');
      }
    }

    fetchData();
  }, []);

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.title}>간편한 지출 관리</div>
      <div className={styles.description}>일상의 지출을 기록하고 분석하여<br />더 나은 재무 습관을 만들어보세요</div>

      <button className={styles.addExpenseBtn} onClick={handleExpenseAddBtnClick}>+ 지출 추가</button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>날짜</th>
            <th className={styles.th}>카테고리</th>
            <th className={styles.th}>제목</th>
            <th className={styles.th}>설명</th>
            <th className={styles.th}>금액</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className={styles.empty}>
                지출 내역이 없습니다
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={index}
                onClick={() => navigate(`/expense/${row.id}`)}
              >
                <td>{row.date.slice(0, 10)}</td>
                <td>{categoryMap[row.category]}</td>
                <td className={styles.td}>{row.title}</td>
                <td className={styles.td}>{row.description}</td>
                <td className={styles.td}>{Number(row.amount).toLocaleString()}원</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div >
  );
}

export default DashboardPage;