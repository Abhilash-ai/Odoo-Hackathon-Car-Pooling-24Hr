export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMINISTRATOR' | 'EMPLOYEE';
  gender: 'FEMALE' | 'MALE' | 'OTHER';
  department?: string;
  workLocation?: string;
  organizationId: string;
  organizationName: string;
  walletBalance: number; // ₹ INR
  avatarUrl?: string;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  color: string;
  plateNumber: string;
  totalSeats: number;
  fuelType: 'Petrol' | 'Diesel' | 'CNG' | 'EV';
  mileageKmL: number; // km/L or km/kWh
  isDefault: boolean;
}

export interface MatchBreakdown {
  score: number;
  originProximityKm: number;
  destProximityKm: number;
  reasons: string[];
}

export interface Ride {
  id: string;
  organizationId: string;
  driverId: string;
  vehicleId: string;
  originName: string;
  originLat: number;
  originLng: number;
  destName: string;
  destLat: number;
  destLng: number;
  departureTime: string;
  availableSeats: number;
  totalSeats: number;
  pricePerSeat: number; // ₹ INR
  estimatedFuelCost: number; // ₹ INR
  isWomenOnly: boolean;
  routePolyline?: string;
  distanceKm: number;
  durationMins: number;
  isRecurring: boolean;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driver: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    department?: string;
    gender?: string;
  };
  vehicle: Vehicle;
  matchScore?: number;
  matchBreakdown?: MatchBreakdown;
}

export interface Booking {
  id: string;
  rideId: string;
  passengerId: string;
  seatsBooked: number;
  totalFare: number; // ₹ INR
  pickupName: string;
  dropName: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  ride: Ride;
  trip?: Trip;
}

export interface Trip {
  id: string;
  organizationId: string;
  rideId: string;
  bookingId: string;
  driverId: string;
  passengerId: string;
  status: 'BOOKED' | 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAYMENT_PENDING' | 'PAYMENT_COMPLETED';
  currentLat?: number;
  currentLng?: number;
  startedAt?: string;
  completedAt?: string;
  distanceKm: number;
  fareAmount: number; // ₹ INR
  paymentStatus: 'UNPAID' | 'PAID';
  paymentMethod?: string;
  driver: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    department?: string;
    gender?: string;
    phone?: string;
  };
  passenger: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    department?: string;
    gender?: string;
    phone?: string;
  };
  ride: Ride;
  booking: Booking;
  transaction?: Transaction;
}

export interface Transaction {
  id: string;
  walletId: string;
  tripId?: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number; // ₹ INR
  paymentMethod: string;
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // ₹ INR
  transactions: Transaction[];
}

export interface SavedPlace {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  tripId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}
