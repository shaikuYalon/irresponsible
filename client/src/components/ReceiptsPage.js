import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ReceiptsPage.module.css";

function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]); // מצב לשמירת רשימת הקבלות
  const [categories, setCategories] = useState([]); // מצב לשמירת רשימת הקטגוריות
  const [trashReceipts, setTrashReceipts] = useState([]); // מצב לשמירת רשימת הקבלות שנמחקו
  const [newReceipt, setNewReceipt] = useState({
    userId: JSON.parse(localStorage.getItem("userId")),
    categoryId: "",
    storeName: "",
    purchaseDate: "",
    productName: "",
    warrantyExpiration: "",
    image: null,
    reminderDaysBefore: "",
  }); // מצב לשמירת פרטי הקבלה החדשה
  const [showReceipts, setShowReceipts] = useState(false);
  const [showTrash, setShowTrash] = useState(false); // מצב להצגת קבלות שנמחקו
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [editReceiptId, setEditReceiptId] = useState(null);

  const today = new Date().toISOString().split("T")[0]; // משתנה לשמירת תאריך היום בפורמט המתאים

  const fetchReceipts = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const response = await axios.get(`http://localhost:5000/api/receipts?userId=${userId}`);
      setReceipts(response.data);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  };

  const fetchTrashReceipts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/trash");
      setTrashReceipts(response.data);
    } catch (error) {
      console.error("Error fetching trash receipts:", error);
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
    fetchTrashReceipts();
  }, []);

  const toggleReceipts = () => {
    setShowReceipts(!showReceipts);
    setShowAddForm(false);
    setShowReminders(false);
    setShowTrash(false);
    if (!showReceipts) fetchReceipts();
  };

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    setShowReceipts(false);
    setShowReminders(false);
    setShowTrash(false);
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
    setShowTrash(false);
    if (receipts.length === 0) {
      fetchReceipts();
    }
  };

  const toggleTrash = () => {
    setShowTrash(!showTrash);
    setShowReceipts(false);
    setShowAddForm(false);
    setShowReminders(false);
    if (!showTrash) fetchTrashReceipts();
  };

  const handlePurchaseDateChange = (e) => {
    setNewReceipt({ ...newReceipt, purchaseDate: e.target.value });
  };

  const handleWarrantyExpirationChange = (e) => {
    setNewReceipt({ ...newReceipt, warrantyExpiration: e.target.value });
  };

  const addOrUpdateReceipt = async () => {
    if (isAddingReminder) {
      await addReminder(editReceiptId);
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
      fetchReceipts();
    } catch (error) {
      console.error("Error adding reminder:", error);
    }
  };

  const editReceipt = (receipt) => {
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

  const deleteReminder = async (receiptId) => {
    try {
        await axios.put(`http://localhost:5000/api/receipts/${receiptId}/reminder`);
        console.log("Reminder deleted successfully");
        fetchReceipts(); // רענן את הרשימה לאחר מחיקה
    } catch (error) {
        console.error("Error deleting reminder:", error);
    }
};


  const editReminder = (receipt) => {
    setIsEditing(false);
    setIsAddingReminder(true);
    setEditReceiptId(receipt.receipt_id);
    setNewReceipt((prev) => ({
      ...prev,
      reminderDaysBefore: receipt.reminder_days_before || "",
    }));
    setShowAddForm(true);
    setShowReceipts(false);
  };

  const moveToTrash = async (receiptId) => {
    try {
      await axios.put(`http://localhost:5000/api/receipts/${receiptId}/trash`);
      setReceipts(receipts.filter((r) => r.receipt_id !== receiptId));
      fetchTrashReceipts();
      console.log("Receipt moved to trash");
    } catch (error) {
      console.error("Error moving receipt to trash:", error);
    }
  };

  const restoreReceipt = async (receiptId) => {
    try {
      await axios.put(`http://localhost:5000/api/receipts/restore/${receiptId}`);
      fetchTrashReceipts();
      fetchReceipts();
      console.log("Receipt restored successfully");
    } catch (error) {
      console.error("Error restoring receipt:", error);
    }
  };

  const permanentlyDeleteReceipt = async (receiptId) => {
    try {
      await axios.delete(`http://localhost:5000/api/trash/${receiptId}`);
      fetchTrashReceipts();
      console.log("Receipt permanently deleted");
    } catch (error) {
      console.error("Error permanently deleting receipt:", error);
    }
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
        <button className={styles.actionButton} onClick={toggleTrash}>
          {showTrash ? "הסתר זבל" : "הצגת זבל"}
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
                <th>קובץ קבלה</th>
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
                          הצג קבלה
                        </a>
                      )}
                    </td>
                    <td>{receipt.reminder_days_before ? `${receipt.reminder_days_before} ימים לפני תום האחריות` : "ללא תזכורת"}</td>
                    <td>
                      <button onClick={() => editReceipt(receipt)}>ערוך קבלה</button>
                      <button onClick={() => moveToTrash(receipt.receipt_id)}>מחק קבלה</button>
                      {!receipt.reminder_days_before && (
                        <button onClick={() => editReminder(receipt)}>הוסף תזכורת</button>
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
      )}

      {showTrash && (
        <div>
          <h3>קבלות שנמחקו</h3>
          {trashReceipts.length === 0 ? (
            <p>אין קבלות בזבל</p>
          ) : (
            <table className={styles.trashTable}>
              <thead>
                <tr>
                  <th>חנות</th>
                  <th>מוצר</th>
                  <th>תאריך רכישה</th>
                  <th>פעולות</th>
                </tr>
              </thead>
              <tbody>
                {trashReceipts.map((receipt) => (
                  <tr key={receipt.receipt_id}>
                    <td>{receipt.store_name}</td>
                    <td>{receipt.product_name}</td>
                    <td>{new Date(receipt.purchase_date).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => restoreReceipt(receipt.receipt_id)}>שחזר</button>
                      <button onClick={() => permanentlyDeleteReceipt(receipt.receipt_id)}>מחק לצמיתות</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showAddForm && (
        <div className={styles.addReceiptForm}>
          <h3>{isEditing ? "עריכת קבלה" : isAddingReminder ? "הוספת תזכורת" : "הוספת קבלה חדשה"}</h3>
          {isAddingReminder ? (
            <select
              value={newReceipt.reminderDaysBefore || ""}
              onChange={(e) => setNewReceipt({ ...newReceipt, reminderDaysBefore: e.target.value || null })}
            >
              <option value="">בחר תזכורת</option>
              <option value="2">יומיים לפני</option>
              <option value="7">שבוע לפני</option>
              <option value="14">שבועיים לפני</option>
            </select>
          ) : (
            <>
              <label>
                שם החנות:
                <input
                  type="text"
                  placeholder="שם החנות"
                  value={newReceipt.storeName}
                  onChange={(e) => setNewReceipt({ ...newReceipt, storeName: e.target.value })}
                />
              </label>
              
              <label>
                שם המוצר:
                <input
                  type="text"
                  placeholder="שם המוצר"
                  value={newReceipt.productName}
                  onChange={(e) => setNewReceipt({ ...newReceipt, productName: e.target.value })}
                />
              </label>

              <label>
                קטגוריה:
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
              </label>

              <label>
                תאריך רכישה:
                <input
                  type="date"
                  placeholder="תאריך רכישה"
                  value={newReceipt.purchaseDate}
                  onChange={handlePurchaseDateChange}
                  max={today}
                />
              </label>

              <label>
                תוקף אחריות:
                <input
                  type="date"
                  placeholder="תוקף אחריות"
                  value={newReceipt.warrantyExpiration}
                  onChange={handleWarrantyExpirationChange}
                  min={newReceipt.purchaseDate || today}
                />
              </label>

              <label>
                העלאת קבלה:
                <input
                  type="file"
                  placeholder="קובץ הקבלה"
                  onChange={(e) => setNewReceipt({ ...newReceipt, image: e.target.files[0] })}
                />
              </label>

              <label>
                תזכורת:
                <select
                  value={newReceipt.reminderDaysBefore || ""}
                  onChange={(e) => setNewReceipt({ ...newReceipt, reminderDaysBefore: e.target.value || null })}
                >
                  <option value="">בחר תזכורת</option>
                  <option value="2">יומיים לפני</option>
                  <option value="7">שבוע לפני</option>
                  <option value="14">שבועיים לפני</option>
                </select>
              </label>
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
