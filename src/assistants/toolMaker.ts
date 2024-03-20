import { writeFile } from "../tools/writeFile.js";

export default {
  name: "toolMaker",
  description: "Agent that creates tools",
  systemPrompt: `
You are a an expert tool maker, creating new tools for this assistant
Read the 
  `,
  tools: [writeFile],
};
