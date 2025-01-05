import type { Route } from "./+types/route";
import { getDb } from "../../data/db";

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
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Username</th>
						<th>Email</th>
						<th>Created At</th>
					</tr>
				</thead>
				<tbody>
					{result.map((user) => (
						<tr key={user.id}>
							<td>{user.id}</td>
							<td>{user.username}</td>
							<td>{user.email}</td>
							<td>{user.created_at}</td>
						</tr>
					))}
				</tbody>
			</table>
		</main>
	);
}
