import type { Route } from "./+types/route";
import { getDb } from "../../../../data/db";
import {
	Table,
	TableHeader,
	Column,
	Row,
	Cell,
} from "../../../../components/Table";
import { TableBody } from "react-aria-components";
import { Link } from "../../../../components/Link";

interface EntityType {
	id: number;
	name: string;
	description: string | null;
}

interface Attribute {
	id: number;
	name: string;
	data_type: string;
	description: string | null;
	created_at: string;
}

interface LoaderData {
	entityType: EntityType;
	attributes: Attribute[];
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
		.prepare(`
            SELECT id, name, data_type, description, created_at
            FROM attributes
            WHERE entity_type_id = ?
        `)
		.all(entityType.id) as Attribute[];

	return { entityType, attributes } satisfies LoaderData;
}

export default function EntityTypeAttributes({
	loaderData,
}: {
	loaderData: LoaderData;
}) {
	const { entityType, attributes } = loaderData;

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
					{entityType.name} Attributes
				</h1>
				{entityType.description && (
					<p className="text-gray-400 mt-2">{entityType.description}</p>
				)}
			</div>

			<Table className="w-[850px]" aria-label={`${entityType.name} Attributes`}>
				<TableHeader>
					<Column id="id" isRowHeader>
						ID
					</Column>
					<Column id="name">Name</Column>
					<Column id="data_type">Data Type</Column>
					<Column id="description">Description</Column>
					<Column id="created_at">Created At</Column>
				</TableHeader>
				<TableBody items={attributes}>
					{(attribute: Attribute) => (
						<Row key={attribute.id}>
							<Cell>{attribute.id}</Cell>
							<Cell>{attribute.name}</Cell>
							<Cell>{attribute.data_type}</Cell>
							<Cell>{attribute.description || "-"}</Cell>
							<Cell>{attribute.created_at}</Cell>
						</Row>
					)}
				</TableBody>
			</Table>
		</main>
	);
}
