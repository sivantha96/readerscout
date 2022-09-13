import React from "react";
import {
    Avatar,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import { Colors } from "../assets/colors";
import moment from "moment";
import DeleteIcon from "@mui/icons-material/Delete";

export interface IBook {
    _id: string;
    asin: string;
    title: string;
    rating: string;
    ratings_total: number;
    last_modified_on: Date;
    added_on: Date;
}

export interface IWatchlist {
    _id: string;
    product: IBook;
    notifications: number;
    user: string;
    added_on: Date;
    last_notified_on: Date;
    loading?: boolean;
}

interface BookListProps {
    data: IWatchlist[];
    onDelete: (item: IWatchlist, index: number) => void;
}

const BookList = ({ data, onDelete }: BookListProps) => {
    return (
        <List
            sx={{
                width: "100%",
                backgroundColor: Colors.white,
                flexGrow: 100,
                maxHeight: "500px",
                overflowY: "scroll",
            }}
        >
            {data.map((item, index) => (
                <ListItem
                    key={item._id}
                    secondaryAction={
                        item.loading ? (
                            <CircularProgress />
                        ) : (
                            <IconButton
                                color="error"
                                aria-label="delete"
                                sx={{ mx: 1 }}
                                onClick={() => onDelete(item, index)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        )
                    }
                    sx={{
                        padding: 0,
                        "& .MuiListItemSecondaryAction-root": {
                            display: "none",
                        },
                        "&:hover .MuiListItemSecondaryAction-root": {
                            display: "block",
                        },
                    }}
                >
                    <ListItemButton>
                        <ListItemAvatar>
                            <Avatar
                                sx={{
                                    backgroundColor: Colors.greenLight,
                                }}
                            >
                                <BookmarkAddedIcon color="success" />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={item.product.title}
                            secondary={moment(item.added_on).format(
                                "MMM DD, YYYY"
                            )}
                            primaryTypographyProps={{
                                sx: {
                                    display: "-webkit-box",
                                    overflow: "hidden",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 1,
                                },
                            }}
                        />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
};

export default BookList;
