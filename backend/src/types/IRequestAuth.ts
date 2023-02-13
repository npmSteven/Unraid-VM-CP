import { Request } from 'express';

type IRequestAuthUser = {
  id: string
  isUnraidUser: boolean
}


export interface IRequestAuth<T = any> extends Request {
  body: T,
  user?: IRequestAuthUser,
}
