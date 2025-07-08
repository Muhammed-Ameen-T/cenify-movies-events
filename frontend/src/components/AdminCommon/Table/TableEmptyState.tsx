import React from 'react';

interface TableEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  colSpan: number;
}

const TableEmptyState: React.FC<TableEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  colSpan
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          {icon && <div className="text-gray-400 text-5xl mb-4">{icon}</div>}
          <h3 className="text-white text-xl font-bold mb-2">{title}</h3>
          <p className="text-gray-400 mb-6">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TableEmptyState;