import React, { useEffect, useState } from "react";
import axios from "axios";
import ReceiptsTable from "./utils/ReceiptsTable";
import RemindersList from "./utils/RemindersList";
// import editReceipt from "./utils/editReceipt";
import styles from "./ReceiptsPage.module.css";


function ReceiptsPage() {
  // הגדרת מצבים שונים לשמירת הנתונים ולהצגת התצוגות
  const [receipts, setReceipts] = useState([]); // רשימת הקבלות
  const [categories, setCategories] = useState([]); // רשימת הקטגוריות
  const [trashReceipts, setTrashReceipts] = useState([]); // קבלות שנמחקו
  const [newReceipt, setNewReceipt] = useState({
    userId: JSON.parse(localStorage.getItem("userId")),
    categoryId: "",
    storeName: "",
    purchaseDate: "",
    productName: "",
    warrantyExpiration: "",
    image: null,
    reminderDaysBefore: "",
  }); // פרטי קבלה חדשה
  const [showReceipts, setShowReceipts] = useState(false); // הצגת קבלות
  const [showTrash, setShowTrash] = useState(false); // הצגת קבלות שנמחקו
  const [showAddForm, setShowAddForm] = useState(false); // הצגת טופס הוספת קבלה
  const [showReminders, setShowReminders] = useState(false); // הצגת תזכורות
  const [isEditing, setIsEditing] = useState(false); // מצב עריכת קבלה
  const [isAddingReminder, setIsAddingReminder] = useState(false); // מצב הוספת תזכורת
  const [editReceiptId, setEditReceiptId] = useState(null); // מזהה קבלה לעריכה

  const today = new Date().toISOString().split("T")[0]; // משתנה לשמירת תאריך היום בפורמט ISO

  // שליפת הקבלות מהשרת
  const fetchReceipts = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      const response = await axios.get(`http://localhost:5000/api/receipts?userId=${userId}`);
      setReceipts(response.data);
    } catch (error) {
      console.error("שגיאה בשליפת קבלות:", error);
    }
  };

  // שליפת קבלות שנמחקו
  const fetchTrashReceipts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/trash");
      setTrashReceipts(response.data);
    } catch (error) {
      console.error("שגיאה בשליפת קבלות שנמחקו:", error);
    }
  };

  // שליפת קטגוריות
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("שגיאה בשליפת קטגוריות:", error);
    }
  };

  // הפעלת שליפות של קטגוריות וקבלות שנמחקו בעת טעינת הקומפוננטה
  useEffect(() => {
    fetchCategories();
    fetchTrashReceipts();
  }, []);

  // הצגת רשימת קבלות והסתרת תצוגות אחרות
  const toggleReceipts = () => {
    setShowReceipts(!showReceipts);
    setShowAddForm(false);
    setShowReminders(false);
    setShowTrash(false);
    if (!showReceipts) fetchReceipts();
  };

  // הצגת טופס הוספת קבלה והסתרת תצוגות אחרות
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

  // הצגת תזכורות והסתרת תצוגות אחרות
  const toggleReminders = () => {
    setShowReminders(!showReminders);
    setShowReceipts(false);
    setShowAddForm(false);
    setShowTrash(false);
    if (receipts.length === 0) {
      fetchReceipts();
    }
  };

  // הצגת קבלות שנמחקו והסתרת תצוגות אחרות
  const toggleTrash = () => {
    setShowTrash(!showTrash);
    setShowReceipts(false);
    setShowAddForm(false);
    setShowReminders(false);
    if (!showTrash) fetchTrashReceipts();
  };

  // עדכון תאריך רכישה
  const handlePurchaseDateChange = (e) => {
    setNewReceipt({ ...newReceipt, purchaseDate: e.target.value });
  };

  // עדכון תוקף אחריות
  const handleWarrantyExpirationChange = (e) => {
    setNewReceipt({ ...newReceipt, warrantyExpiration: e.target.value });
  };

  // הוספה או עדכון של קבלה
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
        console.log("הקבלה עודכנה בהצלחה");
      } else {
        await axios.post("http://localhost:5000/api/receipts", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("הקבלה נוספה בהצלחה");
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
      console.error("שגיאה בהוספה או עדכון הקבלה:", error);
    }
  };

  // הוספת תזכורת לקבלה
  const addReminder = async (receiptId) => {
    try {
      await axios.post("http://localhost:5000/api/reminders", {
        userId: JSON.parse(localStorage.getItem("userId")),
        receiptId: receiptId,
        reminderDaysBefore: newReceipt.reminderDaysBefore,
      });
      console.log("תזכורת נוספה בהצלחה");
      fetchReceipts();
    } catch (error) {
      console.error("שגיאה בהוספת תזכורת:", error);
    }
  };

  // עריכת קבלה
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

  // מחיקת תזכורת
  const deleteReminder = async (receiptId) => {
    try {
      await axios.put(`http://localhost:5000/api/receipts/${receiptId}/reminder`);
      console.log("תזכורת נמחקה בהצלחה");
      fetchReceipts(); // רענון הרשימה לאחר המחיקה
    } catch (error) {
      console.error("שגיאה במחיקת תזכורת:", error);
    }
  };

  // עריכת תזכורת קיימת
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

  // העברת קבלה לזבל
  const moveToTrash = async (receiptId) => {
    try {
      await axios.put(`http://localhost:5000/api/receipts/${receiptId}/trash`);
      setReceipts(receipts.filter((r) => r.receipt_id !== receiptId));
      fetchTrashReceipts();
      console.log("הקבלה הועברה לזבל");
    } catch (error) {
      console.error("שגיאה בהעברת קבלה לזבל:", error);
    }
  };

  // שחזור קבלה מהזבל
  const restoreReceipt = async (receiptId) => {
    try {
      await axios.put(`http://localhost:5000/api/receipts/restore/${receiptId}`);
      fetchTrashReceipts();
      fetchReceipts();
      console.log("הקבלה שוחזרה בהצלחה");
    } catch (error) {
      console.error("שגיאה בשחזור קבלה:", error);
    }
  };


  const permanentlyDeleteReceipt = async (receiptId) => {
    try {
      await axios.delete(`http://localhost:5000/api/trash/${receiptId}`); // מחיקה לצמיתות של קבלה מהשרת
      fetchTrashReceipts(); // רענון רשימת הקבלות שנמחקו לאחר המחיקה
      console.log("Receipt permanently deleted");
    } catch (error) {
      console.error("Error permanently deleting receipt:", error);
    }
  };
  
  return (
    <div className={styles.container}>
      <h2>ניהול קבלות ותזכורות</h2>
  
      {/* כפתורי פעולה להחלפת תצוגה בין קבלות, טופס הוספה, תזכורות וזבל */}
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
  
      {/* הצגת רשימת הקבלות */}
      {showReceipts && (
  <ReceiptsTable 
    receipts={receipts}
    categories={categories}
    editReceipt={editReceipt}
    moveToTrash={moveToTrash}
    editReminder={editReminder}
  />
)}
 
  
      {/* הצגת רשימת התזכורות */}
      {showReminders && (
  <RemindersList 
    receipts={receipts}
    editReminder={editReminder}
    deleteReminder={deleteReminder}
  />
)}

  
      {/* הצגת רשימת הקבלות שנמחקו */}
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
  
      {/* טופס הוספת קבלה חדשה או תזכורת */}
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
          {/* כפתור להוספה או שמירת שינויים בקבלה */}
          <button onClick={addOrUpdateReceipt}>
            {isEditing || isAddingReminder ? "שמור שינויים" : "הוסף קבלה"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ReceiptsPage;
  