import type { Route } from "./+types/route";
import { getDb } from "../../data/db";
import { Table, TableHeader, Column, Row, Cell } from "../../components/Table";
import { TableBody } from "react-aria-components";
import { Link } from "../../components/Link";

interface EntityType {
	id: number;
	name: string;
	description: string | null;
	created_at: string;
}

export function loader({ context }: Route.LoaderArgs) {
	const db = getDb();
	const result = db
		.prepare("SELECT id, name, description, created_at FROM entity_types")
		.all() as EntityType[];
	return { result };
}

export default function EntityTypes({ loaderData }: Route.ComponentProps) {
	const result = loaderData.result;
	return (
		<main className="p-8">
			<div className="mb-8">
				<Link
					href="/demo"
					className="text-gray-400 hover:text-gray-600 mb-2 inline-block"
				>
					← Back to Demo
				</Link>
				<h1 className="text-2xl font-semibold text-gray-400">Entity Types</h1>
			</div>
			<Table className="w-2/3" aria-label="Entity Types">
				<TableHeader>
					<Column id="id" isRowHeader>
						ID
					</Column>
					<Column id="name">Name</Column>
					<Column id="description">Description</Column>
					<Column id="created_at">Created At</Column>
					<Column id="actions" className="w-48">
						Actions
					</Column>
				</TableHeader>
				<TableBody items={result}>
					{(row) => (
						<Row key={row.id}>
							<Cell>{row.id}</Cell>
							<Cell>{row.name}</Cell>
							<Cell>{row.description || "-"}</Cell>
							<Cell>{row.created_at}</Cell>
							<Cell>
								<div className="space-x-4">
									<Link
										href={`/entity-types/${row.id}`}
										className="text-blue-400 hover:text-blue-600"
									>
										View Entities
									</Link>
									<Link
										href={`/entity-types/${row.id}/attributes`}
										className="text-blue-400 hover:text-blue-600"
									>
										View Attributes
									</Link>
								</div>
							</Cell>
						</Row>
					)}
				</TableBody>
			</Table>
		</main>
	);
}
