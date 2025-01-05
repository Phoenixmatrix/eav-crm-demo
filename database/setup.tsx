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

			// Insert Order entity type
			const orderType = db
				.prepare("INSERT INTO entity_types (name, description) VALUES (?, ?)")
				.run("Order", "Customer orders and transactions");

			// Insert Order attributes
			insertAttribute.run(
				"order_number",
				"Unique order identifier",
				"text",
				orderType.lastInsertRowid,
			);
			insertAttribute.run(
				"total_amount",
				"Total order amount",
				"number",
				orderType.lastInsertRowid,
			);
			insertAttribute.run(
				"order_date",
				"Date of the order",
				"text",
				orderType.lastInsertRowid,
			);
			insertAttribute.run(
				"status",
				"Order status",
				"text",
				orderType.lastInsertRowid,
			);

			// Insert Supplier entity type
			const supplierType = db
				.prepare("INSERT INTO entity_types (name, description) VALUES (?, ?)")
				.run("Supplier", "Product suppliers and vendors");

			// Insert Supplier attributes
			insertAttribute.run(
				"company_name",
				"Supplier company name",
				"text",
				supplierType.lastInsertRowid,
			);
			insertAttribute.run(
				"contact_person",
				"Primary contact person",
				"text",
				supplierType.lastInsertRowid,
			);
			insertAttribute.run(
				"email",
				"Contact email",
				"text",
				supplierType.lastInsertRowid,
			);
			insertAttribute.run(
				"phone",
				"Contact phone number",
				"text",
				supplierType.lastInsertRowid,
			);
			insertAttribute.run(
				"rating",
				"Supplier rating (1-5)",
				"number",
				supplierType.lastInsertRowid,
			);

			// Insert Inventory entity type
			const inventoryType = db
				.prepare("INSERT INTO entity_types (name, description) VALUES (?, ?)")
				.run("Inventory", "Product inventory tracking");

			// Insert Inventory attributes
			insertAttribute.run(
				"product_id",
				"Associated product ID",
				"number",
				inventoryType.lastInsertRowid,
			);
			insertAttribute.run(
				"quantity",
				"Current stock quantity",
				"number",
				inventoryType.lastInsertRowid,
			);
			insertAttribute.run(
				"location",
				"Storage location",
				"text",
				inventoryType.lastInsertRowid,
			);
			insertAttribute.run(
				"last_restock",
				"Last restock date",
				"text",
				inventoryType.lastInsertRowid,
			);
			insertAttribute.run(
				"minimum_stock",
				"Minimum stock threshold",
				"number",
				inventoryType.lastInsertRowid,
			);

			// Insert Category entity type
			const categoryType = db
				.prepare("INSERT INTO entity_types (name, description) VALUES (?, ?)")
				.run("Category", "Product categories and classifications");

			// Insert Category attributes
			insertAttribute.run(
				"name",
				"Category name",
				"text",
				categoryType.lastInsertRowid,
			);
			insertAttribute.run(
				"parent_category",
				"Parent category ID",
				"number",
				categoryType.lastInsertRowid,
			);
			insertAttribute.run(
				"description",
				"Category description",
				"text",
				categoryType.lastInsertRowid,
			);
			insertAttribute.run(
				"is_active",
				"Whether the category is active",
				"boolean",
				categoryType.lastInsertRowid,
			);

			// Insert Project entity type
			const projectType = db
				.prepare("INSERT INTO entity_types (name, description) VALUES (?, ?)")
				.run("Project", "Customer projects and initiatives");

			// Insert Project attributes
			insertAttribute.run(
				"name",
				"Project name",
				"text",
				projectType.lastInsertRowid,
			);
			insertAttribute.run(
				"start_date",
				"Project start date",
				"text",
				projectType.lastInsertRowid,
			);
			insertAttribute.run(
				"end_date",
				"Project end date",
				"text",
				projectType.lastInsertRowid,
			);
			insertAttribute.run(
				"budget",
				"Project budget",
				"number",
				projectType.lastInsertRowid,
			);
			insertAttribute.run(
				"status",
				"Project status",
				"text",
				projectType.lastInsertRowid,
			);
			insertAttribute.run(
				"manager",
				"Project manager",
				"text",
				projectType.lastInsertRowid,
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
				{
					full_name: "Emma Thompson",
					email: "emma@example.com",
					age: 42,
					is_active: true,
				},
				{
					full_name: "David Chen",
					email: "david@example.com",
					age: 31,
					is_active: false,
				},
				{
					full_name: "Sarah Wilson",
					email: "sarah@example.com",
					age: 29,
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

			// Create sample products (extending existing products array)
			products.push(
				{
					name: "Gaming Keyboard RGB",
					price: 129.99,
				},
				{
					name: "Wireless Headphones Pro",
					price: 199.99,
				},
				{
					name: "USB-C Dock Station",
					price: 89.99,
				},
				{
					name: "Ergonomic Chair",
					price: 299.99,
				},
				{
					name: "Webcam 4K",
					price: 79.99,
				},
			);

			// Create sample orders
			const orders = [
				{
					order_number: "ORD-2023-001",
					total_amount: 1499.99,
					order_date: "2023-01-15",
					status: "completed",
				},
				{
					order_number: "ORD-2023-002",
					total_amount: 299.99,
					order_date: "2023-02-20",
					status: "processing",
				},
				{
					order_number: "ORD-2023-003",
					total_amount: 899.99,
					order_date: "2023-03-10",
					status: "completed",
				},
				{
					order_number: "ORD-2023-004",
					total_amount: 199.99,
					order_date: "2023-04-05",
					status: "shipped",
				},
				{
					order_number: "ORD-2023-005",
					total_amount: 649.99,
					order_date: "2023-05-01",
					status: "completed",
				},
			];

			// Generate more orders
			const statuses = [
				"completed",
				"processing",
				"shipped",
				"cancelled",
				"pending",
			];
			const generateOrder = (index: number) => {
				const month = String(Math.floor(index / 8) + 1).padStart(2, "0");
				const day = String((index % 28) + 1).padStart(2, "0");
				return {
					order_number: `ORD-2023-${String(index + 6).padStart(3, "0")}`,
					total_amount: Number((Math.random() * 2000 + 50).toFixed(2)),
					order_date: `2023-${month}-${day}`,
					status: statuses[Math.floor(Math.random() * statuses.length)],
				};
			};

			// Add 95 more orders
			for (let i = 0; i < 95; i++) {
				orders.push(generateOrder(i));
			}

			// Create sample suppliers
			const suppliers = [
				{
					company_name: "TechPro Supplies",
					contact_person: "John Smith",
					email: "john@techpro.com",
					phone: "555-0101",
					rating: 4.5,
				},
				{
					company_name: "Global Electronics",
					contact_person: "Maria Garcia",
					email: "maria@globalelec.com",
					phone: "555-0102",
					rating: 4.8,
				},
				{
					company_name: "Office Solutions Inc",
					contact_person: "Robert Lee",
					email: "robert@officesol.com",
					phone: "555-0103",
					rating: 4.2,
				},
				{
					company_name: "Premium Components",
					contact_person: "Lisa Wong",
					email: "lisa@premiumcomp.com",
					phone: "555-0104",
					rating: 4.7,
				},
			];

			// Create sample inventory items
			const inventoryItems = [
				{
					product_id: 1,
					quantity: 50,
					location: "Warehouse A",
					last_restock: "2023-05-15",
					minimum_stock: 10,
				},
				{
					product_id: 2,
					quantity: 75,
					location: "Warehouse B",
					last_restock: "2023-05-10",
					minimum_stock: 15,
				},
				{
					product_id: 3,
					quantity: 30,
					location: "Warehouse A",
					last_restock: "2023-05-20",
					minimum_stock: 5,
				},
				{
					product_id: 4,
					quantity: 25,
					location: "Warehouse C",
					last_restock: "2023-05-18",
					minimum_stock: 8,
				},
			];

			// Create sample categories
			const categories = [
				{
					name: "Electronics",
					parent_category: null,
					description: "Electronic devices and accessories",
					is_active: true,
				},
				{
					name: "Computers",
					parent_category: 1,
					description: "Computer systems and parts",
					is_active: true,
				},
				{
					name: "Peripherals",
					parent_category: 2,
					description: "Computer peripherals and accessories",
					is_active: true,
				},
				{
					name: "Office Equipment",
					parent_category: null,
					description: "Office furniture and equipment",
					is_active: true,
				},
			];

			// Create sample projects
			const projects = [
				{
					name: "Website Redesign",
					start_date: "2023-01-01",
					end_date: "2023-06-30",
					budget: 50000,
					status: "in_progress",
					manager: "Michael Brown",
				},
				{
					name: "Inventory System Upgrade",
					start_date: "2023-03-15",
					end_date: "2023-08-31",
					budget: 75000,
					status: "planning",
					manager: "Jennifer Davis",
				},
				{
					name: "Mobile App Development",
					start_date: "2023-02-01",
					end_date: "2023-07-31",
					budget: 100000,
					status: "in_progress",
					manager: "Thomas Wilson",
				},
				{
					name: "Cloud Migration",
					start_date: "2023-04-01",
					end_date: "2023-09-30",
					budget: 120000,
					status: "not_started",
					manager: "Amanda Martinez",
				},
			];

			// Function to insert entity values
			interface EntityData {
				[key: string]: string | number | boolean | null;
			}

			function insertEntityValues(
				entityId: number,
				attributes: ProductAttribute[],
				data: EntityData,
			) {
				for (const attr of attributes) {
					let valueText: string | null = null;
					let valueNumber: number | null = null;
					let valueBoolean: number | null = null;

					const value = data[attr.name];
					if (value !== undefined && value !== null) {
						switch (attr.data_type) {
							case "text":
								valueText = String(value);
								break;
							case "number":
								valueNumber = Number(value);
								break;
							case "boolean":
								valueBoolean = value ? 1 : 0;
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
			}

			// Insert all sample data
			function insertSampleData(
				entityTypeId: number | bigint,
				attributes: ProductAttribute[],
				data: EntityData[],
			) {
				const typeId = Number(entityTypeId);
				for (const item of data) {
					const entityResult = insertEntity.run(typeId);
					insertEntityValues(
						Number(entityResult.lastInsertRowid),
						attributes,
						item,
					);
				}
			}

			// Get attributes for each entity type
			const getAttributes = db.prepare(`
				SELECT id, name, data_type
				FROM attributes
				WHERE entity_type_id = ?
			`);

			// Insert all sample data
			const orderAttrs = getAttributes.all(
				Number(orderType.lastInsertRowid),
			) as ProductAttribute[];
			const supplierAttrs = getAttributes.all(
				Number(supplierType.lastInsertRowid),
			) as ProductAttribute[];
			const inventoryAttrs = getAttributes.all(
				Number(inventoryType.lastInsertRowid),
			) as ProductAttribute[];
			const categoryAttrs = getAttributes.all(
				Number(categoryType.lastInsertRowid),
			) as ProductAttribute[];
			const projectAttrs = getAttributes.all(
				Number(projectType.lastInsertRowid),
			) as ProductAttribute[];

			insertSampleData(orderType.lastInsertRowid, orderAttrs, orders);
			insertSampleData(supplierType.lastInsertRowid, supplierAttrs, suppliers);
			insertSampleData(
				inventoryType.lastInsertRowid,
				inventoryAttrs,
				inventoryItems,
			);
			insertSampleData(categoryType.lastInsertRowid, categoryAttrs, categories);
			insertSampleData(projectType.lastInsertRowid, projectAttrs, projects);

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
