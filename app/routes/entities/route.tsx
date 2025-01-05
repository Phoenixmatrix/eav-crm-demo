import type { Route } from "./+types/route";
import { getDb } from "../../data/db";
import { Table, TableHeader, Column, Row, Cell } from "../../components/Table";
import { TableBody } from "react-aria-components";
import { Link } from "../../components/Link";

interface Entity {
	id: number;
	entity_type_name: string;
	created_at: string;
}

export function loader({ context }: Route.LoaderArgs) {
	const db = getDb();
	const result = db
		.prepare(`
            SELECT
                e.id,
                et.name as entity_type_name,
                e.created_at
            FROM entities e
            JOIN entity_types et ON e.entity_type_id = et.id
        `)
		.all() as Entity[];
	return { result };
}

export default function Entities({ loaderData }: Route.ComponentProps) {
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
				<h1 className="text-2xl font-semibold text-gray-400">Entities</h1>
			</div>
			<Table className="w-2/3" aria-label="Entities">
				<TableHeader>
					<Column id="id" isRowHeader>
						ID
					</Column>
					<Column id="entity_type">Entity Type</Column>
					<Column id="created_at">Created At</Column>
				</TableHeader>
				<TableBody items={result}>
					{(row) => (
						<Row key={row.id}>
							<Cell>{row.id}</Cell>
							<Cell>{row.entity_type_name}</Cell>
							<Cell>{row.created_at}</Cell>
						</Row>
					)}
				</TableBody>
			</Table>
		</main>
	);
}
