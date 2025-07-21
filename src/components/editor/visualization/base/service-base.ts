import { Log } from "@/lib/log";
import { ExecutionRequest, ExecutionResponse, ExecutionTrace } from "./types";

export class VisualizationServiceBase {
  private static readonly LOCAL_API_ENDPOINT = "";

  async executeCode(request: ExecutionRequest): Promise<ExecutionResponse> {
    const _configParams = this.getConfigParams();
    const payload = {
      code: request.code,
      language: request.language,
      user_uuid: _configParams.userUUID,
      session_uuid: _configParams.sessionUUID,
      provider: "pythontutor",
    };

    try {
      const response = await fetch(
        `${VisualizationServiceBase.LOCAL_API_ENDPOINT}/api/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as {
        result: ExecutionResponse;
      };

      if (!data.result.success) {
        throw new Error(data.result.error || "Execution failed");
      }

      return data.result;
    } catch (error) {
      Log.error("PythonTutorService: Execution failed:", error);
      throw error;
    }
  }

  /**
   * Parse execution response data into trace object
   */
  parseExecutionTrace(responseData: string) {
    try {
      const parsed = JSON.parse(responseData);
      if (parsed.trace && Array.isArray(parsed.trace)) {
        return parsed as ExecutionTrace;
      }
      throw new Error("Invalid trace data format");
    } catch (error) {
      Log.error("PythonTutorService: Failed to parse trace data:", error);
      throw error;
    }
  }

  _generateSessionUUID() {
    const tmp = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
    return tmp;
  }

  getConfigParams() {
    const sessionUUID = this._generateSessionUUID();
    const userUUID = "ff77a87f-3f9c-4f93-d390-67214c308b9h";
    return {
      sessionUUID,
      userUUID,
    };
  }
}
