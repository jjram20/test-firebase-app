import {HttpsError} from "firebase-functions/v2/https";

import {pistonConfig} from "../../config/piston";
import {
  ExecuteCodeFile,
  ExecuteCodeInput,
} from "./executeCode.types";

const isRecord = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

const parseRequiredString = (
  value: unknown,
  fieldName: string,
): string => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new HttpsError(
      "invalid-argument",
      `El campo '${fieldName}' es obligatorio.`,
    );
  }

  return value.trim();
};

const parseOptionalString = (
  value: unknown,
  fieldName: string,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpsError(
      "invalid-argument",
      `El campo '${fieldName}' debe ser una cadena.`,
    );
  }

  return value;
};

const parseOptionalPositiveInteger = (
  value: unknown,
  fieldName: string,
): number | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new HttpsError(
      "invalid-argument",
      `El campo '${fieldName}' debe ser un entero positivo.`,
    );
  }

  return value;
};

const parseOptionalStringArray = (
  value: unknown,
  fieldName: string,
): string[] | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (
    !Array.isArray(value) ||
    !value.every((item) => typeof item === "string")
  ) {
    throw new HttpsError(
      "invalid-argument",
      `El campo '${fieldName}' debe ser un arreglo de cadenas.`,
    );
  }

  return value;
};

const parseFile = (
  value: unknown,
  index: number,
): ExecuteCodeFile => {
  if (!isRecord(value)) {
    throw new HttpsError(
      "invalid-argument",
      `El archivo en la posición ${index} no es válido.`,
    );
  }

  const content = parseRequiredString(
    value.content,
    `files[${index}].content`,
  );

  const codeSize = Buffer.byteLength(content, "utf8");

  if (codeSize > pistonConfig.maxCodeSizeBytes) {
    throw new HttpsError(
      "invalid-argument",
      `El archivo '${index}' supera el límite de ` +
        `${pistonConfig.maxCodeSizeBytes} bytes.`,
    );
  }

  const name = parseOptionalString(
    value.name,
    `files[${index}].name`,
  );

  return {
    ...(name !== undefined && {name}),
    content,
  };
};

const parseFiles = (value: unknown): ExecuteCodeFile[] => {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "Debe proporcionarse al menos un archivo.",
    );
  }

  if (value.length > pistonConfig.maxFiles) {
    throw new HttpsError(
      "invalid-argument",
      `Solo se permiten ${pistonConfig.maxFiles} archivo(s).`,
    );
  }

  return value.map(parseFile);
};

export const parseExecuteCodeInput = (
  data: unknown,
): ExecuteCodeInput => {
  if (!isRecord(data)) {
    throw new HttpsError(
      "invalid-argument",
      "La solicitud debe contener un objeto válido.",
    );
  }

  const language = parseRequiredString(
    data.language,
    "language",
  ).toLowerCase();

  if (!pistonConfig.allowedLanguages.has(language)) {
    throw new HttpsError(
      "invalid-argument",
      `El lenguaje '${language}' no está permitido.`,
    );
  }

  const version = parseOptionalString(
    data.version,
    "version",
  );

  const stdin = parseOptionalString(
    data.stdin,
    "stdin",
  );

  const args = parseOptionalStringArray(
    data.args,
    "args",
  );

  const compileTimeout = parseOptionalPositiveInteger(
    data.compileTimeout,
    "compileTimeout",
  );

  const runTimeout = parseOptionalPositiveInteger(
    data.runTimeout,
    "runTimeout",
  );

  const compileMemoryLimit = parseOptionalPositiveInteger(
    data.compileMemoryLimit,
    "compileMemoryLimit",
  );

  const runMemoryLimit = parseOptionalPositiveInteger(
    data.runMemoryLimit,
    "runMemoryLimit",
  );

  return {
    language,
    version,
    files: parseFiles(data.files),
    stdin,
    args,
    compileTimeout,
    runTimeout,
    compileMemoryLimit,
    runMemoryLimit,
  };
};