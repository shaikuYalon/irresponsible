import React, { useState } from "react";
import styles from "./ReceiptsTable.module.css";
import ReminderModal from "../ReminderModal"; // ייבוא הקומפוננטה החדשה

function ReceiptsTable({
  receipts,
  categories,
  editReceipt,
  moveToTrash,
  addReminder,
}) {
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const handleOpenReminderModal = (receipt) => {
    setSelectedReceipt(receipt);
    setIsReminderModalOpen(true);
  };

  const handleCloseReminderModal = () => {
    setIsReminderModalOpen(false);
    setSelectedReceipt(null);
  };

  const handleSaveReminder = async (reminderDays) => {
    await addReminder(selectedReceipt, reminderDays);
    handleCloseReminderModal();
  };

  return (
    <div className={styles.tableContainer}>
      {/* טבלת קבלות */}
      <table className={styles.receiptsTable}>
        <thead>
          <tr>
            <th>חנות</th>
            <th>מוצר</th>
            <th>עלות מוצר</th>
            <th>תאריך רכישה</th>
            <th>תוקף אחריות</th>
            <th>מספר קבלה</th>
            <th>קובץ קבלה</th>
            <th>תזכורת</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {receipts.length === 0 ? (
            <tr key="no-receipts">
              <td colSpan="7" className={styles.noReceiptsMessage}>
                אין קבלות שמורות
              </td>
            </tr>
          ) : (
            receipts.map((receipt, index) => (
              <tr key={receipt.receipt_id || `receipt-${index}`}>
                <td>{receipt.store_name}</td>
                <td>{receipt.product_name}</td>
                <td>{receipt.price ? `${receipt.price} ₪` : "לא הוזן"}</td>
                <td>
                  {receipt.purchase_date
                    ? new Date(receipt.purchase_date).toLocaleDateString()
                    : "לא הוזן"}
                </td>
                <td>
                  {receipt.warranty_expiration
                    ? new Date(receipt.warranty_expiration).toLocaleDateString()
                    : "לא הוזן"}
                </td>
                <td>{receipt.receipt_number || "לא הוזן"}</td>
                <td>
                  {receipt.image_path ? (
                    <a
                      href={`${receipt.image_path}?alt=media`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      הצג קבלה
                    </a>
                  ) : (
                    <span>אין קבלה</span>
                  )}
                </td>
                <td>
                  {receipt.reminder_days_before
                    ? `${receipt.reminder_days_before} ימים לפני תום האחריות`
                    : "ללא תזכורת"}
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button
                      className={`${styles.actionButton} ${styles.editButton}`}
                      onClick={() => editReceipt(receipt)}
                    >
                      ערוך קבלה
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={() => moveToTrash(receipt.receipt_id)}
                    >
                      מחק קבלה
                    </button>
                    {!receipt.reminder_days_before && (
                      <button
                        className={`${styles.actionButton} ${styles.reminderButton}`}
                        onClick={() => handleOpenReminderModal(receipt)}
                      >
                        הוסף תזכורת
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* שימוש בקומפוננטה ReminderModal */}
      {selectedReceipt && (
        <ReminderModal
          open={isReminderModalOpen}
          onClose={handleCloseReminderModal}
          onSave={handleSaveReminder}
          title="הוסף תזכורת" // כותרת למודל
        />
      )}
    </div>
  );
}

export default ReceiptsTable;
