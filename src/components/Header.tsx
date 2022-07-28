import React from "react";
import { AppBar, Fab, Toolbar, Typography, Box } from "@mui/material";
import PropTypes from "prop-types";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Colors } from "../assets/colors";

const Header = ({ alerts = 0 }) => {
  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar
        sx={{
          minHeight: 100,
          display: "flex",
          justifyContent: "space-between",
          ml: 2,
          mr: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            transform: "scale(1.1)",
          }}
        >
          <MenuBookIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Bookshopper
          </Typography>
        </Box>

        <Fab
          size="small"
          aria-label="edit"
          sx={{
            background: Colors.white,
          }}
        >
          <Typography variant="body1" fontWeight="bold">
            {alerts}
          </Typography>
        </Fab>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  alerts: PropTypes.number,
};

export default Header;
