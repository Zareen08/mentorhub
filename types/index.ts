export type Role = 'USER' | 'MENTOR' | 'ADMIN';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
export type NotificationType = 'BOOKING_CONFIRMED' | 'BOOKING_REMINDER' | 'BOOKING_CANCELLED' | 'REVIEW_RECEIVED' | 'PAYMENT_RECEIVED' | 'SYSTEM';
export type AIType = 'RECOMMENDATION' | 'CHAT' | 'MATCHING' | 'INSIGHT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar: string | null;
  bio: string | null;
  expertise: string[];
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { bookings: number; reviews: number };
}

export interface Mentor {
  id: string;
  userId: string;
  title: string;
  company: string | null;
  experience: number;
  hourlyRate: number;
  skills: string[];
  availability: string[];
  isActive: boolean;
  totalSessions: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'rating' | 'totalReviews' | 'bio' | 'expertise'>;
  averageRating?: number;
  totalReviews?: number;
}

export interface Booking {
  id: string;
  userId: string;
  mentorId: string;
  date: string;
  duration: number;
  status: BookingStatus;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  meetingLink: string | null;
  notes: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  mentor?: Mentor;
  user?: User;
  review?: Review | null;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  mentorId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'avatar'>;
  mentor?: Mentor;
  booking?: Booking;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalMentors: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  conversionRate: number;
}

export interface MentorAnalytics {
  totalSessions: number;
  totalReviews: number;
  totalEarnings: number;
  averageRating: number;
  monthlyTrend: Array<{ month: string; bookings: number; revenue: number }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<{ data?: T[]; pagination?: Pagination }> {
  data: { [key: string]: T[] | Pagination | undefined };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface AIRecommendation {
  mentorId: string;
  score: number;
  reason: string;
}

export interface AIMatch {
  mentorId: string;
  score: number;
  reason: string;
  expectedImprovement: string;
}

export interface AISentiment {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  emotion: string;
  keywords: string[];
}

export interface MentorFilters {
  search?: string;
  skill?: string;
  minRate?: string;
  maxRate?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}
