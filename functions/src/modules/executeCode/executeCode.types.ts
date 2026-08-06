export interface ExecuteCodeFile {
  name?: string;
  content: string;
}

export interface ExecuteCodeInput {
  language: string;
  version?: string;
  files: ExecuteCodeFile[];
  stdin?: string;
  args?: string[];

  compileTimeout?: number;
  runTimeout?: number;
  compileMemoryLimit?: number;
  runMemoryLimit?: number;
}

export interface PistonExecuteRequest {
  language: string;
  version: string;
  files: ExecuteCodeFile[];
  stdin: string;
  args: string[];

  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

export interface PistonProcessResult {
  stdout?: string;
  stderr?: string;
  output?: string;
  code?: number;
  signal?: string | null;
}

export interface PistonExecuteResponse {
  language?: string;
  version?: string;

  compile?: PistonProcessResult;
  run?: PistonProcessResult;

  message?: string;
}

export interface ExecuteCodeResult {
  language?: string;
  version?: string;

  compile?: PistonProcessResult;
  run?: PistonProcessResult;
}