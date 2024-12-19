import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AdminDashboard.module.css";

// פונקציה להמרת מספר חודש לשם החודש
const getMonthName = (monthNumber) => {
    const monthNames = [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ];
    return monthNames[monthNumber - 1]; // מספר חודש מ-1 עד 12
  };

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [purchaseData, setPurchaseData] = useState(null);
  const [isPurchaseDataVisible, setIsPurchaseDataVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
   

  const token = sessionStorage.getItem("token");
  // מיפוי שמות עמודות לכותרות בעברית
  const columnHeadersMapping = {
    category: {
      category_name: "שם קטגוריה",
      total_purchases: "סך רכישות",
      total_spent: "סך הוצאה",
    },
    monthly: {
      month: "חודש",
      total_spent: "סך הוצאה",
      total_receipts: "סך חשבוניות",
    },
    topStores: {
      store_name: "שם חנות",
      total_purchases: "סך רכישות",
      total_spent: "סך הוצאה",
    },
    yearly: {
      year: "שנה",
      total_spent: "סך הוצאה",
      total_receipts: "סך חשבוניות",
    },
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const role = localStorage.getItem("role");
      if (role !== "admin") {
        setUsers([]);
        setShowUsers(false);
        setSelectedUser(null);
        setPurchaseData(null);
        setAnalysisData(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const loadUsers = async () => {
    if (!showUsers) {
      setLoading(true);
      try {
        const response = await axios.get(
          "http://localhost:5001/api/admin/users",{
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setUsers(response.data.users || []);
        setError("");
        setShowUsers(true);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("שגיאה בטעינת רשימת המשתמשים.");
      } finally {
        setLoading(false);
      }
    } else {
      setShowUsers(false);
      setSelectedUser(null);
      setPurchaseData(null);
      setIsPurchaseDataVisible(false);
      setAnalysisData(null);
      setCurrentAnalysis(null);
    }
  };

  const handleUserDetailsToggle = async (user) => {
    if (selectedUser && selectedUser.user_id === user.user_id) {
      // אם לוחצים שוב על אותו משתמש, נסגור את המידע שלו
      setSelectedUser(null);
      setPurchaseData(null);
      setIsPurchaseDataVisible(false);
      setAnalysisData(null); // איפוס נתוני הניתוח
      setCurrentAnalysis(null); // איפוס סוג הניתוח
    } else {
      // סגור מידע קודם
      setSelectedUser(null);
      setPurchaseData(null);
      setIsPurchaseDataVisible(false);
      setAnalysisData(null); // איפוס נתוני הניתוח
      setCurrentAnalysis(null); // איפוס סוג הניתוח
  
      // הצג מידע חדש
      setSelectedUser(user);
      try {
        const response = await axios.get(
          "http://localhost:5001/api/admin/user-purchases",
          { params: { user_id: user.user_id } }
        );
        setPurchaseData(response.data.purchases);
        setIsPurchaseDataVisible(true);
      } catch (error) {
        console.error("Error fetching purchase data:", error);
        setError("שגיאה בטעינת נתוני הקניות.");
      }
    }
  };
  

  const fetchAnalysisData = async (type) => {
    if (!selectedUser) {
      setError("לא נבחר משתמש.");
      return;
    }

    if (currentAnalysis === type && analysisData) {
      setAnalysisData(null);
      setCurrentAnalysis(null);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5001/api/admin/purchase-analysis/${type}`,
        { params: { user_id: selectedUser.user_id } }
      );

      console.log("Response data:", response.data);

      const filteredData =
        type === "category" && Array.isArray(response.data.categories)
          ? response.data.categories.filter((item) => item.category_name !== null)
          : type === "monthly" && Array.isArray(response.data.monthlyData)
          ? response.data.monthlyData
          : type === "topStores" && Array.isArray(response.data.topStores)
          ? response.data.topStores
          : type === "yearly" && Array.isArray(response.data.yearlyData)
          ? response.data.yearlyData
          : [];

      if (filteredData.length === 0) {
        setError("לא נמצאו נתונים עבור הניתוח המבוקש.");
      } else {
        setError(""); // איפוס הודעת השגיאה אם יש נתונים
      }

      setAnalysisData({
        data: filteredData,
        headers: columnHeadersMapping[type],
      });
      setCurrentAnalysis(type);
    } catch (error) {
      console.error("Error fetching analysis data:", error);
      setError(
        `שגיאה בטעינת ניתוח הנתונים: ${
          error.response?.data?.error || "תקלה לא צפויה"
        }`
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>ניהול מערכת</h1>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <button className={styles.button} onClick={loadUsers} disabled={loading}>
        {loading ? "טוען..." : showUsers ? "הסתרת משתמשים" : "הצגת משתמשים"}
      </button>

      {showUsers && users.length > 0 && (
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th>ID</th>
              <th>שם פרטי</th>
              <th>שם משפחה</th>
              <th>שם משתמש</th>
              <th>דוא"ל</th>
              <th>תאריך יצירה</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{new Date(user.created_at).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                <td>
                  <button
                    className={styles.button}
                    onClick={() => handleUserDetailsToggle(user)}
                  >
                    {selectedUser && selectedUser.user_id === user.user_id
                      ? "הסתר מידע"
                      : "הצג מידע"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedUser && isPurchaseDataVisible && purchaseData && (
        <div>
          <h2>נתוני קניות עבור {selectedUser.first_name} {selectedUser.last_name}</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>חנות</th>
                <th>תאריך רכישה</th>
                <th>מוצר</th>
                <th>תוקף אחריות</th>
                <th>מחיר</th>
                <th>מספר קבלה</th>
                <th>קטגוריה</th>
                <th>תאריך יצירה</th>
                <th>האם נמחקה</th>
                <th>קישור לתמונה</th>
              </tr>
            </thead>
            <tbody>
              {purchaseData.map((purchase, index) => (
                <tr key={index}>
                  <td>{purchase.store_name}</td>
<td>
  {new Date(purchase.purchase_date)
    .toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })}
</td>
                  <td>{purchase.product_name}</td>
                  <td>
                  <td className="date-cell">
  {purchase.warranty_expiration
    ? new Date(purchase.warranty_expiration).toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "לא צוין"}
</td>
                  </td>
                  <td>{purchase.price ? purchase.price : "לא צויין"} ₪</td>
                  <td>{purchase.receipt_number ? purchase.receipt_number : "לא צויין"}</td>
                  <td>{purchase.category_name ? purchase.category_name : "לא צויין"}</td>
                  <td>{new Date(purchase.created_date).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                  <td>{purchase.is_deleted ? "נמחקה" : "פעילה"}</td>
                  <td>
                    {purchase.image_path ? (
                      <a
                        href={purchase.image_path}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        קישור לתמונה
                      </a>
                    ) : (
                      "לא צוין"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

{selectedUser && (
        <div className={styles.analysisButtons}>
            <button
            className={styles.button}
            onClick={() => fetchAnalysisData("yearly")}
          >
            ניתוח לפי שנים
          </button>
          <button
            className={styles.button}
            onClick={() => fetchAnalysisData("monthly")}
          >
            ניתוח לפי חודשים
          </button>
          <button
            className={styles.button}
            onClick={() => fetchAnalysisData("category")}
          >
            ניתוח לפי קטגוריות
          </button>
          <button
            className={styles.button}
            onClick={() => fetchAnalysisData("topStores")}
          >
            דירוג חנויות מובילות
          </button>
          
        </div>
      )}

{analysisData && analysisData.data ? (
  analysisData.data.length > 0 ? (
    <div className={styles.analysisResults}>
      <h3>תוצאות ניתוח:</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            {Object.keys(analysisData.headers).map((key) => (
              <th key={key}>{analysisData.headers[key]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {analysisData.data.map((row, index) => (
            <tr key={index}>
              {Object.keys(analysisData.headers).map((key, i) => (
                <td key={i}>
                  {key === "month" ? getMonthName(row[key]) : row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className={styles.noDataMessage}>לא נמצאו תוצאות ניתוח.</p>
  )
) : null}
    </div>
  );
}

export default AdminDashboard;