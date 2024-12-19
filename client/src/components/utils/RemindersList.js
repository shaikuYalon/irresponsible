import React, { useState } from "react";
import styles from "../ReceiptsPage.module.css";
import ReminderModal from "../ReminderModal";

function RemindersList({ receipts, editReminder, deleteReminder }) {
  const [isModalOpen, setIsModalOpen] = useState(false); // ניהול סטייט למודל
  const [selectedReceipt, setSelectedReceipt] = useState(null); // הקבלה שנבחרה לעריכה

  // פתיחת המודל עם תזכורת שנבחרה
  const handleOpenEditModal = (receipt) => {
    if (!receipt.reminder_days_before || !receipt.warranty_expiration) {
      console.error("Invalid reminder data for receipt:", receipt);
      return;
    }
    setSelectedReceipt(receipt);
    setIsModalOpen(true);
  };

  // סגירת המודל
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReceipt(null);
  };

  // שמירת התזכורת המעודכנת
  const handleSaveReminder = (updatedDays) => {
    if (selectedReceipt) {
      const updatedReceipt = { ...selectedReceipt };
  
      // אם הערך `updatedDays` תקין, נעדכן את השדה
      if (updatedDays && !isNaN(updatedDays)) {
        updatedReceipt.reminder_days_before = updatedDays;
      } else {
        console.error("Invalid reminder_days_before value");
        alert("מספר הימים לתזכורת אינו תקין.");
        return;
      }
  
      console.log("Updated reminder sent to editReminder:", updatedReceipt); // Debugging log
      editReminder(updatedReceipt); // קריאה לפונקציה לעריכת תזכורת בשרת
      setIsModalOpen(false);
      setSelectedReceipt(null);
    }
  };
  

  return (
    <div className={styles.remindersContainer}>
      <h3 className={styles.remindersTitle}>רשימת כל התזכורות</h3>
      <ul className={styles.remindersList}>
        {receipts
          .filter((receipt) => receipt.reminder_days_before) // רק קבלות עם תזכורות
          .map((receipt) => {
            const reminderDate = receipt.warranty_expiration
              ? new Date(
                  new Date(receipt.warranty_expiration) - 
                  receipt.reminder_days_before * 24 * 60 * 60 * 1000
                ).toLocaleDateString()
              : "תאריך לא תקין";

            return (
              <li key={`reminder-${receipt.receipt_id}`} className={styles.reminderItem}>
                <span>{`ב-${reminderDate} תתקבל תזכורת על כך שנותרו ${receipt.reminder_days_before} ימים עד סיום האחריות על ${receipt.product_name}`}</span>
                <div className={styles.reminderButtonGroup}>
                  <button
                    className={styles.reminderButton}
                    onClick={() => handleOpenEditModal(receipt)}
                  >
                    ערוך תזכורת
                  </button>
                  <button
                    className={styles.reminderButtonDelete}
                    onClick={() => deleteReminder(receipt.receipt_id)}
                  >
                    מחק תזכורת
                  </button>
                </div>
              </li>
            );
          })}
      </ul>

      {/* מודל לעריכת התזכורת */}
      {isModalOpen && selectedReceipt && (
        <ReminderModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveReminder}
          initialDays={selectedReceipt.reminder_days_before} // ימים קיימים
          title="ערוך תזכורת"
        />
      )}
    </div>
  );
}

export default RemindersList;
