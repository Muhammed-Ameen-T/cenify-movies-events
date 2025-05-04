import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ToastContainer, toast } from 'react-toastify';
import { Theater, Grid } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createTheater } from '../../services/Vendor/api';

const theaterSchema = z.object({
  name: z.string().min(1, 'Theater name is required'),
  location: z.string().min(1, 'Location is required'),
  rows: z.number().min(1, 'At least 1 row required'),
  seatsPerRow: z.number().min(1, 'At least 1 seat per row required'),
});

type TheaterFormData = z.infer<typeof theaterSchema>;

const TheaterManagement: React.FC = () => {
  const [seatLayout, setSeatLayout] = useState<string[][]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TheaterFormData>({
    resolver: zodResolver(theaterSchema),
  });

  const rows = watch('rows') || 0;
  const seatsPerRow = watch('seatsPerRow') || 0;

  // Generate seat layout preview
  useEffect(() => {
    const layout = Array.from({ length: rows }, () =>
      Array.from({ length: seatsPerRow }, () => 'available')
    );
    setSeatLayout(layout);
  }, [rows, seatsPerRow]);

  const createTheaterMutation = useMutation({
    mutationFn: createTheater,
    onSuccess: () => toast.success('Theater created successfully!'),
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to create theater'),
  });

  const onSubmit = (data: TheaterFormData) => {
    createTheaterMutation.mutate({ ...data, seatLayout });
  };

  return (
    <Card className="p-6 bg-[#18181f] border border-[#333333]">
      <ToastContainer />
      <h3 className="text-2xl font-bold text-white mb-6">Create Theater</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-400">
            Theater Name
          </label>
          <div className="relative">
            <Theater className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              {...register('name')}
              id="name"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
              placeholder="Enter theater name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium text-gray-400">
            Location
          </label>
          <input
            {...register('location')}
            id="location"
            className="w-full pl-4 pr-4 py-3 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
            placeholder="Enter location"
          />
          {errors.location && <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="rows" className="text-sm font-medium text-gray-400">
            Rows
          </label>
          <input
            {...register('rows', { valueAsNumber: true })}
            id="rows"
            type="number"
            className="w-full pl-4 pr-4 py-3 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
            placeholder="Number of rows"
          />
          {errors.rows && <p className="mt-1 text-sm text-red-400">{errors.rows.message}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="seatsPerRow" className="text-sm font-medium text-gray-400">
            Seats per Row
          </label>
          <input
            {...register('seatsPerRow', { valueAsNumber: true })}
            id="seatsPerRow"
            type="number"
            className="w-full pl-4 pr-4 py-3 rounded-lg bg-[#121218] border border-[#333333] text-white text-sm placeholder-gray-400 focus:ring-1 focus:ring-[#0066F5] focus:border-[#0066F5]"
            placeholder="Seats per row"
          />
          {errors.seatsPerRow && <p className="mt-1 text-sm text-red-400">{errors.seatsPerRow.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center">
            <Grid className="mr-2" size={18} />
            Seat Layout Preview
          </label>
          <div className="grid gap-2 bg-[#121218] p-4 rounded-lg">
            {seatLayout.map((row, rowIndex) => (
              <div key={rowIndex} className="flex space-x-2">
                {row.map((seat, seatIndex) => (
                  <div
                    key={seatIndex}
                    className="w-8 h-8 bg-[#333333] rounded flex items-center justify-center text-white text-xs font-medium"
                  >
                    {String.fromCharCode(65 + rowIndex)}{seatIndex + 1}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          isLoading={createTheaterMutation.isPending}
        >
          Create Theater
        </Button>
      </form>
    </Card>
  );
};

export default TheaterManagement;