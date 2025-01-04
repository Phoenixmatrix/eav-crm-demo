import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("interactions", "./routes/interactions/route.tsx"),
] satisfies RouteConfig;
