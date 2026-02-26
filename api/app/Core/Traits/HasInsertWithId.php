<?php

namespace App\Core\Traits;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

trait HasInsertWithId
{
    public static function insertWithId(array $rows, string $idColumn = 'id'): void
    {
        $rows = Arr::isAssoc($rows) ? [$rows] : $rows;
        if (empty($rows)) return;

        $model = new static();
        $table = $model->getTable();
        [$schema, $tableOnly] = self::parseTable($table);

        $columns = array_keys($rows[0]);

        if (!in_array($idColumn, $columns, true)) {
            throw new \InvalidArgumentException("Column '$idColumn' must be present in the data.");
        }

        $identityMode = self::detectIdentityMode($schema, $tableOnly, $idColumn);

        $sql = self::buildInsertSql($schema, $tableOnly, $columns, $identityMode === 'ALWAYS');

        [$placeholders, $bindings] = self::buildPlaceholdersAndBindings($rows, $columns);

        DB::statement($sql . ' VALUES ' . implode(', ', $placeholders), $bindings);

        DB::statement("
            SELECT setval(
                pg_get_serial_sequence(?, ?),
                COALESCE((SELECT MAX(\"$idColumn\") FROM " . self::fqtn($schema, $tableOnly) . "), 0)
            )
        ", [$schema ? "$schema.$tableOnly" : $tableOnly, $idColumn]);
    }

    public static function deleteWithId(array $ids, string $idColumn = 'id'): void
    {
        if (empty($ids)) return;

        $model = new static();
        $table = $model->getTable();
        [$schema, $tableOnly] = self::parseTable($table);

        $placeholders = implode(', ', array_fill(0, count($ids), '?'));
        $sql = 'DELETE FROM ' . self::fqtn($schema, $tableOnly) . ' WHERE ' . self::qi($idColumn) . ' IN (' . $placeholders . ')';

        DB::statement($sql, $ids);
    }

    /** -------------------- helpers -------------------- */

    private static function parseTable(string $table): array
    {
        if (str_contains($table, '.')) {
            [$schema, $tableOnly] = explode('.', $table, 2);
        } else {
            $schema = 'public';
            $tableOnly = $table;
        }
        return [$schema, $tableOnly];
    }

    private static function fqtn(string $schema, string $table): string
    {
        return '"' . str_replace('"', '""', $schema) . '"."' . str_replace('"', '""', $table) . '"';
    }

    private static function qi(string $ident): string
    {
        return '"' . str_replace('"', '""', $ident) . '"';
    }

    private static function detectIdentityMode(string $schema, string $table, string $column): ?string
    {
        $sql = "
            SELECT identity_generation
            FROM information_schema.columns
            WHERE table_schema = ? AND table_name = ? AND column_name = ?
              AND is_identity = 'YES'
            LIMIT 1
        ";
        $row = DB::selectOne($sql, [$schema, $table, $column]);
        return $row?->identity_generation ?? null; // 'ALWAYS' | 'BY DEFAULT' | null
    }

    private static function buildInsertSql(string $schema, string $table, array $columns, bool $overrideIdentity): string
    {
        $colList = implode(', ', array_map([self::class, 'qi'], $columns));
        $over = $overrideIdentity ? ' OVERRIDING SYSTEM VALUE' : '';
        return 'INSERT INTO ' . self::fqtn($schema, $table) . $over . ' (' . $colList . ')';
    }

    private static function buildPlaceholdersAndBindings(array $rows, array $columns): array
    {
        $placeholders = [];
        $bindings = [];

        foreach ($rows as $row) {
            $marks = [];
            foreach ($columns as $col) {
                $marks[] = '?';
                $bindings[] = $row[$col] ?? null;
            }
            $placeholders[] = '(' . implode(', ', $marks) . ')';
        }

        return [$placeholders, $bindings];
    }
}
