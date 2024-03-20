## How to add a tool ?

1. Look at `./src/tools/readFile.ts` for an example
2. Create a new file `./src/tools/<camelCaseToolName>.ts`
3. Write and export an interface for your tool args
   - Create the input validation schema using `zod`
   - Create the type infering it from the schema
   - Export the tool, complying with the `Tool` interface from `./src/tool.utils.ts`
