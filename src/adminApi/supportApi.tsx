import adminInstance from "./adminInstance";

export const getAllTickets = () => adminInstance.get('/tickets/all');

export const updateTicketStatus = (ticketId: string, payload: { status: string }) => adminInstance.patch(`/tickets/${ticketId}/status`, payload);

export const sendMessage = (ticketId: string, payload: FormData) => adminInstance.post(`/tickets/${ticketId}/messages`, payload);

export const getMessages = (ticketId: string) => adminInstance.get(`/tickets/${ticketId}/messages`);