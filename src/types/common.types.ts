export interface CommonResponse<T> {
  error: boolean;
  message: string;
  data: T;
}
