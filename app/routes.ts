import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("diagnostic", "routes/diagnostic/route.tsx"),
	route("entity-types", "routes/entity-types/route.tsx"),
] satisfies RouteConfig;
