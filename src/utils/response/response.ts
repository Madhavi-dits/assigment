import { STATUS_CODE } from "../statusCode/status-code";

const SendResponse = (
  status: number = STATUS_CODE.BAD_REQUEST,
  data: any,
  message: string = 'Invalid Request'
) => {
  return { status: status, data: data, message: message };
}
export default SendResponse;