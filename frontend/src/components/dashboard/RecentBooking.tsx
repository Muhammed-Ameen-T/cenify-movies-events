import React from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { bookings } from '../../utils/mockData';

const RecentBookings: React.FC = () => {
  // Get the 5 most recent bookings
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime())
    .slice(0, 5);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Recent Bookings</h3>
        <button className="text-sm text-[#0066F5] hover:text-[#3391f7]">View All</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-400 border-b border-[#333333]">
              <th className="pb-3 font-medium">Customer</th>
              <th className="pb-3 font-medium">Show</th>
              <th className="pb-3 font-medium">Amount</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentBookings.map((booking) => (
              <tr 
                key={booking.id} 
                className="border-b border-[#333333] hover:bg-[#121218] transition-colors"
              >
                <td className="py-3 text-sm text-white font-medium">
                  {booking.userName}
                </td>
                <td className="py-3 text-sm text-gray-300">
                  {booking.showTitle}
                </td>
                <td className="py-3 text-sm text-white font-medium">
                  ${booking.totalAmount}
                </td>
                <td className="py-3">
                  <Badge 
                    label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)} 
                    variant={getStatusVariant(booking.status)}
                    size="sm"
                  />
                </td>
                <td className="py-3 text-sm text-gray-400">
                  {formatDate(booking.bookedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentBookings;