import { fileURLToPath } from "url";
import { dirname, join } from "path";

export const __dirname = (url: string) => dirname(fileURLToPath(url));

export const __rootDir = join(__dirname(import.meta.url), "..");

export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
