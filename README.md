# Library Catalog Service

A small MongoDB/Mongoose data layer for a library catalog. It stores genres separately and references each book's genre by ObjectId.

## Requirements

- Node.js 18 or newer
- MongoDB (local or Atlas)

## Setup and seed

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` to your MongoDB connection string. Keep `.env` private; it is ignored by Git.
3. Run `npm run seed`.

The seed command clears the existing `books` and `genres` documents before inserting four genres and sixteen books. It logs the inserted totals and closes the MongoDB connection, including when a seed operation fails. Running it again produces the same catalog without accumulating duplicates. The sample ISBN-13 values are synthetic and use valid ISBN check digits.

## Schema Design

### Book

| Field | Storage and reason | Trade-off |
| --- | --- | --- |
| `title` | Embedded string on each book; it is intrinsic catalog metadata. | A scalar keeps book reads simple and avoids another lookup. |
| `author` | Embedded string; author text is sufficient for this assignment and is displayed with the book. | Repeating an author's name avoids a join for this small catalog. A separate Author collection would be preferable if author biographies, aliases, or linked works needed independent management. |
| `isbn` | Embedded, required, unique string; it identifies a particular book edition. | A unique index makes duplicate editions easy to reject, while keeping the identifier directly available in book queries. |
| `description` | Embedded string because it is book-specific descriptive text and is usually read with the book. | This duplicates no shared entity data and avoids an extra query; large, independently versioned editorial content could be separated later. |
| `coverImage` | Embedded URL string because each edition has one catalog cover URL. | Direct retrieval is simple, though replacing a remote URL requires updating the book document. |
| `totalCopies` | Embedded non-negative integer: the library's owned inventory count for this catalog item. | Keeping the count with its book makes a catalog response self-contained; copy-by-copy tracking would instead require a separate physical-copy model. |
| `availableCopies` | Embedded non-negative integer: the current shelf/checkout availability count. | It is fast to read alongside inventory, but must be updated consistently whenever loans change. The schema rejects values greater than `totalCopies`. |
| `genre` | Reference to a `Genre` document using an ObjectId and `ref: 'Genre'`. Genres are shared classification records with a unique display name and slug. | Referencing avoids repeating genre names/slugs in every book and keeps genre renames consistent; the trade-off is an extra populate/query when the genre label is needed. |

### Genre

`name` and lowercase `slug` are required, unique strings. Genres are referenced by multiple books, so storing each once avoids inconsistent repeated labels and slugs. The unique indexes prevent duplicate genre names and URL identifiers.

## Repository contents

- `models/Genre.js` — genre schema
- `models/Book.js` — book schema and copy-count validation
- `seed.js` — repeatable catalog seed script
- `.env.example` — connection-string variable template without credentials