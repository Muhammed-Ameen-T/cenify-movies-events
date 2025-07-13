import { z } from 'zod';
import { IMovie } from './movie';
import { ITheater } from './theater';
import { Screen } from './screen';


export const showFormSchema = z.object({
  theaterId: z.string().min(1, 'Theater is required'),
  screenId: z.string().min(1, 'Screen is required'),
  movieId: z.string().min(1, 'Movie is required'),
  date: z.string().refine(
    (val) => {
      const selectedDate = new Date(val);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    { message: 'Date cannot be in the past' }
  ),
  showTimes: z
    .array(
      z.object({
        startTime: z.string().min(1, 'Start time is required'),
        endTime: z.string().min(1, 'End time is required'),
      })
    )
    .min(1, 'At least one show time is required'),
});

export type ShowFormData = z.infer<typeof showFormSchema>;


export interface Show {
  id: Key | null | undefined;
  _id: string;
  movieId: string;
  theaterId: string;
  screenId: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'Running' | 'Completed' | 'Cancelled';
  bookedSeats: Array<{
    date: string;
    isPending: boolean;
    seatNumber: string;
    seatPrice: number;
    type: 'VIP' | 'Regular' | 'Premium';
    position: { row: number; col: number };
    userId: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ShowTime {
  startTime: string; 
  endTime: string; 
}