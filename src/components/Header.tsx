import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Badge,
  IconButton,
} from "@mui/material";
import PropTypes from "prop-types";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Colors } from "../assets/colors";
import LogoImage from "src/assets/images/logo.svg";
import Image from "./Image";

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
          <Image
            source={LogoImage}
            alt="logo"
            height="30px"
            width="30px"
            sx={{
              mr: 2,
            }}
          />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Bookshopper
            </Typography>
            <Typography
              variant="body2"
              sx={{
                marginTop: "-5px",
              }}
            >
              Watchlist
            </Typography>
          </Box>
        </Box>

        <IconButton>
          <Badge badgeContent={alerts} color="error">
            <NotificationsIcon sx={{ color: Colors.white }} />
          </Badge>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  alerts: PropTypes.number,
};

export default Header;
