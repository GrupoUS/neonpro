import * as React from "react";
import { flexRender } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "./table";

// Note: keep props non-generic to avoid unused generic type errors in consumers
export interface EnhancedTableProps {
  table: any; // Table from @tanstack/react-table (kept loose to avoid cross-package type issues)
  loading?: boolean;
  columnsCount?: number;
  ariaLabel?: string;
  emptyMessage?: string;
  className?: string;
  // Optional UI slots
  renderToolbar?: React.ReactNode;
  renderPagination?: React.ReactNode;
  // Optional behavior for clickable rows
  onRowClick?: (row: any) => void;
  stopRowClickPredicate?: (cell: any) => boolean;
}

/**
 * EnhancedTable
 * - Accessible table wrapper with optional toolbar and pagination slots
 * - Works with TanStack Table instances passed via `table`
 * - Preserves keyboard/screen-reader semantics
 */
export function EnhancedTable(props: EnhancedTableProps) {
  const {
    table,
    loading = false,
    columnsCount,
    ariaLabel,
    emptyMessage = "Nenhum registro encontrado.",
    className,
    renderToolbar,
    renderPagination,
    onRowClick,
    stopRowClickPredicate
  } = props;

  const colSpan = columnsCount ?? table?.getAllLeafColumns?.().length ?? 1;

  return (
    <div
      className={["overflow-hidden rounded-md border", className]
        .filter(Boolean)
        .join(" ")}
    >
      {renderToolbar ? (
        <div className="flex items-center justify-between px-3 pt-3">
          {renderToolbar}
        </div>
      ) : null}

      <Table aria-label={ariaLabel}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
                <TableHead
                  key={header.id}
                  style={{
                    width: header.getSize?.()
                      ? `${header.getSize()}px`
                      : undefined
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center">
                Carregando...
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row: any) => (
              <TableRow
                key={row.id}
                data-state={
                  row.getIsSelected && row.getIsSelected() && "selected"
                }
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {row.getVisibleCells().map((cell: any) => (<TableCell
                    key={cell.id}
                    onClick={(e) => {
                      if (
                        stopRowClickPredicate &&
                        stopRowClickPredicate(cell)
                      ) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={colSpan} className="h-24 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {renderPagination ? (
        <div className="flex items-center justify-between px-3 pb-3">
          {renderPagination}
        </div>
      ) : null}
    </div>
  );
}
