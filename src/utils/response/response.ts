import { STATUS_CODE } from "../statusCode/status-code";

export const SendResponse = (
  status: number = STATUS_CODE.BAD_REQUEST,
  data?: any,
  message: string = 'Invalid Request'
) => {
  return { status: status, data: data, message: message };
}


export const Response = (
  status: number = STATUS_CODE.BAD_REQUEST,
  message: string = 'Invalid Request'
) => {
  return { status: status, message: message };
}