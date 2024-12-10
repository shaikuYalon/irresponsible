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
import Profile from "./components/ProfilePage";
import styles from "./App.module.css";
import UsersAnalysis from "./components/admin/UsersAnalysis";

function App() {
  const [userRole, setUserRole] = useState(
    localStorage.getItem("role") || "user"
  );

  useEffect(() => {
    const role = localStorage.getItem("role") || "user";
    if (userRole !== role) {
      setUserRole(role);
    }
  }, []);

  const handleLogin = (role) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserRole("user");
    window.location.href = "/";
  };

  return (
    <div className={styles.pageContainer}>
      <Router>
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
            <Route path="/Users-analysis" element={<UsersAnalysis />} />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/receipts"
              element={
                <PrivateRoute>
                  <ReceiptsPage />
                </PrivateRoute>
              }
            />
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

        {userRole !== "admin" && <Footer />}
      </Router>
    </div>
  );
}

export default App;
