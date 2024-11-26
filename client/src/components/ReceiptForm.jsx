import React, { useEffect, useRef, useState } from "react";
import styles from "./ReceiptForm.module.css";
import axios from "axios";
import scanImage from "./openAi";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";//המרת PDF לתמונה

// הגדר את ה-workerSrc
GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

function ReceiptForm({ onSave, categories, receiptData, isReminderOnly }) {
  // שמירת המידע של הקבלה ב-state
  const [receipt, setReceipt] = useState(
    receiptData || {
      storeName:  "",
      productName: "", 
      purchaseDate: "", 
      warrantyExpiration: "", 
      categoryId: "", 
      reminderDaysBefore: "", 
      image: null, 
    }
  );

  const [isCameraOpen, setIsCameraOpen] = useState(false); // האם המצלמה פתוחה
  const [photoPreview, setPhotoPreview] = useState(null); // תצוגה מקדימה של התמונה
  const [isScanning, setIsScanning] = useState(false); // סטטוס סריקת התמונה
  const [shouldScanAfterCapture, setShouldScanAfterCapture] = useState(false); // דגל לסריקה אחרי צילום
  const [showScanDialog, setShowScanDialog] = useState(false); // דיאלוג לסריקה

  const videoRef = useRef(null); // רפרנס לוידאו של המצלמה
  const fileInputRef = useRef(null); // רפרנס לשדה העלאת הקובץ

  // אפקט להפעלת המצלמה או עצירתה בהתבסס על מצב
  useEffect(() => {
    if (isCameraOpen) {
      // פתיחת המצלמה
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream; // חיבור הזרם לוידאו
          }
        })
        .catch((err) => {
          console.error("Error accessing camera: ", err); // טיפול בשגיאות גישה למצלמה
        });
    } else {
      // עצירת המצלמה אם המצב נסגר
      stopCamera();
    }
  }, [isCameraOpen]);


  

  // פונקציה לעדכון שדה ב-state בהתבסס על שינוי
  const handleChange = (e) => {
    const { name, value } = e.target; // שם השדה והערך החדש
    setReceipt({ ...receipt, [name]: value }); // עדכון ה-state
  };

    // אפקט לעדכון הקבלה ב-state אם התקבלו נתונים חדשים ב-receiptData
useEffect(() => {
  console.log("State after Update:", receipt);
}, [receipt]);

  // פונקציה לעצירת המצלמה
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      let stream = videoRef.current.srcObject; // הזרם של המצלמה
      let tracks = stream.getTracks(); // המסלולים של הזרם
      tracks.forEach((track) => track.stop()); // עצירת כל המסלולים
      videoRef.current.srcObject = null; // איפוס הזרם
    }
  };

  // פונקציה לצילום תמונה מחדש
  const handleRetakePhoto = () => {
    setPhotoPreview(null); // איפוס התצוגה המקדימה
    setIsCameraOpen(true); // פתיחת המצלמה מחדש
  };

  

const convertPdfToImage = async (pdfFile) => {
  try {
    const fileReader = new FileReader();

    fileReader.onload = async () => {
      const pdfData = new Uint8Array(fileReader.result);
      const pdfDoc = await getDocument({ data: pdfData }).promise;
      const page = await pdfDoc.getPage(1); // לוקח את הדף הראשון

      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      canvas.toBlob((blob) => {
        if (blob) {
          const imageFile = new File([blob], "converted-image.jpeg", {
            type: "image/jpeg",
          });
          setReceipt({ ...receipt, image: imageFile }); // שמירת התמונה
          setPhotoPreview(URL.createObjectURL(blob)); // הצגת תצוגה מקדימה
          setShowScanDialog(true); // הצגת דיאלוג לסריקה
        }
      }, "image/jpeg");
    };

    fileReader.readAsArrayBuffer(pdfFile);
  } catch (error) {
    console.error("Error converting PDF to image:", error);
  }
};


  // פונקציה לטיפול בהעלאת קובץ
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const fileType = file.type;
    console.log("Uploaded file type:", fileType);
  
    if (fileType === "application/pdf") {
      // אם הקובץ הוא PDF, בצע המרה לתמונה
      convertPdfToImage(file);
    } else {
      // אם הקובץ הוא תמונה רגילה, שמור אותו
      setReceipt({ ...receipt, image: file });
      setPhotoPreview(URL.createObjectURL(file));
      setShowScanDialog(true); // הצגת דיאלוג לסריקה
    }
  };
  
  

  const handleScanConfirmation = (confirm) => {
    setShowScanDialog(false); // סגור את הדיאלוג
    if (confirm && receipt.image) {
      scanReceipt(receipt.image); // אם המשתמש מאשר, בצע סריקה
    }
  };
  

  // פונקציה למחיקת הקובץ ואיפוס שדה העלאת הקובץ
  const handleRemoveFile = () => {
    setReceipt({ ...receipt, image: null }); // מחיקת התמונה מה-state
    setPhotoPreview(null); // איפוס התצוגה המקדימה
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // איפוס שדה העלאת הקובץ
    }
  };

  // פונקציה לצילום תמונה ממצלמה
  const handleCapture = () => {
    if (!videoRef.current) return; // אם אין רפרנס לוידאו, לצאת מהפונקציה
  
    const canvas = document.createElement("canvas"); // יצירת אלמנט קנבס
    canvas.width = videoRef.current.videoWidth; // רוחב הוידאו
    canvas.height = videoRef.current.videoHeight; // גובה הוידאו
    const context = canvas.getContext("2d"); // יצירת הקשר גרפי
  
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height); // ציור הוידאו על הקנבס
  
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "captured-image.jpg", {
          type: "image/jpeg",
        });
        setReceipt({ ...receipt, image: file }); // שמירת הקובץ ב-state
        setPhotoPreview(URL.createObjectURL(blob)); // הצגת תצוגה מקדימה
  
        // אם הדגל shouldScanAfterCapture מופעל, מבצע סריקה
        if (shouldScanAfterCapture) {
          scanReceipt(file); // קריאה לפונקציית הסריקה
        }
      }
      setIsCameraOpen(false); // סגירת המצלמה
      stopCamera(); // עצירת המצלמה
    }, "image/jpeg");
  };
  

  const handleExitCamera = () => {
    setIsCameraOpen(false);
    stopCamera();
  };

 
  
  const handleSubmit = () => {
    const updatedReceipt = {
      ...receipt,
      categoryId: receipt.categoryId || null,
    };
    console.log("Submitting receipt:", updatedReceipt);
    onSave(updatedReceipt);
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return "";
    const datePart = dateTime.split(" ")[0]; // לוקח רק את החלק של התאריך לפני הרווח
    const [day, month, year] = datePart.split("/");
    return `${year}-${month}-${day}`; // מחזיר את התאריך בפורמט הנדרש
  };
  
  
  
  const scanReceipt = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/upload-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      console.log("Image uploaded successfully:", response.data);
  
      const imageUrl = response.data.imageUrl;
      if (!imageUrl) throw new Error("Image URL is missing in the response");
  
      // קריאה ל-OpenAI לסריקת התמונה
      const scannedData = await scanImage(imageUrl);
      console.log("Scanned Data from AI:", scannedData); // לוג של scannedData
  
      if (!scannedData || Object.keys(scannedData).length === 0) {
        console.error("No data returned from AI.");
        return;
      }
  
      // עדכון ה-state עם הנתונים מ-scannedData
      setReceipt((prevReceipt) => {
        console.log("Previous Receipt State:", prevReceipt);
        console.log("Scanned Data (raw):", scannedData);
      
        const parsedScannedData = JSON.parse(scannedData); // נתונים לאחר פריסה
        console.log("Parsed Scanned Data:", parsedScannedData);
      
        // יצירת עותק מעודכן של ה-state עם הנתונים החדשים
        const updatedReceipt = {
          ...prevReceipt, // שמירה על הערכים הקיימים
          storeName: parsedScannedData.storeName || "", // עדכון רק אם יש ערך
          productName: parsedScannedData.productName || "",
          purchaseDate: parsedScannedData.purchaseDate
            ? formatDate(parsedScannedData.purchaseDate)
            : prevReceipt.purchaseDate,
          warrantyExpiration: parsedScannedData.warrantyEndDate
            ? formatDate(parsedScannedData.warrantyEndDate)
            : prevReceipt.warrantyExpiration,
        };
      
        console.log("Updated Receipt in State:", updatedReceipt);
        return updatedReceipt;
      });
      
      
    } catch (error) {
      console.error("Error uploading or scanning the image:", error);
    } finally {
      setIsScanning(false);
      setIsCameraOpen(false); // סיום תהליך המצלמה
    }
  };
  
  return (
    <div className="formContainerWrapper">
      <div className={styles.formContainer}>
        <h3>{isReminderOnly ? "עריכת תזכורת" : "הוספת/עריכת קבלה"}</h3>

        {isReminderOnly ? (
          // הצגת שדה התזכורת בלבד במצב של עריכת תזכורת
          <div className={styles.reminderSectionOnly}>
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
            <div className={styles.buttonGroup}>
              <button onClick={handleSubmit} className={styles.saveButton}>
                שמור
              </button>
            </div>
          </div>
        ) : (
          // הטופס המלא במצב של הוספת/עריכת קבלה
          <>
            <div className={styles.scanButtonContainer}>
  <button
    onClick={() => {
      setShouldScanAfterCapture(true); // להפעיל סריקה אחרי צילום
      setIsCameraOpen(true); // לפתוח את המצלמה
    }}
    disabled={isScanning}
  >
    {isScanning ? "סורק..." : "מלא פרטים מסריקה"}
  </button>
</div>


            <label>
  שם החנות:
  <input
    type="text"
    name="storeName"
    value={receipt.storeName || ""} // מחובר לערך ב-state
    onChange={handleChange} // מעדכן את ה-state במקרה של שינוי ידני
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
                    <option
                      key={category.category_id}
                      value={category.category_id}
                    >
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
                  setReceipt({
                    ...receipt,
                    purchaseDate,
                    warrantyExpiration: "",
                  });
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
                min={
                  receipt.purchaseDate || new Date().toISOString().split("T")[0]
                }
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
            <button
  onClick={() => {
    setShouldScanAfterCapture(false); // לא לבצע סריקה אחרי צילום
    setIsCameraOpen(true); // לפתוח את המצלמה
  }}
  className={styles.cameraButton}
>
  צלם קבלה
</button>

              <button onClick={handleSubmit} className={styles.saveButton}>
                שמור
              </button>
            </div>
          </>
        )}

        {isCameraOpen && (
          <div className={styles.fullscreenCamera}>
            <video ref={videoRef} autoPlay className={styles.fullscreenVideo} />
            <div className={styles.cameraButtons}>
              <button onClick={handleCapture} className={styles.captureButton}>
                צלם
              </button>
              <button onClick={handleExitCamera} className={styles.exitButton}>
                ביטול
              </button>
            </div>
          </div>
        )}

{showScanDialog && (
  <div className={styles.dialog}>
    <p>האם ברצונך למלא פרטים אוטומטית מהסריקה?</p>
    <button onClick={() => handleScanConfirmation(true)}>כן</button>
    <button onClick={() => handleScanConfirmation(false)}>לא</button>
  </div>
)}


        {photoPreview && (
          <div>
            <img
              src={photoPreview}
              alt="תצוגת תמונה"
              className={styles.photoPreview}
            />
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