import React, { FC } from 'react';
import { Box, Button, Modal, Typography } from "@mui/material";
import { styles } from '@/app/styles/style';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
};

const DeleteConfirmationModal: FC<Props> = ({ open, onClose, onConfirm, itemName = 'this item' }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none">
        <Typography variant="h5" className={`${styles.title} !text-left`}>
          Confirm Deletion
        </Typography>
        <Typography sx={{ mt: 2, mb: 3 }}>
          Are you sure you want to delete {itemName}? This action cannot be undone.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} color="error" variant="contained">
            Delete
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteConfirmationModal;