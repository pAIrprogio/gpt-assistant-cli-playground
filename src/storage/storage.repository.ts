import OpenAI from "openai";
import { isEqual } from "moderndash";
import {
  AssistantConfig,
  SerializedAssistantConfig,
  serializeAssistantConfig,
} from "../assistant.utils.js";
import { db } from "./storage.client.js";
import { assistants } from "./storage.schema.js";
import { eq } from "drizzle-orm";

async function createRemoteAssistant(
  openaiClient: OpenAI,
  assistantConfig: SerializedAssistantConfig,
) {
  const assistant = await openaiClient.beta.assistants.create(assistantConfig);
  return { id: assistant.id };
}

async function updateRemoteAssistant(
  openaiClient: OpenAI,
  assistantId: string,
  assistantConfig: SerializedAssistantConfig,
) {
  const assistant = await openaiClient.beta.assistants.update(
    assistantId,
    assistantConfig,
  );
  return { id: assistant.id };
}

async function getRemoteAssistant(openaiClient: OpenAI, assistantId: string) {
  const assistant = await openaiClient.beta.assistants.retrieve(assistantId);
  return { id: assistant.id };
}

async function getDbAssistantById(id: string) {
  return db.query.assistants.findFirst({
    where: eq(assistants.id, id),
  });
}

async function createDBAssistant(
  remoteAssistantId: string,
  assistantConfig: SerializedAssistantConfig,
) {
  const dbASsistants = await db
    .insert(assistants)
    .values({
      id: assistantConfig.name,
      foreignId: remoteAssistantId,
      serializedConfig: assistantConfig,
    })
    .returning();
  return dbASsistants[0];
}

async function updateDBAssistant(
  remoteAssistantId: string,
  assistantConfig: SerializedAssistantConfig,
  version: number,
) {
  const dbASsistants = await db
    .update(assistants)
    .set({
      serializedConfig: assistantConfig,
      version,
    })
    .where(eq(assistants.foreignId, remoteAssistantId))
    .returning();
  return dbASsistants[0];
}

export async function syncCachedAssistant(
  openaiClient: OpenAI,
  assistantConfig: AssistantConfig,
) {
  const serializedAssistantConfig = serializeAssistantConfig(assistantConfig);

  const storedAssistantConfig = await getDbAssistantById(assistantConfig.name);

  if (!storedAssistantConfig) {
    const name = `${assistantConfig.name} - v0`;
    const remoteAssistant = await createRemoteAssistant(openaiClient, {
      ...serializedAssistantConfig,
      name,
    });
    const dbAssistant = await createDBAssistant(
      remoteAssistant.id,
      serializedAssistantConfig,
    );
    return {
      remoteId: remoteAssistant.id,
      name: assistantConfig.name,
      version: dbAssistant.version,
      state: "created" as const,
    };
  }

  if (
    !isEqual(storedAssistantConfig.serializedConfig, serializedAssistantConfig)
  ) {
    const version = storedAssistantConfig.version + 1;
    const name = `${assistantConfig.name} - v${version}`;
    const remoteAssistant = await updateRemoteAssistant(
      openaiClient,
      storedAssistantConfig.foreignId,
      { ...serializedAssistantConfig, name },
    );
    const dbAssistant = await updateDBAssistant(
      remoteAssistant.id,
      serializedAssistantConfig,
      version,
    );
    return {
      remoteId: remoteAssistant.id,
      name: assistantConfig.name,
      version,
      state: "updated" as const,
    };
  }

  // We still want to verify that the remote assistant is valid
  // TODO - Handle deleted remote assistants
  const remoteAssistant = await getRemoteAssistant(
    openaiClient,
    storedAssistantConfig.foreignId,
  );
  return {
    remoteId: remoteAssistant.id,
    name: assistantConfig.name,
    version: storedAssistantConfig.version,
    state: "cached" as const,
  };
}
