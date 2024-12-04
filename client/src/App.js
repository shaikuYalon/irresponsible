import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import DashboardPage from "./components/DashboardPage";
import Contact from "./components/Contact";
import ReceiptsPage from "./components/ReceiptsPage";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminNavbar from "./components/admin/AdminNavbar";
import PrivateRoute from "./components/PrivateRoute";
import RemindersPage from "./components/RemindersPage";
import styles from "./App.module.css";

function App() {
  const [userRole, setUserRole] = useState(
    localStorage.getItem("role") || "user"
  );

  // עדכון תפקיד מה-localStorage בעת טעינה ראשונית
  useEffect(() => {
    const role = localStorage.getItem("role") || "user";
    if (userRole !== role) {
      setUserRole(role);
    }
  }, []);

  const handleLogin = (role) => {
    setUserRole(role); // עדכון state לפי התפקיד
  };

  const handleLogout = () => {
    localStorage.clear(); // מחיקת כל הנתונים
    setUserRole("user"); // חזרה לערך ברירת המחדל
    window.location.href = "/"; // ניווט לדף הבית
  };

  return (
    <div className={styles.pageContainer}>
      <Router>
        {/* בחירת Navbar בהתאם ל-role */}
        {userRole === "admin" ? (
          <AdminNavbar onLogout={handleLogout} />
        ) : (
          <Navbar onLogout={handleLogout} />
        )}

        <div className={styles.content}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />

            {/* דף ניהול המנהל */}
            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            {/* דף המשתמש הרגיל */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />

            {/* דף קבלה */}
            <Route
              path="/receipts"
              element={
                <PrivateRoute>
                  <ReceiptsPage />
                </PrivateRoute>
              }
            />

            {/* דף התראות */}
            <Route
              path="/reminders"
              element={
                <PrivateRoute>
                  <RemindersPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>

        {/* Footer יופיע רק אם המשתמש אינו מנהל */}
        {userRole !== "admin" && <Footer />}
      </Router>
    </div>
  );
}

export default App;
