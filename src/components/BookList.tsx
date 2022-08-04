import React from "react";
import {
  Avatar,
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
  id: string;
  name: string;
  added_on: string;
}

interface BookListProps {
  books: IBook[];
  onDelete: Function;
}

const BookList = ({ books, onDelete }: BookListProps) => {
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
      {books.map((book) => (
        <ListItem
          key={book.id.toString()}
          secondaryAction={
            <IconButton
              aria-label="delete"
              sx={{ mx: 1 }}
              onClick={() => onDelete(book.id.toString())}
            >
              <DeleteIcon />
            </IconButton>
          }
          sx={{
            padding: 0,
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
              primary={book.name}
              secondary={moment(book.added_on).format("MMM DD, YYYY")}
              primaryTypographyProps={{
                sx: {
                  display: "-webkit-box",
                  overflow: "hidden",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 1,
                  pr: 1,
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
