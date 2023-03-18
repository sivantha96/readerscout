import React from "react";
import { Avatar, Box, Typography } from "@mui/material";
import { Colors } from "src/assets/colors";
import { type IUser } from "src/types/user.types";
import { type IAmazonData } from "src/types/amazon.types";
import PeopleIcon from "@mui/icons-material/People";
import moment from "moment";

interface LinkAuthorAccountProps {
  userData?: IUser;

  amazonData?: IAmazonData;
  followersCount?: number;
  profilePicture?: string;
}

function AuthorProfile({
  userData,
  profilePicture,
  amazonData,
  followersCount,
}: LinkAuthorAccountProps) {
  const count = followersCount ?? userData?.followers_count?.count;
  const name = amazonData?.identities[0].claimedAuthorName ?? userData?.name;
  const picture = profilePicture ?? userData?.profile_picture;

  if (!count && !name && !picture) return null;
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
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          p: 1,
          justifyContent: "flex-start",
          border: "1px solid",
          borderColor: Colors.grayLight,
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Avatar
            src={picture}
            sx={{
              mr: 2,
              ml: 1,
              height: "60px",
              width: "60px",
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
            }}
          >
            <Typography
              sx={{
                textTransform: "none",
                textAlign: "left",
                width: "100%",
                fontSize: "18px",
                fontWeight: 500,
              }}
            >
              {name}
            </Typography>
            {count ? (
              <>
                <Box
                  sx={{
                    textTransform: "none",
                    textAlign: "left",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "13px",
                  }}
                >
                  <PeopleIcon
                    sx={{
                      mr: "5px",
                      fontSize: "18px",
                    }}
                  />
                  Followers Count{" "}
                  <Typography
                    sx={{
                      ml: 1,
                      color: Colors.white,
                      background: Colors.black,
                      padding: "0px 10px",
                      borderRadius: "5px",
                      fontSize: "14px",
                    }}
                  >
                    {count}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    padding: "0px 10px 2px 10px",
                    background: Colors.grayLight,
                    color: Colors.black,
                    borderRadius: "5px",
                    fontSize: "12px",
                    mt: "5px",
                  }}
                >
                  <span>
                    Last Updated On:{" "}
                    {followersCount ? (
                      <span style={{ color: Colors.green }}>Now</span>
                    ) : (
                      moment(userData?.followers_count?.updated_on).format(
                        "YYYY-MM-DD"
                      )
                    )}
                  </span>
                </Box>
              </>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AuthorProfile;
