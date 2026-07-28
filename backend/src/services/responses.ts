import { IResponse } from "../types/IResponse.js";

export const respondErrorMessage = (message: string): IResponse => ({
  success: false,
  payload: [message],
});

export const respondError = (payload: unknown): IResponse => ({
  success: false,
  payload,
});

export const respondInternalServerError = (): IResponse =>
  respondErrorMessage('Internal server error');

export const respondSuccess = (payload: unknown): IResponse => ({
  success: true,
  payload,
});
