import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const BackButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-white hover:text-gray-300 transition-colors mb-7"
    >
      <ChevronLeft size={20} className="mr-1" />
      <span className="text-sm font-medium">Back</span>
    </button>
  );
};


export default BackButton;