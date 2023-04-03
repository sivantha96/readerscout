import React, { type MouseEventHandler } from "react";
import { Box, ButtonBase, Link, Typography } from "@mui/material";
import PropTypes from "prop-types";
import Image from "src/components/Image";
import Logo from "src/assets/images/logo.png";
import LogoText from "src/assets/images/logo-text.svg";
import AmazonLogo from "src/assets/images/amazon.svg";
import { Colors } from "src/assets/colors";

interface StartupProps {
  hideButtons: boolean;
  isGoogleLoading: boolean;
  onLoginWithGoogle: Function;
  onLoginWithAmazon: Function;
}

const StartupPage = ({
  onLoginWithGoogle,
  onLoginWithAmazon,
  hideButtons,
  isGoogleLoading,
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
      <Box
        sx={{
          maxHeight: hideButtons ? 0 : "600px",
          transition: hideButtons ? "none" : "all 0.5s ease",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          px: 5,
        }}
      >
        <ButtonBase
          disabled={isGoogleLoading}
          onClick={onLoginWithAmazon as MouseEventHandler}
          sx={{
            boxShadow: 4,
            px: 2,
            py: 1,
            mt: 2,
            borderRadius: 1,
            fontWeight: 700,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60px",
            mb: 2,
            width: "300px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {isGoogleLoading ? (
            <Box
              sx={{
                zIndex: 998,
                position: "absolute",
                opacity: 0.5,
                width: "100%",
                height: "100%",
                backgroundColor: Colors.white,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            />
          ) : null}
          <Image
            source={AmazonLogo}
            alt="logo"
            width="20px"
            objectFit="contain"
            sx={{ mt: 1, mr: 2 }}
          />
          Login with Amazon
        </ButtonBase>

        <Box sx={{ pt: 3 }}>
          <Typography
            sx={{
              fontSize: "12px",
              textAlign: "center",
            }}
          >
            Already have an account using Google?{" "}
            <Link
              sx={{
                cursor: "pointer",
              }}
              onClick={onLoginWithGoogle as MouseEventHandler}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

StartupPage.propTypes = {
  onLoginWithGoogle: PropTypes.func,
  onLoginWithAmazon: PropTypes.func,
  hideButtons: PropTypes.bool,
};

export default StartupPage;
