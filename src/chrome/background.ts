import { PROVIDERS } from "src/constants";
import { type CommonResponse } from "src/types/common.types";
import { type WatchListResponse } from "src/types/watchlist.types";

function checkForValidUrls(): void {
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

      const url = tabs[0]?.url ?? "";
      const match = url?.toString().match(amazonRegex);
      const asinMatch = url?.match(asinRegex);

      if (
        match != null &&
        match?.length > 0 &&
        asinMatch != null &&
        asinMatch?.length > 0
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
): void {
  chrome.notifications.create(notification);
}

function setNotificationBadge(value: number): void {
  chrome.action.getBadgeText({}, (result) => {
    if (result !== "New" && value > 0) {
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

  void chrome.action.setBadgeText({ text: value > 0 ? "New" : "" });
  void chrome.action.setBadgeBackgroundColor({ color: "#c20000" });
}

async function getWatchlist(token: string, provider: string): Promise<void> {
  const url = `${process.env.REACT_APP_API_BASE_URL ?? ""}/watchlist`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`, provider },
  });

  const res: CommonResponse<WatchListResponse> = await response.json();

  if (res.error) {
    chrome.alarms.clearAll();
    return;
  }

  const allItems = res.data?.watchList || [];
  const totalCountRatingCount = allItems?.reduce((n, item) => {
    return n + (item.notifications_rating ?? 0);
  }, 0);
  const totalCountPriceCount = allItems?.reduce((n, item) => {
    return n + (item.notifications_price ?? 0);
  }, 0);

  const totalCount = totalCountRatingCount + totalCountPriceCount;

  setNotificationBadge(totalCount);
}

async function refreshWatchlist(): Promise<void> {
  try {
    const res = await chrome?.storage?.local.get("provider");

    // if the provider is NONE then the user has logged out from google, hence do not login automatically
    if (res.provider === PROVIDERS.NONE) {
      return;
    }

    // if the provider is amazon, then refresh the list using token
    if (res.provider === PROVIDERS.AMAZON) {
      const res = await chrome?.storage?.local.get("token");
      getWatchlist(res.token, PROVIDERS.AMAZON);
    }

    // provider can be GOOGLE or undefined
    // try to login with GOOGLE and refresh the list
    chrome?.identity?.getAuthToken({}, (token: string) => {
      if (token?.length > 0) {
        getWatchlist(token, PROVIDERS.GOOGLE);
      }
    });
  } catch (error: any) {
    await chrome.alarms.clearAll();
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "REFRESH_WATCHLIST") {
    await refreshWatchlist();
  }
});

// when the chrome extension is installed the first time
chrome.runtime.onInstalled.addListener(async () => {
  createNotification({
    type: "basic",
    iconUrl: "logo192.png",
    title: "Welcome to ReaderScout",
    message: "Start tracking price changes and new reviews for books on Amazon",
    buttons: [{ title: "Welcome to ReaderScout" }],
    priority: 0,
    isClickable: false,
  });

  void refreshWatchlist();
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
  void refreshWatchlist();
  chrome.alarms.create("REFRESH_WATCHLIST", { periodInMinutes: 60 });
});

// everytime a new chrome window is opened
chrome.runtime.onStartup.addListener(async () => {
  void refreshWatchlist();
  chrome.alarms.create("REFRESH_WATCHLIST", { periodInMinutes: 60 });
});

export {};
