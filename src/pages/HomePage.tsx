import React, { useEffect, useState } from "react";
import { Backdrop, Box, Button, CircularProgress } from "@mui/material";
import axios from "axios";
import AddIcon from "@mui/icons-material/Add";
import { NAVIGATION, PROVIDERS } from "src/constants";
import Header from "src/components/Header";
import {
  type WatchListResponse,
  type IProduct,
  type IWatchlist,
} from "src/types/watchlist.types";
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

  isAmazonPage: boolean;
  currentAsin?: string;
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

  isAmazonPage,
  currentAsin,
}: HomePageProps) => {
  const [alertsCount, setCount] = useState<number>(0);
  const [list, setList] = useState<IWatchlist[]>([]);

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
      const url = `${
        process.env.REACT_APP_API_BASE_URL ?? ""
      }/users/author-info`;
      await axios.patch<CommonResponse<IUser>>(
        url,
        {
          id: authorId,
          asin: authorAsin,
          marketplace: amazonData.identities?.[0]?.marketplace,
          customer_id: amazonData.account?.customerId,
          name: amazonData.identities?.[0]?.claimedAuthorName,
          created_at: amazonData.identities?.[0]?.createdAt,
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
    if (userData?.provider === PROVIDERS.AMAZON) {
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
        setTimeout(() => {
          setLoading(false);
        }, 2000);
        console.log("updateUserWatchlist error", error);
      }
    });

    await Promise.all(promises);
  };

  const getLatestWatchlist = async (user: IUser) => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_BASE_URL ?? ""}/watchlist`;
      const res = await axios.get<CommonResponse<WatchListResponse>>(url, {
        headers: {
          authorization: `Bearer ${token}`,
          provider: user.provider,
        },
      });

      // setUserData(res.data?.data.user);
      let allItems = res.data?.data?.watchList || [];

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
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      console.log("getLatestWatchlist error", error);
    }
  };

  useEffect(() => {
    if (token && userData) {
      getLatestWatchlist(userData);
    }
  }, [token, userData]);

  const handleOnClick = async () => {
    setLoading(true);

    try {
      const url = `${process.env.REACT_APP_API_BASE_URL ?? ""}/watchlist/`;
      const res = await axios.post<CommonResponse<IWatchlist>>(
        url,
        {
          asin: currentAsin?.toString(),
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
      setTimeout(() => {
        setLoading(false);
      }, 2000);
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
      const url = `${process.env.REACT_APP_API_BASE_URL ?? ""}/watchlist/${
        item._id
      }`;

      await axios.delete<CommonResponse<IProduct>>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(userData?.provider ? { provider: userData.provider } : {}),
        },
        params: {
          id: item._id,
        },
      });

      const newList = [...list];
      newList.splice(index, 1);
      setList(newList);

      setLoading(false);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return onLogout(() => setLoading(false));
      }
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      console.log("handleOnDelete error", error);
    }
  };

  const goToWeb = () => {
    const newWindow = window.open(
      `${process.env.REACT_APP_WEB_URL ?? ""}/user/${userData?.hash ?? ""}`,
      "_blank",
      "noopener,noreferrer"
    );
    if (newWindow) newWindow.opener = null;
  };

  const handleOnClickNotifications = async () => {
    setLoading(true);

    try {
      const url = `${
        process.env.REACT_APP_API_BASE_URL ?? ""
      }/users/notifications`;

      await axios.delete<CommonResponse<IProduct>>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(userData?.provider ? { provider: userData.provider } : {}),
        },
      });

      setAlertsCount(0);
      setLoading(false);
      goToWeb();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        return onLogout(() => setLoading(false));
      }
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      console.log("handleOnClickNotifications error", error);
    }
  };

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
        hideSettings={false}
      />

      {userData?.provider === PROVIDERS.GOOGLE &&
      !userData?.hide_author_suggestion ? (
        <LinkAuthorAccount
          onDismiss={handleOnDismissAuthorAccountSuggestion}
          onClickLink={() => setNavigation(NAVIGATION.AMAZON_CONNECT)}
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
          !isAmazonPage ||
          !currentAsin ||
          alreadyAdded ||
          (userData?.provider === PROVIDERS.GOOGLE && list.length > 5) ||
          (userData?.provider === PROVIDERS.AMAZON && list.length > 50)
        }
        size="large"
        startIcon={
          alreadyAdded ||
          list.length === 5 ||
          !isAmazonPage ? undefined : !currentAsin ? (
            <CircularProgress size={20} color="info" />
          ) : (
            <AddIcon />
          )
        }
        sx={{
          py: 3,
          borderRadius: 0,
          textTransform: "none",
          lineHeight: 1.25,
        }}
      >
        {(userData?.provider === PROVIDERS.GOOGLE && list.length > 5) ||
        (userData?.provider === PROVIDERS.AMAZON && list.length > 50)
          ? "List is Full"
          : alreadyAdded
          ? "Already Added to the List"
          : isAmazonPage && !currentAsin
          ? ""
          : isAmazonPage
          ? "Add to the List"
          : "Add Another Book By Going To Its Amazon Page And Clicking Here"}
      </Button>

      <Backdrop open={loading} sx={{ zIndex: 999 }}>
        <CircularProgress />
      </Backdrop>
    </Box>
  );
};

export default HomePage;
