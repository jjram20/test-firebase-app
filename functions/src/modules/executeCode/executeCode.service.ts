import {
  ExecuteCodeInput,
  ExecuteCodeResult,
  PistonExecuteRequest,
} from "./executeCode.types";
import {executePistonRequest} from "./pistonClient";

const buildPistonPayload = (
  input: ExecuteCodeInput,
): PistonExecuteRequest => {
  return {
    language: input.language,
    version: input.version ?? "*",
    files: input.files,
    stdin: input.stdin ?? "",
    args: input.args ?? [],

    ...(input.compileTimeout !== undefined && {
      compile_timeout: input.compileTimeout,
    }),

    ...(input.runTimeout !== undefined && {
      run_timeout: input.runTimeout,
    }),

    ...(input.compileMemoryLimit !== undefined && {
      compile_memory_limit: input.compileMemoryLimit,
    }),

    ...(input.runMemoryLimit !== undefined && {
      run_memory_limit: input.runMemoryLimit,
    }),
  };
};

export const executeCodeService = async (
  input: ExecuteCodeInput,
): Promise<ExecuteCodeResult> => {
  const payload = buildPistonPayload(input);
  const response = await executePistonRequest(payload);

  return {
    language: response.language,
    version: response.version,
    compile: response.compile,
    run: response.run,
  };
};