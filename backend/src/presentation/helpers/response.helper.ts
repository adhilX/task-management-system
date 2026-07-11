import { Response } from 'express';

export function sendSuccess(res: Response, data: any, message = 'Operation successful', status = 200) {
  // If data is already structured with success/data/message, send it directly
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return res.status(status).json(data);
  }

  const resultData = data && typeof data === 'object' && 'data' in data ? data.data : data;
  const resultMessage = data && typeof data === 'object' && 'message' in data ? data.message : message;

  return res.status(status).json({
    success: true,
    data: resultData,
    message: resultMessage,
  });
}
