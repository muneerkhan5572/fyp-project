import { createEnv } from "@t3-oss/env-nextjs";
import "dotenv/config";

export const env = createEnv({
  server: {},
  client: {},
  emptyStringAsUndefined: true,
  runtimeEnv: {},
});
