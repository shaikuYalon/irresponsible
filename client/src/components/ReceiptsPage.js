import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // שימוש ב-useLocation
import ReceiptsTable from "./utils/ReceiptsTable";
import RemindersList from "./utils/RemindersList";
import ReceiptForm from "./ReceiptForm";
import styles from "./ReceiptsPage.module.css";
import apiClient from "./ApiClient";

function ReceiptsPage() {
  // הגדרת מצבים שונים לשמירת הנתונים ולהצגת התצוגות
  const [setError] = useState(""); // סטייט להודעות שגיאה
  const location = useLocation(); // קבלת המידע שהועבר
  const [receipts, setReceipts] = useState([]); // רשימת הקבלות
  const [categories, setCategories] = useState([]); // רשימת הקטגוריות
  const [trashReceipts, setTrashReceipts] = useState([]); // קבלות שנמחקו
  const [newReceipt, setNewReceipt] = useState({
    
    userId: JSON.parse(localStorage.getItem("userId")),
    categoryId: "",
    storeName: "",
    purchaseDate: "",
    productName: "",
    price: "",
    reciptNumber: "",
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
  const [showReminderModal, setShowReminderModal] = useState(false); // שליטה במודאל
const [selectedReceipt, setSelectedReceipt] = useState(null); // שמירת הקבלה שנבחרה


  const today = new Date().toISOString().split("T")[0]; // משתנה לשמירת תאריך היום בפורמט ISO

  // שליפת הקבלות מהשרת
  const fetchReceipts = async () => {
    try {
        const response = await apiClient.get("/receipts"); // אין צורך להוסיף userId ל-query
        setReceipts(response.data);
    } catch (error) {
        console.error("שגיאה בשליפת קבלות:", error.response?.data || error.message);
    }
};


// שליפת קבלות שנמחקו
const fetchTrashReceipts = async () => {
  try {
    const response = await apiClient.get("/trash?"); // אין צורך להעביר userId, נשלף מתוך הטוקן בשרת
    setTrashReceipts(response.data);
  } catch (error) {
    console.error("שגיאה בשליפת קבלות שנמחקו:", error);
  }
};



const fetchCategories = async () => {
  try {
      const response = await apiClient.get("/categories"); // שימוש ב-apiClient
      setCategories(response.data);
  } catch (error) {
      console.error("שגיאה בשליפת קטגוריות:", error.response?.data || error.message);
  }
};


  useEffect(() => {
    fetchCategories();
    fetchTrashReceipts();
  
    // בדיקת פרמטרים מ-location לפתיחת טופס אוטומטי
    if (location.state?.openAddForm) {
      setShowAddForm(true); // פותח את הטופס אוטומטית אם הפרמטר הועבר
    }
  }, [location.state]); // תלוי ב-location.state
  

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
    if (isEditing) {
      // ביטול עריכה והצגת הקבלות
      setIsEditing(false);
      setShowAddForm(false);
      setShowReceipts(true); // הצגת הקבלות
    } else {
      // מצב של הוספת קבלה חדשה
      setShowAddForm(!showAddForm);
      setShowReceipts(false);
      setShowReminders(false);
      setShowTrash(false);
      setIsAddingReminder(false);
      setNewReceipt({
        userId: JSON.parse(localStorage.getItem("userId")),
        categoryId: null,
        storeName: "",
        purchaseDate: null,
        productName: "",
        price: null,
        receiptNumber: null,
        warrantyExpiration: null,
        image: null,
        reminderDaysBefore: null,
      });
    }
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
    try {
        // בדיקה אם מדובר בתזכורת בלבד
        if (updatedReceipt.receiptId && updatedReceipt.reminderDaysBefore) {
            // שליחת בקשה להוספת תזכורת בלבד
            const response = await apiClient.post("/api/reminders", {
                receiptId: updatedReceipt.receiptId,
                reminderDaysBefore: updatedReceipt.reminderDaysBefore,
            });

            console.log("Reminder added successfully:", response.data);
            setReceipts(
                receipts.map((receipt) =>
                    receipt.receipt_id === updatedReceipt.receiptId
                        ? { ...receipt, reminder_days_before: updatedReceipt.reminderDaysBefore }
                        : receipt
                )
            );
            return; // סיום הבקשה לתזכורת בלבד
        }

        // הכנת ה-FormData לקבלה חדשה או עדכון קבלה קיימת
        const formData = new FormData();

        formData.append("userId", updatedReceipt.userId || "");
        formData.append("categoryId", updatedReceipt.categoryId || "");
        formData.append("storeName", updatedReceipt.storeName || "");
        formData.append("purchaseDate", updatedReceipt.purchaseDate || "");
        formData.append("productName", updatedReceipt.productName || "");
        formData.append("price", updatedReceipt.price || "");
        formData.append("receiptNumber", updatedReceipt.receiptNumber || "");
        formData.append("warrantyExpiration", updatedReceipt.warrantyExpiration || "");
        formData.append("reminderDaysBefore", updatedReceipt.reminderDaysBefore || "");

        if (updatedReceipt.image) {
            formData.append("image", updatedReceipt.image);
        }

        let response;
        if (isEditing && editReceiptId) {
            // עדכון קבלה קיימת
            response = await apiClient.put(`/receipts/${editReceiptId}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setReceipts(
                receipts.map((receipt) =>
                    receipt.receipt_id === editReceiptId
                        ? { ...receipt, reminder_days_before: updatedReceipt.reminderDaysBefore }
                        : receipt
                )
            );

            console.log("Receipt updated successfully:", response.data);
        } else {
            // הוספת קבלה חדשה
            response = await apiClient.post("/receipts", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setReceipts([...receipts, response.data]);
            console.log("Receipt added successfully:", response.data);
        }

        // איפוס השדות
        setNewReceipt({
            userId: JSON.parse(localStorage.getItem("userId")),
            categoryId: "",
            storeName: "",
            purchaseDate: "",
            productName: "",
            price: "",
            receiptNumber: "",
            warrantyExpiration: "",
            image: null,
            reminderDaysBefore: "",
        });

        setShowAddForm(false);
        setShowReceipts(true); // הצגת כל הקבלות לאחר שמירה
        setIsEditing(false);
        setEditReceiptId(null);
    } catch (error) {
        console.error("Error adding/updating receipt:", error.response?.data || error.message);
    }
    // רענון הרשימה מהשרת
    fetchReceipts();
};

const handleAddReminder = (receipt) => {
  setSelectedReceipt(receipt); // שמירת הקבלה שנבחרה
  setShowReminderModal(true); // הצגת המודאל
};

{showReminderModal && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <h3>הוספת תזכורת</h3>
      <p>בחר מספר ימים לפני תום האחריות לקבלת תזכורת:</p>
      <select
        onChange={(e) => setSelectedReceipt({ 
          ...selectedReceipt, 
          reminder_days_before: e.target.value 
        })}
        value={selectedReceipt?.reminder_days_before || ""}
      >
        <option value="">בחר</option>
        <option value="2">יומיים לפני</option>
        <option value="7">שבוע לפני</option>
        <option value="14">שבועיים לפני</option>
      </select>
      <div className={styles.modalActions}>
        <button
          onClick={() => {
            addReminder(selectedReceipt);
            setShowReminderModal(false);
          }}
          className={styles.saveButton}
        >
          שמור
        </button>
        <button
          onClick={() => setShowReminderModal(false)}
          className={styles.cancelButton}
        >
          ביטול
        </button>
      </div>
    </div>
  </div>
)}


//הוספת תזכורת לקבלה קיימת
const addReminder = async (receipt, reminderDaysBefore) => {
  try {
    // קריאה ל-API להוספת תזכורת
    const response = await apiClient.post(`/receipts/${receipt.receipt_id}/reminder`, {
      reminderDaysBefore: parseInt(reminderDaysBefore, 10),
    });

    console.log("Reminder added successfully:", response.data);

    // עדכון הסטייט המקומי
    setReceipts((prevReceipts) =>
      prevReceipts.map((r) =>
        r.receipt_id === receipt.receipt_id
          ? { ...r, reminder_days_before: reminderDaysBefore }
          : r
      )
    );
  } catch (error) {
    console.error("Error adding reminder:", error.response?.data || error.message);
    setError("שגיאה בהוספת תזכורת. נסה שוב."); // סטייט להודעת שגיאה ידידותית
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
      price: receipt.price,
      receiptNumber: receipt.receipt_number,
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
      const response = await apiClient.put(`/receipts/${receiptId}/reminder`);
      console.log(response.data.message);
      fetchReceipts(); // רענון הקבלות
    } catch (error) {
      console.error("Error deleting reminder:", error.response?.data || error.message);
    }
  };
  

   //   עריכת תזכורת
   const editReminder = async (updatedReceipt) => {
    try {
      // קריאה לשרת לעדכון תזכורת
      const response = await apiClient.put(
        `/receipts/${updatedReceipt.receipt_id}/reminder`,
        {
          reminder_days_before: updatedReceipt.reminder_days_before,
        }
      );
  
      console.log(response.data.message);
  
      // עדכון הקבלה ברשימה לאחר הצלחה
      setReceipts((prevReceipts) =>
        prevReceipts.map((receipt) =>
          receipt.receipt_id === updatedReceipt.receipt_id
            ? {
                ...receipt,
                reminder_days_before: updatedReceipt.reminder_days_before,
                reminder_date: calculateReminderDate(
                  receipt.warranty_expiration,
                  updatedReceipt.reminder_days_before
                ), // עדכון התאריך בטבלה המקומית
              }
            : receipt
        )
      );
    } catch (error) {
      console.error(
        "Error editing reminder:",
        error.response?.data || error.message
      );
    }
  };
  
  // פונקציה לחישוב תאריך התזכורת
  const calculateReminderDate = (warrantyExpiration, daysBefore) => {
    if (!warrantyExpiration) return null;
    const expirationDate = new Date(warrantyExpiration);
    expirationDate.setDate(expirationDate.getDate() - daysBefore);
    return expirationDate.toISOString().split("T")[0]; // פורמט YYYY-MM-DD
  };
  
  
  // העברת קבלה לזבל
const moveToTrash = async (receiptId) => {
  try {
    await apiClient.put(`/receipts/${receiptId}/trash`);

      setReceipts(receipts.filter((r) => r.receipt_id !== receiptId));
      fetchTrashReceipts(); // רענון רשימת הקבלות שנמחקו
      console.log("הקבלה הועברה לזבל");
  } catch (error) {
      console.error("שגיאה בהעברת קבלה לזבל:", error.response?.data || error.message);
  }
};


  // שחזור קבלה מהזבל
const restoreReceipt = async (receiptId) => {
  try {
    await apiClient.put(`/receipts/restore/${receiptId}`);
    fetchTrashReceipts(); // רענון רשימת הקבלות בזבל
      fetchReceipts(); // רענון רשימת הקבלות הפעילות
      console.log("הקבלה שוחזרה בהצלחה");
  } catch (error) {
      console.error("שגיאה בשחזור קבלה:", error.response?.data || error.message);
  }
};


const permanentlyDeleteReceipt = async (receiptId) => {
  try {
      await apiClient.delete(`/trash/${receiptId}`); // מחיקה לצמיתות של קבלה מהשרת
      fetchTrashReceipts(); // רענון רשימת הקבלות שנמחקו לאחר המחיקה
      console.log("Receipt permanently deleted");
  } catch (error) {
      console.error("Error permanently deleting receipt:", error.response?.data || error.message);
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
  {isEditing 
    ? "ביטול עריכה" 
    : showAddForm 
      ? "ביטול הוספת קבלה" 
      : "הוספת קבלה חדשה"}
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
    addReminder={addReminder}
    handleAddReminder={handleAddReminder}
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
