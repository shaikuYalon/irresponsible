import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode"; // פענוח טוקן
import "./Navbar.css";

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.role); // עדכון ה-role מתוך הטוקן
      } catch (error) {
        console.error("Invalid token:", error);
        handleLogoutClick(); // התנתקות במקרה של טוקן לא תקין
      }
    }
  }, []);

  const handleLogoutClick = () => {
    sessionStorage.clear(); // ניקוי כל הנתונים מה-sessionStorage
    setUserRole(null);
    navigate("/"); // חזרה לדף הבית
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="navbar">
      {/* כפתור בית */}
      <Link
        className="navbar-link"
        to={userRole === "admin" ? "/admin-dashboard" : "/dashboard"}
      >
        בית
      </Link>

      {/* כפתור הודעות מערכת */}
      {sessionStorage.getItem("token") && (
        <div className="notification-container" style={{ position: "relative" }}>
          <button className="navbar-link" onClick={toggleNotifications}>
            הודעות מערכת
          </button>
          {showNotifications && (
            <div className="notifications">
              <p>אין הודעות</p>
            </div>
          )}
        </div>
      )}

      {/* כפתור התנתקות */}
      {sessionStorage.getItem("token") && (
        <button
          className="navbar-button logout-button"
          onClick={handleLogoutClick}
        >
          התנתק
        </button>
      )}
    </nav>
  );
}

export default Navbar;
