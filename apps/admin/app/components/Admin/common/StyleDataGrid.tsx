import React, { FC } from 'react';
import { Box } from "@mui/material";
import { DataGrid, DataGridProps } from "@mui/x-data-grid";
import { useTheme } from "next-themes";

const StyledDataGrid: FC<DataGridProps> = (props) => {
  const { theme } = useTheme();

  return (
    <Box
      height="80vh"
      sx={{
        "& .MuiDataGrid-root": { border: "none", outline: "none" },
        "& .css-pqjvzy-MuiSvgIcon-root-MuiSelect-icon": { color: theme === "dark" ? "#fff" : "#000" },
        "& .MuiDataGrid-sortIcon": { color: theme === "dark" ? "#fff" : "#000" },
        "& .MuiDataGrid-row": {
          color: theme === "dark" ? "#fff" : "#000",
          borderBottom: theme === "dark" ? "1px solid #ffffff30!important" : "1px solid #ccc!important",
        },
        "& .MuiTablePagination-root": { color: theme === "dark" ? "#fff" : "#000" },
        "& .MuiDataGrid-cell": { borderBottom: "none!important" },
        "& .MuiDataGrid-columnHeaders": {
          backgroundColor: theme === "dark" ? "#3e4396" : "#A4A9FC",
          borderBottom: "none",
          color: theme === "dark" ? "#fff" : "#000",
        },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: theme === "dark" ? "#1F2A40" : "#F2F0F0" },
        "& .MuiDataGrid-footerContainer": {
          color: theme === "dark" ? "#fff" : "#000",
          borderTop: "none",
          backgroundColor: theme === "dark" ? "#3e4396" : "#A4A9FC",
        },
        "& .MuiCheckbox-root": { color: theme === "dark" ? `#b7ebde !important` : `#000 !important` },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `#fff !important` },
      }}
    >
      <DataGrid {...props} />
    </Box>
  );
};

export default StyledDataGrid;