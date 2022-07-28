import React from "react";
import { Box, Button } from "@mui/material";
import BookList from "./components/BookList";
import Header from "./components/Header";
import AddIcon from "@mui/icons-material/Add";

function App() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "600px",
      }}
    >
      <Header />
      <BookList />
      <Button
        size="large"
        startIcon={<AddIcon />}
        sx={{
          py: 3,
          borderRadius: 0,
        }}
      >
        Add book on this page
      </Button>
    </Box>
  );
}

export default App;
