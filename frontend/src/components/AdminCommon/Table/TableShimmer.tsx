import React from 'react';
import { TableColumn } from '../../../types/adminTable/table';

interface TableShimmerProps {
  columns: TableColumn[];
  rows?: number;
}

const TableShimmer: React.FC<TableShimmerProps> = ({ columns, rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-gray-700">
          {columns.map((column, colIndex) => (
            <td key={colIndex} className="p-4">
              <div className="h-4 bg-gray-700 rounded animate-pulse" style={{ width: column.width || '100%' }}></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default TableShimmer;