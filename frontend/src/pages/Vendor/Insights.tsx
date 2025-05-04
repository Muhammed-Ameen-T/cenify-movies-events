import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Card from '../../components/ui/Card';
import { statistics } from '../utils/mockData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Insights: React.FC = () => {
  const bookingData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Bookings',
        data: [120, 190, 300, 500, 200, 300],
        borderColor: '#0066F5',
        backgroundColor: 'rgba(0, 102, 245, 0.2)',
        fill: true,
      },
    ],
  };

  const engagementData = {
    labels: ['Theater 1', 'Theater 2', 'Theater 3'],
    datasets: [
      {
        label: 'Engagement',
        data: [65, 59, 80],
        backgroundColor: '#f5005f',
      },
    ],
  };

  return (
    <Card className="p-6 bg-[#18181f] border border-[#333333]">
      <h3 className="text-2xl font-bold text-white mb-6">Insights Dashboard</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Booking Trends</h4>
          <div className="h-80">
            <Line
              data={bookingData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { color: '#999999' } }, x: { ticks: { color: '#999999' } } },
                plugins: { legend: { labels: { color: '#ffffff' } } },
              }}
            />
          </div>
        </div>
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Engagement by Theater</h4>
          <div className="h-80">
            <Bar
              data={engagementData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true, ticks: { color: '#999999' } }, x: { ticks: { color: '#999999' } } },
                plugins: { legend: { labels: { color: '#ffffff' } } },
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Insights;