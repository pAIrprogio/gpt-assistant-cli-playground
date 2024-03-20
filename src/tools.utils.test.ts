import { describe, expect, it } from "vitest";
import { toOpenAiTool, toOpenAiTools } from "./tool.utils.js";
import { ls } from "./tools/ls.js";
import { readFile } from "./tools/readFile.js";
import { executeCommand } from "./tools/executeCommand.js";

describe("toOpenAiTool", () => {
  it("creates schema from a tool", () => {
    expect(toOpenAiTool(ls)).toMatchSnapshot();
  });
});

describe("toOpenAiTools", () => {
  it("creates schemas from tools", () => {
    expect(toOpenAiTools([readFile, executeCommand])).toMatchSnapshot();
  });
});
