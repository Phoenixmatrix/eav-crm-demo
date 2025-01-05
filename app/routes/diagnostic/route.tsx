import type { Route } from "./+types/route";
import { getDb } from "../../data/db";
import { Table, TableHeader, Column, Row, Cell } from "../../components/Table";
import { TableBody } from "react-aria-components";

interface Users {
	id: number;
	username: string;
	email: string;
	created_at: string;
}

export function loader({ context }: Route.LoaderArgs) {
	const db = getDb();
	const result = db
		.prepare("SELECT id, username, email, created_at FROM users")
		.all() as Users[];
	return { result };
}

export default function Home({ loaderData }: Route.ComponentProps) {
	const result = loaderData.result;
	return (
		<main>
			<h1>SQLite demo</h1>
			<Table className="w-2/3" aria-label="SQLite demo">
				<TableHeader>
					<Column id="id" isRowHeader>
						ID
					</Column>
					<Column id="username">Username</Column>
					<Column id="email">Email</Column>
					<Column id="created_at">Created At</Column>
				</TableHeader>
				<TableBody items={result}>
					{(row) => (
						<Row key={row.id}>
							<Cell>{row.id}</Cell>
							<Cell>{row.username}</Cell>
							<Cell>{row.email}</Cell>
							<Cell>{row.created_at}</Cell>
						</Row>
					)}
				</TableBody>
			</Table>
		</main>
	);
}
