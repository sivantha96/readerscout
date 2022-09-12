/* eslint-disable no-unused-vars */

export enum CONTENT_MESSAGE_TYPES {
    GET_PRODUCT_TITLE = "GET_PRODUCT_TITLE",
}

export type ContentMessagePayload = {
    type: CONTENT_MESSAGE_TYPES;
    data: any;
};
