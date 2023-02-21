import { ContentMessagePayload, MESSAGE_TYPES } from "src/types/chrome.types";

const showToast = (message: string) => {
  // append html element to webpage
  const toastContainer = document.createElement("div");
  toastContainer.innerText = message;
  toastContainer.className = "toast";
  document.body.appendChild(toastContainer);
  document.body.style.backgroundColor = "orange";
};

chrome.runtime.onMessage.addListener(
  (
    request: ContentMessagePayload,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ContentMessagePayload) => void
  ) => {
    switch (request.type) {
      case MESSAGE_TYPES.SHOW_TOAST:
        break;

      default:
        break;
    }

    showToast(request.data.message);
    sendResponse({ type: MESSAGE_TYPES.SUCCESS_SHOW_TOAST });
  }
);
