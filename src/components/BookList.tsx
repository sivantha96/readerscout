import React from "react";
import {
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { Colors } from "../assets/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import EmptyList from "./EmptyList";
import Image from "./Image";

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
  loading: boolean;
  onDelete: (item: IWatchlist, index: number) => void;
}

const BookList = ({ data, onDelete, loading }: BookListProps) => {
  if ((!data || data.length === 0) && !loading) return <EmptyList />;

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
            <IconButton
              color="error"
              aria-label="delete"
              sx={{
                mx: 1,
                background: "#fefefe",
                "&:hover": {
                  background: "#fefefe",
                },
              }}
              onClick={() => onDelete(item, index)}
            >
              <DeleteIcon />
            </IconButton>
          }
          sx={{
            display: "flex",
            alignItems: "flex-start",
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
            <ListItemAvatar
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={item.product.cover}
                alt="book cover"
                width="50px"
                sx={{
                  mr: 2,
                }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={item.product.title}
              primaryTypographyProps={{
                sx: {
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  fontSize: "0.9rem",
                  lineHeight: "0.9rem",
                  fontWeight: 500,
                },
              }}
              secondaryTypographyProps={{
                sx: {
                  fontSize: "0.8rem",
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
