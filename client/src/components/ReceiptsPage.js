import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ReceiptsPage.module.css";

function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newReceipt, setNewReceipt] = useState({
    userId: JSON.parse(localStorage.getItem("userId")),
    categoryId: "",
    storeName: "",
    purchaseDate: "",
    productName: "",
    warrantyExpiration: "",
    image: null,
    reminderDaysBefore: "",
  });
  const [showReceipts, setShowReceipts] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [editReceiptId, setEditReceiptId] = useState(null);

  const fetchReceipts = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const response = await axios.get(`http://localhost:5000/api/receipts?userId=${userId}`);
      setReceipts(response.data);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleReceipts = () => {
    setShowReceipts(!showReceipts);
    setShowAddForm(false);
    setShowReminders(false);
    if (!showReceipts) fetchReceipts();
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setShowReceipts(false);
    setShowReminders(false);
    setIsEditing(false);
    setIsAddingReminder(false);
    setNewReceipt({
      userId: JSON.parse(localStorage.getItem("userId")),
      categoryId: "",
      storeName: "",
      purchaseDate: "",
      productName: "",
      warrantyExpiration: "",
      image: null,
      reminderDaysBefore: "",
    });
  };

  const toggleReminders = () => {
    setShowReminders(!showReminders);
    setShowReceipts(false);
    setShowAddForm(false);
  };

  const addOrUpdateReceipt = async () => {
    if (isAddingReminder) {
      addReminder(editReceiptId);
      setShowAddForm(false);
      return;
    }

    const formData = new FormData();
    formData.append("userId", newReceipt.userId || "");
    formData.append("categoryId", newReceipt.categoryId || "");
    formData.append("storeName", newReceipt.storeName || "");
    formData.append("purchaseDate", newReceipt.purchaseDate || "");
    formData.append("productName", newReceipt.productName || "");
    formData.append("warrantyExpiration", newReceipt.warrantyExpiration || "");
    formData.append("reminderDaysBefore", newReceipt.reminderDaysBefore || "");

    if (newReceipt.image) {
      formData.append("image", newReceipt.image);
    }

    try {
      if (isEditing && editReceiptId) {
        await axios.put(`http://localhost:5000/api/receipts/${editReceiptId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Receipt updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/receipts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Receipt added successfully");
      }
      setShowAddForm(false);
      fetchReceipts();
    } catch (error) {
      console.error("Error adding or updating receipt:", error);
    }
  };

  const addReminder = async (receiptId) => {
    try {
      await axios.post("http://localhost:5000/api/reminders", {
        userId: JSON.parse(localStorage.getItem("userId")),
        receiptId: receiptId,
        reminderDaysBefore: newReceipt.reminderDaysBefore,
      });
      console.log("Reminder added successfully");
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  };

  const handleEditClick = (receipt) => {
    setIsEditing(true);
    setIsAddingReminder(false);
    setEditReceiptId(receipt.receipt_id);
    setNewReceipt({
      userId: receipt.user_id,
      categoryId: receipt.category_id,
      storeName: receipt.store_name,
      purchaseDate: new Date(receipt.purchase_date).toISOString().split("T")[0],
      productName: receipt.product_name,
      warrantyExpiration: new Date(receipt.warranty_expiration).toISOString().split("T")[0],
      image: null,
      reminderDaysBefore: receipt.reminder_days_before || "",
    });
    setShowAddForm(true);
    setShowReceipts(false);
  };

  const handleDeleteClick = async (receipt) => {
    try {
      await axios.delete(`http://localhost:5000/api/receipts/${receipt.receipt_id}`);
      setReceipts(receipts.filter((r) => r.receipt_id !== receipt.receipt_id));
    } catch (error) {
      console.error("Error deleting receipt:", error);
    }
  };

  const handleAddReminderClick = (receiptId) => {
    setEditReceiptId(receiptId);
    setIsEditing(false);
    setIsAddingReminder(true);
    setShowAddForm(true);
    setNewReceipt((prev) => ({
      ...prev,
      reminderDaysBefore: "",
    }));
  };

  return (
    <div className={styles.container}>
      <h2>ניהול קבלות ותזכורות</h2>

      <div className={styles.actionButtons}>
        <button className={styles.actionButton} onClick={toggleReceipts}>
          {showReceipts ? "הסתר קבלות" : "הצגת כל הקבלות"}
        </button>
        <button className={styles.actionButton} onClick={toggleAddForm}>
          {showAddForm ? "ביטול הוספת קבלה" : "הוספת קבלה חדשה"}
        </button>
        <button className={styles.actionButton} onClick={toggleReminders}>
          {showReminders ? "הסתר תזכורות" : "הצגת כל התזכורות"}
        </button>
      </div>

      {showReceipts && (
        <div className={styles.tableContainer}>
          <table className={styles.receiptsTable}>
            <thead>
              <tr>
                <th>חנות</th>
                <th>מוצר</th>
                <th>תאריך רכישה</th>
                <th>תוקף אחריות</th>
                <th>תמונה</th>
                <th>תזכורת</th>
                <th>פעולות</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.noReceiptsMessage}>אין קבלות שמורות</td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr key={receipt.receipt_id}>
                    <td>{receipt.store_name}</td>
                    <td>{receipt.product_name}</td>
                    <td>{new Date(receipt.purchase_date).toLocaleDateString()}</td>
                    <td>{new Date(receipt.warranty_expiration).toLocaleDateString()}</td>
                    <td>
                      {receipt.image_path && (
                        <a href={`http://localhost:5000/${receipt.image_path}`} target="_blank" rel="noopener noreferrer">
                          הצג תמונה
                        </a>
                      )}
                    </td>
                    <td>{receipt.reminder_days_before ? `${receipt.reminder_days_before} ימים לפני תום האחריות` : "ללא תזכורת"}</td>
                    <td>
                      <button onClick={() => handleEditClick(receipt)}>עריכה</button>
                      <button onClick={() => handleDeleteClick(receipt)}>מחיקה</button>
                      {!receipt.reminder_days_before && (
                        <button onClick={() => handleAddReminderClick(receipt.receipt_id)}>הוסף תזכורת</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showReminders && (
        <div>
          <h3>רשימת כל התזכורות</h3>
          <ul>
            {receipts
              .filter((receipt) => receipt.reminder_days_before)
              .map((receipt) => (
                <li key={receipt.receipt_id}>
                  {`${receipt.product_name} - תזכורת ${receipt.reminder_days_before} ימים לפני תום האחריות`}
                  <button onClick={() => handleEditClick(receipt)}>ערוך</button>
                  <button onClick={() => handleDeleteClick(receipt)}>מחק</button>
                </li>
              ))}
          </ul>
        </div>
      )}

      {showAddForm && (
        <div className={styles.addReceiptForm}>
          <h3>{isEditing ? "עריכת קבלה" : isAddingReminder ? "הוספת תזכורת" : "הוספת קבלה חדשה"}</h3>
          {isAddingReminder ? (
            <select
              value={newReceipt.reminderDaysBefore || ""}
              onChange={(e) => setNewReceipt({ ...newReceipt, reminderDaysBefore: e.target.value })}
            >
              <option value="">בחר תזכורת</option>
              <option value="2">יומיים לפני</option>
              <option value="7">שבוע לפני</option>
              <option value="14">שבועיים לפני</option>
            </select>
          ) : (
            <>
              <input
                type="text"
                placeholder="שם החנות"
                value={newReceipt.storeName}
                onChange={(e) => setNewReceipt({ ...newReceipt, storeName: e.target.value })}
              />
              <input
                type="text"
                placeholder="שם המוצר"
                value={newReceipt.productName}
                onChange={(e) => setNewReceipt({ ...newReceipt, productName: e.target.value })}
              />
              <select
                value={newReceipt.categoryId}
                onChange={(e) => setNewReceipt({ ...newReceipt, categoryId: e.target.value })}
              >
                <option value="">בחר קטגוריה</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                placeholder="תאריך רכישה"
                value={newReceipt.purchaseDate}
                onChange={(e) => setNewReceipt({ ...newReceipt, purchaseDate: e.target.value })}
              />
              <input
                type="date"
                placeholder="תוקף אחריות"
                value={newReceipt.warrantyExpiration}
                onChange={(e) => setNewReceipt({ ...newReceipt, warrantyExpiration: e.target.value })}
              />
              <input
                type="file"
                placeholder="תמונה"
                onChange={(e) => setNewReceipt({ ...newReceipt, image: e.target.files[0] })}
              />
              <select
                value={newReceipt.reminderDaysBefore || ""}
                onChange={(e) => setNewReceipt({ ...newReceipt, reminderDaysBefore: e.target.value })}
              >
                <option value="">בחר תזכורת</option>
                <option value="2">יומיים לפני</option>
                <option value="7">שבוע לפני</option>
                <option value="14">שבועיים לפני</option>
              </select>
            </>
          )}
          <button onClick={addOrUpdateReceipt}>
            {isEditing || isAddingReminder ? "שמור שינויים" : "הוסף קבלה"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ReceiptsPage;
