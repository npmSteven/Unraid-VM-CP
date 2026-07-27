import { IUser } from "../types/IUser.js";

export const sanitiseUser = ({ password: _password, ...rest }: IUser) => {
  return rest;
}
