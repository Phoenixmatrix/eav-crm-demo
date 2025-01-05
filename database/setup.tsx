import Database from "better-sqlite3";
import path from "node:path";

// Initialize the database
const db = new Database(
	path.join(path.dirname(new URL(import.meta.url).pathname), "crm.db"),
);
db.pragma("journal_mode = WAL");

function setupDatabase() {
	try {
		// Create users table
		db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

		// Prepare insert statement
		const insertUser = db.prepare(`
            INSERT INTO users (username, email)
            VALUES (@username, @email)
        `);

		// Create a transaction for inserting multiple users
		const insertUsers = db.transaction(
			(users: { username: string; email: string }[]) => {
				for (const user of users) {
					insertUser.run(user);
				}
			},
		);

		// Check if test data already exists
		const existingUsers = db
			.prepare("SELECT COUNT(*) as count FROM users")
			.get() as { count: number };

		// Only insert test data if the table is empty
		if (existingUsers.count === 0) {
			// Insert test data
			const testUsers = [
				{ username: "john_doe", email: "john@example.com" },
				{ username: "jane_smith", email: "jane@example.com" },
				{ username: "bob_wilson", email: "bob@example.com" },
			];

			insertUsers(testUsers);
			console.log("Test users inserted successfully");
		} else {
			console.log("Test data already exists, skipping insertion");
		}

		console.log("Database setup completed successfully");

		// Verify the data
		const users = db.prepare("SELECT * FROM users").all();
		console.log("Inserted users:", users);
	} catch (error) {
		console.error("Error setting up database:", error);
		throw error;
	} finally {
		// Close the database connection
		db.close();
	}
}

// Run the setup
setupDatabase();
