import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode"; // ייבוא נכון של jwtDecode
import "./AdminNavbar.css";

const AdminNavbar = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      // אם אין טוקן, מתנתק ומפנה לדף הבית
      onLogout();
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken.role !== "admin") {
        // אם המשתמש אינו מנהל, מתנתק ומפנה לדף הבית
        onLogout();
      }
    } catch (error) {
      console.error("Invalid token:", error);
      onLogout(); // מתנתק במקרה של טוקן לא תקין
    }
  }, [navigate, onLogout]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="admin-navbar" role="navigation" aria-label="תפריט מנהל">
      <ul className="admin-navbar-list">
        {/* כפתור לניהול ראשי */}
        <li className="admin-navbar-item">
          <button
            className="admin-navbar-button"
            onClick={() => handleNavigation("/admin-dashboard")}
            aria-label="מעבר לניהול ראשי"
          >
            ניהול ראשי
          </button>
        </li>

        {/* כפתור ניתוח משתמשים */}
        <li className="admin-navbar-item">
          <button
            className="admin-navbar-button"
            onClick={() => handleNavigation("/users-analysis")}
            aria-label="ניתוח משתמשים כללי"
          >
            ניתוח משתמשים כללי
          </button>
        </li>

        {/* כפתור התנתקות */}
        <li className="admin-navbar-item">
          <button
            className="admin-navbar-button logout-button"
            onClick={() => {
              sessionStorage.removeItem("token"); // מחיקת הטוקן
              onLogout(); // קריאה לפונקציית ההתנתקות
            }}
            aria-label="התנתקות מהמערכת"
          >
            התנתק
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
