import React, { useEffect, useState } from "react";
import { Backdrop, Box, Button, CircularProgress } from "@mui/material";
import axios from "axios";
import PropTypes from "prop-types";
import AddIcon from "@mui/icons-material/Add";
import BookList, { IBook, IWatchlist } from "src/components/BookList";
import { AMAZON_REGEX, ASIN_REGEX, URLS } from "src/constants";
import {
    ContentMessagePayload,
    CONTENT_MESSAGE_TYPES,
} from "src/types/chrome.types";
import { isJson } from "src/utils";
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

interface WatchListResponse {
    watchList: IWatchlist[];
    userId: string;
}

const HomePage = ({ onLogout, token }: HomePageProps) => {
    const [alertsCount, setCount] = useState<number>(0);
    const [list, setList] = useState<IWatchlist[]>([]);
    const [isAmazonPage, setAmazonPage] = useState<boolean>(false);
    const [currentBook, setCurrentBook] = useState<string>("");
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
            if (error?.response.status === 401) {
                onLogout(() => setLoading(false));
            }
            setLoading(false);
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

        console.log(promises);

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
            if (error?.response.status === 401) {
                onLogout(() => setLoading(false));
            }
            setLoading(false);
        }
    };

    const checkUrl = (): void => {
        chrome?.tabs?.query(
            {
                active: true,
                currentWindow: true,
            },
            (tabs) => {
                const url = tabs[0].url || "";

                const match = url?.toString().match(AMAZON_REGEX);
                const asinMatch = url?.match(ASIN_REGEX);

                if (
                    match &&
                    match.length > 0 &&
                    asinMatch &&
                    asinMatch.length > 0
                ) {
                    setAsin(asinMatch[1]);
                    setAmazonPage(true);

                    chrome?.tabs?.sendMessage(
                        tabs[0].id || 0,
                        CONTENT_MESSAGE_TYPES.GET_PRODUCT_TITLE,
                        (response: ContentMessagePayload) => {
                            if (!chrome?.runtime?.lastError) {
                                setCurrentBook(response?.data);
                                // if you have any response
                            } else {
                                // if your document doesn’t have any response, it’s fine but you should actually handle
                                // it and we are doing this by carefully examining chrome.runtime.lastError
                                console.log(chrome?.runtime?.lastError);
                            }
                        }
                    );
                } else {
                    setAmazonPage(false);
                }
            }
        );
    };

    const getAlerts = () => {
        chrome?.storage?.local?.get(
            ["numOfAlerts"],
            (result: { [key: string]: any }) => {
                if (result?.numOfAlerts && isJson(result.numOfAlerts)) {
                    setAlertsCount(result.numOfAlerts);
                }
            }
        );
    };

    const goToWeb = () => {
        // TODO: attach userId to the end of the url
        console.log(userId);
        const newWindow = window.open(
            "https://publisherrocket.com/",
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
            if (error?.response.status === 401) {
                onLogout(() => setLoading(false));
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        getAlerts();
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
                    !currentBook ||
                    alreadyAdded ||
                    list.length === 20
                }
                size="large"
                startIcon={
                    alreadyAdded || list.length === 20 ? undefined : <AddIcon />
                }
                sx={{
                    py: 3,
                    borderRadius: 0,
                }}
            >
                {list.length === 20
                    ? "List is Full"
                    : alreadyAdded
                    ? "Already Added to the List"
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
