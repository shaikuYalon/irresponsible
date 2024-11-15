import React, { useState } from "react";
import styles from "./ReceiptsTable.module.css";

function ReceiptsTable({ receipts, categories, editReceipt, moveToTrash, editReminder }) {
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");
  const [searchProductName, setSearchProductName] = useState("");
  const [searchStoreName, setSearchStoreName] = useState("");
  const [searchPurchaseDate, setSearchPurchaseDate] = useState("");
  const [searchYear, setSearchYear] = useState("");
 
  const filteredReceipts = receipts.filter((receipt) => {
    const matchCategory = searchCategory ? receipt.category_id.toString() === searchCategory : true;
    const matchProductName = searchProductName ? receipt.product_name.includes(searchProductName) : true;
    const matchStoreName = searchStoreName ? receipt.store_name.includes(searchStoreName) : true;
    const matchPurchaseDate = searchPurchaseDate ? receipt.purchase_date.startsWith(searchPurchaseDate) : true;
    const matchYear = searchYear ? new Date(receipt.purchase_date).getFullYear() === Number(searchYear) : true;
    return matchCategory && matchProductName && matchStoreName && matchPurchaseDate && matchYear;
});
  

  return (
    <div className={styles.tableContainer}>
      <button className={styles.filterButton} onClick={() => setIsFilterVisible(!isFilterVisible)}>
    {isFilterVisible ? "סגור סינון" : "סינון לפי"}
</button>


      {isFilterVisible && (
        <div className={styles.searchContainer}>
          <label>
            חפש לפי קטגוריה:
            <select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
              <option value="">כל הקטגוריות</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </option>
              ))}
            </select>
          </label>
          <input
            type="text"
            placeholder="חפש לפי שם המוצר"
            value={searchProductName}
            onChange={(e) => setSearchProductName(e.target.value)}
          />
          <input
            type="text"
            placeholder="חפש לפי שם החנות"
            value={searchStoreName}
            onChange={(e) => setSearchStoreName(e.target.value)}
          />
          <label>
            חפש לפי תאריך רכישה:
            <input
              type="date"
              value={searchPurchaseDate}
              onChange={(e) => setSearchPurchaseDate(e.target.value)}
            />
          </label>
          <input
            type="text"
            placeholder="חפש לפי שנה"
            value={searchYear}
            onChange={(e) => setSearchYear(e.target.value)}
          />
        </div>
      )}

      <table className={styles.receiptsTable}>
        <thead>
          <tr>
            <th>חנות</th>
            <th>מוצר</th>
            <th>תאריך רכישה</th>
            <th>תוקף אחריות</th>
            <th>קובץ קבלה</th>
            <th>תזכורת</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {filteredReceipts.length === 0 ? (
            <tr>
              <td colSpan="7" className={styles.noReceiptsMessage}>אין קבלות שמורות</td>
            </tr>
          ) : (
            filteredReceipts.map((receipt) => (
              <tr key={receipt.receipt_id}>
                <td>{receipt.store_name}</td>
                <td>{receipt.product_name}</td>
                <td>{new Date(receipt.purchase_date).toLocaleDateString()}</td>
                <td>{new Date(receipt.warranty_expiration).toLocaleDateString()}</td>
                <td>
                  {receipt.image_path && (
                    <a href={`http://localhost:5000/${receipt.image_path}`} target="_blank" rel="noopener noreferrer">
                      הצג קבלה
                    </a>
                  )}
                </td>
                <td>{receipt.reminder_days_before ? `${receipt.reminder_days_before} ימים לפני תום האחריות` : "ללא תזכורת"}</td>
                <td>
                  <div className={styles.actionButtons}>
                    <button className={`${styles.actionButton} ${styles.editButton}`} onClick={() => editReceipt(receipt)}>
                      ערוך קבלה
                    </button>
                    <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => moveToTrash(receipt.receipt_id)}>
                      מחק קבלה
                    </button>
                    {!receipt.reminder_days_before && (
                      <button className={`${styles.actionButton} ${styles.reminderButton}`} onClick={() => editReminder(receipt)}>
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
    </div>
  );
}

export default ReceiptsTable;
