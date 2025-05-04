import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { CalendarDays, Clock, DollarSign } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createEvent } from '../../services/Vendor/api';

const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  theaterId: z.string().min(1, 'Theater is required'),
  ticketPrice: z.number().min(0, 'Ticket price must be non-negative'),
});

type EventFormData = z.infer<typeof eventSchema>;

const EventManagement: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => toast.success('Event created successfully!'),
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to create event'),
  });

  const onSubmit = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  return (
    <Card className="p-6 bg-[#18181f] border border-[#333333]">
      <ToastContainer />
      <h3 className="text-2xl font-bold text-white mb-6">Create Event</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-400">
            Event Name
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              {...register('name')}
              id="name"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
              placeholder="Enter event name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium text-gray-400">
            Date
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              {...register('date')}
              id="date"
              type="date"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
            />
            {errors.date && <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="time" className="text-sm font-medium text-gray-400">
            Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              {...register('time')}
              id="time"
              type="time"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
            />
            {errors.time && <p className="mt-1 text-sm text-red-400">{errors.time.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="theaterId" className="text-sm font-medium text-gray-400">
            Theater
          </label>
          <select
            {...register('theaterId')}
            id="theaterId"
            className="w-full pl-4 pr-4 py-3 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
          >
            <option value="" className="text-gray-400">Select a theater</option>
            <option value="theater1" className="text-white">Theater 1</option>
            <option value="theater2" className="text-white">Theater 2</option>
          </select>
          {errors.theaterId && <p className="mt-1 text-sm text-red-400">{errors.theaterId.message}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="ticketPrice" className="text-sm font-medium text-gray-400">
            Ticket Price
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              {...register('ticketPrice', { valueAsNumber: true })}
              id="ticketPrice"
              type="number"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
              placeholder="Enter ticket price"
            />
            {errors.ticketPrice && <p className="mt-1 text-sm text-red-400">{errors.ticketPrice.message}</p>}
          </div>
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={createEventMutation.isPending}
        >
          Create Event
        </Button>
      </form>
    </Card>
  );
};

export default EventManagement; 