export interface Booking {
  _id: string;
  customerName: string;
  destination: string;
  travelDate: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}