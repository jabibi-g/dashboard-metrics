import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// @ts-ignore: Express error handlers need 4 parameters
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  res.status(statusCode).json({ ok: false, error: { code: statusCode, message } });
};
