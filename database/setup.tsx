import Database from "better-sqlite3";
import path from "node:path";

// Initialize the database
const db = new Database(
	path.join(path.dirname(new URL(import.meta.url).pathname), "crm.db"),
);
db.pragma("journal_mode = WAL");

function setupDatabase() {
	try {
		// Drop existing tables in reverse order of dependencies
		db.exec(`
            DROP TABLE IF EXISTS entity_values;
            DROP TABLE IF EXISTS entities;
            DROP TABLE IF EXISTS attributes;
            DROP TABLE IF EXISTS entity_types;
            DROP TABLE IF EXISTS users;
        `);

		// Create users table
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
			// Insert Product entity type
			const productType = db
				.prepare("INSERT INTO entity_types (name, description) VALUES (?, ?)")
				.run("Product", "Physical product for sale");

			// Insert Customer entity type
			const customerType = db
				.prepare("INSERT INTO entity_types (name, description) VALUES (?, ?)")
				.run("Customer", "Customer information");

			// Insert Product attributes
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

			// Insert Customer attributes
			insertAttribute.run(
				"full_name",
				"Customer's full name",
				"text",
				customerType.lastInsertRowid,
			);
			insertAttribute.run(
				"email",
				"Customer's email address",
				"text",
				customerType.lastInsertRowid,
			);
			insertAttribute.run(
				"age",
				"Customer's age",
				"number",
				customerType.lastInsertRowid,
			);
			insertAttribute.run(
				"is_active",
				"Whether the customer is active",
				"boolean",
				customerType.lastInsertRowid,
			);

			// Insert sample entities and their values
			const insertEntity = db.prepare(`
                INSERT INTO entities (entity_type_id)
                VALUES (?)
            `);

			const insertValue = db.prepare(`
                INSERT INTO entity_values (entity_id, attribute_id, value_text, value_number, value_boolean)
                VALUES (?, ?, ?, ?, ?)
            `);

			// Create sample customers
			const customers = [
				{
					full_name: "Alice Johnson",
					email: "alice@example.com",
					age: 28,
					is_active: true,
				},
				{
					full_name: "Carlos Rodriguez",
					email: "carlos@example.com",
					age: 35,
					is_active: true,
				},
			];

			// Get attribute IDs for customer fields
			interface CustomerAttribute {
				id: number;
				name: string;
				data_type: string;
			}

			const customerAttrs = db
				.prepare(`
                SELECT id, name, data_type
                FROM attributes
                WHERE entity_type_id = ?
            `)
				.all(customerType.lastInsertRowid) as CustomerAttribute[];

			// Insert customer entities and their values
			for (const customer of customers) {
				const entityResult = insertEntity.run(customerType.lastInsertRowid);
				const entityId = entityResult.lastInsertRowid;

				for (const attr of customerAttrs) {
					let valueText: string | null = null;
					let valueNumber: number | null = null;
					let valueBoolean: number | null = null;

					switch (attr.data_type) {
						case "text":
							valueText = customer[
								attr.name as keyof typeof customer
							] as string;
							break;
						case "number":
							valueNumber = customer[
								attr.name as keyof typeof customer
							] as number;
							break;
						case "boolean":
							valueBoolean = (customer[
								attr.name as keyof typeof customer
							] as boolean)
								? 1
								: 0;
							break;
					}

					insertValue.run(
						entityId,
						attr.id,
						valueText,
						valueNumber,
						valueBoolean,
					);
				}
			}

			// Create sample products
			const products = [
				{
					name: "Laptop Pro X1",
					price: 1299.99,
				},
				{
					name: "Wireless Mouse M3",
					price: 49.99,
				},
				{
					name: "4K Monitor 27-inch",
					price: 399.99,
				},
			];

			// Get attribute IDs for product fields
			interface ProductAttribute {
				id: number;
				name: string;
				data_type: string;
			}

			const productAttrs = db
				.prepare(`
				SELECT id, name, data_type
				FROM attributes
				WHERE entity_type_id = ?
			`)
				.all(productType.lastInsertRowid) as ProductAttribute[];

			// Insert product entities and their values
			for (const product of products) {
				const entityResult = insertEntity.run(productType.lastInsertRowid);
				const entityId = entityResult.lastInsertRowid;

				for (const attr of productAttrs) {
					let valueText: string | null = null;
					let valueNumber: number | null = null;
					const valueBoolean: number | null = null;

					const value = product[attr.name as keyof typeof product];
					switch (attr.data_type) {
						case "text":
							valueText = String(value);
							break;
						case "number":
							valueNumber = Number(value);
							break;
					}

					insertValue.run(
						entityId,
						attr.id,
						valueText,
						valueNumber,
						valueBoolean,
					);
				}
			}

			console.log("Test EAV data inserted successfully");
		}

		console.log("Database setup completed successfully");

		// Verify the data
		const users = db.prepare("SELECT * FROM users").all();
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
