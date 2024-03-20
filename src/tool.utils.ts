import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export type SuccessToolOutput = {
  success: true;
  output: any;
  error?: undefined;
};

export type ErrorToolOutput = {
  success: false;
  error: string;
  output?: undefined;
};

export type ToolOutput = SuccessToolOutput | ErrorToolOutput;

export interface Tool<Args = any> {
  name: string;
  description: string;
  argsSchema: z.ZodSchema<Args>;
  call: (args: Args) => Promise<ToolOutput>;
}

export const toOpenAiTool = <Args = any>(tool: Tool<Args>) => {
  const parameters = zodToJsonSchema(tool.argsSchema);
  delete parameters.$schema;
  return {
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters,
    },
  };
};

export const toOpenAiTools = (tools: Array<Tool> | undefined) => {
  if (!tools) return [];
  return tools.map(toOpenAiTool);
};

export const toToolsMap = (tools: Array<Tool>) => {
  return tools.reduce((acc, tool) => {
    return {
      ...acc,
      [tool.name]: tool,
    };
  }, {}) as { [key: string]: Tool };
};
