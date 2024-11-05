import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import DashboardPage from "./components/DashboardPage";
import Contact from "./components/Contact";
import ReceiptsPage from "./components/ReceiptsPage";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import RemindersPage from "./components/RemindersPage";
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.pageContainer}>
      <Router>
        <Navbar />
        <div className={styles.content}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
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
        <Footer />
      </Router>
    </div>
  );
}

export default App;
