import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
	index("routes/home.tsx"),
	route("demo", "routes/demo/route.tsx"),
	route("diagnostic", "routes/diagnostic/route.tsx"),
	route("entity-types", "routes/entity-types/route.tsx"),
	route("attributes", "routes/attributes/route.tsx"),
	route("entities", "routes/entities/route.tsx"),
	route("entity-values", "routes/entity-values/route.tsx"),
] satisfies RouteConfig;
