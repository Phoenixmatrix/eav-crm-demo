import type { Route } from "./+types/route";
import { getDb } from "../../data/db";
import { Table, TableHeader, Column, Row, Cell } from "../../components/Table";
import { TableBody } from "react-aria-components";

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
		<main>
			<h1>Entity Types</h1>
			<Table className="w-2/3" aria-label="Entity Types">
				<TableHeader>
					<Column id="id" isRowHeader>
						ID
					</Column>
					<Column id="name">Name</Column>
					<Column id="description">Description</Column>
					<Column id="created_at">Created At</Column>
				</TableHeader>
				<TableBody items={result}>
					{(row) => (
						<Row key={row.id}>
							<Cell>{row.id}</Cell>
							<Cell>{row.name}</Cell>
							<Cell>{row.description || "-"}</Cell>
							<Cell>{row.created_at}</Cell>
						</Row>
					)}
				</TableBody>
			</Table>
		</main>
	);
}
