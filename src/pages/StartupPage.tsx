import React, { type MouseEventHandler } from "react";
import { Box, ButtonBase, Typography } from "@mui/material";
import PropTypes from "prop-types";
import Image from "src/components/Image";
import Logo from "src/assets/images/logo.png";
import LogoText from "src/assets/images/logo-text.svg";
import AmazonLogo from "src/assets/images/amazon.svg";

interface StartupProps {
  hideButtons: boolean;
  onLoginWithGoogle: Function;
  onLoginWithAmazon: Function;
}

const StartupPage = ({
  onLoginWithGoogle,
  onLoginWithAmazon,
  hideButtons,
}: StartupProps) => {
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
      {!hideButtons && (
        <ButtonBase
          onClick={onLoginWithAmazon as MouseEventHandler}
          sx={{
            boxShadow: 4,
            px: 2,
            py: 1,
            borderRadius: 1,
            fontWeight: 700,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50px",
            mb: 2,
            width: "200px",
          }}
        >
          <Image
            source={AmazonLogo}
            alt="logo"
            width="20px"
            objectFit="contain"
            sx={{ mt: 1, mr: 2 }}
          />
          Login with Amazon
        </ButtonBase>
      )}
    </Box>
  );
};

StartupPage.propTypes = {
  onLoginWithGoogle: PropTypes.func,
  onLoginWithAmazon: PropTypes.func,
  hideButtons: PropTypes.bool,
};

export default StartupPage;
