import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

// Minimal EnhancedTable to unblock build; supports columns + data
export interface Column<T> {
  accessorKey?: keyof T | string;
  header: React.ReactNode;
  cell?: (info: {
    getValue: () => any;
    row: { original: T };
  }) => React.ReactNode;
}

export interface EnhancedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  pagination?: boolean;
  itemsPerPage?: number;
}

export function EnhancedTable<T extends Record<string, any>>({
  columns,
  data,
}: EnhancedTableProps<T>) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rIdx) => (
            <TableRow key={rIdx}>
              {columns.map((col, cIdx) => {
                const getValue = () => {
                  if (!col.accessorKey) return undefined;
                  const key = col.accessorKey as string;
                  return row[key as keyof T];
                };
                return (
                  <TableCell key={cIdx}>
                    {col.cell
                      ? col.cell({ getValue, row: { original: row } })
                      : String(getValue() ?? "")}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default EnhancedTable;
