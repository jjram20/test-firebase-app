import * as logger from "firebase-functions/logger";
import {
  HttpsError,
  onCall,
} from "firebase-functions/v2/https";

import {ExternalServiceError} from "../../shared/errors/externalServiceError";
import {executeCodeService} from "./executeCode.service";
import {ExecuteCodeResult} from "./executeCode.types";
import {parseExecuteCodeInput} from "./executeCode.validation";

const mapExternalServiceError = (
  error: ExternalServiceError,
): HttpsError => {
  switch (error.code) {
  case "TIMEOUT":
    return new HttpsError(
      "deadline-exceeded",
      "La ejecución superó el tiempo permitido.",
    );

  case "UNAUTHORIZED":
    return new HttpsError(
      "internal",
      "El servicio de ejecución no está configurado correctamente.",
    );

  case "BAD_RESPONSE":
    return new HttpsError(
      "failed-precondition",
      "El servicio rechazó la solicitud de ejecución.",
    );

  case "UNAVAILABLE":
  default:
    return new HttpsError(
      "unavailable",
      "El servicio de ejecución no está disponible.",
    );
  }
};

export const executeCode = onCall(
  {
    region: "us-central1",
    timeoutSeconds: 30,
    maxInstances: 3,
    concurrency: 10,
    enforceAppCheck: false,
  },
  async (request): Promise<ExecuteCodeResult> => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Debes iniciar sesión para ejecutar código.",
      );
    }

    try {
      const input = parseExecuteCodeInput(request.data);

      logger.info("Executing code", {
        uid: request.auth.uid,
        language: input.language,
        fileCount: input.files.length,
      });

      const result = await executeCodeService(input);

      logger.info("Code execution completed", {
        uid: request.auth.uid,
        language: input.language,
        exitCode: result.run?.code,
      });

      return result;
    } catch (error: unknown) {
      if (error instanceof HttpsError) {
        throw error;
      }

      if (error instanceof ExternalServiceError) {
        logger.error("External execution service failed", {
          uid: request.auth.uid,
          errorCode: error.code,
          status: error.statusCode,
          error,
        });

        throw mapExternalServiceError(error);
      }

      logger.error("Unexpected executeCode error", {
        uid: request.auth.uid,
        error,
      });

      throw new HttpsError(
        "internal",
        "Ocurrió un error inesperado durante la ejecución.",
      );
    }
  },
);