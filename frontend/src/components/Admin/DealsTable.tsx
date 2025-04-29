import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, ChevronRight } from 'lucide-react';

// Define TypeScript interface for deal data
interface Deal {
  id: number;
  theater: string;
  movie: string;
  amount: number;
  tickets: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

// Mock data for recent deals
const recentDeals: Deal[] = [
  {
    id: 1,
    theater: 'PVR KOCHI',
    movie: 'Avengers: Endgame',
    amount: 8250,
    tickets: 33,
    date: '14 Oct 2025',
    status: 'Completed',
  },
  {
    id: 2,
    theater: 'INOX Mumbai',
    movie: 'Interstellar',
    amount: 4500,
    tickets: 18,
    date: '13 Oct 2025',
    status: 'Pending',
  },
  {
    id: 3,
    theater: 'Cinepolis Delhi',
    movie: 'The Dark Knight',
    amount: 3750,
    tickets: 15,
    date: '12 Oct 2025',
    status: 'Completed',
  },
  {
    id: 4,
    theater: 'Carnival Chennai',
    movie: 'Inception',
    amount: 5000,
    tickets: 20,
    date: '11 Oct 2025',
    status: 'Cancelled',
  },
  {
    id: 5,
    theater: 'PVR Bengaluru',
    movie: 'Jurassic World',
    amount: 6250,
    tickets: 25,
    date: '10 Oct 2025',
    status: 'Completed',
  },
];

const DealsTable: React.FC = () => {
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusColor = (status: Deal['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-900 bg-opacity-20 text-green-400';
      case 'Pending':
        return 'bg-yellow-900 bg-opacity-20 text-yellow-400';
      case 'Cancelled':
        return 'bg-red-900 bg-opacity-20 text-red-400';
      default:
        return 'bg-gray-900 bg-opacity-20 text-gray-400';
    }
  };

  return (
    <motion.div
      className="bg-gray-800 rounded-xl shadow-lg border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-700">
        <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
        <motion.button
          className="flex items-center text-sm text-blue-400 hover:text-blue-300"
          whileHover={{ x: 5 }}
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </motion.button>
      </div>

      <div className="overflow-x-auto">
        <motion.table
          className="min-w-full divide-y divide-gray-700"
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          aria-label="Recent transactions table"
        >
          <thead className="bg-gray-900/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Theater
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Movie
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Tickets
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {recentDeals.map((deal) => (
              <motion.tr
                key={deal.id}
                className="hover:bg-gray-700"
                variants={rowVariants}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{deal.theater}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{deal.movie}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">${deal.amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{deal.tickets}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{deal.date}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getStatusColor(deal.status)}`}
                  >
                    {deal.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <motion.button
                    className="text-gray-400 hover:text-white"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`More actions for ${deal.theater} transaction`}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>
    </motion.div>
  );
};

export default DealsTable;