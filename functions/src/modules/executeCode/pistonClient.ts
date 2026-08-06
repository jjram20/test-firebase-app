import * as logger from "firebase-functions/logger";
import {GoogleAuth} from "google-auth-library";

import {pistonConfig} from "../../config/piston";
import {ExternalServiceError} from "../../shared/errors/externalServiceError";
import {
  PistonExecuteRequest,
  PistonExecuteResponse,
} from "./executeCode.types";

interface HttpErrorLike {
  response?: {
    status?: number;
    data?: unknown;
  };
  code?: string;
  message?: string;
}

const googleAuth = new GoogleAuth();

const isHttpErrorLike = (
  error: unknown,
): error is HttpErrorLike => {
  return typeof error === "object" && error !== null;
};

const getHttpStatusCode = (
  error: unknown,
): number | undefined => {
  if (!isHttpErrorLike(error)) {
    return undefined;
  }

  return error.response?.status;
};

const isTimeoutError = (
  error: unknown,
): boolean => {
  if (!isHttpErrorLike(error)) {
    return false;
  }

  const message = error.message?.toLowerCase() ?? "";

  return (
    error.code === "ETIMEDOUT" ||
    error.code === "ECONNABORTED" ||
    message.includes("timeout") ||
    message.includes("deadline")
  );
};

export const executePistonRequest = async (
  payload: PistonExecuteRequest,
): Promise<PistonExecuteResponse> => {
  try {
    const targetAudience = pistonConfig.apiUrl;

    const client = await googleAuth.getIdTokenClient(
      targetAudience,
    );

    const response =
      await client.request<PistonExecuteResponse>({
        url: targetAudience,
        method: "POST",
        data: payload,
        timeout: pistonConfig.requestTimeoutMs,
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (
      !response.data ||
      typeof response.data !== "object"
    ) {
      throw new ExternalServiceError(
        "BAD_RESPONSE",
        "Piston devolvió una respuesta inválida.",
        response.status,
      );
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof ExternalServiceError) {
      throw error;
    }

    const statusCode = getHttpStatusCode(error);

    logger.error("Error calling Piston API", {
      statusCode,
      originalError: error,
    });

    if (isTimeoutError(error)) {
      throw new ExternalServiceError(
        "TIMEOUT",
        "La solicitud a Piston superó el tiempo permitido.",
        statusCode,
        error,
      );
    }

    if (statusCode === 401 || statusCode === 403) {
      throw new ExternalServiceError(
        "UNAUTHORIZED",
        "La Function no está autorizada para invocar Cloud Run.",
        statusCode,
        error,
      );
    }

    if (
      statusCode !== undefined &&
      statusCode >= 400 &&
      statusCode < 500
    ) {
      throw new ExternalServiceError(
        "BAD_RESPONSE",
        "Piston rechazó la solicitud.",
        statusCode,
        error,
      );
    }

    throw new ExternalServiceError(
      "UNAVAILABLE",
      "El servicio de Piston no está disponible.",
      statusCode,
      error,
    );
  }
};