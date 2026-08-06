export type ExternalServiceErrorCode =
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "BAD_RESPONSE"
  | "UNAVAILABLE";

export class ExternalServiceError extends Error {
  public readonly cause?: unknown;

  constructor(
    public readonly code: ExternalServiceErrorCode,
    message: string,
    public readonly statusCode?: number,
    cause?: unknown,
  ) {
    super(message);

    this.name = "ExternalServiceError";
    this.cause = cause;

    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}