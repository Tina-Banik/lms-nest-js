import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    code?: string,
    details?: unknown,
  ) {
    super(
      {
        success: false,
        message,
        code,
        details,
      },
      statusCode,
    );
  }
}
