import React, { useState, useEffect } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const ReminderModal = ({ 
  open, 
  onClose, 
  onSave, 
  initialDays = "", 
  title = "הוסף תזכורת" 
}) => {
  const [reminderDays, setReminderDays] = useState(""); // סטייט לניהול מספר הימים

  // אתחול השדה הראשוני בעת פתיחת המודל (לעריכה)
  useEffect(() => {
    setReminderDays(initialDays);
  }, [initialDays]);

  const handleSave = () => {
    if (!reminderDays) {
      alert("אנא בחר מספר ימים.");
      return;
    }
    onSave(parseInt(reminderDays, 10)); // שמירת הערך הנבחר
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="reminder-modal-title">
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 300,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography id="reminder-modal-title" variant="h6" mb={2}>
          {title}
        </Typography>
        <Typography variant="body1" mb={3}>
          אנא בחר את מספר הימים לפני סיום האחריות:
        </Typography>

        {/* כפתורי בחירה */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            variant={reminderDays === "2" ? "contained" : "outlined"}
            onClick={() => setReminderDays("2")}
          >
            2 ימים
          </Button>
          <Button
            variant={reminderDays === "7" ? "contained" : "outlined"}
            onClick={() => setReminderDays("7")}
          >
            7 ימים
          </Button>
          <Button
            variant={reminderDays === "14" ? "contained" : "outlined"}
            onClick={() => setReminderDays("14")}
          >
            14 ימים
          </Button>
        </Box>

        {/* כפתורי שמירה וביטול */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button variant="contained" color="success" onClick={handleSave}>
            שמור
          </Button>
          <Button variant="contained" color="error" onClick={onClose}>
            ביטול
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ReminderModal;
