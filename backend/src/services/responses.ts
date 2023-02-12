import { IResponse } from "../types/IResponse.js";

export const respondErrorMessage = (message: string): IResponse => {
  return {
    success: false,
    payload: [message],
  };
};

export const respondError = (payload: any): IResponse => {
  return {
    success: false,
    payload,
  };
};

export const respondInternalServerError = (): IResponse => {
  return respondErrorMessage('Internal server error');
};

export const respondSuccess = (payload: any): IResponse => {
  return {
    success: true,
    payload,
  };
};

type IError = {
  value: number
  msg: string
  param: string
  location: string
}

export const respondErrorValidation = (errors: IError[]): IResponse => {
  return respondError(errors.map(({ msg }) => msg));
}
