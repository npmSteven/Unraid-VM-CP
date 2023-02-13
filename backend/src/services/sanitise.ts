import { IUser } from "../types/IUser.js";

export const sanitiseUser = ({ password, ...rest }: IUser) => {
  return rest;
}
