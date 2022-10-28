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
import { Colors } from "../assets/colors";
import moment from "moment";
import DeleteIcon from "@mui/icons-material/Delete";

export interface IBook {
    _id: string;
    asin: string;
    title: string;
    rating: string;
    price: any;
    bestsellers_rank: any;
    ratings_total: number;
    last_modified_on: Date;
    added_on: Date;
    link: string;
    authors: any[];
    cover: string;
}

export interface IWatchlist {
    _id: string;
    product: IBook;
    notifications_price: number;
    notifications_rating: number;
    user: string;
    added_on: Date;
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
                    alignItems="flex-start"
                    key={item._id}
                    secondaryAction={
                        item.loading ? (
                            <CircularProgress size={30} />
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
                        display: 'flex',
                        alignItems: 'flex-start',
                        padding: 0,
                        "& .MuiListItemSecondaryAction-root": {
                            display: item.loading ? "block" : "none",
                        },
                        "&:hover .MuiListItemSecondaryAction-root": {
                            display: "block",
                        },
                    }}
                >
                    <ListItemButton>
                        <ListItemAvatar>
                            <Avatar
                                variant="rounded"
                                alt="book cover"
                                src={item.product.cover}
                            />
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
                                    WebkitLineClamp: 2,
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
