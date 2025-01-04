import { createRequestHandler } from "react-router";

declare global {
  interface CloudflareEnvironment {
    VALUE_FROM_CLOUDFLARE: string;
  }
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: { env: CloudflareEnvironment };
  }
}

const requestHandler = createRequestHandler(
  // @ts-expect-error - virtual module provided by React Router at build time
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  fetch(request, env) {
    return requestHandler(request, {
      cloudflare: { env },
    });
  },
} satisfies ExportedHandler<CloudflareEnvironment>;
