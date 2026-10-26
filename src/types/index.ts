export type UserRole = 'super_admin' | 'sales_manager' | 'sales_agent' | 'technical_support';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  phone?: string;
  department: string;
  joinedDate: string;
  readinessScore: number; // 0 - 100
  learningXp: number;
  streakDays: number;
  completedLessons: string[]; // lesson ids
  completedQuizzes: { quizId: string; score: number; passed: boolean; date: string }[];
  badges: string[];
  assignedTargetRevenueINR: number;
  leadsWon: number;
  revenueGenerated: number;
}

export interface ServicePackage {
  id: string;
  name: string; // e.g., "Starter", "Professional", "Enterprise"
  priceINR: number;
  pricingUnit: 'one-time' | 'monthly' | 'per-project' | 'custom';
  deliveryTimeline: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'archived';
  inclusions: string[];
  exclusions: string[];
  recommendedFor: string;
  paymentMilestones: string[];
}

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  category: 'Web Development' | 'Software Solutions' | 'Digital Marketing' | 'Content & Creative' | 'Maintenance';
  shortDescription: string;
  shortDescriptionHinglish?: string;
  shortDescriptionEnglish?: string;
  definition: string;
  definitionHinglish?: string;
  definitionEnglish?: string;
  howItWorks: string;
  howItWorksHinglish?: string;
  howItWorksEnglish?: string;
  commonProblemsSolved: string[];
  businessBenefits: string[];
  targetIndustries: string[];
  packages: ServicePackage[];
  optionalAddons: { name: string; priceINR: number; description: string }[];
  discoveryQuestions: string[];
  commonObjections: { objection: string; quickResponse: string; detailedResponse: string; doNotPromise: string }[];
  technicalLimitations: string[];
  approvalRequirements: string[];
  faqs: { question: string; answer: string; language?: string }[];
  pitchScript: {
    hinglish: string;
    english: string;
    discoveryQuestion: string;
    closingHook: string;
  };
  demoUrl?: string;
  portfolioExamples: string[];
  lastReviewedDate: string;
  contentOwner: string;
  approvalStatus: 'approved' | 'review_required';
  version: string;
}

export interface Lesson {
  id: string;
  dayNumber: number;
  title: string;
  serviceCategory?: string;
  learningObjective: string;
  durationMinutes: number;
  summary: string;
  fullContent: string;
  businessCaseExample: {
    client: string;
    industry: string;
    problem: string;
    recommendedSolution: string;
    outcome: string;
  };
  pitchScript: {
    hinglish: string;
    english: string;
    hook: string;
  };
  flashcards: { front: string; back: string }[];
  quizQuestions: QuizQuestion[];
  practicalRoleplayPrompt: string;
  assignment: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lessons: Lesson[];
  prerequisites?: string[];
}

export interface QuizQuestion {
  id: string;
  type: 'single' | 'multiple' | 'true_false' | 'scenario';
  question: string;
  options: string[];
  correctAnswer: number | number[]; // index
  explanation: string;
  category: 'product_knowledge' | 'pricing' | 'objection' | 'compliance' | 'sales_discipline';
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  courseDay: number;
  score: number;
  totalQuestions: number;
  passed: boolean;
  timestamp: string;
  userAnswers: { [questionId: string]: any };
}

export interface ObjectionItem {
  id: string;
  objection: string;
  category: 'Price & Budget' | 'Competitor & Trust' | 'Need & Timing' | 'Technical & Guarantee' | 'Authority & Stall';
  whyCustomerAsks: string;
  shortAgentResponse: string;
  hinglishResponse: string;
  professionalResponse: string;
  discoveryQuestion: string;
  whatNotToPromise: string;
  suggestedNextAction: string;
  escalationConditions: string;
}

export interface MockCallScenario {
  id: string;
  title: string;
  industry: string;
  clientName: string;
  clientRole: string;
  businessType: string;
  personality: 'Price-sensitive' | 'Skeptical' | 'Busy' | 'Confused' | 'Technical' | 'Friendly' | 'Interested but hesitant' | 'Angry';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  primaryInterest: string;
  backstory: string;
  openingPrompt: string;
  secretNeeds: string[];
  dealBreakers: string[];
}

export interface MockCallEvaluation {
  openingScore: number; // /10
  productKnowledgeScore: number; // /25
  requirementDiscoveryScore: number; // /20
  pricingAccuracyScore: number; // /20
  objectionHandlingScore: number; // /15
  closingScore: number; // /10
  totalScore: number; // /100
  passed: boolean;
  strengths: string[];
  mistakes: string[];
  missedQuestions: string[];
  incorrectPromises: string[];
  suggestedResponses: string[];
  recommendedModules: string[];
  summaryFeedback: string;
}

export interface MockCallMessage {
  id: string;
  sender: 'ai_customer' | 'agent' | 'system';
  text: string;
  timestamp: string;
}

export interface Lead {
  id: string;
  agentId: string;
  agentName: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  website?: string;
  fullAddress?: string;
  area?: string;
  city: string;
  state?: string;
  zipcode?: string;
  industry: string;
  category?: string;
  serviceInterest: string;
  rating?: string;
  reviews?: string;
  latitude?: string;
  longitude?: string;
  googleMapsUrl?: string;
  searchKeyword?: string;
  searchLatitude?: string;
  searchLongitude?: string;
  scrapedDate?: string;
  estimatedBudgetINR: number;
  quotationINR?: number | null;
  status: 'new' | 'contacted' | 'interested' | 'qualified' | 'demo_scheduled' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  wonAt?: string;
  leadSource: 'Cold Call' | 'Inbound' | 'Referral' | 'Google Maps' | 'Instagram / Ads';
  lastContactDate: string;
  nextFollowUpDate: string;
  callbackTimeSlot?: string;
  followUpStatus?: 'pending' | 'completed' | 'rescheduled';
  notes: string;
  isHighPriority?: boolean;
  customerRequirement?: 'share_details' | 'callback' | 'demo_requested' | 'rate_negotiation' | 'ready_to_close' | 'quotation_needed';
  supportStatus?: 'pending_support' | 'details_shared' | 'demo_sent' | 'negotiation_approved' | 'in_progress' | 'completed';
  supportNotes?: string;
  assignedSupportName?: string;
}

export interface LeadDistributionHistory {
  id: string;
  fileName: string;
  importedCount: number;
  skippedCount: number;
  duplicateCount: number;
  perAgent: { agentId: string; agentName: string; assignedCount: number }[];
  distributedById: string;
  distributedByName: string;
  distributedAt: string;
}

export interface QuotationLineItem {
  id: string;
  moduleName: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl?: string;
  tagline?: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  gstin?: string;
  pan?: string;
  bankDetails?: {
    bankName: string;
    accountNo: string;
    ifsc: string;
    upiId: string;
  };
}

export interface Proposal {
  id: string;
  proposalNumber: string;
  leadId: string;
  agentId: string;
  agentName: string;
  clientName: string;
  clientCompany: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientCity?: string;
  companyProfileId?: string;
  companyProfile?: CompanyProfile;
  serviceCategory: string;
  scopeOfWork: string[];
  deliverables: string[];
  timeline: string;
  items?: QuotationLineItem[];
  subtotalINR: number;
  discountPercentage: number;
  gstRate?: number;
  gstAmount?: number;
  totalINR: number;
  paymentMilestones: string[];
  termsAndConditions: string[];
  closingNote?: string;
  preparedBy?: string;
  approvalStatus: 'draft' | 'pending_support_dispatch' | 'pending_manager_approval' | 'approved' | 'sent_to_client' | 'rejected' | 'sent' | 'accepted' | 'declined';
  managerComments?: string;
  supportNotes?: string;
  dispatchedAt?: string;
  dispatchedBy?: string;
  createdAt: string;
  validUntil: string;
}

export interface EscalationTicket {
  id: string;
  ticketNumber: string;
  agentId: string;
  agentName: string;
  clientOrLeadName: string;
  serviceCategory: string;
  type: 'custom_pricing' | 'technical_feasibility' | 'timeline_approval' | 'crm_erp_integration' | 'discount_request';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  question: string;
  status: 'open' | 'assigned' | 'in_review' | 'resolved' | 'closed';
  assignedTo?: string;
  assignedToName?: string;
  slaTargetHours: number;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  internalNotes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'Product Update' | 'Pricing Update' | 'Training Notice' | 'Team Win' | 'Important Rule' | 'Technical Notice';
  author: string;
  date: string;
  priority: 'normal' | 'high';
  readBy: string[];
}

export type TaskDepartment = 'Digital' | 'Developer';
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface DepartmentTask {
  id: string;
  title: string;
  description: string;
  department: TaskDepartment;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId?: string;
  assignedToName?: string;
  dueDate?: string;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Academy' | 'Mock Call' | 'Sales' | 'Discipline';
}
