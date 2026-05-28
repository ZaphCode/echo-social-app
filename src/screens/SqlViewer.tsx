import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { getChatDatabase } from "@/chat/db";
import {
  getSqlViewerColumns,
  getSqlViewerRows,
  listSqlViewerTables,
  SqlViewerColumn,
  SqlViewerRow,
  SqlViewerSortDirection,
  SqlViewerTable,
} from "@/utils/sqlViewer";

const PAGE_SIZE = 25;
const AUTO_REFRESH_INTERVAL_MS = 3000;
const SORTABLE_DATE_COLUMNS = [
  "updated_at",
  "created_at",
  "cached_at",
  "created_at_client",
  "created_at_server",
  "updated_at_server",
  "last_auth_at",
  "last_online_at",
  "read_at_client",
];

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function getRowSearchText(row: SqlViewerRow) {
  return Object.values(row).map(stringifyValue).join(" ").toLowerCase();
}

function formatRowJson(row: SqlViewerRow) {
  return JSON.stringify(row, null, 2);
}

export default function SqlViewer() {
  const [tables, setTables] = useState<SqlViewerTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<SqlViewerColumn[]>([]);
  const [rows, setRows] = useState<SqlViewerRow[]>([]);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [sortDirection, setSortDirection] =
    useState<SqlViewerSortDirection>("desc");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;

    return rows.filter((row) => getRowSearchText(row).includes(query));
  }, [rows, search]);

  const selectedTableInfo = tables.find(
    (table) => table.name === selectedTable,
  );
  const canGoBack = page > 0;
  const canGoNext = selectedTableInfo
    ? (page + 1) * PAGE_SIZE < selectedTableInfo.rowCount
    : false;
  const sortColumn = useMemo(() => {
    const columnNames = new Set(columns.map((column) => column.name));
    return (
      SORTABLE_DATE_COLUMNS.find((columnName) => columnNames.has(columnName)) ??
      null
    );
  }, [columns]);

  const loadTables = useCallback(
    async (nextSelectedTable?: string | null) => {
      const db = getChatDatabase();
      const nextTables = await listSqlViewerTables(db);
      const preferredTable = nextSelectedTable ?? selectedTable;
      const nextSelected =
        preferredTable &&
        nextTables.some((table) => table.name === preferredTable)
          ? preferredTable
          : (nextTables[0]?.name ?? null);

      setTables(nextTables);
      setSelectedTable(nextSelected);
      return nextSelected;
    },
    [selectedTable],
  );

  const loadTableData = useCallback(
    async (tableName: string | null, nextPage: number) => {
      if (!tableName) {
        setColumns([]);
        setRows([]);
        return;
      }

      const db = getChatDatabase();
      const nextColumns = await getSqlViewerColumns(db, tableName);
      const columnNames = new Set(nextColumns.map((column) => column.name));
      const nextSortColumn =
        SORTABLE_DATE_COLUMNS.find((columnName) =>
          columnNames.has(columnName),
        ) ?? null;
      const nextRows = await getSqlViewerRows(
        db,
        tableName,
        PAGE_SIZE,
        nextPage * PAGE_SIZE,
        nextSortColumn
          ? { column: nextSortColumn, direction: sortDirection }
          : null,
      );

      setColumns(nextColumns);
      setRows(nextRows);
    },
    [sortDirection],
  );

  const refresh = useCallback(
    async (options?: { quiet?: boolean }) => {
      if (options?.quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const nextSelected = await loadTables(selectedTable);
        await loadTableData(nextSelected, page);
      } catch (nextError) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "No se pudo leer la base local.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loadTableData, loadTables, page, selectedTable],
  );

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!selectedTable) return;

    setExpandedRow(null);
    setSearch("");
    loadTableData(selectedTable, page).catch((nextError) => {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "No se pudo leer la tabla seleccionada.",
      );
    });
  }, [loadTableData, page, selectedTable]);

  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      refresh({ quiet: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refresh]);

  const selectTable = (tableName: string) => {
    setSelectedTable(tableName);
    setPage(0);
  };

  const renderTableChip = ({ item }: { item: SqlViewerTable }) => {
    const selected = item.name === selectedTable;

    return (
      <Pressable
        style={[styles.tableCard, selected && styles.tableCardSelected]}
        onPress={() => selectTable(item.name)}
      >
        <Text
          numberOfLines={2}
          style={[
            styles.tableCardName,
            selected && styles.tableCardNameSelected,
          ]}
        >
          {item.name}
        </Text>
        <Text style={styles.tableCardCount}>{item.rowCount} filas</Text>
        <Text style={styles.tableCardColumnCount}>
          {item.columnCount} columnas
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Local DB</Text>
          <Text style={styles.subtitle}>echo-chat.db</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Refrescar tablas"
          style={styles.iconButton}
          onPress={() => refresh({ quiet: true })}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#22D3EE" />
          ) : (
            <Feather name="refresh-cw" size={18} color="#D9F7FF" />
          )}
        </Pressable>
      </View>

      <View style={styles.controls}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Filtrar filas cargadas"
          placeholderTextColor="#64748B"
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.searchInput}
        />
        <View style={styles.autoRefreshControl}>
          <Text style={styles.autoRefreshLabel}>Auto</Text>
          <Switch
            value={autoRefresh}
            onValueChange={setAutoRefresh}
            style={styles.switch}
            trackColor={{ false: "#334155", true: "#0E7490" }}
            thumbColor={autoRefresh ? "#22D3EE" : "#CBD5E1"}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#22D3EE" />
          <Text style={styles.centerText}>Leyendo SQLite local...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <MaterialCommunityIcons
            name="database-alert"
            size={34}
            color="#F87171"
          />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => refresh()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.tablesTitleRow}>
            <MaterialCommunityIcons
              name="table-multiple"
              size={18}
              color="#67E8F9"
            />
            <Text style={styles.tablesTitle}>Tables</Text>
          </View>

          <FlatList
            data={tables}
            horizontal
            keyExtractor={(item) => item.name}
            renderItem={renderTableChip}
            style={styles.tablesScroller}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tableList}
          />

          <View style={styles.tableMeta}>
            <View style={styles.metaInfo}>
              {/*<Text numberOfLines={1} style={styles.metaTitle}>
                {selectedTable ?? "Sin tablas"}
              </Text>*/}
              <Text style={styles.metaText}>
                {sortColumn
                  ? `Ordenando por "${sortColumn}"`
                  : "Esta tabla no tiene columna temporal para ordenar"}
              </Text>
            </View>
            {sortColumn && (
              <View style={styles.sortSegment}>
                <Pressable
                  style={[
                    styles.sortButton,
                    sortDirection === "desc" && styles.sortButtonSelected,
                  ]}
                  onPress={() => {
                    setPage(0);
                    setSortDirection("desc");
                  }}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortDirection === "desc" && styles.sortButtonTextSelected,
                    ]}
                  >
                    Recientes
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.sortButton,
                    sortDirection === "asc" && styles.sortButtonSelected,
                  ]}
                  onPress={() => {
                    setPage(0);
                    setSortDirection("asc");
                  }}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortDirection === "asc" && styles.sortButtonTextSelected,
                    ]}
                  >
                    Viejos
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {filteredRows.length === 0 ? (
            <View style={styles.centerState}>
              <MaterialCommunityIcons
                name="database-off"
                size={34}
                color="#64748B"
              />
              <Text style={styles.centerText}>
                {rows.length === 0
                  ? "Esta tabla no tiene filas."
                  : "No hay filas cargadas que coincidan."}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.rowsList}
              contentContainerStyle={styles.rowsContent}
            >
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator
                contentContainerStyle={[
                  styles.dataTable,
                  { minWidth: Math.max(columns.length * 160 + 64, 360) },
                ]}
              >
                <View>
                  <View style={styles.dataHeaderRow}>
                    <View style={[styles.dataHeaderCell, styles.rowNumberCell]}>
                      <Text style={styles.dataHeaderText}>#</Text>
                    </View>
                    {columns.map((column) => (
                      <View key={column.name} style={styles.dataHeaderCell}>
                        <Text numberOfLines={1} style={styles.dataHeaderText}>
                          {column.name}
                        </Text>
                        <Text numberOfLines={1} style={styles.dataHeaderType}>
                          {column.type || "ANY"}
                          {column.pk ? " PK" : ""}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {filteredRows.map((row, index) => {
                    const absoluteIndex = page * PAGE_SIZE + index;
                    const expanded = expandedRow === absoluteIndex;

                    return (
                      <View key={`${selectedTable}-${absoluteIndex}`}>
                        <Pressable
                          style={[
                            styles.dataRow,
                            expanded && styles.dataRowExpanded,
                          ]}
                          onPress={() =>
                            setExpandedRow(expanded ? null : absoluteIndex)
                          }
                        >
                          <View style={[styles.dataCell, styles.rowNumberCell]}>
                            <Text style={styles.rowNumberText}>
                              {absoluteIndex + 1}
                            </Text>
                          </View>
                          {columns.map((column) => (
                            <View key={column.name} style={styles.dataCell}>
                              <Text
                                selectable
                                numberOfLines={1}
                                style={styles.dataCellText}
                              >
                                {stringifyValue(row[column.name])}
                              </Text>
                            </View>
                          ))}
                        </Pressable>
                        {expanded && (
                          <View style={styles.jsonPanel}>
                            <Text selectable style={styles.jsonText}>
                              {formatRowJson(row)}
                            </Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </ScrollView>
          )}

          <View style={styles.pagination}>
            <Pressable
              style={[
                styles.pageButton,
                !canGoBack && styles.pageButtonDisabled,
              ]}
              disabled={!canGoBack}
              onPress={() =>
                setPage((currentPage) => Math.max(0, currentPage - 1))
              }
            >
              <Text style={styles.pageButtonText}>Anterior</Text>
            </Pressable>
            <Text style={styles.pageText}>Pagina {page + 1}</Text>
            <Pressable
              style={[
                styles.pageButton,
                !canGoNext && styles.pageButtonDisabled,
              ]}
              disabled={!canGoNext}
              onPress={() => setPage((currentPage) => currentPage + 1)}
            >
              <Text style={styles.pageButtonText}>Siguiente</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
  },
  title: {
    color: "#F8FAFC",
    fontFamily: "Geist-Bold",
    fontSize: 22,
  },
  subtitle: {
    color: "#A3A3A3",
    fontFamily: "Geist-Regular",
    fontSize: 13,
    marginTop: 2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "#262626",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: "#E2E8F0",
    fontFamily: "Geist-Regular",
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "#262626",
  },
  autoRefreshControl: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "30%",
    paddingLeft: 10,
    paddingRight: 4,
    borderRadius: 10,
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "#262626",
  },
  autoRefreshLabel: {
    color: "#CBD5E1",
    fontFamily: "Geist-Bold",
    fontSize: 11,
  },
  tableList: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  tablesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 10,
  },
  tablesTitle: {
    color: "#F5F5F5",
    fontFamily: "Geist-Bold",
    fontSize: 14,
  },
  tablesScroller: {
    flexGrow: 0,
    maxHeight: 100,
  },
  switch: {
    transform:
      Platform.OS === "ios"
        ? [{ scaleX: 0.7 }, { scaleY: 0.7 }]
        : [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
  tableCard: {
    width: 166,
    minHeight: 86,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "#262626",
  },
  tableCardSelected: {
    backgroundColor: "#061013",
    borderColor: "#22D3EE",
  },
  tableCardName: {
    color: "#D4D4D4",
    fontFamily: "Geist-Bold",
    fontSize: 12,
    lineHeight: 16,
  },
  tableCardNameSelected: {
    color: "#F8FAFC",
  },
  tableCardCount: {
    color: "#67E8F9",
    fontFamily: "Geist-Regular",
    fontSize: 12,
    marginTop: 8,
  },
  tableCardColumnCount: {
    color: "#A3A3A3",
    fontFamily: "Geist-Regular",
    fontSize: 12,
    marginTop: 4,
  },
  tableMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
  },
  metaTitle: {
    color: "#F8FAFC",
    fontFamily: "Geist-Bold",
    fontSize: 18,
  },
  metaInfo: {
    flex: 1,
  },
  metaText: {
    color: "#A3A3A3",
    fontFamily: "Geist-Regular",
    fontSize: 12,
    marginTop: 2,
  },
  sortSegment: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 10,
    backgroundColor: "#050505",
    borderWidth: 1,
    borderColor: "#262626",
  },
  sortButton: {
    minWidth: 72,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  sortButtonSelected: {
    backgroundColor: "#0E7490",
  },
  sortButtonText: {
    color: "#A3A3A3",
    fontFamily: "Geist-Bold",
    fontSize: 11,
  },
  sortButtonTextSelected: {
    color: "#F8FAFC",
  },
  rowsList: {
    flex: 1,
  },
  rowsContent: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  dataTable: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#262626",
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  dataHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#0A0A0A",
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  dataHeaderCell: {
    width: 160,
    minHeight: 50,
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRightWidth: 1,
    borderRightColor: "#262626",
  },
  dataHeaderText: {
    color: "#F5F5F5",
    fontFamily: "Geist-Bold",
    fontSize: 11,
  },
  dataHeaderType: {
    color: "#737373",
    fontFamily: "Geist-Regular",
    fontSize: 10,
    marginTop: 2,
  },
  dataRow: {
    flexDirection: "row",
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
  },
  dataRowExpanded: {
    backgroundColor: "#050505",
  },
  dataCell: {
    width: 160,
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRightWidth: 1,
    borderRightColor: "#171717",
  },
  dataCellText: {
    color: "#D4D4D4",
    fontFamily: "Geist-Regular",
    fontSize: 12,
  },
  rowNumberCell: {
    width: 64,
    backgroundColor: "#050505",
  },
  rowNumberText: {
    color: "#67E8F9",
    fontFamily: "Geist-Bold",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  jsonPanel: {
    padding: 10,
    backgroundColor: "#050505",
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  jsonText: {
    color: "#BAE6FD",
    fontFamily: "Geist-Regular",
    fontSize: 11,
    lineHeight: 16,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#171717",
  },
  pageButton: {
    flex: 1,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#0E7490",
  },
  pageButtonDisabled: {
    opacity: 0.35,
  },
  pageButtonText: {
    color: "#F8FAFC",
    fontFamily: "Geist-Bold",
    fontSize: 13,
  },
  pageText: {
    color: "#A3A3A3",
    fontFamily: "Geist-Regular",
    fontSize: 12,
    minWidth: 76,
    textAlign: "center",
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 24,
  },
  centerText: {
    color: "#A3A3A3",
    fontFamily: "Geist-Regular",
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    color: "#FCA5A5",
    fontFamily: "Geist-Regular",
    fontSize: 14,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#7F1D1D",
  },
  retryText: {
    color: "#FEE2E2",
    fontFamily: "Geist-Bold",
    fontSize: 13,
  },
});
