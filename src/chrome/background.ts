import axios from "axios";
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

      if (match && match.length > 0 && asinMatch && asinMatch.length > 0) {
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
});

chrome.tabs.onUpdated.addListener(() => {
  checkForValidUrls();
});

chrome.tabs.onActivated.addListener(() => {
  checkForValidUrls();
});

// everytime a new chrome window is opened
chrome.windows.onCreated.addListener(async () => {
  chrome?.storage?.local?.get(
    ["token"],
    async (result: { [key: string]: any }) => {
      if (result?.token) {
        try {
          const res = await axios.get<CommonResponse<IWatchlist[]>>(
            URLS.INFO_API,
            {
              headers: { Authorization: `Bearer ${result?.token}` },
            }
          );

          const allItems = res.data?.data;
          const totalCount = allItems.reduce((n, item) => {
            return n + (item.notifications || 0);
          }, 0);

          setNotificationBadge(totalCount);
          chrome.storage.local.set({ numOfAlerts: totalCount });
        } catch (error: any) {
          console.log(error);
          chrome.storage.local.set({ error: "oops" });
        }
      }
    }
  );
});

export {};
