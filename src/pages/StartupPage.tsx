import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import PropTypes from "prop-types";
import Image from "src/components/Image";
import Logo from "src/assets/images/logo.png";
import LogoText from "src/assets/images/logo-text.svg";

const StartupPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "600px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Image source={Logo} alt="logo" width="100px" objectFit="contain" />
      <Image source={LogoText} alt="logo" width="220px" objectFit="contain" />
      <Typography variant="body1" sx={{ mb: 4 }}>
        Track your books easily
      </Typography>

      <CircularProgress />
    </Box>
  );
};

StartupPage.propTypes = {
  onLoginWithGoogle: PropTypes.func,
  onLoginWithAmazon: PropTypes.func,
  hideButtons: PropTypes.bool,
};

export default StartupPage;
