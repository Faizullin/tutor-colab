import { VisualizationServiceBase } from "./visualization/base/service-base";
import {
  ExecutionRequest,
  ExecutionResponse,
  ExecutionTrace,
} from "./visualization/base/types";
import { cppEditorService } from "./visualization/types/cpp/render";
import { pyEditorService } from "./visualization/types/py/render";

const serviceMapping = {
  cpp: cppEditorService,
  python: pyEditorService,
};

export class PythonTutorClientProvider {
  async runCode(
    service: VisualizationServiceBase,
    request: ExecutionRequest
  ): Promise<ExecutionResponse<ExecutionTrace | string>> {
    const execute = service.executeCode.bind(service);
    const result = (await execute(request)) as ExecutionResponse;
    if (result.success) {
      const parsedData = service.parseExecutionTrace(result.data);
      return {
        ...result,
        data: parsedData,
      };
    }
    return result;
  }

  getService(language: keyof typeof serviceMapping): VisualizationServiceBase {
    const s = serviceMapping[language];
    if (!s) {
      throw new Error(`No service found for language: ${language}`);
    }
    return s;
  }
}
