import React from "react";
import { AppBar, Toolbar } from "@mui/material";

const Header = () => {
  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar
        sx={{
          minHeight: 100,
        }}
      ></Toolbar>
    </AppBar>
  );
};

export default Header;
