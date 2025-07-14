import { Log } from "@/lib/log";
import { useMutation } from "@tanstack/react-query";
import { VisualizationServiceBase } from "./visualization/base/service-base";
import {
  ExecutionRequest,
  ExecutionResponse,
} from "./visualization/base/types";

const baseService = new VisualizationServiceBase();

export const useLoadMutation = () => {
  return useMutation({
    mutationFn: baseService.loadData,
  });
};

export const useRunMutation = <T extends VisualizationServiceBase>({
  service,
}: {
  service: T;
}) => {
  return useMutation({
    mutationFn: async (request: ExecutionRequest) => {
      const execute = service.executeCode.bind(service);
      return (await execute(request)) as ExecutionResponse;
    },
    onError: (error) => {
      Log.error("Error executing code:", error);
    },
  });
};
