// Enums matching Prisma schema
export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
export type ComplaintMessageType = "TEXT" | "IMAGE";

export interface ComplaintMessage {
  id: string;
  complaintId: string;
  senderId: string;
  messageType: ComplaintMessageType;
  content: string; // Text content hoặc image URL
  createdAt: string;
}

export interface Complaint {
  complaintId: string;
  userId: string;
  title: string;
  status: ComplaintStatus;
  fullName?: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt?: string;
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
