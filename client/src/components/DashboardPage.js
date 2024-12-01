import React from "react";
import styles from "./DashboardPage.module.css";
import { useNavigate } from "react-router-dom";



function DashboardPage({ username }) {
  const navigate = useNavigate();

  const handleReceiptsAndRemindersClick = () => {
    navigate("/receipts");
  };

  const handleAddReceiptClick = () => {
    navigate("/receipts", { state: { openAddForm: true } }); // ניתוב עם פרמטר
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.dashboardHeader}>
        <h2>ברוך הבא! {username}</h2>
        <p>ניהול האחריות שלך במקום אחד</p>
      </header>
      <div className={styles.dashboardLinks}>
        <button
          className={styles.addReceiptButton}
          onClick={handleAddReceiptClick}
          title="הוספת קבלה חדשה"
        >
          +
        </button>

        <button
          className={styles.dashboardButton}
          onClick={handleReceiptsAndRemindersClick}
        >
          ניהול קבלות ותזכורות
        </button>
        <button className={styles.dashboardButton} onClick={handleProfileClick}>
          פרופיל
        </button>
        <button
          className={styles.dashboardButton}
          onClick={handleSettingsClick}
        >
          הגדרות
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;
