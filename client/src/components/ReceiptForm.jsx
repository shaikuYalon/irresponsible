import React, { useEffect, useRef, useState } from "react";
import styles from "./ReceiptForm.module.css";

function ReceiptForm({ onSave, categories, receiptData, isReminderOnly }) {
  const [receipt, setReceipt] = useState(receiptData || {
    storeName: "",
    productName: "",
    purchaseDate: "",
    warrantyExpiration: "",
    categoryId: "",
    reminderDaysBefore: "",
    image: null,
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null); // רפרנס לשדה העלאת הקובץ

  useEffect(() => {
    if (receiptData) {
      setReceipt(receiptData);
    }
  }, [receiptData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReceipt({ ...receipt, [name]: value });
  };

  useEffect(() => {
    if (isCameraOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera: ", err);
        });
    } else {
      stopCamera();
    }
  }, [isCameraOpen]);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      let stream = videoRef.current.srcObject;
      let tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleRetakePhoto = () => {
    setPhotoPreview(null);
    setIsCameraOpen(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setReceipt({ ...receipt, image: file });
    setPhotoPreview(URL.createObjectURL(file));
  };

  // פונקציה למחיקת הקובץ והאיפוס של שדה העלאת הקובץ
  const handleRemoveFile = () => {
    setReceipt({ ...receipt, image: null });
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // איפוס השדה כך שיהיה אפשר לבחור קובץ אחר
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });
        setReceipt({ ...receipt, image: file });
        setPhotoPreview(URL.createObjectURL(blob));
      }
      setIsCameraOpen(false);
      stopCamera();
    }, "image/jpeg");
  };

  const handleExitCamera = () => {
    setIsCameraOpen(false);
    stopCamera();
  };

  const handleScanReceipt = () => {
    setIsScanning(true);
    setIsCameraOpen(true);
  };

  const handleSubmit = () => {
    const updatedReceipt = {
      ...receipt,
      categoryId: receipt.categoryId || null,
    };
    onSave(updatedReceipt);
  };

  return (
    <div className="formContainerWrapper">
    <div className={styles.formContainer}>
      <h3>{isReminderOnly ? "עריכת תזכורת" : "הוספת/עריכת קבלה"}</h3>

      {!isReminderOnly && (
        <>
          <div className={styles.scanButtonContainer}>
            <button onClick={handleScanReceipt} disabled={isScanning}>
              {isScanning ? "סורק..." : "מלא פרטים מסריקה"}
            </button>
          </div>

          <label>
            שם החנות:
            <input
              type="text"
              name="storeName"
              value={receipt.storeName || ""}
              onChange={handleChange}
            />
          </label>
          <label>
            שם המוצר:
            <input
              type="text"
              name="productName"
              value={receipt.productName || ""}
              onChange={handleChange}
            />
          </label>
          <label>
            קטגוריה:
            <select
              name="categoryId"
              value={receipt.categoryId || ""}
              onChange={handleChange}
            >
              <option value="">בחר קטגוריה</option>
              {categories.length === 0 ? (
                <option disabled>אין קטגוריות זמינות</option>
              ) : (
                categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.category_name}
                  </option>
                ))
              )}
            </select>
          </label>
          <label>
            תאריך רכישה:
            <input
              type="date"
              name="purchaseDate"
              value={receipt.purchaseDate || ""}
              onChange={(e) => {
                const purchaseDate = e.target.value;
                setReceipt({ ...receipt, purchaseDate, warrantyExpiration: "" });
              }}
              max={new Date().toISOString().split("T")[0]}
            />
          </label>
          <label>
            תוקף אחריות:
            <input
              type="date"
              name="warrantyExpiration"
              value={receipt.warrantyExpiration || ""}
              onChange={handleChange}
              min={receipt.purchaseDate || new Date().toISOString().split("T")[0]}
            />
          </label>

          <div className={styles.fileUploadSection}>
            <label htmlFor="file-upload">העלאת קובץ קבלה:</label>
            <input
              type="file"
              id="file-upload"
              name="image"
              onChange={handleFileUpload}
              ref={fileInputRef}
            />
            {receipt.image && (
              <button type="button" onClick={handleRemoveFile}>
                מחק קובץ
              </button>
            )}
          </div>

          <div className={styles.reminderSection}>
            <label htmlFor="reminder">תזכורת:</label>
            <select
              id="reminder"
              name="reminderDaysBefore"
              value={receipt.reminderDaysBefore || ""}
              onChange={handleChange}
            >
              <option value="">בחר תזכורת</option>
              <option value="2">יומיים לפני</option>
              <option value="7">שבוע לפני</option>
              <option value="14">שבועיים לפני</option>
            </select>
          </div>

          <div className={styles.buttonGroup}>
  <button onClick={() => setIsCameraOpen(true)} className={styles.cameraButton}>צלם קבלה</button>
  <button onClick={handleSubmit} className={styles.saveButton}>שמור</button>
</div>

        </>
      )}

{isCameraOpen && (
  <div className={styles.fullscreenCamera}>
    <video ref={videoRef} autoPlay className={styles.fullscreenVideo} />
    <div className={styles.cameraButtons}>
      <button onClick={handleCapture} className={styles.captureButton}>צלם</button>
      <button onClick={handleExitCamera} className={styles.exitButton}>ביטול</button>
    </div>
  </div>
)}



      {photoPreview && (
        <div>
          <img src={photoPreview} alt="תצוגת תמונה" className={styles.photoPreview} />
          <button onClick={handleRetakePhoto} className={styles.retakeButton}>
            צילום חדש
          </button>
        </div>
      )}
    </div>
    </div>
  );
}

export default ReceiptForm;
