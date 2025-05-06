import React, { useState, useMemo, useRef, useEffect } from 'react';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { Grid, Search, Filter, Trash2, Edit, Eye, X } from 'lucide-react';
import gsap from 'gsap';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createEvent } from '../../services/Vendor/eventApi'; // Assume this exists
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

// GSAP ScrollTrigger (optional, included for potential future use)
import ScrollTrigger from 'gsap/ScrollTrigger';
import BackButton from '../../components/Buttons/BackButton';
gsap.registerPlugin(ScrollTrigger);

// Event schema for validation
const eventSchema = z.object({
  Name: z.string().min(1, 'Event name is required'),
  Language: z.string().min(1, 'Language is required'),
  Theme: z.string().min(1, 'Theme is required'),
  Location: z.string().min(1, 'Location is required'),
});

type EventFormData = z.infer<typeof eventSchema>;

// Interface for event data (based on IEvent)
interface Event {
  _id: string;
  Name: string;
  About: string;
  Language: string;
  TheaterId: string;
  Theme: string;
  AdultOnly: boolean;
  EntryFee: number;
  Duration: number;
  Facilities: string[];
  Status: 'Active' | 'Inactive' | 'Upcoming';
  TotalCapacity: string;
  SlotsFilled: number; // Derived field: percentage of capacity filled
  Artists: { name: string; role: string }[];
  Date: string;
  Interests: string;
  Location: string; // Simplified from Coordinates/Type
  Banner: string | null;
}

// Mock data for events
const mockEvents: Event[] = [
  {
    _id: '1',
    Name: 'Moonlight Symphony',
    About: 'A grand orchestral performance under the stars.',
    Language: 'English',
    TheaterId: '1',
    Theme: 'Classical Music',
    AdultOnly: false,
    EntryFee: 50,
    Duration: 120,
    Facilities: ['Parking', 'Food Stalls', 'Restrooms'],
    Status: 'Active',
    TotalCapacity: '500',
    SlotsFilled: 400, // 80% filled
    Artists: [{ name: 'John Doe', role: 'Conductor' }, { name: 'Jane Smith', role: 'Violinist' }],
    Date: '2025-06-15',
    Interests: 'Music, Orchestra',
    Location: 'New York',
    Banner: 'https://via.placeholder.com/1200x400?text=Moonlight+Symphony',
  },
  {
    _id: '2',
    Name: 'Comedy Night',
    About: 'An evening of stand-up comedy with top comedians.',
    Language: 'English',
    TheaterId: '2',
    Theme: 'Comedy',
    AdultOnly: true,
    EntryFee: 30,
    Duration: 90,
    Facilities: ['Bar', 'Restrooms'],
    Status: 'Upcoming',
    TotalCapacity: '200',
    SlotsFilled: 100, // 50% filled
    Artists: [{ name: 'Mike Lee', role: 'Comedian' }],
    Date: '2025-07-10',
    Interests: 'Comedy, Entertainment',
    Location: 'Los Angeles',
    Banner: 'https://via.placeholder.com/1200x400?text=Comedy+Night',
  },
  {
    _id: '3',
    Name: 'Jazz Festival',
    About: 'A vibrant jazz festival featuring local and international artists.',
    Language: 'English',
    TheaterId: '3',
    Theme: 'Jazz Music',
    AdultOnly: false,
    EntryFee: 40,
    Duration: 180,
    Facilities: ['Parking', 'Food Trucks', 'Seating'],
    Status: 'Active',
    TotalCapacity: '1000',
    SlotsFilled: 900, // 90% filled
    Artists: [{ name: 'Ella Brown', role: 'Singer' }, { name: 'Tom Jazz', role: 'Saxophonist' }],
    Date: '2025-08-05',
    Interests: 'Music, Jazz',
    Location: 'Chicago',
    Banner: 'https://via.placeholder.com/1200x400?text=Jazz+Festival',
  },
  {
    _id: '4',
    Name: 'Drama Play',
    About: 'A captivating theater play exploring human emotions.',
    Language: 'English',
    TheaterId: '4',
    Theme: 'Drama',
    AdultOnly: true,
    EntryFee: 60,
    Duration: 150,
    Facilities: ['Restrooms', 'Seating'],
    Status: 'Inactive',
    TotalCapacity: '300',
    SlotsFilled: 0, // 0% filled
    Artists: [{ name: 'Sarah Davis', role: 'Actor' }, { name: 'Mark Wilson', role: 'Director' }],
    Date: '2025-09-20',
    Interests: 'Theater, Drama',
    Location: 'Miami',
    Banner: null,
  },
];

const EventsManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filters, setFilters] = useState({ search: '', status: '', language: '', theme: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  // Mutation for creating an event (mocked API call)
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => toast.success('Event created successfully!'),
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to create event'),
  });

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setCurrentPage(1);
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = event.Name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status ? event.Status === filters.status : true;
      const matchesLanguage = filters.language
        ? event.Language.toLowerCase().includes(filters.language.toLowerCase())
        : true;
      const matchesTheme = filters.theme
        ? event.Theme.toLowerCase().includes(filters.theme.toLowerCase())
        : true;
      return matchesSearch && matchesStatus && matchesLanguage && matchesTheme;
    });
  }, [events, filters]);

  // Paginate events
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  // Handle create or update event (mocked)
  const handleCreateOrUpdateEvent = (data: EventFormData) => {
    // For simplicity, assume this is a create operation
    const newEvent: Event = {
      _id: String(events.length + 1),
      ...data,
      About: 'New event description',
      TheaterId: '1',
      AdultOnly: false,
      EntryFee: 0,
      Duration: 120,
      Facilities: [],
      Status: 'Upcoming',
      TotalCapacity: '100',
      SlotsFilled: 0,
      Artists: [],
      Date: new Date().toISOString().split('T')[0],
      Interests: 'General',
      Location: data.Location,
      Banner: null,
    };
    setEvents([...events, newEvent]);
    createEventMutation.mutate(data);
    toast.success('Event created successfully!');
  };

  // Handle delete event
  const handleDelete = (id: string) => {
    setEvents(events.filter((e) => e._id !== id));
    toast.success('Event deleted successfully!');
  };

  // Handle edit event
  const handleEdit = (event: Event) => {
    navigate(`/vendor/edit-event/${event._id}`);
  };

  // Handle view event (open modal)
  const handleView = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  // GSAP animations for modal
  useEffect(() => {
    if (!modalRef.current) return;

    if (isModalOpen) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(
        modalRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.2 }
      );
    }
  }, [isModalOpen]);

  return (
    <div className="p-6 bg-[#1E1E2D] min-h-screen">
      <BackButton/>
      <ToastContainer theme="dark" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Events Management</h1>
        <Button
          variant="primary"
          icon={<Grid size={16} />}
          onClick={() => navigate('/vendor/create-event')}
        >
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-6 bg-[#18181f] border border-[#333333]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center">
            <Filter className="mr-2 text-[#0066F5]" size={20} />
            Filters
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-400">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
                placeholder="Search by event name"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
            >
              <option value="">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">Language</label>
            <input
              type="text"
              name="language"
              value={filters.language}
              onChange={handleFilterChange}
              className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
              placeholder="Enter language"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-400">Theme</label>
            <input
              type="text"
              name="theme"
              value={filters.theme}
              onChange={handleFilterChange}
              className="w-full mt-1 pl-4 pr-4 py-2 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
              placeholder="Enter theme"
            />
          </div>
        </div>
      </Card>

      {/* Events Table */}
      <Card className="p-6 bg-[#18181f] border border-[#333333]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-white">
            <thead>
              <tr className="border-b border-[#333333]">
                <th className="py-3 px-4 text-sm font-medium text-gray-400">No.</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Event Name</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Date</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Language</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Theme</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Slots Filled</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEvents.map((event, index) => (
                <tr key={event._id} className="border-b border-[#333333] hover:bg-[#121218]">
                  <td className="py-3 px-4 text-sm">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="py-3 px-4 text-sm">{event.Name}</td>
                  <td className="py-3 px-4 text-sm">{event.Date}</td>
                  <td className="py-3 px-4 text-sm">{event.Language}</td>
                  <td className="py-3 px-4 text-sm">{event.Theme}</td>
                  <td className="py-3 px-4 text-sm">
                    {((event.SlotsFilled / parseInt(event.TotalCapacity)) * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        event.Status === 'Active'
                          ? 'bg-green-500/20 text-green-400'
                          : event.Status === 'Upcoming'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {event.Status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm flex space-x-2">
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-400 hover:text-blue-300"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleView(event)}
                      className="text-gray-400 hover:text-gray-300"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedEvents.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-400">
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Show</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="pl-2 pr-2 py-1 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-400">of {filteredEvents.length} entries</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  currentPage === page
                    ? 'bg-[#0066F5] text-white'
                    : 'bg-[#121218] border border-[#333333] text-white'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* View Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-[#18181f] border border-[#333333] rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto text-white relative"
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-300"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedEvent.Name}</h2>
            {selectedEvent.Banner && (
              <img
                src={selectedEvent.Banner}
                alt={selectedEvent.Name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">About</p>
                <p className="text-white">{selectedEvent.About}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Language</p>
                <p className="text-white">{selectedEvent.Language}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Theme</p>
                <p className="text-white">{selectedEvent.Theme}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white">{selectedEvent.Location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="text-white">{selectedEvent.Date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="text-white">{selectedEvent.Duration} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Entry Fee</p>
                <p className="text-white">${selectedEvent.EntryFee}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Adult Only</p>
                <p className="text-white">{selectedEvent.AdultOnly ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Capacity</p>
                <p className="text-white">{selectedEvent.TotalCapacity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Slots Filled</p>
                <p className="text-white">
                  {((selectedEvent.SlotsFilled / parseInt(selectedEvent.TotalCapacity)) * 100).toFixed(
                    0
                  )}
                  %
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p
                  className={`${
                    selectedEvent.Status === 'Active'
                      ? 'text-green-400'
                      : selectedEvent.Status === 'Upcoming'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}
                >
                  {selectedEvent.Status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Interests</p>
                <p className="text-white">{selectedEvent.Interests}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Artists</p>
                <p className="text-white">
                  {selectedEvent.Artists.map((artist) => `${artist.name} (${artist.role})`).join(
                    ', '
                  ) || 'None'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-400">Facilities</p>
                <p className="text-white">{selectedEvent.Facilities.join(', ') || 'None'}</p>
              </div>
            </div>
            <Button
              variant="primary"
              className="mt-6 w-full"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsManagement;