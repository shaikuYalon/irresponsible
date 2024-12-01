import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const ScanPop = ({ open, onClose, onConfirm }) => {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="scan-modal-title">
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
        <Typography id="scan-modal-title" variant="h6" component="h2" mb={2}>
          פרטים מסריקה
        </Typography>
        <Typography variant="body1" mb={3}>
          האם ברצונך למלא פרטים אוטומטית מהסריקה?
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Button variant="contained" color="success" onClick={() => onConfirm(true)}>
            כן
          </Button>
          <Button variant="contained" color="error" onClick={() => onConfirm(false)}>
            לא
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ScanPop;
