export interface ExecutionRequest {
  code: string;
  language?: string;
}

export interface ExecutionResponse<TData = string> {
  success: boolean;
  data: TData;
  url: string;
  user_uuid?: string;
  session_uuid?: string;
  error?: string;
  details?: string;
}

export interface TraceStep {
  event: string;
  func_name?: string;
  line: number;
  stack_to_render: Array<{
    func_name: string;
    line: number;
    is_highlighted: boolean;
    ordered_varnames: string[];
    encoded_locals: Record<string, unknown>;
    frame_id?: string;
    is_parent?: boolean;
    is_zombie?: boolean;
    parent_frame_id_list?: string[];
    unique_hash?: string;
  }>;
  heap: Record<string, unknown>;
  stdout?: string;
  globals?: Record<string, unknown>;
  ordered_globals?: string[];
  exception_msg?: string;
}

export interface ExecutionTrace {
  code: string;
  trace: TraceStep[];
  status: "success" | "error";
}
