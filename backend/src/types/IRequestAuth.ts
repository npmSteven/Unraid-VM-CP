import { Request } from 'express';

export type IRequestAuthUser = {
  id: string
  isUnraidUser: boolean
}

export interface IRequestAuth<T = any> extends Request {
  body: T,
  user?: IRequestAuthUser,
}
