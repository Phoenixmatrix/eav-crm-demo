import type { Route } from "./+types/route";
import { getDb } from "../../data/db";
import { Table, TableHeader, Column, Row, Cell } from "../../components/Table";
import { TableBody } from "react-aria-components";
import { Link } from "../../components/Link";

interface EntityValue {
	id: number;
	entity_id: number;
	attribute_name: string;
	value_text: string | null;
	value_number: number | null;
	value_date: string | null;
	value_boolean: number | null;
	created_at: string;
}

export function loader({ context }: Route.LoaderArgs) {
	const db = getDb();
	const result = db
		.prepare(`
            SELECT
                ev.id,
                ev.entity_id,
                a.name as attribute_name,
                ev.value_text,
                ev.value_number,
                ev.value_date,
                ev.value_boolean,
                ev.created_at
            FROM entity_values ev
            JOIN attributes a ON ev.attribute_id = a.id
        `)
		.all() as EntityValue[];
	return { result };
}

export default function EntityValues({ loaderData }: Route.ComponentProps) {
	const result = loaderData.result;

	function formatValue(row: EntityValue) {
		if (row.value_text !== null) return row.value_text;
		if (row.value_number !== null) return row.value_number.toString();
		if (row.value_date !== null) return row.value_date;
		if (row.value_boolean !== null) return row.value_boolean ? "True" : "False";
		return "-";
	}

	return (
		<main className="p-8">
			<div className="mb-8">
				<Link
					href="/demo"
					className="text-gray-400 hover:text-gray-600 mb-2 inline-block"
				>
					← Back to Demo
				</Link>
				<h1 className="text-2xl font-semibold text-gray-400">Entity Values</h1>
			</div>
			<Table className="w-2/3" aria-label="Entity Values">
				<TableHeader>
					<Column id="id" isRowHeader>
						ID
					</Column>
					<Column id="entity_id">Entity ID</Column>
					<Column id="attribute">Attribute</Column>
					<Column id="value">Value</Column>
					<Column id="created_at">Created At</Column>
				</TableHeader>
				<TableBody items={result}>
					{(row) => (
						<Row key={row.id}>
							<Cell>{row.id}</Cell>
							<Cell>{row.entity_id}</Cell>
							<Cell>{row.attribute_name}</Cell>
							<Cell>{formatValue(row)}</Cell>
							<Cell>{row.created_at}</Cell>
						</Row>
					)}
				</TableBody>
			</Table>
		</main>
	);
}
