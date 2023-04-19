export enum MESSAGE_TYPES {
  SHOW_TOAST = "SHOW_TOAST",
  SUCCESS_SHOW_TOAST = "SUCCESS_SHOW_TOAST",
}

export interface ContentMessagePayload {
  type: MESSAGE_TYPES;
  data?: any;
}
