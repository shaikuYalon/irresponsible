import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

const AdminNavbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="admin-navbar">
      <ul className="admin-navbar-list">
        {/* כפתור לניהול ראשי */}
        <li className="admin-navbar-item">
          <button
            className="admin-navbar-button"
            onClick={() => handleNavigation("/admin-dashboard")}
            aria-label="ניהול ראשי"
          >
            ניהול ראשי
          </button>
        </li>

        {/* כפתור התנתקות */}
        <li className="admin-navbar-item">
          <button
            className="admin-navbar-button logout-button"
            onClick={onLogout}
            aria-label="התנתק"
          >
            התנתק
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default AdminNavbar;
