import React, { useState } from "react";
import styles from "../styles/ReceiptForm.module.css";

function ReceiptForm({ onSave }) {
  const [receipt, setReceipt] = useState({
    storeName: "",
    productName: "",
    purchaseDate: "",
    warrantyExpiration: "",
    categoryId: "",
    reminderDaysBefore: "",
  });

  const handleChange = (e) => {
    setReceipt({ ...receipt, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(receipt);
  };

  return (
    <div className={styles.formContainer}>
      <h3>הוספת קבלה חדשה</h3>
      <label>
        שם החנות:
        <input type="text" name="storeName" value={receipt.storeName} onChange={handleChange} />
      </label>
      <label>
        שם המוצר:
        <input type="text" name="productName" value={receipt.productName} onChange={handleChange} />
      </label>
      <label>
        תאריך רכישה:
        <input type="date" name="purchaseDate" value={receipt.purchaseDate} onChange={handleChange} />
      </label>
      <label>
        תוקף אחריות:
        <input type="date" name="warrantyExpiration" value={receipt.warrantyExpiration} onChange={handleChange} />
      </label>
      <label>
        קטגוריה:
        <select name="categoryId" value={receipt.categoryId} onChange={handleChange}>
          <option value="">בחר קטגוריה</option>
          {/* אפשרויות קטגוריה */}
        </select>
      </label>
      <label>
        תזכורת:
        <select name="reminderDaysBefore" value={receipt.reminderDaysBefore} onChange={handleChange}>
          <option value="">בחר תזכורת</option>
          <option value="2">יומיים לפני</option>
          <option value="7">שבוע לפני</option>
          <option value="14">שבועיים לפני</option>
        </select>
      </label>
      <button onClick={handleSubmit}>שמור קבלה</button>
    </div>
  );
}

export default ReceiptForm;
