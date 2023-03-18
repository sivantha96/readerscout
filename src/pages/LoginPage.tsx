import React, { useEffect, useState } from "react";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import Image from "src/components/Image";
import {
  AWS_AUTHORS_API,
  AWS_BOOKS_API,
  NAVIGATION,
  PROVIDERS,
} from "src/constants";
import Logo from "src/assets/images/logo.png";
import LogoText from "src/assets/images/logo-text.svg";
import { Colors } from "src/assets/colors";
import { addParamsToURL } from "src/utils";
import axios from "axios";
import { type IAmazonData } from "src/types/amazon.types";
import { type CommonResponse } from "src/types/common.types";
import Header from "src/components/Header";

interface LoginPageProps {
  onSuccess: Function;
  setNavigation: Function;

  amazonData?: IAmazonData;
  isSignedIn: boolean;
  followersCount?: number;
  profilePicture?: string;
  currentToken?: string;
  newUser?: boolean;
  isLoading: boolean;
}

function LoginPage({
  onSuccess,
  amazonData,
  isSignedIn,
  followersCount,
  profilePicture,
  newUser = true,
  isLoading = true,
  currentToken,
  setNavigation,
}: LoginPageProps) {
  const [isLoadingBooks, setLoadingBooks] = useState(false);
  const [isLoadingRegister, setLoadingRegister] = useState(false);

  const [books, setBooks] = useState<any[]>();

  const convertGoogleUserToAmazon = async (
    amazonData: IAmazonData,
    books: any[],
    followersCount: number,
    profilePicture?: string
  ) => {
    try {
      const res = await axios.post<CommonResponse<{ token: string }>>(
        `${process.env.REACT_APP_API_BASE_URL ?? ""}/auth/change-to-amazon`,
        {
          books: books && books.length > 0 ? books.slice(0, 50) : [],
          author: {
            id: amazonData.author.amazonAuthorId,
            asin: amazonData.author.asin,
            marketplace: amazonData.identities[0].marketplace,
            customer_id: amazonData.account.customerId,
            name: amazonData.identities[0].claimedAuthorName,
            created_at: amazonData.identities[0].createdAt,
            followers_count: followersCount,
            profile_picture: profilePicture,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${currentToken ?? ""}`,
            provider: PROVIDERS.GOOGLE,
          },
        }
      );

      await chrome?.storage?.local.set({
        token: res.data.data.token,
        provider: PROVIDERS.AMAZON,
      });

      onSuccess(res.data.data.token);
      setNavigation(NAVIGATION.HOME);
    } catch (error) {
      console.log(error);
    }
  };

  const onComplete = async () => {
    if (!isLoadingBooks && amazonData && books && followersCount) {
      if (!newUser) {
        return convertGoogleUserToAmazon(
          amazonData,
          books,
          followersCount,
          profilePicture
        );
      }

      try {
        const res = await axios.post<CommonResponse<{ token: string }>>(
          `${process.env.REACT_APP_API_BASE_URL ?? ""}/auth/amazon`,
          {
            books: books && books.length > 0 ? books.slice(0, 50) : [],
            author: {
              id: amazonData.author.amazonAuthorId,
              asin: amazonData.author.asin,
              marketplace: amazonData.identities[0].marketplace,
              customer_id: amazonData.account.customerId,
              name: amazonData.identities[0].claimedAuthorName,
              created_at: amazonData.identities[0].createdAt,
              followers_count: followersCount,
              profile_picture: profilePicture,
            },
          }
        );

        await chrome?.storage?.local.set({
          token: res.data.data.token,
          provider: PROVIDERS.AMAZON,
        });

        onSuccess(res.data.data.token);
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    onComplete();
  }, [amazonData, books, followersCount, profilePicture, isLoadingBooks]);

  const getBooks = async () => {
    if (!amazonData) return;

    setLoadingBooks(true);

    const url = addParamsToURL(AWS_BOOKS_API, {
      author: amazonData.author.asin,
      marketplace: amazonData.identities[0].marketplace,
    });

    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "content-type": "application/json",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-csrf-token": amazonData.csrftoken.token,
        "x-requested-with": "XMLHttpRequest",
      },
      body: null,
      mode: "cors",
    });

    const data = await res.json();

    setBooks(data.data);

    setLoadingBooks(false);
  };

  const handleOnPressSync = () => {
    getBooks();
    setLoadingRegister(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "600px",
      }}
    >
      {!newUser ? (
        <Header
          onClickBack={() => {
            setNavigation(NAVIGATION.HOME);
          }}
        />
      ) : null}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          mt: 3,
          p: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          <Image source={Logo} alt="logo" width="50px" objectFit="contain" />
          <Image
            source={LogoText}
            alt="logo"
            width="220px"
            objectFit="contain"
          />
          <Box
            sx={{
              maxHeight: isLoading ? 0 : "600px",
              transition: !isLoading ? "all 0.5s ease" : "none",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                mx: 5,
                mt: 3,
              }}
            >
              {isSignedIn ? (
                "Click the button to get started"
              ) : (
                <>
                  Login to <Link href={AWS_AUTHORS_API}>amazon.author.com</Link>{" "}
                  then click the button to get started
                </>
              )}
            </Typography>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
              }}
            >
              <Button
                disabled={!amazonData}
                onClick={handleOnPressSync}
                variant="contained"
                sx={{
                  my: 3,
                  textTransform: "none",
                }}
              >
                Sync Your Amazon Account
              </Button>
            </Box>

            {isSignedIn ? null : (
              <Alert
                sx={{
                  fontSize: "12px",
                  color: Colors.error,
                }}
                severity="error"
              >
                You need to be signed in to{" "}
                <Link href={AWS_AUTHORS_API}>amazon.author.com</Link> to get
                started
              </Alert>
            )}
          </Box>
        </Box>
        <Box
          sx={{
            maxHeight: isLoading ? 0 : "600px",
            transition: !isLoading ? "all 0.5s ease" : "none",
            overflow: "hidden",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Box
              sx={{
                backgroundColor: Colors.grayExtraLight,
                mt: 2,
                borderRadius: 1,
                px: 2,
                py: 2,
                width: "100%",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textAlign: "center",
                  fontWeight: "600",
                  width: "100%",
                }}
              >
                Why do I need to connect my Amazon account?
              </Typography>

              <List dense sx={{ p: 0 }}>
                <ListItem sx={{ py: 0, pt: 0, pb: 0 }}>
                  <ListItemText
                    sx={{ my: 0, mt: 0, mb: 0 }}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: "12px",
                      },
                    }}
                    primary="• This verifies you as an author"
                  />
                </ListItem>
                <ListItem sx={{ py: 0, pt: 0, pb: 0 }}>
                  <ListItemText
                    sx={{ my: 0, mt: 0, mb: 0 }}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: "12px",
                      },
                    }}
                    primary="• Helps auto-load your book list"
                  />
                </ListItem>
                <ListItem sx={{ py: 0, pt: 0, pb: 0 }}>
                  <ListItemText
                    sx={{ my: 0, mt: 0, mb: 0 }}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: "12px",
                      },
                    }}
                    primary="• Gives permissions to see your followers"
                  />
                </ListItem>
              </List>
            </Box>

            <Link
              href={AWS_AUTHORS_API}
              sx={{
                py: 2,
                fontSize: "12px",
              }}
            >
              Privacy Policy
            </Link>
          </Box>

          <Backdrop
            open={isLoadingBooks || isLoadingRegister}
            sx={{ zIndex: 999 }}
          >
            <CircularProgress />
          </Backdrop>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
