import React, { useEffect, useState } from "react";
import axios from "axios";

function ReceiptsPage() {
  const [receipts, setReceipts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newReceipt, setNewReceipt] = useState({
    userId: JSON.parse(localStorage.getItem("userId")),
    categoryId: "",
    storeName: "",
    purchaseDate: "",
    productName: "",
    warrantyExpiration: "",
    image: null,
  });
  const [showReceipts, setShowReceipts] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchReceipts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/receipts");
      setReceipts(response.data);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchReceipts();
    fetchCategories();
  }, []);

  const addReceipt = async () => {
    const formData = new FormData();
    formData.append("userId", newReceipt.userId);
    formData.append("categoryId", newReceipt.categoryId);
    formData.append("storeName", newReceipt.storeName);
    formData.append("purchaseDate", newReceipt.purchaseDate);
    formData.append("productName", newReceipt.productName);
    formData.append("warrantyExpiration", newReceipt.warrantyExpiration);
    formData.append("image", newReceipt.image);

    try {
      await axios.post("http://localhost:5000/api/receipts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setShowAddForm(false);
      setNewReceipt({
        userId: JSON.parse(localStorage.getItem("userId")),
        categoryId: "",
        storeName: "",
        purchaseDate: "",
        productName: "",
        warrantyExpiration: "",
        image: null,
      });
      fetchReceipts();
    } catch (error) {
      console.error("Error adding receipt:", error);
    }
  };

  return (
    <div>
      <h2>ניהול קבלות</h2>

      <button onClick={() => setShowReceipts(true)}>הצגת כל הקבלות</button>
      <button onClick={() => setShowAddForm(!showAddForm)}>הוספת קבלה חדשה</button>

      {showReceipts && (
        <div>
          <h3>רשימת קבלות</h3>
          {receipts.length === 0 ? (
            <p>אין קבלות שמורות</p>
          ) : (
            receipts.map((receipt) => (
              <div key={receipt.receipt_id}>
                <p>חנות: {receipt.store_name}</p>
                <p>מוצר: {receipt.product_name}</p>
                <p>תאריך רכישה: {receipt.purchase_date}</p>
                <p>תוקף אחריות: {receipt.warranty_expiration}</p>
                {receipt.image_path && (
                  <button
                    onClick={() =>
                      window.open(`http://localhost:5000/${receipt.image_path}`, "_blank")
                    }
                  >
                    הצגת הקבלה
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {showAddForm && (
        <div>
          <h3>הוספת קבלה חדשה</h3>
          <input
            type="text"
            placeholder="שם החנות"
            value={newReceipt.storeName}
            onChange={(e) => setNewReceipt({ ...newReceipt, storeName: e.target.value })}
          />
          <input
            type="text"
            placeholder="שם המוצר"
            value={newReceipt.productName}
            onChange={(e) => setNewReceipt({ ...newReceipt, productName: e.target.value })}
          />
          <select
            value={newReceipt.categoryId}
            onChange={(e) => setNewReceipt({ ...newReceipt, categoryId: e.target.value })}
          >
            <option value="">בחר קטגוריה</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
          <input
            type="date"
            placeholder="תאריך רכישה"
            value={newReceipt.purchaseDate}
            onChange={(e) => setNewReceipt({ ...newReceipt, purchaseDate: e.target.value })}
          />
          <input
            type="date"
            placeholder="תוקף אחריות"
            value={newReceipt.warrantyExpiration}
            onChange={(e) =>
              setNewReceipt({ ...newReceipt, warrantyExpiration: e.target.value })
            }
          />
          <input
            type="file"
            placeholder="תמונה"
            onChange={(e) => setNewReceipt({ ...newReceipt, image: e.target.files[0] })}
          />
          <button onClick={addReceipt}>הוסף קבלה</button>
        </div>
      )}
    </div>
  );
}

export default ReceiptsPage;
