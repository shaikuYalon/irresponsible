import React, { useEffect, useState } from "react";
import axios from "axios";
import ReceiptsTable from "./utils/ReceiptsTable";
import RemindersList from "./utils/RemindersList";
import ReceiptForm from "./ReceiptForm";
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

 


  const addOrUpdateReceipt = async (updatedReceipt) => {
    if (isAddingReminder) {
        const reminderDaysBefore = updatedReceipt.reminderDaysBefore || null;
        await addReminder(editReceiptId, reminderDaysBefore); // העברת הערך ישירות
        setShowAddForm(false);
        return;
    }

    const formData = new FormData();
    formData.append("userId", updatedReceipt.userId || "");
    formData.append("categoryId", updatedReceipt.categoryId || "");
    formData.append("storeName", updatedReceipt.storeName || "");
    formData.append("purchaseDate", updatedReceipt.purchaseDate || "");
    formData.append("productName", updatedReceipt.productName || "");
    formData.append("warrantyExpiration", updatedReceipt.warrantyExpiration || "");
    formData.append("reminderDaysBefore", updatedReceipt.reminderDaysBefore || "");

    if (updatedReceipt.image) {
        formData.append("image", updatedReceipt.image);
    }

    try {
        if (isEditing && editReceiptId) {
            // עדכון קבלה קיימת
            const response = await axios.put(`http://localhost:5000/api/receipts/${editReceiptId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setReceipts(
                receipts.map((receipt) =>
                    receipt.receipt_id === editReceiptId
                        ? { ...receipt, reminder_days_before: updatedReceipt.reminderDaysBefore }
                        : receipt
                )
            );
            console.log("הקבלה עודכנה בהצלחה");
        } else {
            // הוספת קבלה חדשה
            const response = await axios.post("http://localhost:5000/api/receipts", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setReceipts([...receipts, response.data]);
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
        setIsEditing(false);
        setEditReceiptId(null);
    } catch (error) {
        console.error("שגיאה בהוספה או עדכון הקבלה:", error);
    }
};


  // הוספת תזכורת לקבלה
  const addReminder = async (receiptId, reminderDaysBefore) => {
    try {
        if (!reminderDaysBefore) {
            console.error("תזכורת לא יכולה להיות ריקה.");
            return;
        }

        console.log("נתונים שנשלחים לשרת:", {
            userId: JSON.parse(localStorage.getItem("userId")),
            receiptId,
            reminderDaysBefore,
        });

        await axios.post("http://localhost:5000/api/reminders", {
            userId: JSON.parse(localStorage.getItem("userId")),
            receiptId,
            reminderDaysBefore,
        });

        console.log("תזכורת נוספה או עודכנה בהצלחה");
        fetchReceipts(); // רענון הרשימה של הקבלות
    } catch (error) {
        console.error("שגיאה בהוספת או עדכון תזכורת:", error);
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
      image: receipt.image,
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
      fetchReceipts(); // רענון הרשימה
    } catch (error) {
      console.error("שגיאה במחיקת תזכורת:", error);
    }
  };
  
  // עריכת תזכורת קיימת
  const editReminder = (receipt) => {
    setIsAddingReminder(true);
    setEditReceiptId(receipt.receipt_id);

    setNewReceipt({
        reminderDaysBefore: receipt.reminder_days_before || "",
    });

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
  
      <div className={styles.actionButtons}>
  <button className={styles.actionButton + ' ' + styles.receiptsButton} onClick={toggleReceipts}>
    {showReceipts ? "הסתר קבלות" : "הצגת כל הקבלות"}
  </button>
  <button className={styles.actionButton + ' ' + styles.addFormButton} onClick={toggleAddForm}>
    {showAddForm ? "ביטול הוספת קבלה" : "הוספת קבלה חדשה"}
  </button>
  <button className={styles.actionButton + ' ' + styles.remindersButton} onClick={toggleReminders}>
    {showReminders ? "הסתר תזכורות" : "הצגת כל התזכורות"}
  </button>
  <button className={styles.actionButton + ' ' + styles.trashButton} onClick={toggleTrash}>
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
    setShowAddForm={setShowAddForm} 
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
                <div className={styles.buttonContainer}>
                  <button onClick={() => restoreReceipt(receipt.receipt_id)}>שחזר</button>
                  <button onClick={() => permanentlyDeleteReceipt(receipt.receipt_id)}>מחק לצמיתות</button>
                </div>
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
  <ReceiptForm
  categories={categories}
  onSave={(data) => addOrUpdateReceipt(data)}
  receiptData={newReceipt}
  isReminderOnly={isAddingReminder}
  onPurchaseDateChange={handlePurchaseDateChange}
  onWarrantyExpirationChange={handleWarrantyExpirationChange}
/>
  )}
</div>
);
}

export default ReceiptsPage;
  