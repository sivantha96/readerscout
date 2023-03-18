/* eslint-disable no-constant-condition */
import React, { useEffect, useState } from "react";
import { Backdrop, Box, Button, CircularProgress } from "@mui/material";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import { AMAZON_REGEX, ASIN_REGEX, NAVIGATION, PROVIDERS } from "src/constants";
import Header from "src/components/Header";
import { type IWatchItem, type IWatchlist } from "src/types/watchlist.types";
import { type CommonResponse } from "src/types/common.types";
import { type IUser } from "src/types/user.types";
import BookList from "src/components/BookList";
import LinkAuthorAccount from "src/components/LinkAuthorAccount";
import AuthorProfile from "src/components/AuthorProfile";
import { type IAmazonData } from "src/types/amazon.types";

interface HomePageProps {
  onLogout: Function;
  token: string;
  amazonData?: IAmazonData;

  followersCount?: number;
  profilePicture?: string;

  userData?: IUser;
  setUserData: Function;
  setNavigation: Function;
}

const HomePage = ({
  onLogout,
  token,

  amazonData,
  followersCount,
  profilePicture,

  userData,
  setUserData,
  setNavigation,
}: HomePageProps) => {
  const [alertsCount, setCount] = useState<number>(0);
  const [list, setList] = useState<IWatchlist[]>([]);
  const [isAmazonPage, setAmazonPage] = useState<boolean>(false);
  const [currentAsin, setAsin] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleOnDismissAuthorAccountSuggestion = async () => {
    const url = `${
      process.env.REACT_APP_API_BASE_URL ?? ""
    }/users/author-link-suggestion`;
    setUserData((prevState: IUser) => ({
      ...prevState,
      hide_author_suggestion: true,
    }));

    await axios.patch<CommonResponse<IUser>>(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(userData?.provider ? { provider: userData.provider } : {}),
        },
      }
    );
  };

  const updateFollowersCount = async () => {
    try {
      const url = `${
        process.env.REACT_APP_API_BASE_URL ?? ""
      }/users/followers-count`;
      await axios.patch<CommonResponse<IUser>>(
        url,
        {
          count: followersCount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(userData?.provider ? { provider: userData.provider } : {}),
          },
        }
      );
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return onLogout(() => setLoading(false));
      }
    }
  };

  const updateAuthorInfo = async () => {
    try {
      const url = `${
        process.env.REACT_APP_API_BASE_URL ?? ""
      }/users/author-info`;
      await axios.patch<CommonResponse<IUser>>(
        url,
        {
          id: amazonData?.author?.amazonAuthorId,
          asin: amazonData?.author?.asin,
          marketplace: amazonData?.identities?.[0]?.marketplace,
          customer_id: amazonData?.account?.customerId,
          name: amazonData?.identities?.[0]?.claimedAuthorName,
          created_at: amazonData?.identities?.[0]?.createdAt,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(userData?.provider ? { provider: userData.provider } : {}),
          },
        }
      );
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return onLogout(() => setLoading(false));
      }
    }
  };

  const updateProfilePicture = async () => {
    try {
      const url = `${
        process.env.REACT_APP_API_BASE_URL ?? ""
      }/users/profile-picture`;
      await axios.patch<CommonResponse<IUser>>(
        url,
        {
          profile_picture: profilePicture,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(userData?.provider ? { provider: userData.provider } : {}),
          },
        }
      );
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return onLogout(() => setLoading(false));
      }
    }
  };

  useEffect(() => {
    if (followersCount && userData?.provider === PROVIDERS.AMAZON) {
      updateFollowersCount();
    }
  }, [followersCount, userData]);

  useEffect(() => {
    if (amazonData && userData?.provider === PROVIDERS.AMAZON) {
      updateAuthorInfo();
    }
  }, [amazonData, userData]);

  useEffect(() => {
    if (profilePicture && userData?.provider === PROVIDERS.AMAZON) {
      updateProfilePicture();
    }
  }, [profilePicture, userData]);

  const updateUserWatchlist = async (allItems: IWatchlist[]) => {
    const promises = allItems.map(async (listItem) => {
      try {
        const url = `${process.env.REACT_APP_API_BASE_URL ?? ""}/watchlist/${
          listItem._id
        }`;
        await axios.patch<CommonResponse<IWatchlist[]>>(
          url,
          {
            asin: listItem.product.asin,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              ...(userData?.provider ? { provider: userData.provider } : {}),
            },
          }
        );

        stopLoading(listItem._id);
      } catch (error: any) {
        stopLoading(listItem._id);

        if (error?.response?.status === 401) {
          return onLogout(() => setLoading(false));
        }
        setLoading(false);
        console.log("updateUserWatchlist error", error);
      }
    });

    await Promise.all(promises);
  };

  const getLatestWatchlist = async (user: IUser) => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_BASE_URL ?? ""}/watchlist`;
      const res = await axios.get<CommonResponse<IWatchlist[]>>(url, {
        headers: {
          authorization: `Bearer ${token}`,
          provider: user.provider,
        },
      });

      // setUserData(res.data?.data.user);
      let allItems = res.data?.data;

      // get the notification count
      const totalCountRatingCount = allItems.reduce((n, item) => {
        return n + (item.notifications_rating || 0);
      }, 0);

      const totalCountPriceCount = allItems?.reduce((n, item) => {
        return n + (item.notifications_price || 0);
      }, 0);

      const totalCount = totalCountRatingCount + totalCountPriceCount;

      setAlertsCount(totalCount);

      if (totalCount > 0) {
        // if there are new updates
        // set everything to loading state
        allItems = allItems.map((item) => ({ ...item, loading: true }));
        // trigger update all the books in the user's watchlist
        updateUserWatchlist(allItems);
      }

      setList(allItems);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return onLogout(() => setLoading(false));
      }
      setLoading(false);
      console.log("getLatestWatchlist error", error);
    }
  };

  useEffect(() => {
    if (token && userData) {
      getLatestWatchlist(userData);
    }
  }, [token, userData]);

  const handleOnClick = async () => {
    // TODO: convert to new API
    setLoading(true);

    try {
      const res = await axios.put<CommonResponse<IWatchlist>>(
        process.env.REACT_APP_API_BASE_URL as string,
        {
          asin: currentAsin.toString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(userData?.provider ? { provider: userData.provider } : {}),
          },
        }
      );

      setList((prevList) => [...prevList, res.data.data]);
      setLoading(false);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return onLogout(() => setLoading(false));
      }
      setLoading(false);
      console.log("handleOnClick error", error);
    }
  };

  const setAlertsCount = (value: number) => {
    chrome?.action.setBadgeText({ text: value > 0 ? "New" : "" });
    setCount(value);
  };

  const stopLoading = (id: string) => {
    setList((prevList) =>
      prevList.map((item) => {
        if (item._id === id) {
          return {
            ...item,
            loading: false,
          };
        }

        return item;
      })
    );
  };

  const handleOnDelete = async (item: IWatchlist, index: number) => {
    setLoading(true);

    try {
      await axios.delete<CommonResponse<IWatchItem>>(
        process.env.REACT_APP_API_BASE_URL as string,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(userData?.provider ? { provider: userData.provider } : {}),
          },
          params: {
            type: "book",
            id: item._id,
          },
        }
      );

      const newList = [...list];
      newList.splice(index, 1);
      setList(newList);

      setLoading(false);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return onLogout(() => setLoading(false));
      }
      setLoading(false);
      console.log("handleOnDelete error", error);
    }
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

        if (match && match.length > 0 && asinMatch && asinMatch.length > 0) {
          setAsin(asinMatch[2]);
          setAmazonPage(true);
        } else {
          setAmazonPage(false);
        }
      }
    );
  };

  const goToWeb = () => {
    // TODO:
    // const newWindow = window.open(
    //   `${process.env.WEB_URL ?? ""}/user/${userId}`,
    //   "_blank",
    //   "noopener,noreferrer"
    // );
    // if (newWindow) newWindow.opener = null;
  };

  const handleOnClickNotifications = async () => {
    setLoading(true);

    try {
      await axios.delete<CommonResponse<IWatchItem>>(
        process.env.REACT_APP_API_BASE_URL as string,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(userData?.provider ? { provider: userData.provider } : {}),
          },
          params: {
            type: "notification",
          },
        }
      );

      setAlertsCount(0);
      setLoading(false);
      goToWeb();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return onLogout(() => setLoading(false));
      }
      setLoading(false);
      console.log("handleOnClickNotifications error", error);
    }
  };

  useEffect(() => {
    checkUrl();
    chrome?.tabs?.onUpdated?.addListener(checkUrl);
    return () => {
      chrome?.tabs?.onUpdated?.removeListener(checkUrl);
    };
  }, []);

  const alreadyAdded = list.some((item) => item.product?.asin === currentAsin);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "600px",
      }}
    >
      <Header
        alerts={alertsCount}
        onLogout={onLogout}
        onClickNotifications={handleOnClickNotifications}
      />

      {userData?.provider === PROVIDERS.GOOGLE &&
      !userData?.hide_author_suggestion ? (
        <LinkAuthorAccount
          onDismiss={handleOnDismissAuthorAccountSuggestion}
          onClickLink={() => setNavigation(NAVIGATION.LOGIN)}
        />
      ) : null}

      {userData?.provider === PROVIDERS.AMAZON ? (
        <AuthorProfile
          userData={userData}
          amazonData={amazonData}
          followersCount={followersCount}
          profilePicture={profilePicture}
        />
      ) : null}

      <BookList data={list} onDelete={handleOnDelete} loading={loading} />
      <Button
        onClick={handleOnClick}
        disabled={
          !isAmazonPage || !currentAsin || alreadyAdded || list.length === 5
        }
        size="large"
        startIcon={
          alreadyAdded || list.length === 5 ? undefined : isAmazonPage &&
            !currentAsin ? (
            <CircularProgress size={20} color="info" />
          ) : (
            <AddIcon />
          )
        }
        sx={{
          py: 3,
          borderRadius: 0,
        }}
      >
        {list.length === 5
          ? "List is Full"
          : alreadyAdded
          ? "Already Added to the List"
          : isAmazonPage && !currentAsin
          ? ""
          : "Add to the Watch List"}
      </Button>

      <Backdrop open={loading} sx={{ zIndex: 999 }}>
        <CircularProgress />
      </Backdrop>
    </Box>
  );
};

export default HomePage;
