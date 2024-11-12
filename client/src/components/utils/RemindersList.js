// RemindersList.js
// הצגת רשימת תזכורות

import React from "react";
import styles from "../ReceiptsPage.module.css";

function RemindersList({ receipts, editReminder, deleteReminder }) {
  return (
    <div>
      <h3>רשימת כל התזכורות</h3>
      <ul>
        {receipts
          .filter((receipt) => receipt.reminder_days_before)
          .map((receipt) => {
            const reminderDate = new Date(new Date(receipt.warranty_expiration) - receipt.reminder_days_before * 24 * 60 * 60 * 1000);
            return (
              <li key={receipt.receipt_id} className={styles.reminderItem}>
                <span>{`ב-${reminderDate.toLocaleDateString()} תתקבל תזכורת על כך שנותרו ${receipt.reminder_days_before} ימים עד סיום האחריות על ${receipt.product_name}`}</span>
                <div className={styles.buttonGroup}>
                  <button onClick={() => editReminder(receipt)}>ערוך תזכורת</button>
                  <button onClick={() => deleteReminder(receipt.receipt_id)}>מחק תזכורת</button>
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default RemindersList;
