import React from "react";
import {
    AppBar,
    Toolbar,
    Box,
    Badge,
    IconButton,
} from "@mui/material";
import PropTypes from "prop-types";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Colors } from "../assets/colors";
import LogoImage from "src/assets/images/logo-large.png";
import Image from "./Image";

const Header = ({ alerts = 0, onClickNotifications = () => {} }) => {
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
                        width="230px"
                        sx={{
                            mr: 2,
                        }}
                    />
                </Box>

                <IconButton onClick={onClickNotifications}>
                    {alerts > 0 ? (
                        <Badge badgeContent="New" color="error">
                            <NotificationsIcon sx={{ color: Colors.white }} />
                        </Badge>
                    ) : (
                        <NotificationsIcon sx={{ color: Colors.white }} />
                    )}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};

Header.propTypes = {
    alerts: PropTypes.number,
    onClickNotifications: PropTypes.func,
};

export default Header;
