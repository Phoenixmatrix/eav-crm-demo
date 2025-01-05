import type { Route } from "./+types/route";
import { Link } from "../../components/Link";
import { GridList } from "../../components/GridList";

interface RouteInfo {
	path: string;
	title: string;
	description: string;
}

const routes: RouteInfo[] = [
	{
		path: "/diagnostic",
		title: "Users",
		description: "View all users in the system",
	},
	{
		path: "/entity-types",
		title: "Entity Types",
		description: "View and manage entity types that define your data model",
	},
	{
		path: "/attributes",
		title: "Attributes",
		description: "View attributes associated with entity types",
	},
	{
		path: "/entities",
		title: "Entities",
		description: "View all entities in the system",
	},
	{
		path: "/entity-values",
		title: "Entity Values",
		description: "View all entity attribute values",
	},
];

export default function Demo() {
	return (
		<main className="p-8">
			<h1 className="text-2xl font-bold mb-6">EAV CRM Demo</h1>
			<ul className="space-y-4">
				{routes.map((route) => (
					<li key={route.path}>
						<Link
							href={route.path}
							className="block p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
						>
							<h2 className="text-lg font-semibold text-blue-600">
								{route.title}
							</h2>
							<p className="text-gray-600 mt-2">{route.description}</p>
						</Link>
					</li>
				))}
			</ul>
		</main>
	);
}
