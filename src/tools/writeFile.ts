import { writeFile as fsWriteFile, mkdir } from "fs/promises";
import { dirname } from "path";
import { Tool } from "../tool.utils.js";
import { z } from "zod";

const argsSchema = z.object({
  relativeFilePath: z
    .string()
    .describe("The path to the file relative to the project root"),
  content: z.string().describe("The content to write to the file"),
});

type Args = z.input<typeof argsSchema>;

export const writeFile = {
  name: "writeFile",
  description: "Write text to a file, replacing the current file's content",
  argsSchema,
  async call(args: Args) {
    const directory = dirname(args.relativeFilePath);
    await mkdir(directory, { recursive: true }).catch((error) => {
      if (error.code !== "EEXIST") throw error; // ignore the error if the directory already exists
    });
    await fsWriteFile(args.relativeFilePath, args.content);
    return { success: true, output: null };
  },
} satisfies Tool<Args>;
