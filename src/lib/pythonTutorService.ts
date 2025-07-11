export interface ExecutionRequest {
  code: string;
  language?: string;
  user_uuid?: string;
  session_uuid?: string;
}

export interface ExecutionResponse {
  success: boolean;
  data: string;
  url: string;
  user_uuid?: string;
  session_uuid?: string;
  error?: string;
  details?: string;
}

export interface TraceStep {
  event?: string;
  func_name?: string;
  line: number;
  stack_to_render?: Array<{
    func_name: string;
    line: number;
    is_highlighted: boolean;
    ordered_varnames?: string[];
    encoded_locals: Record<string, unknown>;
    frame_id?: string;
    is_parent?: boolean;
    is_zombie?: boolean;
    parent_frame_id_list?: string[];
    unique_hash?: string;
  }>;
  heap?: Record<string, unknown>;
  stdout?: string;
  globals?: Record<string, unknown>;
  ordered_globals?: string[];
}

export interface ExecutionTrace {
  code: string;
  trace: TraceStep[];
}

export class PythonTutorService {
  private static readonly API_ENDPOINT = '/api/execute';
  private static readonly USER_UUID = 'ff77a87f-3f9c-4f93-d390-67214c308b9e';

  /**
   * Generate a random session UUID for each request
   */
  private static generateSessionUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Execute code and get visualization data
   */
  static async executeCode(request: ExecutionRequest): Promise<ExecutionResponse> {
    const sessionUUID = this.generateSessionUUID();
    
    const payload = {
      code: request.code,
      language: request.language || 'cpp',
      user_uuid: request.user_uuid || this.USER_UUID,
      session_uuid: request.session_uuid || sessionUUID
    };

    console.log('PythonTutorService: Executing code with parameters:', {
      language: payload.language,
      user_uuid: payload.user_uuid,
      session_uuid: payload.session_uuid
    });

    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ExecutionResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Execution failed');
      }

      return data;
    } catch (error) {
      console.error('PythonTutorService: Execution failed:', error);
      throw error;
    }
  }

  /**
   * Parse execution response data into trace object
   */
  static parseExecutionTrace(responseData: string): ExecutionTrace | null {
    try {
      const parsed = JSON.parse(responseData);
      if (parsed.trace && Array.isArray(parsed.trace)) {
        return parsed as ExecutionTrace;
      }
      return null;
    } catch (error) {
      console.error('PythonTutorService: Failed to parse trace data:', error);
      return null;
    }
  }

  /**
   * Get the current line being executed from a trace step
   */
  static getCurrentExecutionLine(step: TraceStep): number | null {
    // First try to get line from highlighted stack frame
    const highlightedFrame = step.stack_to_render?.find(frame => frame.is_highlighted);
    if (highlightedFrame?.line) {
      return highlightedFrame.line;
    }
    
    // Fallback to step line
    return step.line || null;
  }

  /**
   * Check if execution is complete (no more steps)
   */
  static isExecutionComplete(trace: ExecutionTrace, currentStep: number): boolean {
    return currentStep >= trace.trace.length - 1;
  }

  /**
   * Get all lines that will be executed (for highlighting)
   */
  static getExecutedLines(trace: ExecutionTrace): number[] {
    const lines = new Set<number>();
    
    trace.trace.forEach(step => {
      const line = this.getCurrentExecutionLine(step);
      if (line !== null) {
        lines.add(line);
      }
    });
    
    return Array.from(lines).sort((a, b) => a - b);
  }
}
