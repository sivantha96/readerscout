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

const books = [
  {
    id: "asdadaidyasd",
    name: "Harry potter and the Half Blood Prince. Volume 03. Harry potter and the Half Blood Prince. Volume 03, Harry potter and the Half Blood Prince. Volume 03, Harry potter and the Half Blood Prince. Volume 03",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: true,
  },
  {
    id: "aosdhaohdohajd",
    name: "Game of Thrones",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: false,
  },
  {
    id: "aodjbaobdoabsod",
    name: "Lord of the Rings",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: true,
  },
  {
    id: "aosdhohphiqphpqd",
    name: "Game of Thrones",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: false,
  },
  {
    id: "aksbcoahodhahdip",
    name: "Lord of the Rings",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: true,
  },
  {
    id: "apihoqahfoqpfnqofbo",
    name: "Game of Thrones",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: false,
  },
  {
    id: "akscbqac9uqh9c",
    name: "Lord of the Rings",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: true,
  },
  {
    id: "qcoqhocq0hf9p-hfpwc",
    name: "Game of Thrones",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: false,
  },
  {
    id: "q9ucgq9bcoqocqcb",
    name: "Lord of the Rings",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: true,
  },
  {
    id: "q0898hcoquboucbnoq",
    name: "Game of Thrones",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: false,
  },
  {
    id: "qoichoqhwconbioqwc",
    name: "Lord of the Rings",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: true,
  },
  {
    id: "qchqowcoiqnpwcnqw",
    name: "Game of Thrones",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: false,
  },
  {
    id: "qcoqho0cnqc97g9ufb",
    name: "Lord of the Rings",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: true,
  },
  {
    id: "0q8fh80hq0b0qn",
    name: "Game of Thrones",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: false,
  },
  {
    id: "08qhf0hn2pifnip2hf",
    name: "Lord of the Rings",
    added_on: "2022-07-28T07:39:47.876Z",
    connected: true,
  },
];

const BookList = () => {
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
            <IconButton aria-label="delete">
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemButton>
            <ListItemAvatar>
              <Avatar
                sx={{
                  backgroundColor: book.connected
                    ? Colors.greenLight
                    : Colors.errorLight,
                }}
              >
                <BookmarkAddedIcon
                  color={book.connected ? "success" : "error"}
                />
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
