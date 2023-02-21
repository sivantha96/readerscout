/* eslint-disable no-unused-vars */

export enum MESSAGE_TYPES {
  SHOW_TOAST = "SHOW_TOAST",
  SUCCESS_SHOW_TOAST = "SUCCESS_SHOW_TOAST",
}

export type ContentMessagePayload = {
  type: MESSAGE_TYPES;
  data?: any;
};
