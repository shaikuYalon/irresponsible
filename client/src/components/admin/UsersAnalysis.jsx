import React, { useState } from "react";
import axios from "axios";
import styles from "./UsersAnalysis.module.css";
import apiClient from "../ApiClient";

const UsersAnalysis = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("");

  const columnHeadersMapping = {
    monthly: {
      month: "חודש",
      total_sales: "סך מכירות",
      total_revenue: "סך הכנסות",
    },
    yearly: {
      year: "שנה",
      total_sales: "סך מכירות",
      total_revenue: "סך הכנסות",
    },
    topStores: {
      period: "תקופה",
      store_name: "שם חנות",
      total_sales: "מספר מכירות",
      total_revenue: "סך הכנסות",
    },
  };

  const fetchAnalysisData = async (type, period = null) => {
    if (currentAnalysis === type) {
      setAnalysisData(null);
      setCurrentAnalysis(null);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5001/api/admin/users-analysis/${type}`,
        { params: { period, year: year || undefined } } // שולח year רק אם הוזן
      );
      const data = response.data[type] || response.data;
      setAnalysisData({ data, headers: columnHeadersMapping[type] || {} });
      setCurrentAnalysis(type);
      setError("");
    } catch (error) {
      console.error("Error fetching general analysis data:", error);
      setError("שגיאה בטעינת הנתונים.");
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

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
    return monthNames[monthNumber - 1] || monthNumber; // מציג את המספר במקרה ואין תרגום
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>ניתוח כללי של משתמשים</h1>
      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.filters}>
        <label className={styles.label}>
          הזן שנה:
          <input
            type="number"
            className={styles.input}
            placeholder="לדוגמה: 2023"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min="2000"
            max="2100"
          />
        </label>
      </div>

      <div className={styles.analysisButtons}>
        <button
          className={styles.button}
          onClick={() => fetchAnalysisData("monthly")}
        >
          ניתוח לפי חודשים
        </button>
        <button
          className={styles.button}
          onClick={() => fetchAnalysisData("yearly")}
        >
          ניתוח לפי שנים
        </button>
        <button
          className={styles.button}
          onClick={() => fetchAnalysisData("topStores", "monthly")}
        >
          דירוג חנויות לפי חודשים
        </button>
        <button
          className={styles.button}
          onClick={() => fetchAnalysisData("topStores", "yearly")}
        >
          דירוג חנויות לפי שנים
        </button>
      </div>

      {loading && <p className={styles.loading}>טוען נתונים...</p>}

      {!loading &&
      currentAnalysis &&
      analysisData &&
      analysisData.data &&
      analysisData.data.length > 0 ? (
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
                    {key === "month"
                      ? getMonthName(row[key]) // תרגום חודש
                      : key === "period" && isNaN(row[key])
                      ? row[key] // שנה
                      : key === "period" && !isNaN(row[key])
                      ? getMonthName(row[key]) // חודש
                      : row[key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading &&
        currentAnalysis && (
          <p className={styles.noData}>לא נמצאו תוצאות ניתוח.</p>
        )
      )}
    </div>
  );
};

export default UsersAnalysis;
