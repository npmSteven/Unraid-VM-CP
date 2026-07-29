import type { IUser, ISanitisedUser } from "@unraid-vm-cp/shared-types";

export const sanitiseUser = ({ password: _password, ...rest }: IUser): ISanitisedUser => {
  return rest;
};
