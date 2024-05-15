import ora from "ora";
import { getVectorStore, updateVectorStore } from "../../openai.client.js";
import { promptVectorStoreConfig } from "./create-vector-store.cli.js";
import { promptVectorStoreSelection } from "./vector-store.utils.js";

export const updateVectorStoreAction = async () => {
  const store = await promptVectorStoreSelection(
    "Which vector store do you want to update?",
    false,
  );
  const config = await promptVectorStoreConfig({
    name: store.name,
    metadata: {
      syncConfig: store.syncConfig,
    },
  });
  const spinner = ora({
    text: "Updating vector store",
    color: "blue",
  }).start();
  await updateVectorStore(store.id, config);
  spinner.succeed("Vector store updated");
};