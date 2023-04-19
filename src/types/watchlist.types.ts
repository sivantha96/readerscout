export interface IProduct {
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
  product: IProduct;
  notifications_price: number;
  notifications_rating: number;
  user: string;
  added_on: Date;
  loading?: boolean;
}

export interface WatchListResponse {
  watchList: IWatchlist[];
  userId: string;
}
