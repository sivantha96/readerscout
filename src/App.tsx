import React, { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import { Box, Snackbar } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import {
  AMAZON_REGEX,
  ASIN_REGEX,
  AUTHOR_REGEX,
  AWS_AUTHORS_API,
  AWS_AUTHORS_HOME_PAGE,
  AWS_PROFILE_IMAGE_API,
  NAVIGATION,
  PROVIDERS,
} from "./constants";
import { type IAmazonData } from "./types/amazon.types";
import { type IUser } from "./types/user.types";
import axios from "axios";
import { type CommonResponse } from "./types/common.types";
import StartupPage from "./pages/StartupPage";

function App(): JSX.Element {
  const [isLoading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [isGoogleLoading, setGoogleLoading] = useState(false);
  const [isSnackbarOpen, setSnackbarOpen] = useState(false);

  const [isSignedIn, setSignedIn] = useState(false);

  const [amazonData, setAmazonData] = useState<IAmazonData>();
  const [followersCount, setFollowersCount] = useState<number>();
  const [profilePicture, setProfilePicture] = useState("");
  const [userData, setUserData] = useState<IUser>();

  const [navigation, setNavigation] = useState("");

  // current page data
  const [isAmazonPage, setAmazonPage] = useState<boolean>(false);
  const [isAmazonAuthorPage, setIsAmazonAuthorPage] = useState(false);
  const [currentAsin, setAsin] = useState<string>("");

  const handleOnLogout = (callback: () => void): void => {
    chrome?.identity?.clearAllCachedAuthTokens(async () => {
      await chrome?.storage?.local?.set({
        provider: "NONE",
        token: null,
      });
      setToken("");
      callback?.();
    });
  };

  const loginUser = async (
    token: string,
    provider: string,
    callbackFn?: (success: boolean) => void,
    interactive?: boolean
  ) => {
    try {
      if (token) {
        const url = `${process.env.REACT_APP_API_BASE_URL ?? ""}/auth/login`;
        const res = await axios.post<CommonResponse<IUser>>(url, {
          token,
        });

        setUserData(res.data.data);
      }

      chrome?.storage?.local
        .set({
          token,
          provider,
        })
        .then(() => {
          setTimeout(() => {
            callbackFn?.(true);
            setLoading(false);
            setGoogleLoading(false);
          }, 2000);
        })
        .catch(() => {
          setTimeout(() => {
            callbackFn?.(false);
            setLoading(false);
            setGoogleLoading(false);
          }, 2000);
        });
      setToken(token);
    } catch (error: any) {
      callbackFn?.(false);
      if (error?.response?.status === 401) {
        return handleOnLogout(() => {
          setTimeout(() => {
            if (interactive) {
              setSnackbarOpen(true);
            }
            setGoogleLoading(false);
            setLoading(false);
          }, 2000);
        });
      }
    }
  };

  const loginWithGoogle = (interactive = false): void => {
    try {
      chrome?.identity?.getAuthToken({ interactive }, (response: string) => {
        loginUser(response, PROVIDERS.GOOGLE, undefined, interactive);
      });
    } catch (error) {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const loginWithAmazon = (): void => {
    // this function get executed only if the local storage has provider === AMAZON
    // that means local storage should have a token
    chrome?.storage?.local.get("token").then((res) => {
      loginUser(res.token, PROVIDERS.AMAZON);
    });
  };

  const getFollowersCount = async (amazonData?: IAmazonData) => {
    if (!amazonData?.author) return;

    const authorId = amazonData.author.amazonAuthorId;
    const url = `${AWS_AUTHORS_API}/${authorId}/latestFollowCount`;

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

    setFollowersCount(data.count);
  };

  const getProfileImage = async (amazonData?: IAmazonData) => {
    if (!amazonData?.author) return;

    const authorId = amazonData.author.amazonAuthorId;
    const url = `${AWS_PROFILE_IMAGE_API}/${authorId}`;

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

    setProfilePicture(data.url);
  };

  const getCSRFToken = async (provider: string) => {
    try {
      const res = await fetch(AWS_AUTHORS_HOME_PAGE, {
        credentials: "include",
      });

      if (res.url.includes("signin")) {
        setSignedIn(false);
        if (provider === PROVIDERS.AMAZON || provider === PROVIDERS.NONE) {
          setTimeout(() => {
            setLoading(false);
          }, 2000);
        }
      } else {
        const parser = new DOMParser();

        const html = await res.text();
        const doc = parser.parseFromString(html, "text/html");

        const elem = doc.getElementById("__data__");
        if (elem) {
          const data = JSON.parse(elem.innerText);
          if (data) {
            setSignedIn(true);
            setAmazonData(data);
            getProfileImage(data);
            getFollowersCount(data);
            if (provider === PROVIDERS.AMAZON) {
              loginWithAmazon();
            } else {
              if (
                provider === PROVIDERS.AMAZON ||
                provider === PROVIDERS.NONE
              ) {
                setTimeout(() => {
                  setLoading(false);
                }, 2000);
              }
            }
            return;
          }
        }

        setSignedIn(false);
        if (provider === PROVIDERS.AMAZON || provider === PROVIDERS.NONE) {
          setTimeout(() => {
            setLoading(false);
          }, 2000);
        }
      }
    } catch (error) {
      console.log("get token error", error);
    }
  };

  const autoLogin = (): void => {
    chrome?.storage?.local.get("provider").then((res) => {
      getCSRFToken(res.provider);

      if (res.provider === PROVIDERS.NONE) {
        // if the provider is NONE then the user has logged out from google, hence do not login automatically
        return;
      }

      if (res.provider === PROVIDERS.AMAZON) {
        // if the provider is Amazon the user will be logged in automatically by the getCSRFToken function
        return;
      }

      // if the provider is undefined or GOOGLE
      loginWithGoogle();
    });
  };

  const checkUrl = (): void => {
    chrome?.tabs?.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        const url = tabs[0]?.url ?? "";

        const match = url?.toString().match(AMAZON_REGEX);
        const asinMatch = url?.match(ASIN_REGEX);

        setIsAmazonAuthorPage(AUTHOR_REGEX.test(url));

        if (match && match.length > 0 && asinMatch && asinMatch.length > 0) {
          setAsin(asinMatch[2]);
          setAmazonPage(true);
        } else {
          setAmazonPage(false);
        }
      }
    );
  };

  useEffect(() => {
    setLoading(true);
    autoLogin();
    checkUrl();
    chrome?.tabs?.onUpdated?.addListener(checkUrl);
    return () => {
      chrome?.tabs?.onUpdated?.removeListener(checkUrl);
    };
  }, []);

  const navigate = (): JSX.Element => {
    switch (true) {
      case navigation === NAVIGATION.AMAZON_CONNECT:
        return (
          <LoginPage
            onSuccess={loginUser}
            amazonData={amazonData}
            isSignedIn={isSignedIn}
            followersCount={followersCount}
            profilePicture={profilePicture}
            isLoading={isLoading}
            newUser={false}
            setNavigation={setNavigation}
            currentToken={token}
            isAmazonAuthorPage={isAmazonAuthorPage}
          />
        );

      case navigation === NAVIGATION.AMAZON_LOGIN:
        return (
          <LoginPage
            onSuccess={loginUser}
            amazonData={amazonData}
            isSignedIn={isSignedIn}
            followersCount={followersCount}
            profilePicture={profilePicture}
            isLoading={isLoading}
            setNavigation={setNavigation}
            isAmazonAuthorPage={isAmazonAuthorPage}
          />
        );

      case token?.length > 0:
      case navigation === NAVIGATION.HOME:
        return (
          <HomePage
            onLogout={handleOnLogout}
            token={token}
            userData={userData}
            setUserData={setUserData}
            setNavigation={setNavigation}
            followersCount={followersCount}
            profilePicture={profilePicture}
            amazonData={amazonData}
            isAmazonPage={isAmazonPage}
            currentAsin={currentAsin}
          />
        );

      default:
        return (
          <StartupPage
            isGoogleLoading={isGoogleLoading}
            onLoginWithGoogle={() => {
              setGoogleLoading(true);
              loginWithGoogle(true);
            }}
            onLoginWithAmazon={() => {
              setNavigation(NAVIGATION.AMAZON_LOGIN);
            }}
            hideButtons={isLoading}
          />
        );
    }
  };

  return (
    <Box>
      {navigate()}
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message="Looks like you don't have an account. Register to get started."
      />
    </Box>
  );
}

export default App;
