import React, { useEffect, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import axios from "axios";
import PropTypes from "prop-types";
import AddIcon from "@mui/icons-material/Add";
import BookList, { IBook, IWatchlist } from "src/components/BookList";
import { AMAZON_REGEX, ASIN_REGEX, URLS } from "src/constants";
import Header from "src/components/Header";
import { ContentMessagePayload, MESSAGE_TYPES } from "src/types/chrome.types";

interface HomePageProps {
  onLogout: Function;
  token: string;
}

export interface CommonResponse<T> {
  error: boolean;
  message: string;
  data: T;
}

export interface WatchListResponse {
  watchList: IWatchlist[];
  userId: string;
}

const HomePage = ({ onLogout, token }: HomePageProps) => {
  const [alertsCount, setCount] = useState<number>(0);
  const [list, setList] = useState<IWatchlist[]>([]);
  const [isAmazonPage, setAmazonPage] = useState<boolean>(false);
  const [currentAsin, setAsin] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [followersCount, setFollowersCount] = useState<number>(-1);
  const [authorId, setAuthorId] = useState("");

  const getFollowersCount = async (authorId: string) => {
    setLoading(true);
    try {
      const url = `${URLS.AWS_AUTHOR}/${authorId}/latestFollowCount`;
      const res = await axios.get(url);

      setFollowersCount(res.data?.count || -1);
      setLoading(false);
    } catch (error: any) {
      if (error.status === "UNAUTHORIZED") {
        onLogout(() => setLoading(false));
      }
    }
  };

  useEffect(() => {
    chrome.storage.local.get("authorId").then((res) => {
      if (res.authorId) {
        setAuthorId(res.authorId);
        return getFollowersCount(res.authorId);
      }

      chrome.storage.onChanged.addListener((changes, namespace) => {
        for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
          if (namespace === "local" && key === "authorId" && !oldValue) {
            setAuthorId(newValue);
            getFollowersCount(newValue);
          }
        }
      });
    });
  }, []);

  const handleOnClick = async () => {
    setLoading(true);

    try {
      const res = await axios.put<CommonResponse<IWatchlist>>(
        URLS.INFO_API,
        {
          asin: currentAsin.toString(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setList((prevList) => [...prevList, res.data.data]);
      setLoading(false);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        onLogout(() => setLoading(false));
      }
      setLoading(false);
      console.log("add book error", error);
    }
  };

  const setAlertsCount = (value: number) => {
    chrome.action.setBadgeText({ text: value > 0 ? "New" : "" });
    setCount(value);
  };

  const getLatestWatchlist = async () => {
    setLoading(true);
    try {
      const res = await axios.get<CommonResponse<WatchListResponse>>(
        URLS.INFO_API,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUserId(res.data?.data.userId);
      let allItems = res.data?.data.watchList;

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
      setLoading(false);
    } catch (error: any) {
      if (error.status === "UNAUTHORIZED") {
        onLogout(() => setLoading(false));
      }
    }
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

  const updateUserWatchlist = async (allItems: IWatchlist[]) => {
    const promises = allItems.map(async (listItem) => {
      try {
        await axios.patch<CommonResponse<IWatchlist[]>>(
          URLS.INFO_API,
          {
            asin: listItem.product.asin,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        stopLoading(listItem._id);
      } catch (error: any) {
        stopLoading(listItem._id);

        if (error.status === "UNAUTHORIZED") {
          onLogout(() => setLoading(false));
        }
      }
    });

    await Promise.all(promises);
  };

  const handleOnDelete = async (item: IWatchlist, index: number) => {
    setLoading(true);

    try {
      await axios.delete<CommonResponse<IBook>>(URLS.INFO_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          type: "book",
          id: item._id,
        },
      });

      const newList = [...list];
      newList.splice(index, 1);
      setList(newList);

      setLoading(false);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        onLogout(() => setLoading(false));
      }
      setLoading(false);
      console.log("delete error", error);
    }
  };

  const checkUrl = (): void => {
    chrome?.tabs?.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        const url = tabs[0]?.url || "";

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
    const newWindow = window.open(
      `${URLS.WEB_URL}/user/${userId}`,
      "_blank",
      "noopener,noreferrer"
    );
    if (newWindow) newWindow.opener = null;
  };

  const sendMessage = (message: string) => {
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id || 0,
          {
            type: MESSAGE_TYPES.SHOW_TOAST,
            data: { message },
          },
          (res: ContentMessagePayload) => {
            if (!chrome?.runtime?.lastError) {
              console.log(res, "sendMessage");

              // if you have any response
            } else {
              // if your document doesn’t have any response, it’s fine but you should actually handle
              // it and we are doing this by carefully examining chrome.runtime.lastError
              console.log(chrome?.runtime?.lastError);
            }
          }
        );
      }
    });
  };

  const handleOnClickNotifications = async () => {
    setLoading(true);

    try {
      await axios.delete<CommonResponse<IBook>>(URLS.INFO_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          type: "notification",
        },
      });

      setAlertsCount(0);
      setLoading(false);
      goToWeb();
    } catch (error: any) {
      if (error?.response?.status === 401) {
        onLogout(() => setLoading(false));
      }
      setLoading(false);
      console.log("on click notifications error", error);
    }
  };

  useEffect(() => {
    getLatestWatchlist();
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
        onClickNotifications={handleOnClickNotifications}
      />
      {!authorId && (
        <Button
          onClick={async () => {
            chrome.tabs.executeScript({
              code: `document.body.style.backgroundColor = "orange";`,
            });

            const newURL = "https://author.amazon.com/marketingAndReports";
            chrome.windows.create(
              {
                url: newURL,
                focused: true,
                state: "normal",
                type: "popup",
                setSelfAsOpener: true,
              },
              (window) => {
                const windowId = window?.id;
                console.log(windowId, "window?.id");

                chrome.storage.onChanged.addListener((changes, namespace) => {
                  for (const [key, { oldValue }] of Object.entries(changes)) {
                    if (
                      namespace === "local" &&
                      key === "authorId" &&
                      !oldValue
                    ) {
                      if (windowId) {
                        chrome.windows.remove(windowId);
                      }
                      sendMessage("Logged In Successfully");
                    }
                  }
                });
              }
            );
          }}
        >
          Sign up with Amazon
        </Button>
      )}
      {followersCount > -1 && (
        <Typography>Followers: {followersCount}</Typography>
      )}
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

HomePage.propTypes = {
  onLogout: PropTypes.func,
  onRefreshToken: PropTypes.func,
};

export default HomePage;
