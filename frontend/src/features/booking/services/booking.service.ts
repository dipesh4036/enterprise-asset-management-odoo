import { api } from "@/lib/axios";

export interface BookingItem {
  id: string;
  assetId: string;
  asset: {
    id: string;
    name: string;
    assetTag: string;
    isBookable: boolean;
  };
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  createdAt: string;
}

export interface BookingResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const bookingService = {
  /**
   * Fetch all resource bookings
   */
  async getBookings(): Promise<BookingResponse<BookingItem[]>> {
    const res = await api.get<BookingResponse<BookingItem[]>>("/bookings");
    return res.data;
  },

  /**
   * Create a resource booking
   */
  async createBooking(data: {
    assetId: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Promise<BookingResponse<BookingItem>> {
    const res = await api.post<BookingResponse<BookingItem>>("/bookings", data);
    return res.data;
  },

  /**
   * Cancel a resource booking
   */
  async cancelBooking(id: string): Promise<BookingResponse<BookingItem>> {
    const res = await api.patch<BookingResponse<BookingItem>>(`/bookings/${id}/cancel`);
    return res.data;
  },

  /**
   * Reschedule a booking
   */
  async rescheduleBooking(
    id: string,
    data: { startTime: string; endTime: string }
  ): Promise<BookingResponse<BookingItem>> {
    const res = await api.patch<BookingResponse<BookingItem>>(`/bookings/${id}/reschedule`, data);
    return res.data;
  },
};
export default bookingService;
