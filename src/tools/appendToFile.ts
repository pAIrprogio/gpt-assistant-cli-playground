import { promises as fs } from "fs";
import { z } from "zod";
import { Tool } from "../tool.utils.js";

const argsSchema = z.object({
  relativeFilePath: z
    .string()
    .describe("The path to the file relative to the project root"),
  content: z.string().describe("The content to append to the file"),
});

type Args = z.input<typeof argsSchema>;

export const appendToFile = {
  name: "appendToFile",
  description: "Appends content to the specified file",
  argsSchema,
  async call(args: Args) {
    await fs.appendFile(args.relativeFilePath, args.content);
    return { success: true, output: null };
  },
} satisfies Tool<Args>;
