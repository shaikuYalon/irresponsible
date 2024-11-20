import React from "react";
import styles from "../ReceiptsPage.module.css"; 

function RemindersList({ receipts, editReminder, deleteReminder }) {
  return (
    <div className={styles.remindersContainer}>
      <h3 className={styles.remindersTitle}>רשימת כל התזכורות</h3>
      <ul className={styles.remindersList}>
        {receipts
          .filter((receipt) => receipt.reminder_days_before)
          .map((receipt) => {
            const reminderDate = new Date(
              new Date(receipt.warranty_expiration) -
              receipt.reminder_days_before * 24 * 60 * 60 * 1000
            );
            return (
              <li key={`reminder-${receipt.receipt_id}`} className={styles.reminderItem}>
                <span>{`ב-${reminderDate.toLocaleDateString()} תתקבל תזכורת על כך שנותרו ${receipt.reminder_days_before} ימים עד סיום האחריות על ${receipt.product_name}`}</span>
                <div className={styles.reminderButtonGroup}>
                  <button className={styles.reminderButton} onClick={() => editReminder(receipt)}>ערוך תזכורת</button>
                  <button className={styles.reminderButtonDelete} onClick={() => deleteReminder(receipt.receipt_id)}>מחק תזכורת</button>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default RemindersList;
