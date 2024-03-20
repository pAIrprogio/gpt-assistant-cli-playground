import { readFile as fsReadFile } from "fs/promises";
import { z } from "zod";
import { Tool } from "../tool.utils.js";

const argsSchema = z.object({
  relativeFilePath: z
    .string()
    .describe("The path to the file relative to the project root"),
  prefixWithLineNumbers: z
    .boolean()
    .optional()
    .describe("Prefix each line with its line number. Use it for git patches"),
});

type Args = z.input<typeof argsSchema>;

export const readFile = {
  name: "readFile",
  description: "Reads a file",
  argsSchema,
  async call(args: Args) {
    let fileContent = await fsReadFile(args.relativeFilePath, "utf-8");

    if (args.prefixWithLineNumbers) {
      fileContent = fileContent
        .split("\n")
        .map((line, index) => `${index + 1}:${line}`)
        .join("\n");
    }

    return {
      success: true,
      output: fileContent,
    };
  },
} satisfies Tool<Args>;
