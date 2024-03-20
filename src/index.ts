import "dotenv/config";
import { chalk, echo, question, $ } from "zx";
import { ToolCall, createThread, toRunableAssistant } from "./assistant.js";
import ora from "ora";
import OpenAI from "openai";
import baseAssistant from "./assistants/baseAssistant.js";
import { syncCachedAssistant } from "./storage/storage.repository.js";
import { never } from "./ts.utils.js";
import { toTerminal } from "./md.utils.js";

// Disable logging of stdout/stderr
$.verbose = false;

function displayToolCall(action: ToolCall) {
  return `${action.name} (${JSON.stringify(action.args)})`;
}

function displayToolCalls(actions: ToolCall[]) {
  return actions.map(displayToolCall).join(", ");
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const {
  remoteId: assistantId,
  name,
  version,
  state: assistantState,
} = await syncCachedAssistant(client, baseAssistant);

echo(
  chalk.yellow("\nUsing assistant: ") +
    `${name} - v${version} (${assistantState})\n` +
    chalk.underline.yellowBright(
      `https://platform.openai.com/playground?mode=assistant&assistant=${assistantId}`,
    ),
);

const runableAssistant = toRunableAssistant(assistantId, baseAssistant);

const thread = await createThread(client, runableAssistant);

echo(chalk.bold.blue("\nAssistant: ") + "\nHello, how can I help you?");

while (true) {
  echo(chalk.bold.magenta("\nUser: "));
  const userInput = await question();
  echo(chalk.bold.blue("\nAssistant: "));
  const res = thread.sendMessage(userInput, runableAssistant);

  let currentSpinner = ora({
    text: "Waiting",
    color: "blue",
  }).start();
  let previousToolCalls = null;

  // Grab the interrupt function
  let interrupt: (() => Promise<void>) | null = null;
  // TODO: Find a way to use it

  for await (let status of res) {
    switch (status.type) {
      case "message_sent":
        break;
      case "executing_tools_done":
        previousToolCalls = null;
        status.isSuccess ? currentSpinner.succeed() : currentSpinner.fail();
        currentSpinner = ora({
          text: "Waiting",
          color: "cyan",
        }).start();
        break;
      case "executing_tools":
        const toolCalls = displayToolCalls(status.tools);

        if (previousToolCalls && toolCalls !== previousToolCalls) {
          currentSpinner.color = "green";
          currentSpinner.succeed();
          currentSpinner = ora({
            text: "Executing tools: " + toolCalls,
            color: "cyan",
          }).start();
        } else {
          currentSpinner.text = "Executing tools: " + toolCalls;
        }

        previousToolCalls = toolCalls;
        break;

      case "completed":
        currentSpinner.color = "green";
        currentSpinner.stop();
        echo(toTerminal(status.message));
        break;

      case "failed":
        currentSpinner.color = "red";
        currentSpinner.fail("Failed");
        echo(chalk.red(status.error));
        break;

      case "cancelled":
        currentSpinner.color = "yellow";
        currentSpinner.fail("Cancelled");
        break;

      case "expired":
        currentSpinner.color = "red";
        currentSpinner.fail("Expired");
        break;

      case "queued":
        currentSpinner.color = "cyan";
        currentSpinner.text = "Waiting";
        break;

      case "in_progress":
        currentSpinner.color = "blue";
        currentSpinner.text = "Thinking";
        break;

      case "cancelling":
        currentSpinner.color = "yellow";
        currentSpinner.text = "Cancelling";
        break;

      default:
        never(status);
    }
  }

  if (interrupt) process.off("SIGINT", interrupt);
}
