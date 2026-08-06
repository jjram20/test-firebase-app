const getRequiredEnvironmentVariable = (
  name: string,
): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
};

export const pistonConfig = {
  get apiUrl(): string {
    return getRequiredEnvironmentVariable("PISTON_API_URL");
  },

  requestTimeoutMs: 25_000,
  maxFiles: 1,
  maxCodeSizeBytes: 10_000,

  allowedLanguages: new Set([
    "python",
    "javascript",
    "typescript",
  ]),
} as const;