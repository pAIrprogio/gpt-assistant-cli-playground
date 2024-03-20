import { z, input } from "zod";
import { $ } from "zx";
import { Tool } from "../tool.utils.js";

const argsSchema = z.object({
  relativePath: z
    .string()
    .default(".")
    .describe("relative path to the directory"),
});

type Args = z.input<typeof argsSchema>;

export const ls = {
  name: "ls",
  description: "List a directory's files",
  argsSchema,
  async call({ relativePath }: Args) {
    const res =
      await $`(git ls-files ${relativePath}; git ls-files -m  ${relativePath}; git ls-files --others --exclude-standard  ${relativePath}) | sort | uniq`;
    return {
      success: true,
      output: res.stdout.trim(),
    };
  },
} satisfies Tool<Args>;
