import { IWatchlist } from "src/components/BookList";
import { URLS } from "src/constants";
import { CommonResponse } from "src/pages/HomePage";

function checkForValidUrls() {
    chrome.tabs.query(
        {
            active: true,
            currentWindow: true,
        },
        (tabs) => {
            const amazonRegex =
                /https?:\/\/(?=(?:....)?amazon|smile)(www|smile)\S+com(((?:\/(?:dp|gp)\/([A-Z0-9]+))?\S*[?&]?(?:tag=))?\S*?)(?:#)?(\w*?-\w{2})?(\S*)(#?\S*)+/;
            const asinRegex = /(?:dp|gp)\/(.{10})(\/)/;

            const url = tabs[0].url || "";
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
    chrome.action.setBadgeText({ text: value.toString() });
    chrome.action.setBadgeBackgroundColor({ color: "#c20000" });
}

function fetchWatchlist() {
    chrome?.storage?.local?.get(
        ["token"],
        async (result: { [key: string]: any }) => {
            if (result?.token) {
                try {
                    const response = await fetch(URLS.INFO_API, {
                        method: "GET",
                        headers: { Authorization: `Bearer ${result?.token}` },
                    });

                    const res: CommonResponse<IWatchlist[]> =
                        await response.json();

                    const allItems = res.data;
                    const totalCount = allItems.reduce((n, item) => {
                        return n + (item.notifications || 0);
                    }, 0);

                    setNotificationBadge(totalCount);
                    chrome.storage.local.set({ numOfAlerts: totalCount });
                } catch (error: any) {
                    console.log("fetch error", error);
                }
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
        title: "Welcome to Bookshopper",
        message: "You can add you books from amazon to track the rating!",
        buttons: [{ title: "Welcome to Bookshopper." }],
        priority: 0,
        isClickable: false,
    });

    const numOfAlerts = 0;
    chrome.storage.local.set({ numOfAlerts });
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
