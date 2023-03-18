import React, { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import { Box } from "@mui/material";
import LoginPage from "./pages/LoginPage";
import {
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

function App(): JSX.Element {
  const [isLoading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  const [isSignedIn, setSignedIn] = useState(false);

  const [amazonData, setAmazonData] = useState<IAmazonData>();
  const [followersCount, setFollowersCount] = useState<number>();
  const [profilePicture, setProfilePicture] = useState("");
  const [userData, setUserData] = useState<IUser>();

  const [navigation, setNavigation] = useState("");

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

  const loginUser = async (token: string) => {
    try {
      const url = `${process.env.REACT_APP_API_BASE_URL ?? ""}/auth/login`;
      const res = await axios.post<CommonResponse<IUser>>(url, {
        token,
      });

      setUserData(res.data.data);
      setToken(token);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return handleOnLogout(() => {
          setTimeout(() => {
            setLoading(false);
          }, 2000);
        });
      }
    }
  };

  const loginWithGoogle = (): void => {
    try {
      chrome?.identity?.getAuthToken({}, (response: string) => {
        chrome?.storage?.local
          .set({
            token: response,
            provider: PROVIDERS.GOOGLE,
          })
          .then(() => {
            loginUser(response);
          });
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
      loginUser(res.token);
    });
  };

  const getFollowersCount = async (amazonData: IAmazonData) => {
    if (!amazonData) return;

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

  const getProfileImage = async (amazonData: IAmazonData) => {
    if (!amazonData) return;

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

  const getCSRFToken = async (shouldLogin: boolean) => {
    try {
      const res = await fetch(AWS_AUTHORS_HOME_PAGE, {
        credentials: "include",
      });

      if (res.url.includes("signin")) {
        setSignedIn(false);
        setTimeout(() => {
          setLoading(false);
        }, 2000);
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
            if (shouldLogin) {
              loginWithAmazon();
            } else {
              setTimeout(() => {
                setLoading(false);
              }, 2000);
            }
            return;
          }
        }

        setSignedIn(false);
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.log("getCSRFToken error", error);
    }
  };

  const autoLogin = (): void => {
    chrome?.storage?.local.get("provider").then((res) => {
      getCSRFToken(res.provider === PROVIDERS.AMAZON);

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

  useEffect(() => {
    setLoading(true);
    autoLogin();
  }, []);

  const navigate = (): JSX.Element => {
    switch (true) {
      case navigation === NAVIGATION.LOGIN:
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
          />
        );

      case token.length > 0:
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
          />
        );

      default:
        return (
          <LoginPage
            onSuccess={loginUser}
            amazonData={amazonData}
            isSignedIn={isSignedIn}
            followersCount={followersCount}
            profilePicture={profilePicture}
            isLoading={isLoading}
            setNavigation={setNavigation}
          />
        );
    }
  };

  return <Box>{navigate()}</Box>;
}

export default App;
