import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      // @ts-ignore
      incrementalCache: () => import("@opennextjs/cloudflare/incremental-cache"),
    },
  },
};

export default config;
