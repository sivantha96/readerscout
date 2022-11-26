import { URLS } from "src/constants";
import { CommonResponse, WatchListResponse } from "src/pages/HomePage";

function checkForValidUrls() {
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true,
        },
        (tabs) => {
            const amazonRegex =
                /https?:\/\/(?=(?:....)?amazon|smile)(www|smile)\S+com(((?:\/(?:dp|gp\/product|exec\/obidos\/asin)(\/)?([A-Z0-9]+))?\S*[?&]?(?:tag=))?\S*?)(?:#)?(\w*?-\w{2})?(\S*)(#?\S*)+/;
            const asinRegex =
                /(?:dp|gp\/product|exec\/obidos\/asin)\/(\.+\/)?(.{10})/;

            const url = tabs[0]?.url || "";
            const match = url?.toString().match(amazonRegex);
            const asinMatch = url?.match(asinRegex);

            if (
                match &&
                match.length > 0 &&
                asinMatch &&
                asinMatch.length > 0
            ) {
                chrome.action.setIcon({
                    path: "logo16.png",
                });
            } else {
                chrome.action.setIcon({
                    path: "logo-disabled16.png",
                });
            }
        }
    );
}

function createNotification(
    notification: chrome.notifications.NotificationOptions<true>
) {
    chrome.notifications.create(notification);
}

function setNotificationBadge(value: number) {
    chrome.action.getBadgeText({}, (result) => {
        if (result === "" && value > 0) {
            createNotification({
                type: "basic",
                iconUrl: "logo192.png",
                title: "New Updates Available",
                message: "Open up the extension to see new updates",
                priority: 0,
                isClickable: false,
            });
        }
    });

    chrome.action.setBadgeText({ text: value > 0 ? "New" : "" });
    chrome.action.setBadgeBackgroundColor({ color: "#c20000" });
}

function fetchWatchlist() {
    chrome?.identity?.getAuthToken(
        { interactive: true },
        async (token: string) => {
            try {
                const response = await fetch(URLS.INFO_API, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                const res: CommonResponse<WatchListResponse> =
                    await response.json();

                const allItems = res.data.watchList;
                const totalCountRatingCount = allItems?.reduce((n, item) => {
                    return n + (item.notifications_rating || 0);
                }, 0);
                const totalCountPriceCount = allItems?.reduce((n, item) => {
                    return n + (item.notifications_price || 0);
                }, 0);

                const totalCount = totalCountRatingCount + totalCountPriceCount;

                setNotificationBadge(totalCount);
            } catch (error: any) {
                console.log("fetchWatchlist error", error);
            }
        }
    );
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm && alarm.name === "REFRESH_WATCHLIST") {
        fetchWatchlist();
    }
});

// when the chrome extension is installed the first time
chrome.runtime.onInstalled.addListener(async () => {
    createNotification({
        type: "basic",
        iconUrl: "logo192.png",
        title: "Welcome to ReaderScout",
        message:
            "Start tracking price changes and new reviews for books on Amazon",
        buttons: [{ title: "Welcome to ReaderScout" }],
        priority: 0,
        isClickable: false,
    });

    fetchWatchlist();
    chrome.alarms.create("REFRESH_WATCHLIST", { periodInMinutes: 60 });
});

// when the tab is updated
chrome.tabs.onUpdated.addListener(() => {
    checkForValidUrls();
});

// when a new tab if focused
chrome.tabs.onActivated.addListener(() => {
    checkForValidUrls();
});

// everytime the chrome is restarted
chrome.runtime.onStartup.addListener(() => {
    fetchWatchlist();
    chrome.alarms.create("REFRESH_WATCHLIST", { periodInMinutes: 60 });
});

// everytime a new chrome window is opened
chrome.runtime.onStartup.addListener(async () => {
    fetchWatchlist();
    chrome.alarms.create("REFRESH_WATCHLIST", { periodInMinutes: 60 });
});

export {};
