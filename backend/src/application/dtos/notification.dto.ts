export interface CreateNotificationDTO {
  userId: string | null;
  title: string;
  type: 'booking' | 'reminder' | 'alert' | 'general' | 'pass';
  description: string;
  bookingId?: string | null;
  isGlobal?: boolean;
}
export interface UpdateNotificationDTO {
  id: string;
  title?: string;
  type?: 'booking' | 'reminder' | 'alert' | 'general' | 'pass';
  description?: string;
  isRead?: boolean;
  readedUsers?: string[];
}
export interface MarkNotificationReadDTO {
  id: string;
  userId: string;
}
