export interface IUser {
  _id: string;
  hash: string;
  added_on: Date;
  provider: "GOOGLE" | "AMAZON";
  followers_count?: {
    count: number;
    updated_on: Date;
  };
  hide_author_suggestion: boolean
}
