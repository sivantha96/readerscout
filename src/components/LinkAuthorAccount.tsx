import React from "react";
import { Avatar, Box, Button, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Colors } from "src/assets/colors";

interface LinkAuthorAccountProps {
  profilePicture?: string;
  onDismiss: any;
  onClickLink: any;
}

function LinkAuthorAccount({ onDismiss, onClickLink }: LinkAuthorAccountProps) {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "row",
        p: 2,
        position: "relative",
      }}
    >
      <IconButton
        aria-label="delete"
        sx={{
          mx: 1,
          position: "absolute",
          top: 5,
          right: 0,
          backgroundColor: Colors.white,
          zIndex: 999,
          boxShadow: 3,
          height: "25px",
          width: "25px",
          "&:hover": {
            background: Colors.white,
          },
        }}
        onClick={onDismiss}
      >
        <CloseIcon
          sx={{
            fontSize: "15px",
          }}
        />
      </IconButton>

      <Button
        variant="outlined"
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          p: 1,
          justifyContent: "flex-start",
          borderWidth: 1,
          borderColor: Colors.grayLight,
        }}
        onClick={onClickLink}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Avatar />
          <Typography sx={{ ml: 2, textTransform: "none" }}>
            Click here to link your author account
          </Typography>
        </Box>
      </Button>
    </Box>
  );
}

export default LinkAuthorAccount;
