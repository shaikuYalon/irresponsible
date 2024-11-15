import React, { useState } from 'react';

function ReceiptUploader() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // פונקציה לטיפול בהעלאת קובץ
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setResult(null); // איפוס תוצאות קודמות לאחר בחירת קובץ חדש
  };

  // פונקציה לשליחת הקובץ לשרת
  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process the receipt. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Receipt</h2>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? "Processing..." : "Upload and Extract Data"}
      </button>

      {result && (
        <div>
          <h3>Extracted Data</h3>
          <ul>
            <li><strong>Store Name:</strong> {result.storeName || "Not available"}</li>
            <li><strong>Purchase Date:</strong> {result.purchaseDate || "Not available"}</li>
            <li><strong>Product Name:</strong> {result.productName || "Not available"}</li>
            <li><strong>Warranty Expiration:</strong> {result.warrantyEnd || "Not available"}</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ReceiptUploader;
