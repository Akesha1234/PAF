export interface Resource {
    id: string; // was number
    name: string;
    type: string;
    capacity: number | null;
    status: string;
    location: string;
    description?: string;
    availabilityWindows?: string;
}

export interface BookingRequest {
    resourceId: string; // was number before
    date: string;       // YYYY-MM-DD
    startTime: string;  // HH:mm
    endTime: string;    // HH:mm
    purpose: string;
    expectedAttendees?: number;
}

export interface BookingResponse {
    id: string;
    resourceId: string;
    resourceName: string;
    resourceLocation: string;
    userId: string;
    userName: string;
    userEmail: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    purpose: string;
    expectedAttendees?: number;
    adminNotes?: string;
    rejectionReason?: string;
    reviewedById?: string;
    reviewedByName?: string;
    reviewedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    qrCode?: string;
}

export interface TicketRequest {
    title: string;
    description: string;
    resourceId?: string;
    priority: string;
    category: string;
}

export interface CommentResponse {
    id: string;
    ticketId: string;
    authorId: string;
    authorName: string;
    authorPictureUrl?: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface TicketResponse {
    id: string;
    resourceId?: string;
    resourceName?: string;
    reporterId: string;
    reporterName: string;
    reporterEmail?: string;
    assigneeId?: string;
    assigneeName?: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    location?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    resolutionNotes?: string;
    rejectionReason?: string;
    attachmentUrls?: string[];
    resolvedAt?: string;
    firstResponseAt?: string;
    createdAt?: string;
    updatedAt?: string;
    commentsCount: number;
}
