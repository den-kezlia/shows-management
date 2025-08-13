export interface Performance {
  _id?: string;
  name: string;
  description: string;
  photo?: string;
  date: Date;
  venue?: string;
  price?: number;
  showId?: string; // reference to Show (optional)
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Show {
  _id?: string;
  name: string;
  description: string;
  // Initially a show can optionally select an existing performance to attach
  initialPerformanceId?: string;
  performanceIds?: string[]; // full set of associated performances (optional, derived from Performance.showId)
  mainImage?: string; // primary image URL
  galleryImages?: string[]; // additional image URLs
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Ticket {
  _id?: string;
  performanceId: string;
  placeRow: string | number;
  placeNumber: string | number;
  customerPhoneNumber: string;
  customerName: string;
  referenceName?: string;
  qrCode?: string;
  status: 'paid' | 'approved' | 'pending';
  isVisited: boolean;
  visitedAt?: Date;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Admin {
  _id?: string;
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TicketValidation {
  ticket: Ticket;
  performance: Performance;
  isValid: boolean;
  alreadyVisited: boolean;
}
