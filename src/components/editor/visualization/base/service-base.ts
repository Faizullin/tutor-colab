import { Log } from "@/lib/log";
import { ExecutionRequest, ExecutionResponse, ExecutionTrace } from "./types";

export class VisualizationServiceBase {
  private static readonly LOCAL_API_ENDPOINT = "";

  async loadData() {
    try {
      const response = await fetch(
        `${VisualizationServiceBase.LOCAL_API_ENDPOINT}/api/load`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Data loading failed");
      }

      return data;
    } catch (error) {
      Log.error("VisualizationServiceBase: Data loading failed:", error);
      throw error;
    }
  }

  async executeCode(request: ExecutionRequest): Promise<ExecutionResponse> {
    const _configParams = this.getConfigParams();
    const payload = {
      code: request.code,
      language: request.language,
      user_uuid: _configParams.userUUID,
      session_uuid: _configParams.sessionUUID,
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

      const data: ExecutionResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Execution failed");
      }

      return data;
    } catch (error) {
      Log.error("PythonTutorService: Execution failed:", error);
      throw error;
    }
  }

  /**
   * Parse execution response data into trace object
   */
  parseExecutionTrace(responseData: string): ExecutionTrace | null {
    try {
      const parsed = JSON.parse(responseData);
      if (parsed.trace && Array.isArray(parsed.trace)) {
        return parsed as ExecutionTrace;
      }
      return null;
    } catch (error) {
      Log.error("PythonTutorService: Failed to parse trace data:", error);
      return null;
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
    const userUUID = "ff77a87f-3f9c-4f93-d390-67214c308b9e";
    return {
      sessionUUID,
      userUUID,
    };
  }
}
