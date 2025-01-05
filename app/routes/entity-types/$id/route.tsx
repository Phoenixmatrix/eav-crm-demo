import type { Route } from "./+types/route";
import { getDb } from "../../../data/db";
import {
	Table,
	TableHeader,
	Column,
	Row,
	Cell,
} from "../../../components/Table";
import { TableBody } from "react-aria-components";
import { Link } from "../../../components/Link";
import { Check, X } from "lucide-react";

interface EntityType {
	id: number;
	name: string;
	description: string | null;
}

interface Attribute {
	id: number;
	name: string;
	data_type: string;
}

interface EntityValue {
	entity_id: number;
	attribute_id: number;
	value_text: string | null;
	value_number: number | null;
	value_boolean: number | null;
	value_date: string | null;
}

type EntityAttributeValue = string | number | boolean | null;

interface LoaderData {
	entityType: EntityType;
	attributes: Attribute[];
	rows: Record<string, EntityAttributeValue>[];
}

export function loader({ params }: Route.LoaderArgs) {
	const db = getDb();

	// Get entity type info
	const entityType = db
		.prepare("SELECT id, name, description FROM entity_types WHERE id = ?")
		.get(params.id) as EntityType;

	if (!entityType) {
		throw new Error("Entity type not found");
	}

	// Get attributes for this entity type
	const attributes = db
		.prepare(
			"SELECT id, name, data_type FROM attributes WHERE entity_type_id = ?",
		)
		.all(entityType.id) as Attribute[];

	// Get all entities of this type with their values
	const entities = db
		.prepare("SELECT id FROM entities WHERE entity_type_id = ?")
		.all(entityType.id) as { id: number }[];

	// Get all values for these entities
	const values = db
		.prepare(`
            SELECT entity_id, attribute_id, value_text, value_number, value_boolean, value_date
            FROM entity_values
            WHERE entity_id IN (${entities.map((e) => e.id).join(",") || "-1"})
        `)
		.all() as EntityValue[];

	// Organize values by entity_id and attribute_id
	const valueMap = new Map<number, Map<number, EntityAttributeValue>>();
	for (const value of values) {
		if (!valueMap.has(value.entity_id)) {
			valueMap.set(value.entity_id, new Map());
		}
		const entityValues = valueMap.get(value.entity_id) ?? new Map();

		// Get the appropriate value based on data type
		let finalValue: EntityAttributeValue = null;
		if (value.value_text !== null) finalValue = value.value_text;
		if (value.value_number !== null) finalValue = value.value_number;
		if (value.value_boolean !== null) finalValue = Boolean(value.value_boolean);
		if (value.value_date !== null) finalValue = value.value_date;

		entityValues.set(value.attribute_id, finalValue);
		valueMap.set(value.entity_id, entityValues);
	}

	// Convert to array format for the table
	const rows = entities.map((entity) => {
		const row: Record<string, EntityAttributeValue> = { id: entity.id };
		const entityValues = valueMap.get(entity.id) || new Map();

		for (const attr of attributes) {
			row[attr.name] = entityValues.get(attr.id) ?? "-";
		}

		return row;
	});

	return { entityType, attributes, rows } satisfies LoaderData;
}

export default function EntityTypeEntities({
	loaderData,
}: Route.ComponentProps) {
	const { entityType, attributes, rows } = loaderData;

	return (
		<main className="p-8">
			<div className="mb-8">
				<Link
					href="/entity-types"
					className="text-gray-400 hover:text-gray-600 mb-2 inline-block"
				>
					← Back to Entity Types
				</Link>
				<h1 className="text-2xl font-semibold text-gray-400">
					{entityType.name} Entities
				</h1>
				{entityType.description && (
					<p className="text-gray-400 mt-2">{entityType.description}</p>
				)}
			</div>

			<Table className="w-full" aria-label={`${entityType.name} Entities`}>
				<TableHeader>
					<Column id="id" isRowHeader>
						ID
					</Column>
					{attributes.map((attr) => (
						<Column key={attr.id} id={attr.name}>
							{attr.name}
						</Column>
					))}
				</TableHeader>
				<TableBody items={rows}>
					{(row) => {
						return (
							<Row key={row.id as number}>
								<Cell>{row.id}</Cell>
								{attributes.map((attr) => {
									return (
										<Cell key={attr.id}>
											{attr.data_type === "boolean" ? (
												row[attr.name] === true ? (
													<Check
														className="text-green-600"
														size={18}
														aria-label="true"
													/>
												) : (
													<X
														className="text-red-600"
														size={18}
														aria-label="false"
													/>
												)
											) : (
												`${row[attr.name]}`
											)}
										</Cell>
									);
								})}
							</Row>
						);
					}}
				</TableBody>
			</Table>
		</main>
	);
}
