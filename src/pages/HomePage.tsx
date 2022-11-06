import React, { useEffect, useState } from "react";
import { Backdrop, Box, Button, CircularProgress } from "@mui/material";
import axios from "axios";
import PropTypes from "prop-types";
import AddIcon from "@mui/icons-material/Add";
import BookList, { IBook, IWatchlist } from "src/components/BookList";
import { AMAZON_REGEX, ASIN_REGEX, URLS } from "src/constants";
import Header from "src/components/Header";

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

                if (
                    match &&
                    match.length > 0 &&
                    asinMatch &&
                    asinMatch.length > 0
                ) {
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

    const alreadyAdded = list.some(
        (item) => item.product?.asin === currentAsin
    );

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
            <BookList data={list} onDelete={handleOnDelete} />
            <Button
                onClick={handleOnClick}
                disabled={
                    !isAmazonPage ||
                    !currentAsin ||
                    alreadyAdded ||
                    list.length === 5
                }
                size="large"
                startIcon={
                    alreadyAdded ||
                    list.length === 5 ? undefined : isAmazonPage &&
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
