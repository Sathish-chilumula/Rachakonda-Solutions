import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig({
  wrapper: "cloudflare-node",
  converter: "edge",
  incrementalCache: "dummy",
  tagCache: "dummy",
  queue: "dummy",
});

export default config;
