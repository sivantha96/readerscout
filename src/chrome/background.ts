function checkForValidUrls(value: string) {
  console.log(value);
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    (tabs) => {
      console.log(value, "tabs", tabs);
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

  const numOfAlerts = 10;
  setNotificationBadge(numOfAlerts);

  const mockBooks = [
    {
      id: "asdadaidyasd",
      name: "Harry potter and the Half Blood Prince. Volume 03. Harry potter and the Half Blood Prince. Volume 03, Harry potter and the Half Blood Prince. Volume 03, Harry potter and the Half Blood Prince. Volume 03",
      added_on: "2022-07-28T07:39:47.876Z",
    },
    {
      id: "aosdhaohdohajd",
      name: "Game of Thrones",
      added_on: "2022-07-28T07:39:47.876Z",
    },
  ];

  chrome.storage.local.set({ numOfAlerts });
  chrome.storage.local.set({ watchList: JSON.stringify(mockBooks) });
});

chrome.tabs.onUpdated.addListener(() => {
  checkForValidUrls("onUpdated");
});

chrome.tabs.onActivated.addListener(() => {
  checkForValidUrls("onActivated");
});

// everytime a new chrome window is opened
chrome.windows.onCreated.addListener(async () => {
  // TODO: make an API call to the backend and get the watchlist and the number of alerts
  const numOfAlerts = 14;
  setNotificationBadge(numOfAlerts);

  const mockBooks = [
    {
      id: "asdadaidyasd",
      name: "Harry potter and the Half Blood Prince. Volume 03. Harry potter and the Half Blood Prince. Volume 03, Harry potter and the Half Blood Prince. Volume 03, Harry potter and the Half Blood Prince. Volume 03",
      added_on: "2022-07-28T07:39:47.876Z",
    },
    {
      id: "aosdhaohdohajd",
      name: "Game of Thrones",
      added_on: "2022-07-28T07:39:47.876Z",
    },
    {
      id: "aodjbaobdoabsod",
      name: "Lord of the Rings",
      added_on: "2022-07-28T07:39:47.876Z",
    },
  ];

  chrome.storage.local.set({ numOfAlerts });
  chrome.storage.local.set({ watchList: JSON.stringify(mockBooks) });

  // whenever some update happen on a tab including the startup
});

export {};
