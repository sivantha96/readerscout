import React, { type MouseEventHandler, useEffect, useState } from "react";
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
  AWS_AUTHORS_HOME_PAGE,
  AWS_BOOKS_API,
  NAVIGATION,
  PRIVACY_POLICY,
  PROVIDERS,
  SETUP_AUTHOR_ACCOUNT,
} from "src/constants";
import Logo from "src/assets/images/logo.png";
import LogoText from "src/assets/images/logo-text.svg";
import { Colors } from "src/assets/colors";
import { addParamsToURL } from "src/utils";
import axios from "axios";
import { type IAmazonData } from "src/types/amazon.types";
import { type CommonResponse } from "src/types/common.types";
import Header from "src/components/Header";

type onSuccessFunction = (
  token: string,
  provider: string,
  callbackFn?: (success: boolean) => void
) => void;

interface LoginPageProps {
  onSuccess: onSuccessFunction;
  setNavigation: Function;
  onLoginWithGoogle: Function;

  amazonData?: IAmazonData;
  isSignedIn: boolean;
  followersCount?: number;
  profilePicture?: string;
  currentToken?: string;
  newUser?: boolean;
  isLoading: boolean;
  isAmazonAuthorPage: boolean;
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
  isAmazonAuthorPage,
  onLoginWithGoogle,
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
    if (
      !amazonData?.author ||
      !amazonData.identities ||
      amazonData.identities.length === 0
    ) {
      return;
    }

    let authorId;
    let authorAsin;
    if (Array.isArray(amazonData.author)) {
      authorId = amazonData.author[0].amazonAuthorId;
      authorAsin = amazonData.author[0].asin;
    } else {
      authorId = amazonData.author.amazonAuthorId;
      authorAsin = amazonData.author.asin;
    }

    try {
      const res = await axios.post<CommonResponse<{ token: string }>>(
        `${process.env.REACT_APP_API_BASE_URL ?? ""}/auth/change-to-amazon`,
        {
          books: books && books.length > 0 ? books.slice(0, 50) : [],
          author: {
            id: authorId,
            asin: authorAsin,
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

      const callback = (success: boolean) => {
        if (success) {
          setLoadingRegister(false);
          setNavigation(NAVIGATION.HOME);
        } else {
          setLoadingRegister(false);
        }
      };

      onSuccess(res.data.data.token, PROVIDERS.AMAZON, callback);
    } catch (error) {
      setLoadingRegister(false);
    }
  };

  const onComplete = async () => {
    if (
      !isLoadingBooks &&
      amazonData &&
      books &&
      typeof followersCount === "number"
    ) {
      console.log(
        "inside onComplete",
        isLoadingBooks,
        amazonData,
        books,
        followersCount
      );

      if (!newUser) {
        return convertGoogleUserToAmazon(
          amazonData,
          books,
          followersCount,
          profilePicture
        );
      }

      if (
        !amazonData?.author ||
        !amazonData.identities ||
        amazonData.identities.length === 0
      ) {
        return;
      }

      let authorId;
      let authorAsin;
      if (Array.isArray(amazonData.author)) {
        authorId = amazonData.author[0].amazonAuthorId;
        authorAsin = amazonData.author[0].asin;
      } else {
        authorId = amazonData.author.amazonAuthorId;
        authorAsin = amazonData.author.asin;
      }

      try {
        const res = await axios.post<CommonResponse<{ token: string }>>(
          `${process.env.REACT_APP_API_BASE_URL ?? ""}/auth/amazon`,
          {
            books: books && books.length > 0 ? books.slice(0, 50) : [],
            author: {
              id: authorId,
              asin: authorAsin,
              marketplace: amazonData.identities[0].marketplace,
              customer_id: amazonData.account.customerId,
              name: amazonData.identities[0].claimedAuthorName,
              created_at: amazonData.identities[0].createdAt,
              followers_count: followersCount,
              profile_picture: profilePicture,
            },
          }
        );

        const callback = (success: boolean) => {
          if (success) {
            setLoadingRegister(false);
            setNavigation(NAVIGATION.HOME);
          } else {
            setLoadingRegister(false);
          }
        };

        onSuccess(res.data.data.token, PROVIDERS.AMAZON, callback);
      } catch (error) {
        setLoadingRegister(false);
      }
    }
  };

  useEffect(() => {
    onComplete();
  }, [amazonData, books, followersCount, profilePicture, isLoadingBooks]);

  const getBooks = async () => {
    console.log("getting books");

    try {
      if (
        !amazonData?.author ||
        !amazonData.identities ||
        amazonData.identities.length === 0
      ) {
        console.log("returning from getBooks");
        return;
      }

      let authorAsin;
      if (Array.isArray(amazonData.author)) {
        authorAsin = amazonData.author[0].asin;
      } else {
        authorAsin = amazonData.author.asin;
      }

      setLoadingBooks(true);

      console.log(JSON.stringify(amazonData, null, 2));

      const url = addParamsToURL(AWS_BOOKS_API, {
        author: authorAsin,
        marketplace: amazonData.identities[0].marketplace,
        secondarySearchIndex: false,
        sort: "popularity",
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

      console.log("got all the books", data);

      // filter books which does not have an ASIN on top level
      const filteredBooks = data.data?.filter((book: any) => book.asin);

      console.log("filtered books", data);

      setBooks(filteredBooks);

      setLoadingBooks(false);
    } catch (error) {
      console.log("getBooks", error);
      setLoadingBooks(false);
      setLoadingRegister(false);
    }
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
      {newUser ? null : (
        <Header
          onClickBack={() => {
            setNavigation(newUser ? NAVIGATION.LOGIN : NAVIGATION.HOME);
          }}
        />
      )}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          p: 3,
          pb: 0,
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
            width="180px"
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
                mt: 1,
              }}
            >
              {isSignedIn && isAmazonAuthorPage ? (
                "Click the button to get started"
              ) : (
                <>
                  Login to{" "}
                  <Link
                    rel="noreferrer"
                    target="_blank"
                    href={AWS_AUTHORS_HOME_PAGE}
                  >
                    author.amazon.com
                  </Link>{" "}
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
                disabled={!amazonData?.author || !isAmazonAuthorPage}
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

            {isAmazonAuthorPage ? (
              isSignedIn ? (
                !amazonData?.author ? (
                  <Alert
                    sx={{
                      fontSize: "12px",
                      color: Colors.error,
                    }}
                    severity="error"
                  >
                    To use ReaderScout, you need an Amazon Author account. See{" "}
                    <Link
                      rel="noreferrer"
                      target="_blank"
                      href={SETUP_AUTHOR_ACCOUNT}
                    >
                      here
                    </Link>{" "}
                    on how to set one up.
                  </Alert>
                ) : null
              ) : (
                <Alert
                  sx={{
                    fontSize: "12px",
                    color: Colors.error,
                  }}
                  severity="error"
                >
                  You need to be signed in to{" "}
                  <Link
                    rel="noreferrer"
                    target="_blank"
                    href={AWS_AUTHORS_HOME_PAGE}
                  >
                    author.amazon.com
                  </Link>{" "}
                  to get started
                </Alert>
              )
            ) : (
              <Alert
                sx={{
                  fontSize: "12px",
                  color: Colors.error,
                }}
                severity="error"
              >
                You need to be on the{" "}
                <Link
                  rel="noreferrer"
                  target="_blank"
                  href={AWS_AUTHORS_HOME_PAGE}
                >
                  author.amazon.com
                </Link>{" "}
                to get started
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
                    primary="• Auto-loads your book list to track reviews"
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
                    primary="• Displays your follower count"
                  />
                </ListItem>
              </List>
            </Box>

            <Link
              rel="noreferrer"
              target="_blank"
              href={PRIVACY_POLICY}
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
            <CircularProgress size={20} color="info" />
          </Backdrop>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;
