import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface ExceptionResponse {
  responseCode: number;
  message: string;
}

@Catch(QueryFailedError, HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    let response: ExceptionResponse;

    if (exception instanceof QueryFailedError) {
      response = {
        responseCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
      };
    } else if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as { message?: string })?.message || 'Unknown error';
      response = {
        responseCode: exception.getStatus(),
        message,
      };
    } else {
      response = {
        responseCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      };
    }

    const ctx = host.switchToHttp();
    const responseCtx = ctx.getResponse<Response>();
    responseCtx.status(response.responseCode).send(response);
  }
}
