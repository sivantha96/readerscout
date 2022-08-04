import {
  ContentMessagePayload,
  CONTENT_MESSAGE_TYPES,
} from "../types/chrome.types";

// called when a new message is received
const messagesFromReactAppListener = (
  type: CONTENT_MESSAGE_TYPES,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: ContentMessagePayload) => void
) => {
  const element = document.getElementById("productTitle");
  console.log(type, sender);

  const response: ContentMessagePayload = {
    type: CONTENT_MESSAGE_TYPES.GET_PRODUCT_TITLE,
    data: element?.innerText,
  };

  sendResponse(response);
};

// fired when a message is sent from either an extension process or a content script.
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
