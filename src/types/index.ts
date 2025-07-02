export interface Performance {
  _id?: string;
  name: string;
  description: string;
  photo?: string;
  date: Date;
  venue?: string;
  price?: number;
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
  referenceName: string;
  qrCode?: string;
  isVisited: boolean;
  visitedAt?: Date;
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
