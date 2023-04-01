import React, { type MouseEventHandler } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import SettingsIcon from "@mui/icons-material/Settings";
import { Colors } from "../assets/colors";
import LogoImage from "src/assets/images/logo-large.png";
import Image from "./Image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface IHeader {
  alerts?: number;
  onClickNotifications?: MouseEventHandler<HTMLElement>;
  onLogout?: Function;
  hideSettings?: boolean;
  onClickBack?: any;
}

const Header = ({
  alerts,
  onClickNotifications,
  onLogout,
  onClickBack,
  hideSettings = true,
}: IHeader) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const onClickSettings = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOnLogout = () => {
    onLogout?.(null);
  };
  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar
        sx={{
          minHeight: onClickBack ? 60 : 100,
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
          {onClickBack ? (
            <Button
              sx={{
                display: "flex",
                color: Colors.white,
                ml: -2,
              }}
              onClick={onClickBack}
            >
              <ArrowBackIcon sx={{ mr: 1 }} /> Back
            </Button>
          ) : (
            <Image
              source={LogoImage}
              alt="logo"
              width="200px"
              sx={{
                mr: 2,
              }}
            />
          )}
        </Box>
        <Box>
          {!hideSettings ? (
            <>
              <IconButton
                onClick={onClickSettings}
                id="settings-button"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <SettingsIcon sx={{ color: Colors.white }} />
              </IconButton>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  "aria-labelledby": "basic-button",
                }}
              >
                <MenuItem onClick={handleOnLogout}>
                  <ListItemIcon>
                    <SwitchAccountIcon />
                  </ListItemIcon>
                  <ListItemText>Sign In With A Different Account</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : null}

          {onClickNotifications ? (
            <IconButton onClick={onClickNotifications}>
              {alerts && alerts > 0 ? (
                <Badge badgeContent="New" color="error">
                  <NotificationsIcon sx={{ color: Colors.white }} />
                </Badge>
              ) : (
                <NotificationsIcon sx={{ color: Colors.white }} />
              )}
            </IconButton>
          ) : null}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  alerts: PropTypes.number,
  onClickNotifications: PropTypes.func,
};

export default Header;
