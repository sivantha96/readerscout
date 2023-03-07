export const AMAZON_REGEX =
  /https?:\/\/(?=(?:....)?amazon|smile)(www|smile)\S+com(((?:\/(?:dp|gp\/product|exec\/obidos\/asin)(\/)?([A-Z0-9]+))?\S*[?&]?(?:tag=))?\S*?)(?:#)?(\w*?-\w{2})?(\S*)(#?\S*)+/;

export const ASIN_REGEX =
  /(?:dp|gp\/product|exec\/obidos\/asin)\/(\.+\/)?(.{10})/;

export const AWS_AUTHORS_PAGE = "https://author.amazon.com/api/authors";
