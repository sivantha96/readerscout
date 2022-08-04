import React, { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import BookList, { IBook } from "./components/BookList";
import Header from "./components/Header";
import AddIcon from "@mui/icons-material/Add";
import { amazonRegex, asinRegex } from "./constants";
import {
  ContentMessagePayload,
  CONTENT_MESSAGE_TYPES,
} from "./types/chrome.types";
import { isJson } from "./utils";

function App() {
  const [alertsCount, setAlertsCount] = useState<number>(0);
  const [books, setBooks] = useState<IBook[]>([]);
  const [isAmazonPage, setAmazonPage] = useState<boolean>(false);
  const [currentBook, setCurrentBook] = useState<string>("");
  const [currentAsin, setAsin] = useState<string>("");

  const handleOnClick = () => {
    const newBooks: IBook[] = [
      ...books,
      {
        id: currentAsin.toString(),
        name: currentBook,
        added_on: new Date().toISOString(),
      },
    ];
    chrome?.storage?.local?.set({ watchList: JSON.stringify(newBooks) });
    setBooks(newBooks);
  };

  const handleOnDelete = (id: string) => {
    const foundIndex = books.findIndex((book) => book.id === id);
    if (foundIndex > -1) {
      const newBooks: IBook[] = [...books];
      newBooks.splice(foundIndex, 1);
      chrome?.storage?.local?.set({ watchList: JSON.stringify(newBooks) });
      setBooks(newBooks);
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

        const match = url?.toString().match(amazonRegex);
        const asinMatch = url?.match(asinRegex);

        if (match && match.length > 0 && asinMatch && asinMatch.length > 0) {
          setAsin(asinMatch[1]);
          setAmazonPage(true);

          chrome.tabs.sendMessage(
            tabs[0].id || 0,
            CONTENT_MESSAGE_TYPES.GET_PRODUCT_TITLE,
            (response: ContentMessagePayload) => {
              if (!chrome.runtime.lastError) {
                setCurrentBook(response?.data);
                // if you have any response
              } else {
                // if your document doesn’t have any response, it’s fine but you should actually handle
                // it and we are doing this by carefully examining chrome.runtime.lastError
                console.log(chrome.runtime.lastError);
              }
            }
          );
        } else {
          setAmazonPage(false);
        }
      }
    );
  };

  const getUserWatchlist = () => {
    chrome?.storage?.local?.get(
      ["numOfAlerts"],
      (result: { [key: string]: any }) => {
        console.log(isJson(result?.numOfAlerts));
        if (result?.numOfAlerts && isJson(result.numOfAlerts)) {
          setAlertsCount(result.numOfAlerts);
        }
      }
    );

    chrome?.storage?.local?.get(
      ["watchList"],
      (result: { [key: string]: any }) => {
        console.log(isJson(result?.watchList));
        if (result?.watchList && isJson(result.watchList)) {
          const newList: IBook[] = JSON.parse(result.watchList);
          setBooks(newList);
        }
      }
    );
  };

  useEffect(() => {
    getUserWatchlist();
    checkUrl();
    chrome?.tabs?.onUpdated?.addListener(checkUrl);
    return () => {
      chrome?.tabs?.onUpdated?.removeListener(checkUrl);
    };
  }, []);

  const alreadyAdded = books.some((book) => book.id === currentAsin);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "600px",
      }}
    >
      <Header alerts={alertsCount} />
      <BookList books={books} onDelete={handleOnDelete} />
      <Button
        onClick={handleOnClick}
        disabled={!isAmazonPage || !currentBook || alreadyAdded}
        size="large"
        startIcon={<AddIcon />}
        sx={{
          py: 3,
          borderRadius: 0,
        }}
      >
        Add book on this page
      </Button>
    </Box>
  );
}

export default App;
