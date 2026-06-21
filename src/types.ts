export interface AgentReview {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  skills: string[];
  experienceLevel: "Intermediate" | "Senior" | "Executive Expert";
  rating: number;
  reviewsCount: number;
  reviews: AgentReview[];
  currentLoad: number;
  maxCapacity: number;
  isAvailable: boolean;
  timeSlots: string[]; // e.g. ["09:00 AM", "11:00 AM", "02:00 PM"]
  specialties: string[];
}

export interface ServiceTier {
  name: string;
  price: string;
  period: string; // e.g., "per hour", "monthly retainer"
  features: string[];
}

export interface ServiceOffering {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  skillsRequired: string[];
  pricingTiers: ServiceTier[];
  assignedAgentId: string;
}

export interface ClientRequestLog {
  id: string;
  timestamp: string;
  queryText: string;
  queryType: "text" | "voice";
  matchedServiceId: string;
  matchedAgentId: string;
  confidenceScore: number;
  skillsExtracted: string[];
  agentLoadAfterMatch: string;
  directLinkToken: string;
}

export interface Booking {
  id: string;
  agentId: string;
  serviceId: string;
  serviceName: string;
  agentName: string;
  clientName: string;
  clientEmail: string;
  dateTime: string; // Date-time string
  notes: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface Message {
  id: string;
  sender: "client" | "agent";
  content: string;
  timestamp: string;
  file?: {
    name: string;
    size: string;
    url: string;
  };
}

export interface ChatSession {
  token: string;
  agentId: string;
  messages: Message[];
  created: string;
}

export interface PlatformStats {
  totalRequests: number;
  matchSuccessRate: number; // percentage
  avgRating: number;
  agentUtilisation: number; // percentage
  activeAgentsCount: number;
  totalServicesCount: number;
}
