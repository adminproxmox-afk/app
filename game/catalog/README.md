# Game Catalog Foundation

This folder is an unconnected foundation for future game and course content.

Structure:

```text
game/catalog/
  _shared/
    templates/
    assets/
    engine/
  it/
    webdev/
      games/
      courses/
      assets/
      docs/
```

Rules:

- Category and subcategory folders match the IDs already used inside the project.
- Current live games stay in their old folders. This catalog is only the clean base for future growth.
- Content manifests should be created from `_shared/templates/`.
- The source metadata file for this foundation is `data/app-catalog.json`.
