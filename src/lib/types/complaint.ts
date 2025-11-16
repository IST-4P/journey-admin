// Enums matching Prisma schema
export type ComplaintStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type ComplaintMessageType = 'TEXT' | 'IMAGE';

export interface ComplaintMessage {
  id: string;
  complaintId: string;
  senderId: string;
  messageType: ComplaintMessageType;
  content: string; // Text content hoặc image URL
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  title: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintsApiResponse {
  data: {
    complaints: Complaint[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}

export interface ComplaintMessagesApiResponse {
  data: {
    complaintMessages: ComplaintMessage[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}
