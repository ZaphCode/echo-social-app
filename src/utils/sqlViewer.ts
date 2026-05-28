import type { SQLiteDatabase } from "expo-sqlite";

export type SqlViewerTable = {
  name: string;
  rowCount: number;
  columnCount: number;
};

export type SqlViewerColumn = {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: string | number | null;
  pk: number;
};

export type SqlViewerRow = Record<string, unknown>;

export type SqlViewerSortDirection = "desc" | "asc";

export type SqlViewerSort = {
  column: string;
  direction: SqlViewerSortDirection;
};

type TableNameRow = {
  name: string;
};

type CountRow = {
  count: number;
};

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, "\"\"")}"`;
}

export async function listSqlViewerTables(db: SQLiteDatabase) {
  const tableRows = await db.getAllAsync<TableNameRow>(
    `
      SELECT name
      FROM sqlite_master
      WHERE type = 'table'
        AND name NOT LIKE 'sqlite_%'
      ORDER BY name COLLATE NOCASE
    `,
  );

  const tables: SqlViewerTable[] = [];

  for (const table of tableRows) {
    const quotedTable = quoteIdentifier(table.name);
    const [countRow, columns] = await Promise.all([
      db.getFirstAsync<CountRow>(
        `SELECT COUNT(*) AS count FROM ${quotedTable}`,
      ),
      getSqlViewerColumns(db, table.name),
    ]);

    tables.push({
      name: table.name,
      rowCount: countRow?.count ?? 0,
      columnCount: columns.length,
    });
  }

  return tables;
}

export async function getSqlViewerColumns(
  db: SQLiteDatabase,
  tableName: string,
) {
  return db.getAllAsync<SqlViewerColumn>(
    `PRAGMA table_info(${quoteIdentifier(tableName)})`,
  );
}

export async function getSqlViewerRows(
  db: SQLiteDatabase,
  tableName: string,
  limit: number,
  offset: number,
  sort?: SqlViewerSort | null,
) {
  const orderClause = sort
    ? ` ORDER BY ${quoteIdentifier(sort.column)} ${sort.direction === "desc" ? "DESC" : "ASC"}`
    : "";

  return db.getAllAsync<SqlViewerRow>(
    `SELECT * FROM ${quoteIdentifier(tableName)}${orderClause} LIMIT ? OFFSET ?`,
    [limit, offset],
  );
}
