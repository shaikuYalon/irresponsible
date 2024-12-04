import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [userRole, setUserRole] = useState(null); // ניהול role ב-state
  const navigate = useNavigate();

  useEffect(() => {
    // קריאת ה-role מה-localStorage
    const role = localStorage.getItem("role");
    setUserRole(role);

    const handleStorageChange = () => {
      const updatedRole = localStorage.getItem("role");
      setUserRole(updatedRole);
    };

    // הקשבה לשינויים ב-localStorage
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogoutClick = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.dispatchEvent(new Event("storage")); // עדכון ה-App על השינוי
    navigate("/");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="navbar">
      {/* כפתור בית - מותאם לפי ה-role */}
      <Link
        className="navbar-link"
        to={userRole === "admin" ? "/admin-dashboard" : "/dashboard"}
      >
        בית
      </Link>

      {/* כפתור הודעות מערכת - יופיע רק אם המשתמש מחובר */}
      {localStorage.getItem("userId") && (
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

      {/* כפתור התנתקות - יופיע רק אם המשתמש מחובר */}
      {localStorage.getItem("userId") && (
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
