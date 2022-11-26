import { Box, Link, Typography } from "@mui/material";
import React from "react";
import Lottie from "react-lottie-player";
import EmptyListAnimation from "src/assets/animations/empty-list.json";
import { Colors } from "src/assets/colors";

const EmptyList = () => {
    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexGrow: 100,
                maxHeight: "500px",
                flexDirection: "column",
                background: "#ffffff",
            }}
        >
            <Lottie
                loop
                animationData={EmptyListAnimation}
                play
                style={{ width: 200, height: 200 }}
            />
            <Typography
                sx={{
                    textAlign: "center",
                    mb: 2,
                }}
                variant="h6"
            >
                Watchlist is Empty
            </Typography>
            <Typography
                sx={{
                    textAlign: "center",
                    px: 4,
                    whiteSpace: "pre",
                    fontSize: "14px",
                }}
            >
                {
                    'To start, go to the Amazon page \nof a book you would like to track, \nthen click "ADD TO THE WATCHLIST" below.'
                }
            </Typography>
            <Typography
                sx={{
                    textAlign: "center",
                    mt: 2,
                    mb: 5,
                }}
            >
                Click{" "}
                <Link
                    href="http://readerscout.com/"
                    rel="noreferrer"
                    target="_blank"
                    sx={{
                        cursor: "pointer",
                    }}
                >
                    here
                </Link>{" "}
                for a tutorial.
            </Typography>

            <Typography
                sx={{
                    textAlign: "center",
                    mb: 2,
                    fontSize: "12px",
                    color: Colors.grayDark,
                }}
                variant="h6"
            >
                Note: ReaderScout currently only works for Amazon US
            </Typography>
        </Box>
    );
};

export default EmptyList;
