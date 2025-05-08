import { LogOut } from 'react-feather';
import { useDispatch } from 'react-redux';
import { clearAuth } from '../../store/slices/authSlice';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/apiEndPoint';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch();
  const userData = localStorage.getItem('user');
  const accountType = userData ? JSON.parse(userData).role : null;

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Dispatch Redux action to reset authentication state
      navigate(`/admin/login`)
      dispatch(clearAuth());

      console.log("User successfully logged out!");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className="flex p-1 bg-yellow-400 text-dark rounded cursor-pointer hover:bg-gray-700 transition"
      onClick={handleLogout}
    >
      <LogOut size={14} />
      <span className="ml-1 text-xs">Logout</span>
    </div>

  );
};

export default LogoutButton;
