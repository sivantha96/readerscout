import React, { MouseEventHandler } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { ReactComponent as GoogleImage } from "src/assets/images/google.svg";
import Image from "src/components/Image";
import Logo from "src/assets/images/logo.png";

interface StartupProps {
  onLogin: Function;
}

const StartupPage = ({ onLogin }: StartupProps) => {
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
      <Image source={Logo} alt="logo" width="100px" />
      <Typography variant="h4" sx={{ mt: 2 }}>
        ReaderScout
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Track your books easily
      </Typography>
      <ButtonBase
        onClick={onLogin as MouseEventHandler}
        sx={{
          boxShadow: 4,
          px: 2,
          py: 1,
          borderRadius: 1,
          fontWeight: 700,
        }}
      >
        <Box
          sx={{
            height: 20,
            width: 20,
            mr: 2,
          }}
        >
          <GoogleImage />
        </Box>
        Sign In
      </ButtonBase>
    </Box>
  );
};

StartupPage.propTypes = {
  onLogin: PropTypes.func,
};

export default StartupPage;
