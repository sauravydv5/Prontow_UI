import adminInstance from "./adminInstance";

// Get all matches for Opinio
export const getMatches = () => adminInstance.get("/betting/admin/matches");

// Refresh matches from the provider
export const refreshMatches = () =>
  adminInstance.post("/betting/admin/refresh-matches");

// Create a new event
export const createEvent = (data: any) =>
  adminInstance.post("/betting/admin/create-event", data);

// Add a new match manually
export const addMatch = (data: any) =>
  adminInstance.post("/betting/admin/add-matches", data);

// Update match status
export const updateMatchStatus = (data: { matchId: string; makeLive: boolean }) =>
  adminInstance.patch("/betting/admin/update-match-status", data);

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const adminApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

interface CreateEventPayload {
  question: string;
  matchId: string;
  endTime: string;
  yesPrice: number;
  noPrice: number;
}

//  Create a new Opinio event
export const createOpinioEvent = (payload: CreateEventPayload) => {
  return adminInstance.post("/betting/admin/create-event", payload);
};

// interface SettleEventPayload {
//   result: "yes" | "no";
// }

// // Settle an Opinio event
// export const settleEvent = (
//   eventId: string,
//   payload: SettleEventPayload
// ) => {
//   return adminInstance.post(`/admin/settle-event/${eventId}`, payload);
// };

//user opinio records
export const getOpinioRecords = () => {
  return adminInstance.get('/betting/admin/customers');
}

// Get all notifications
export const getNotifications = () => {
  return adminInstance.get("/admin/notifications");
};
