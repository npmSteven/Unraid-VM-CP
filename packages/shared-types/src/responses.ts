import { type Result, type ResultAsync } from 'neverthrow'
import { type IResponse } from './types.js'
import { type AppError, appErrorToStatusCode } from './errors.js'

export const respondSuccess = <T>(payload: T): IResponse<T> => ({
  success: true, payload,
})

export const respondErrorMessage = (message: string): IResponse<string[]> => ({
  success: false, payload: [message],
})

export const respondInternalServerError = (): IResponse<string[]> =>
  respondErrorMessage('Internal server error')

export const respond = <T>(result: Result<T, AppError>): Response => {
  return result.match(
    (data) => Response.json(respondSuccess(data), { status: 200 }),
    (error) => Response.json(respondErrorMessage(error.message), { status: appErrorToStatusCode(error) }),
  )
}

export const respondAsync = async <T>(result: ResultAsync<T, AppError>): Promise<Response> => {
  return result.match(
    (data) => Response.json(respondSuccess(data), { status: 200 }),
    (error) => Response.json(respondErrorMessage(error.message), { status: appErrorToStatusCode(error) }),
  )
}
