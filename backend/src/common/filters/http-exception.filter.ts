import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorResponse: any;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object') {
        errorResponse = res;
      } else {
        errorResponse = { message: res };
      }
    } else {
      errorResponse = {
        message: exception.message || 'Internal server error',
        error: 'Internal Server Error',
      };
    }

    const message = errorResponse.message || exception.message || 'Internal server error';
    const error = errorResponse.error || 'Error';

    // Log the exception details
    this.logger.error(
      `HTTP Status: ${status} Error: ${JSON.stringify(message)} - Method: ${request.method} - URL: ${request.url}`,
      exception.stack,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      error: error,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
