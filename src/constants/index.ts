export const AMAZON_REGEX =
  /https?:\/\/(?=(?:....)?amazon|smile)(www|smile)\S+com(((?:\/(?:dp|gp\/product|exec\/obidos\/asin)(\/)?([A-Z0-9]+))?\S*[?&]?(?:tag=))?\S*?)(?:#)?(\w*?-\w{2})?(\S*)(#?\S*)+/;

export const ASIN_REGEX =
  /(?:dp|gp\/product|exec\/obidos\/asin)\/(\.+\/)?(.{10})/;

export const AWS_AUTHORS_HOME_PAGE = "https://author.amazon.com/home";
export const AWS_AUTHORS_API = "https://author.amazon.com/api/authors";
export const AWS_PROFILE_IMAGE_API =
  "https://author.amazon.com/api/profileImage";
export const AWS_BOOKS_API = "https://author.amazon.com/api/search/titleset";
export const AWS_BOOKS_PAGE = "https://author.amazon.com/books";

export const REACT_GLOBALS = {
  marketPlaceIdWithAuthor: "",
  authorId: "",
};

export const PROVIDERS = {
  NONE: "NONE",
  GOOGLE: "GOOGLE",
  AMAZON: "AMAZON",
};

export const NAVIGATION = {
  HOME: "HOME",
  LOGIN: "LOGIN",
};
