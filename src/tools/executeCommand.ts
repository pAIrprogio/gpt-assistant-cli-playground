import { z } from "zod";
import { $ } from "zx";
import { Tool } from "../tool.utils.js";

const argsSchema = z.object({
  command: z.string(),
});

type Args = z.input<typeof argsSchema>;

export const executeCommand = {
  name: "executeCommand",
  description: "Executes a command in a bash terminal",
  argsSchema,
  async call(args: Args) {
    // Split space but keep quoted strings together
    const argsArray = args.command.match(/"[^"]+"|\S+/g) || [];
    const res = await $`${argsArray}`;

    return {
      success: true,
      output: res.stdout,
    };
  },
} satisfies Tool<Args>;
