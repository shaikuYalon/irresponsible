import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/");
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <nav className="navbar">
      {/* כפתור בית */}
      <Link className="navbar-link" to="/dashboard">
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
  <button className="navbar-button logout-button" onClick={handleLogoutClick}>
    התנתק
  </button>
)}

    </nav>
  );
}

export default Navbar;
