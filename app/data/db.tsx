import Database from "better-sqlite3";
import path from "node:path";

let databaseInstance: InstanceType<typeof Database>;

// Function to connect to the SQLite database
export function getDb(): InstanceType<typeof Database> {
	if (!databaseInstance) {
		databaseInstance = new Database(
			path.join(
				path.dirname(new URL(import.meta.url).pathname),
				"../../database/crm.db",
			),
		);
		databaseInstance.pragma("journal_mode = WAL");
	}
	return databaseInstance;
}
