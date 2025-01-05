import Database from "better-sqlite3";
import path from "node:path";

// Initialize the database
const db = new Database(
	path.join(path.dirname(new URL(import.meta.url).pathname), "crm.db"),
);
db.pragma("journal_mode = WAL");

function setupDatabase() {
	try {
		// Create users table (keeping original)
		db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

		// Create entity_types table
		db.exec(`
            CREATE TABLE IF NOT EXISTS entity_types (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

		// Create attributes table
		db.exec(`
            CREATE TABLE IF NOT EXISTS attributes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                data_type TEXT NOT NULL,
                entity_type_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (entity_type_id) REFERENCES entity_types(id),
                UNIQUE(name, entity_type_id)
            )
        `);

		// Create entities table
		db.exec(`
            CREATE TABLE IF NOT EXISTS entities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_type_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (entity_type_id) REFERENCES entity_types(id)
            )
        `);

		// Create values table
		db.exec(`
            CREATE TABLE IF NOT EXISTS entity_values (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_id INTEGER NOT NULL,
                attribute_id INTEGER NOT NULL,
                value_text TEXT,
                value_number REAL,
                value_date DATETIME,
                value_boolean INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (entity_id) REFERENCES entities(id),
                FOREIGN KEY (attribute_id) REFERENCES attributes(id),
                UNIQUE(entity_id, attribute_id)
            )
        `);

		// Insert test users
		const existingUsers = db
			.prepare("SELECT COUNT(*) as count FROM users")
			.get() as { count: number };

		if (existingUsers.count === 0) {
			const insertUser = db.prepare(`
                INSERT INTO users (username, email)
                VALUES (@username, @email)
            `);

			for (const user of [
				{ username: "john_doe", email: "john@example.com" },
				{ username: "jane_smith", email: "jane@example.com" },
				{ username: "bob_wilson", email: "bob@example.com" },
			]) {
				insertUser.run(user);
			}

			console.log("Test users inserted successfully");
		}

		// Insert test EAV data
		const existingTypes = db
			.prepare("SELECT COUNT(*) as count FROM entity_types")
			.get() as { count: number };

		if (existingTypes.count === 0) {
			// Insert test entity type
			const productType = db
				.prepare("INSERT INTO entity_types (name, description) VALUES (?, ?)")
				.run("Product", "Physical product for sale");

			// Insert test attributes
			const insertAttribute = db.prepare(`
                INSERT INTO attributes (name, description, data_type, entity_type_id)
                VALUES (?, ?, ?, ?)
            `);

			insertAttribute.run(
				"name",
				"Product name",
				"text",
				productType.lastInsertRowid,
			);
			insertAttribute.run(
				"price",
				"Product price",
				"number",
				productType.lastInsertRowid,
			);

			console.log("Test EAV data inserted successfully");
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
