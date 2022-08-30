import React, { useEffect, useState } from "react";
import StartupPage from "./pages/StartupPage";
import HomePage from "./pages/HomePage";
import { Backdrop, Box, CircularProgress } from "@mui/material";

function App() {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState("");

  const handleOnLogout = (callback?: Function) => {
    chrome?.identity?.clearAllCachedAuthTokens(() => {
      setToken("");
      callback?.();
    });
  };

  const getAuthTokens = () => {
    setLoading(true);
    chrome?.identity?.getAuthToken(
      {
        interactive: true,
      },
      (response: string) => {
        setLoading(false);
        setToken(response);
        chrome.storage.local.set({ token: response });
      }
    );
  };

  useEffect(() => {
    getAuthTokens();
  }, []);

  const navigate = () => {
    if (token) {
      return <HomePage onLogout={handleOnLogout} token={token} />;
    }

    return <StartupPage onLogin={getAuthTokens} />;
  };

  return (
    <Box>
      {navigate()}
      <Backdrop open={loading} sx={{ zIndex: 999 }}>
        <CircularProgress />
      </Backdrop>
    </Box>
  );
}

export default App;
