import {GoogleAuth} from "google-auth-library";
import * as logger from "firebase-functions/logger";

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

const getErrorStatus = (
  error: unknown,
): number | undefined => {
  if (!isHttpErrorLike(error)) {
    return undefined;
  }

  return error.response?.status;
};

const isTimeoutError = (error: unknown): boolean => {
  if (!isHttpErrorLike(error)) {
    return false;
  }

  return (
    error.code === "ETIMEDOUT" ||
    error.code === "ECONNABORTED" ||
    error.message?.toLowerCase().includes("timeout") === true
  );
};

export const executePistonRequest = async (
  payload: PistonExecuteRequest,
): Promise<PistonExecuteResponse> => {
  try {
    const client = await googleAuth.getIdTokenClient(
      pistonConfig.apiUrl,
    );

    const response = await client.request<PistonExecuteResponse>({
      url: pistonConfig.apiUrl,
      method: "POST",
      data: payload,
      timeout: pistonConfig.requestTimeoutMs,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.data || typeof response.data !== "object") {
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

    const status = getErrorStatus(error);

    logger.error("Error calling Piston API", {
      status,
      error,
    });

    if (isTimeoutError(error)) {
      throw new ExternalServiceError(
        "TIMEOUT",
        "La solicitud a Piston superó el tiempo permitido.",
        status,
        {cause: error},
      );
    }

    if (status === 401 || status === 403) {
      throw new ExternalServiceError(
        "UNAUTHORIZED",
        "La Function no está autorizada para invocar Cloud Run.",
        status,
        {cause: error},
      );
    }

    if (status !== undefined && status >= 400 && status < 500) {
      throw new ExternalServiceError(
        "BAD_RESPONSE",
        "Piston rechazó la solicitud.",
        status,
        {cause: error},
      );
    }

    throw new ExternalServiceError(
      "UNAVAILABLE",
      "El servicio de Piston no está disponible.",
      status,
      {cause: error},
    );
  }
};