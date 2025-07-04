import React from 'react';
import { motion } from 'framer-motion';
import { TableProps } from '../../../types/adminTable/table';
import TableShimmer from './TableShimmer';
import TableEmptyState from './TableEmptyState';

const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  error = null,
  actions = [],
  emptyState,
  className = '',
  rowClassName = '',
  onRowClick,
  shimmerRows = 5
}: TableProps<T>) => {
  const getRowClassName = (row: T, index: number): string => {
    const baseClass = 'border-b border-gray-700 hover:bg-gray-700/30 transition-colors';
    const clickable = onRowClick ? 'cursor-pointer' : '';
    const customClass = typeof rowClassName === 'function' 
      ? rowClassName(row, index) 
      : rowClassName;
    
    return `${baseClass} ${clickable} ${customClass}`.trim();
  };

  const getCellValue = (row: T, column: any): any => {
    const keys = column.key.split('.');
    return keys.reduce((obj, key) => obj?.[key], row);
  };  

  const totalColumns = columns.length + (actions.length > 0 ? 1 : 0);

  return (
    <div className={`bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50 text-left">
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className={`p-4 text-gray-400 font-medium ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="p-4 text-gray-400 font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableShimmer columns={columns} rows={shimmerRows} />
            ) : error ? (
              <tr>
                <td colSpan={totalColumns} className="p-4 text-center text-red-400">
                  Error loading data: {error}
                </td>
              </tr>
            ) : data.length === 0 ? (
              emptyState ? (
                <TableEmptyState
                  icon={emptyState.icon}
                  title={emptyState.title}
                  description={emptyState.description}
                  action={emptyState.action}
                  colSpan={totalColumns}
                />
              ) : (
                <tr>
                  <td colSpan={totalColumns} className="p-8 text-center text-gray-400">
                    No data available
                  </td>
                </tr>
              )
            ) : (
              data.map((row, index) => (
                <motion.tr
                  key={index}
                  className={getRowClassName(row, index)}
                  onClick={() => onRowClick?.(row)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {columns.map((column) => (
                    <td 
                      key={column.key} 
                      className={`p-4 ${column.className || ''}`}
                    >
                      {column.render 
                        ? column.render(getCellValue(row, column), row, index)
                        : getCellValue(row, column)
                      }
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="p-4">
                      <div className="flex space-x-2">
                        {actions
                          .filter(action => !action.condition || action.condition(row))
                          .map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              className={`px-3 flex py-1 text-xs rounded-md transition-colors ${
                                action.className || 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {action.icon && <span className="mr-1">{action.icon}</span>}
                              {action.label}
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;