export * from "./urls";

export const AMAZON_REGEX =
    /https?:\/\/(?=(?:....)?amazon|smile)(www|smile)\S+com(((?:\/(?:dp|gp)\/([A-Z0-9]+))?\S*[?&]?(?:tag=))?\S*?)(?:#)?(\w*?-\w{2})?(\S*)(#?\S*)+/;

export const ASIN_REGEX = /(?:dp|gp)\/(.{10})(\/)/;
