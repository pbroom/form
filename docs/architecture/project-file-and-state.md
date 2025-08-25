# Project File and State

Goals

- Open/save project state as a single portable file
- Deterministic schema that supports import/export and sharing
- Enable collaborative editing and versioning

Format

- JSON with explicit schema: nodes, edges, metadata, settings
- Backwards/forwards compatible via schemaVersion

Schema sketch

```json
{
	"schemaVersion": 1,
	"modules": [
		{
			"name": "MainScene",
			"tree": {
				/* TreeLayer */
			},
			"graph": {
				/* GraphLayer */
			},
			"meta": {
				/* MetaLayer */
			}
		}
	],
	"settings": {"ui": {}, "project": {}}
}
```

Persistence

- Auto-save locally (e.g., IndexedDB) with manual export to file
- Import loads and validates schema; report errors clearly
- Preserve deterministic ordering to reduce diffs

Sharing

- File-based sharing (email/drive) and link-based when backend exists
- Embed minimal provenance: createdBy, timestamps

Build guidance

- Define TypeScript types for project schema
- Add `loadProject(file)`, `saveProject()` services
- Wire editor state to serialize/deserialize nodes/edges and view state
- Round-tripping: store code-owned and graph-owned regions separately where needed
