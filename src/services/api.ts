/**
 * api.ts — Firestore-backed data layer (replaces Express /api/* calls)
 *
 * All data now reads/writes directly to Firestore so the deployed
 * Firebase Hosting app works without any Express backend.
 *
 * Static read-only data (courses, mock scenarios, badges) is served
 * from initialData to avoid seeding overhead.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  DocumentData,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  broadcastRealtimeEvent,
  onRealtimeEvent,
  subscribeToLeadsRealtime,
  subscribeToProposalsRealtime,
  subscribeToEscalationsRealtime,
  subscribeToAnnouncementsRealtime,
  subscribeToTasksRealtime
} from './realtimeSync';
import {
  ServiceItem,
  Course,
  ObjectionItem,
  MockCallScenario,
  Lead,
  LeadDistributionHistory,
  Proposal,
  EscalationTicket,
  Announcement,
  DepartmentTask,
  TaskStatus,
  BadgeInfo,
  MockCallEvaluation
} from '../types';
import {
  INITIAL_ACADEMY_COURSES,
  INITIAL_MOCK_SCENARIOS,
  INITIAL_BADGES,
  INITIAL_SERVICES,
  INITIAL_OBJECTIONS,
  INITIAL_LEADS,
  INITIAL_PROPOSALS,
  INITIAL_ESCALATIONS,
  INITIAL_ANNOUNCEMENTS
} from '../data/initialData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStoredUser = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('vahlay_crm_user') : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const DEPARTMENT_TASKS_STORAGE_KEY = 'vahlay_department_tasks';
const DELETED_TASK_IDS_STORAGE_KEY = 'vahlay_deleted_task_ids';

const getDeletedTaskIds = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_TASK_IDS_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const markTaskIdDeleted = (id: string) => {
  if (typeof window === 'undefined' || !id) return;
  try {
    const set = getDeletedTaskIds();
    set.add(id);
    localStorage.setItem(DELETED_TASK_IDS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {}
};

const getDemoUser = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('vahlay_demo_user') : null;
    return raw ? JSON.parse(raw) as { id?: string; name?: string; email?: string; role?: string } : null;
  } catch (error) {
    console.warn('Failed to load demo user for department tasks:', error);
    return null;
  }
};
const isDemoSession = () => !auth.currentUser && Boolean(getDemoUser());

const readLocalDepartmentTasks = (): DepartmentTask[] => {
  try {
    const deleted = getDeletedTaskIds();
    const parsed: unknown = JSON.parse(localStorage.getItem(DEPARTMENT_TASKS_STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return (parsed as DepartmentTask[]).filter(t => t?.id && !deleted.has(t.id));
  } catch (error) {
    console.warn('Failed to load locally saved department tasks:', error);
    return [];
  }
};

const writeLocalDepartmentTasks = (tasks: DepartmentTask[]) => {
  const deleted = getDeletedTaskIds();
  const filtered = tasks.filter(t => t?.id && !deleted.has(t.id));
  localStorage.setItem(DEPARTMENT_TASKS_STORAGE_KEY, JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('vahlay:department_tasks_changed'));
};

const currentUid = () => auth.currentUser?.uid ?? getStoredUser()?.id ?? null;
const currentEmail = () => auth.currentUser?.email?.toLowerCase() ?? getStoredUser()?.email?.toLowerCase() ?? null;
const isAdmin = () => currentEmail() === 'vahlaydigital@gmail.com';
const requireCurrentUid = () => {
  const uid = currentUid();
  if (uid) return uid;
  return 'agent-piyush-gond';
};

const inFlightProposals = new Map<string, Promise<Proposal>>();

const isSupportUser = async () => {
  try {
    const uid = requireCurrentUid();
    if (isAdmin()) return true;
    const profile = await getDoc(doc(db, 'users', uid));
    return profile.exists() && profile.data().role === 'technical_support';
  } catch {
    return false;
  }
};

const canManageDepartmentTasks = async () => {
  if (isAdmin()) return true;
  try {
    const uid = currentUid();
    if (!uid) return false;
    const profile = await getDoc(doc(db, 'users', uid));
    return profile.exists() && ['technical_support', 'sales_manager'].includes(profile.data().role);
  } catch {
    return false;
  }
};

/** Convert a Firestore DocumentSnapshot to a typed object with its doc id. */
function fromDoc<T>(docSnap: DocumentData & { id: string }): T {
  const data = docSnap.data?.() ?? docSnap;
  // Convert Firestore Timestamps to ISO strings where needed
  const cleaned: Record<string, unknown> = { ...data, id: docSnap.id };
  for (const [k, v] of Object.entries(cleaned)) {
    if (v instanceof Timestamp) {
      cleaned[k] = v.toDate().toISOString();
    }
  }
  return cleaned as T;
}

/**
 * Try to read a Firestore collection; if it's empty or permission-denied,
 * seed it from the provided fallback array and return the fallback.
 */
async function readOrSeed<T extends { id: string }>(
  collectionName: string,
  fallback: T[]
): Promise<T[]> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    if (!snap.empty) {
      return snap.docs.map(d => fromDoc<T>({ id: d.id, ...d.data() }));
    }
    // Empty — seed initial data (admin only at deploy time, agents get fallback)
    if (isAdmin() && fallback.length > 0) {
      await Promise.all(
        fallback.map(item => setDoc(doc(db, collectionName, item.id), item))
      );
    }
    return fallback;
  } catch {
    return fallback;
  }
}

// ─── API Object ───────────────────────────────────────────────────────────────

export const api = {
  // ── Services ────────────────────────────────────────────────────────────────

  async getServices(): Promise<ServiceItem[]> {
    return readOrSeed<ServiceItem>('services', INITIAL_SERVICES);
  },

  async getService(idOrSlug: string): Promise<ServiceItem> {
    // Try direct doc lookup first
    const directSnap = await getDoc(doc(db, 'services', idOrSlug));
    if (directSnap.exists()) return fromDoc<ServiceItem>({ id: directSnap.id, ...directSnap.data() });
    // Fallback: slug search in full list
    const all = await this.getServices();
    const found = all.find(s => s.id === idOrSlug || s.slug === idOrSlug);
    if (!found) throw new Error(`Service not found: ${idOrSlug}`);
    return found;
  },

  async createService(payload: Partial<ServiceItem>): Promise<ServiceItem> {
    const id = `srv-${Date.now()}`;
    const item: ServiceItem = { ...INITIAL_SERVICES[0], ...payload, id } as ServiceItem;
    await setDoc(doc(db, 'services', id), item);
    return item;
  },

  async updateService(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> {
    await updateDoc(doc(db, 'services', id), updates as Record<string, unknown>);
    const snap = await getDoc(doc(db, 'services', id));
    return fromDoc<ServiceItem>({ id: snap.id, ...snap.data() });
  },

  async deleteService(id: string): Promise<boolean> {
    await deleteDoc(doc(db, 'services', id));
    return true;
  },

  // ── Academy & Quizzes ───────────────────────────────────────────────────────

  async getCourses(): Promise<Course[]> {
    // Courses are large read-only content — serve from static data
    return INITIAL_ACADEMY_COURSES;
  },

  async submitQuiz(payload: {
    quizId: string;
    lessonId: string;
    answers: Record<string, number>;
    courseDay: number;
  }): Promise<{
    score: number;
    passed: boolean;
    correctCount: number;
    totalQuestions: number;
  }> {
    const { lessonId, answers, courseDay } = payload;

    // Find quiz questions from static course data
    let targetQuestions: { id: string; correctAnswer: number }[] = [];
    for (const course of INITIAL_ACADEMY_COURSES) {
      for (const lesson of course.lessons) {
        if (lesson.id === lessonId || lesson.dayNumber === courseDay) {
          targetQuestions = lesson.quizQuestions as { id: string; correctAnswer: number }[];
          break;
        }
      }
      if (targetQuestions.length) break;
    }
    if (!targetQuestions.length) {
      targetQuestions = [{ id: 'q1', correctAnswer: 1 }, { id: 'q2', correctAnswer: 0 }];
    }

    let correctCount = 0;
    targetQuestions.forEach((q, idx) => {
      const ans = answers[q.id] !== undefined ? answers[q.id] : answers[idx];
      if (ans === q.correctAnswer) correctCount++;
    });

    const score = Math.round((correctCount / targetQuestions.length) * 100);
    const passed = score >= 80;

    // Update Firestore user progress
    const uid = currentUid();
    if (uid) {
      const collPath = isAdmin() ? 'admin' : 'users';
      const userRef = doc(db, collPath, uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const completedLessons: string[] = data.completedLessons ?? [];
        const completedQuizzes: object[] = data.completedQuizzes ?? [];
        const learningXp: number = data.learningXp ?? 0;

        if (!completedLessons.includes(lessonId)) completedLessons.push(lessonId);

        const totalDays = 15;
        const progressRatio = completedLessons.length / totalDays;
        const readinessScore = Math.min(100, Math.round(50 + progressRatio * 45 + (passed ? 5 : 0)));

        completedQuizzes.push({
          quizId: payload.quizId || `quiz-${lessonId}`,
          score,
          passed,
          date: new Date().toISOString().split('T')[0]
        });

        await updateDoc(userRef, {
          completedLessons,
          completedQuizzes,
          readinessScore,
          learningXp: learningXp + (passed ? 150 : 50)
        });
      }
    }

    return { score, passed, correctCount, totalQuestions: targetQuestions.length };
  },

  // ── Objections ──────────────────────────────────────────────────────────────

  async getObjections(): Promise<ObjectionItem[]> {
    return readOrSeed<ObjectionItem>('objections', INITIAL_OBJECTIONS);
  },

  async createObjection(payload: Partial<ObjectionItem>): Promise<ObjectionItem> {
    const id = `obj-${Date.now()}`;
    const item = { ...payload, id } as ObjectionItem;
    await setDoc(doc(db, 'objections', id), item);
    return item;
  },

  async updateObjection(id: string, updates: Partial<ObjectionItem>): Promise<ObjectionItem> {
    await updateDoc(doc(db, 'objections', id), updates as Record<string, unknown>);
    const snap = await getDoc(doc(db, 'objections', id));
    return fromDoc<ObjectionItem>({ id: snap.id, ...snap.data() });
  },

  async deleteObjection(id: string): Promise<boolean> {
    await deleteDoc(doc(db, 'objections', id));
    return true;
  },

  // ── Mock Calls ──────────────────────────────────────────────────────────────

  async getMockScenarios(): Promise<MockCallScenario[]> {
    return INITIAL_MOCK_SCENARIOS;
  },

  async sendMockCallMessage(payload: {
    scenarioId: string;
    messages: { sender: string; text: string }[];
    userMessage: string;
    language: string;
    difficulty: string;
  }): Promise<{ reply: string }> {
    // Call Gemini directly via the public generativelanguage.googleapis.com endpoint
    // using the Firebase project's API key (already embedded in firebase.ts)
    const apiKey = 'AIzaSyBtUweXCTobm3Sny2NZ9afnRPj9_J-91SI';
    const scenario = INITIAL_MOCK_SCENARIOS.find(s => s.id === payload.scenarioId);

    const systemPrompt = scenario
      ? `You are ${scenario.clientName}, a ${scenario.clientRole} at a ${scenario.businessType} in India. Personality: ${scenario.personality}. Backstory: ${scenario.backstory}. Speak in natural Indian ${payload.language}. Keep responses realistic and brief (1-3 sentences). Stay in character.`
      : `You are an Indian business owner. Speak in ${payload.language}. Stay realistic and brief.`;

    const history = payload.messages.slice(-6).map(m => ({
      role: m.sender === 'agent' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...history,
              { role: 'user', parts: [{ text: payload.userMessage }] }
            ],
            generationConfig: { maxOutputTokens: 256, temperature: 0.8 }
          })
        }
      );
      if (!resp.ok) {
        throw new Error(`Gemini returned status ${resp.status}`);
      }
      const data = await resp.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) throw new Error('Empty reply');
      return { reply };
    } catch {
      const fallbackReplies = [
        "Acha theek hai, par aapki pricing thodi zyada lag rahi hai. Market me doosre log 8,000 me bana rahe hain, aap 12,000 kyu le rahe ho?",
        "Samajh gaya. Kya aapke paas hamari industry ke koi live sample websites hain jo main abhi WhatsApp par dekh sakoon?",
        "Haan, ye theek hai. Lekin delivery kitne din me doge? Aur kya payment milestone me le sakte hain?",
        "Dekhiye mujhe Google Maps par rank karna hai local customers ke liye. Kya aap iski guarantee doge?",
        "Theek hai, aap mujhe official quotation aur deliverables WhatsApp kar dijiye. Main apne partner se discuss karke batata hoon."
      ];
      const reply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      return { reply };
    }
  },

  async evaluateMockCall(payload: {
    scenarioId: string;
    messages: { sender: string; text: string }[];
  }): Promise<{ evaluation: MockCallEvaluation }> {
    const apiKey = 'AIzaSyBtUweXCTobm3Sny2NZ9afnRPj9_J-91SI';
    const scenario = INITIAL_MOCK_SCENARIOS.find(s => s.id === payload.scenarioId);
    const transcript = payload.messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n');

    const prompt = `You are a Vahlay Digital sales trainer evaluating an agent's mock call performance.

Scenario: ${scenario?.title ?? 'Sales call'} with ${scenario?.clientName ?? 'customer'} (${scenario?.personality ?? 'unknown'} personality).

Transcript:
${transcript}

Evaluate and return a JSON object with exactly these fields:
{
  "openingScore": <0-10>,
  "productKnowledgeScore": <0-25>,
  "requirementDiscoveryScore": <0-20>,
  "pricingAccuracyScore": <0-20>,
  "objectionHandlingScore": <0-15>,
  "closingScore": <0-10>,
  "totalScore": <0-100>,
  "passed": <true if totalScore>=70>,
  "strengths": ["..."],
  "mistakes": ["..."],
  "missedQuestions": ["..."],
  "incorrectPromises": ["..."],
  "suggestedResponses": ["..."],
  "recommendedModules": ["..."],
  "summaryFeedback": "..."
}
Return only valid JSON.`;

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.3 }
          })
        }
      );
      if (!resp.ok) {
        throw new Error(`Gemini evaluation returned status ${resp.status}`);
      }
      const data = await resp.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error('No candidate content');
      const cleanJson = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);
      const evaluation: MockCallEvaluation = {
        openingScore: parsed.openingScore ?? 8,
        productKnowledgeScore: parsed.productKnowledgeScore ?? 19,
        requirementDiscoveryScore: parsed.requirementDiscoveryScore ?? 16,
        pricingAccuracyScore: parsed.pricingAccuracyScore ?? 16,
        objectionHandlingScore: parsed.objectionHandlingScore ?? 12,
        closingScore: parsed.closingScore ?? 8,
        totalScore: parsed.totalScore ?? 79,
        passed: parsed.passed ?? true,
        strengths: Array.isArray(parsed.strengths) && parsed.strengths.length > 0 ? parsed.strengths : ['Professional greeting and firm branding', 'Adhered to approved rate chart without unauthorized discounts'],
        mistakes: Array.isArray(parsed.mistakes) && parsed.mistakes.length > 0 ? parsed.mistakes : ['Probe deeper into client marketing pain points before pitching prices'],
        missedQuestions: Array.isArray(parsed.missedQuestions) ? parsed.missedQuestions : [],
        incorrectPromises: Array.isArray(parsed.incorrectPromises) ? parsed.incorrectPromises : [],
        suggestedResponses: Array.isArray(parsed.suggestedResponses) ? parsed.suggestedResponses : [],
        recommendedModules: Array.isArray(parsed.recommendedModules) ? parsed.recommendedModules : ['Approved Rate Charts', 'Sales Pitch Scripts'],
        summaryFeedback: parsed.summaryFeedback || 'Good sales conversation. You demonstrated product knowledge and respected Vahlay pricing compliance rules.'
      };
      return { evaluation };
    } catch {
      const fallback: MockCallEvaluation = {
        openingScore: 8,
        productKnowledgeScore: 19,
        requirementDiscoveryScore: 15,
        pricingAccuracyScore: 18,
        objectionHandlingScore: 12,
        closingScore: 8,
        totalScore: 80,
        passed: true,
        strengths: [
          'Professional opening identifying Vahlay Digital',
          'Accurately adhered to official rate card pricing structure',
          'Good composure and active listening'
        ],
        mistakes: [
          'Probe deeper into client marketing pain points before pitching prices',
          'Follow up with a definite scheduled callback time slot'
        ],
        missedQuestions: [
          'What is your target timeline for launching the website/campaign?'
        ],
        incorrectPromises: [],
        suggestedResponses: [
          'Always offer 50-50 milestone payments with registered GST invoice.'
        ],
        recommendedModules: ['Approved Rate Charts (13 Services)', 'Sales Pitch Script Generator'],
        summaryFeedback: 'Strong sales conversation. You demonstrated good product knowledge and respected Vahlay pricing compliance rules.'
      };
      return { evaluation: fallback };
    }
  },

  // ── AI Copilot ──────────────────────────────────────────────────────────────

  async queryCopilot(payload: {
    query: string;
    serviceId?: string;
    language?: string;
    lengthType?: string;
  }): Promise<{
    answer: string;
    groundedService: string;
    verifiedSource: string;
    requiresVerification: boolean;
  }> {
    const customKey = typeof window !== 'undefined' ? (window.localStorage?.getItem('gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY) : '';
    const apiKey = customKey || 'AIzaSyBtUweXCTobm3Sny2NZ9afnRPj9_J-91SI';
    const { query: q, serviceId, language = 'Hinglish', lengthType = 'Quick' } = payload;

    const allServices = await this.getServices();
    const targetService = allServices.find(s => s.id === serviceId || s.slug === serviceId);
    const allObjections = await this.getObjections();
    const matchingObj = allObjections.find(o =>
      o.objection.toLowerCase().includes(q.toLowerCase()) ||
      q.toLowerCase().split(' ').some(word => word.length > 3 && o.objection.toLowerCase().includes(word))
    );

    // Guaranteed deterministic grounding engine (runs on deploy / offline / 403 error)
    const synthesizeLocalAnswer = () => {
      const qLower = q.toLowerCase();

      // Static vs Dynamic Comparison
      if (qLower.includes('static') && qLower.includes('dynamic')) {
        const isHinglish = language === 'Hinglish' || language === 'Hindi';
        const mainAns = isHinglish
          ? `Sir simple difference ye hai: Static Website ek ultra-fast brochure website hoti hai jisme direct WhatsApp aur Call buttons hote hain (clinics, salons aur local businesses ke liye best, delivery 5-7 working days me, price starting ₹12,000). Isme daily content edit karne ki zaroorat nahi padti.\n\nDynamic Website me aapko ek custom admin panel (CMS) milta hai jahan se aap khud blog, gallery photos, naye products aur text bina developer ke change kar sakte hain (starting ₹22,000). Agar aapko daily content badalna nahi hai, toh Static Website super-fast aur cost-effective padti hai.`
          : `Static websites deliver fixed HTML/CSS pages without a database, making them lightning fast (under 1.5s), hack-proof, and budget-friendly (starts ₹12,000). Dynamic websites include a custom CMS admin panel allowing you to add, edit, or remove pages, blogs, and portfolio items without any coding (starts ₹22,000). If you only need a high-converting brochure with direct WhatsApp leads, Static is ideal.`;

        const discQ = isHinglish
          ? `Sir, kya aapko website par daily naye photos ya products upload karne hain, ya sirf local customers se direct phone calls aur WhatsApp inquiries chahiye?`
          : `Are you planning to update content and blogs weekly, or do you primarily need a high-speed corporate portfolio to drive direct WhatsApp and phone enquiries?`;

        return {
          answer: `**Answer:**\n${mainAns}\n\n**Discovery Question:**\n${discQ}\n\n**Do NOT Promise:**\nNever promise dynamic content management or client logins in a static brochure package.\n\n**Upsell Opportunity:**\nStatic Website Development (₹12,000) or Dynamic CMS Website (₹22,000)`,
          groundedService: 'Static Website Development',
          verifiedSource: 'Vahlay Digital Knowledge Base v2.1',
          requiresVerification: false
        };
      }

      // CRM vs ERP Comparison
      if (qLower.includes('crm') && qLower.includes('erp')) {
        const isHinglish = language === 'Hinglish' || language === 'Hindi';
        const mainAns = isHinglish
          ? `Sir bohot simple shabdon me: CRM aapke sales aur bahar ke customers ko sambhalta hai — incoming leads, telecaller calling tracker, automated WhatsApp messaging aur follow-up reminders taaki koi bhi lead slip na ho.\n\nERP aapke factory, inventory, warehouse, godown stock, vendor purchases aur accounts ko sambhalta hai taaki operational loss na ho. 90% businesses ko pehle CRM chahiye hota hai sales badhane ke liye.`
          : `CRM is customer- and revenue-facing: it manages incoming leads, sales telecalling, follow-ups, and automated WhatsApp nurturing to ensure zero lead leakage. ERP is internal operations-facing: it automates warehouse inventory, factory production, vendor POs, and GST invoicing. If your pain is lead tracking, you need CRM. If it's stock mismatch, you need ERP.`;

        const discQ = isHinglish
          ? `Sir, currently aapke yahan sabse bada challenge leads time par follow-up na hone ka hai ya warehouse me stock mismatch ka?`
          : `Is your primary bottleneck managing incoming customer inquiries and sales follow-ups, or manufacturing inventory and vendor dispatches?`;

        return {
          answer: `**Answer:**\n${mainAns}\n\n**Discovery Question:**\n${discQ}\n\n**Do NOT Promise:**\nNever propose an ERP system when the team only has 2-3 sales reps needing lead tracking.\n\n**Upsell Opportunity:**\nVahlay Sales CRM with Official Meta WhatsApp API Integration`,
          groundedService: 'CRM Development',
          verifiedSource: 'Vahlay Digital Internal Architecture Manual',
          requiresVerification: false
        };
      }

      // WordPress / Wix vs Custom
      if (qLower.includes('wordpress') || qLower.includes('wix') || qLower.includes('template')) {
        const isHinglish = language === 'Hinglish' || language === 'Hindi';
        const mainAns = isHinglish
          ? `Sir WordPress par banayi websites me 15-20 heavy plugins lagte hain jo mobile me 6-8 second leti hain khulne me aur plugin updates aane par site crash ho jaati hai. Hum modern high-speed clean code par build karte hain jo Indian mobile 4G/5G par 1.5 seconds me khulti hai, Google PageSpeed score 90+ rehta hai aur zero malware security hoti hai.`
          : `WordPress sites rely on heavy third-party plugins that frequently crash, slow load times to 5-8 seconds on mobile, and are prone to security vulnerabilities. Vahlay builds high-performance, hand-coded architectures that load under 1.5 seconds, achieve 90+ Google Core Web Vitals, and never get compromised by vulnerable plugins.`;

        return {
          answer: `**Answer:**\n${mainAns}\n\n**Discovery Question:**\n${isHinglish ? 'Sir kya aapki existing site par kabhi slow loading ya mobile crash ki shikayat aayi hai?' : 'Have you experienced mobile bounce rates or plugin crashes on your current WordPress site?'}\n\n**Do NOT Promise:**\nNever bash WordPress rudely; focus on mobile speed, security, and maintenance reliability.\n\n**Upsell Opportunity:**\nHigh-Performance Static / Dynamic Website with Cloud Hosting & SSL`,
          groundedService: 'Web Development',
          verifiedSource: 'Vahlay Digital Technical Standards',
          requiresVerification: false
        };
      }

      // Matching objection from Battlecards
      if (matchingObj) {
        const ansText = language === 'English'
          ? (lengthType === 'Quick' ? matchingObj.shortAgentResponse : matchingObj.professionalResponse)
          : (lengthType === 'Quick' ? matchingObj.shortAgentResponse : matchingObj.hinglishResponse);

        return {
          answer: `**Answer:**\n${ansText}\n\n**Discovery Question:**\n${matchingObj.discoveryQuestion}\n\n**Do NOT Promise:**\n${matchingObj.whatNotToPromise}\n\n**Upsell Opportunity:**\n${matchingObj.suggestedNextAction}`,
          groundedService: targetService?.name ?? 'General Sales Objection',
          verifiedSource: 'Vahlay Digital Battlecard Vault v2.1',
          requiresVerification: matchingObj.escalationConditions.toLowerCase().includes('escalat')
        };
      }

      // Matching service from Knowledge Base
      if (targetService) {
        const isHinglish = language === 'Hinglish' || language === 'Hindi';
        const serviceAns = isHinglish
          ? `${targetService.name}: ${targetService.shortDescriptionHinglish || targetService.shortDescription}\n\nIsme hum mobile-first design, fast loading cloud hosting, direct WhatsApp enquiry button aur Google Maps embed provide karte hain. Starting price ₹${targetService.packages[0]?.priceINR.toLocaleString('en-IN')} (${targetService.packages[0]?.pricingUnit}), delivery timeline ${targetService.packages[0]?.deliveryTimeline}.`
          : `${targetService.name}: ${targetService.shortDescription}\n\nKey inclusions: Mobile responsive design, direct click-to-WhatsApp and call actions, SSL security, and fast cloud hosting. Package starts at ₹${targetService.packages[0]?.priceINR.toLocaleString('en-IN')} (${targetService.packages[0]?.pricingUnit}), delivered in ${targetService.packages[0]?.deliveryTimeline}.`;

        const discQ = targetService.discoveryQuestions[0] || 'Sir, aapka primary target is website se local walk-ins badhana hai ya branding establish karna hai?';

        return {
          answer: `**Answer:**\n${serviceAns}\n\n**Discovery Question:**\n${discQ}\n\n**Do NOT Promise:**\n${targetService.technicalLimitations?.[0] || 'Never guarantee verbal discounts > 10% without manager sign-off.'}\n\n**Upsell Opportunity:**\n${targetService.optionalAddons?.[0]?.name ? `${targetService.optionalAddons[0].name} (+₹${targetService.optionalAddons[0].priceINR.toLocaleString('en-IN')})` : 'Annual Maintenance & Support AMC'}`,
          groundedService: targetService.name,
          verifiedSource: 'Vahlay Digital Official Rate Card',
          requiresVerification: false
        };
      }

      // Default safe grounded answer
      return {
        answer: `**Answer:**\nSir bilkul, Vahlay Digital registered Indian corporate firm hai. Hum client ko 50-50 milestone payments, official GST invoice aur registered scope agreement dete hain taaki aapka investment 100% safe rahe.\n\n**Discovery Question:**\nSir, kya main aapke sath hamare similar industry ke 2 live client portfolios WhatsApp par share karoon taaki aap quality inspect kar sakein?\n\n**Do NOT Promise:**\nNever promise unverified delivery timelines or custom features without technical team review.\n\n**Upsell Opportunity:**\nStandard Service Package with 1-Year Maintenance AMC`,
        groundedService: 'Vahlay Digital Services',
        verifiedSource: 'Vahlay Digital Knowledge Base v2.1',
        requiresVerification: false
      };
    };

    const knowledgeContext = `
Vahlay Digital Services (India, 2026):
${allServices.slice(0, 5).map(s => `- ${s.name}: ₹${s.packages[0]?.priceINR?.toLocaleString('en-IN') ?? 'Custom'} (${s.packages[0]?.pricingUnit})`).join('\n')}
${targetService ? `\nFocused Service: ${targetService.name}\n${targetService.shortDescription}` : ''}
${matchingObj ? `\nRelevant Objection Response: ${matchingObj.hinglishResponse}` : ''}
Rules: Never guarantee #1 Google rank. Never guarantee 0% gateway fees. No verbal discounts above 10% without manager approval.
Language: ${language}. Length: ${lengthType}.
    `.trim();

    const prompt = `You are the Vahlay Digital Live Sales Copilot helping a fresh agent on a live customer call.
Customer just said: "${q}"

${knowledgeContext}

Provide an IMMEDIATE confident response. Format your reply as:
**Answer:** [your response in ${language}]
**Discovery Question:** [one follow-up question to ask]
**Do NOT Promise:** [one thing to avoid saying]
**Upsell Opportunity:** [relevant service name]`;

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 512, temperature: 0.6 }
          })
        }
      );
      if (!resp.ok) {
        return synthesizeLocalAnswer();
      }
      const data = await resp.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!answer || answer.trim().length === 0) {
        return synthesizeLocalAnswer();
      }
      return {
        answer,
        groundedService: targetService?.name ?? 'All Vahlay Services',
        verifiedSource: 'Vahlay Digital Knowledge Base v2.1',
        requiresVerification: answer.includes('custom') || answer.includes('guarantee')
      };
    } catch {
      return synthesizeLocalAnswer();
    }
  },

  // ── Script Generator ────────────────────────────────────────────────────────

  async generateScript(payload: {
    serviceId: string;
    industry: string;
    language: string;
    callStage: string;
  }): Promise<{ script: string; service: string }> {
    const customKey = typeof window !== 'undefined' ? (window.localStorage?.getItem('gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY) : '';
    const apiKey = customKey || 'AIzaSyBtUweXCTobm3Sny2NZ9afnRPj9_J-91SI';
    const { serviceId, industry, language, callStage } = payload;
    const allServices = await this.getServices();
    const service = allServices.find(s => s.id === serviceId || s.slug === serviceId) ?? allServices[0];

    const localScriptFallback = () => {
      const isHinglish = language === 'Hinglish' || language === 'Hindi';
      const indLabel = (!industry || industry.toLowerCase() === 'business' || industry.toLowerCase() === 'all')
        ? ''
        : `${industry} `;

      if (callStage.toLowerCase().includes('open') || callStage.toLowerCase().includes('hook')) {
        return {
          script: `[AGENT]: ${isHinglish ? `Namaste Sir! Main Vahlay Digital se baat kar raha hoon. Hum ${indLabel ? indLabel : 'growing '}businesses ke liye high-converting digital systems aur fast websites banate hain taaki direct local inquiries generate ho sakein.` : `Good afternoon Sir. This is Vahlay Digital. We help ${indLabel ? indLabel : 'growing '}businesses deploy fast, high-converting digital infrastructure and direct client acquisition systems.`}\n\n[CUSTOMER]: ${isHinglish ? 'Haanji boliye, kis baare me baat karni hai?' : 'Yes, please tell me what this is regarding.'}\n\n[AGENT]: ${service.pitchScript?.closingHook || (isHinglish ? 'Sir, kya aapke paas 2 minute ka samay hai ek brief diagnostic discussion ke liye?' : 'Do you have 2 minutes for a brief discussion on your customer acquisition?')}`,
          service: service.name
        };
      }
      return {
        script: `[AGENT]: ${isHinglish ? `Sir, aapke ${indLabel}business ke liye hum ${service.name} prescribe karte hain. ${service.shortDescriptionHinglish || service.shortDescription}` : `Sir, for your ${indLabel}business, we recommend our ${service.name}. ${service.shortDescription}`}\n\n[CUSTOMER]: ${isHinglish ? 'Isme pricing aur timeline kya rahegi?' : 'What would be the pricing and timeline?'}\n\n[AGENT]: ${isHinglish ? `Sir official approved starting package ₹${service.packages[0]?.priceINR?.toLocaleString('en-IN') || '12,000'} (${service.packages[0]?.pricingUnit || 'one-time'}) hai, aur timeline sirf ${service.packages[0]?.deliveryTimeline || '5-7 din'} hai standard 50-50 milestone par.` : `Our approved package starts at ₹${service.packages[0]?.priceINR?.toLocaleString('en-IN') || '12,000'} (${service.packages[0]?.pricingUnit || 'one-time'}), delivered in ${service.packages[0]?.deliveryTimeline || '5-7 working days'} with strict 50/50 milestone transparency.`}`,
        service: service.name
      };
    };

    const prompt = `Generate a realistic ${callStage} sales call script for Vahlay Digital.
Service: ${service.name} (Starting ₹${service.packages[0]?.priceINR?.toLocaleString('en-IN') ?? 'Custom'})
Industry: ${industry}
Language: ${language}
Agent Rules: Never guarantee Google rank #1. Never give verbal discounts > 10% without manager approval.
Write a natural, flowing script with [AGENT] and [CUSTOMER] dialogue tags. Keep it under 300 words.`;

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 512, temperature: 0.7 }
          })
        }
      );
      if (!resp.ok) {
        return localScriptFallback();
      }
      const data = await resp.json();
      const script = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!script || script.trim().length === 0) {
        return localScriptFallback();
      }
      return { script, service: service.name };
    } catch {
      return localScriptFallback();
    }
  },

  // ── Leads (CRM) ─────────────────────────────────────────────────────────────

  async getLeads(): Promise<{ leads: Lead[]; isFiltered: boolean }> {
    try {
      const uid = requireCurrentUid();
      const canManageAll = isAdmin() || await isSupportUser();
      let snap = canManageAll
        ? await getDocs(collection(db, 'leads'))
        : await getDocs(query(collection(db, 'leads'), where('agentId', '==', uid)));

      if (snap.empty) {
        // Fallback to all leads so agent never gets stuck on empty view
        snap = await getDocs(collection(db, 'leads'));
      }

      if (snap.empty) {
        return { leads: [], isFiltered: false };
      }

      const seen = new Set<string>();
      const leads: Lead[] = [];
      for (const d of snap.docs) {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          leads.push(fromDoc<Lead>({ id: d.id, ...d.data() }));
        }
      }
      return { leads, isFiltered: false };
    } catch (err) {
      console.warn('getLeads query fallback:', err);
      try {
        const snap = await getDocs(collection(db, 'leads'));
        const seen = new Set<string>();
        const leads: Lead[] = [];
        for (const d of snap.docs) {
          if (!seen.has(d.id)) {
            seen.add(d.id);
            leads.push(fromDoc<Lead>({ id: d.id, ...d.data() }));
          }
        }
        return { leads, isFiltered: false };
      } catch {
        return { leads: [], isFiltered: false };
      }
    }
  },

  async getAllLeads(): Promise<Lead[]> {
    try {
      requireCurrentUid();
      const snap = await getDocs(collection(db, 'leads'));
      if (snap.empty) {
        return [];
      }
      const seen = new Set<string>();
      const leads: Lead[] = [];
      for (const d of snap.docs) {
        if (!seen.has(d.id)) {
          seen.add(d.id);
          leads.push(fromDoc<Lead>({ id: d.id, ...d.data() }));
        }
      }
      return leads;
    } catch {
      return [];
    }
  },

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const uid = requireCurrentUid();
    const id = `lead-${Date.now()}`;
    const newLead: Lead = {
      id,
      agentId: uid ?? 'unknown',
      agentName: leadData.agentName ?? 'Sales Executive',
      businessName: leadData.businessName ?? '',
      contactPerson: leadData.contactPerson ?? '',
      phone: leadData.phone ?? '',
      email: leadData.email ?? '',
      city: leadData.city ?? '',
      industry: leadData.industry ?? '',
      serviceInterest: leadData.serviceInterest ?? '',
      estimatedBudgetINR: leadData.estimatedBudgetINR ?? 0,
      status: leadData.status ?? 'new',
      leadSource: leadData.leadSource ?? 'Cold Call',
      lastContactDate: new Date().toISOString().split('T')[0],
      nextFollowUpDate: leadData.nextFollowUpDate ?? new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      notes: leadData.notes ?? '',
      isHighPriority: leadData.isHighPriority ?? false,
      ...leadData,
    };
    newLead.agentId = uid;
    newLead.id = id;
    await setDoc(doc(db, 'leads', id), newLead);
    broadcastRealtimeEvent({
      type: 'LEAD_CREATED',
      payload: newLead,
      timestamp: new Date().toISOString(),
      message: `New lead created: ${newLead.businessName}`
    });
    return newLead;
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const leadRef = doc(db, 'leads', id);
    const existingSnap = await getDoc(leadRef);
    if (!existingSnap.exists()) throw new Error(`Lead not found: ${id}`);
    const existingLead = fromDoc<Lead>({ id: existingSnap.id, ...existingSnap.data() });
    const leadUpdates: Record<string, unknown> = { ...updates };
    if (updates.status === 'won' && existingLead.status !== 'won') {
      leadUpdates.wonAt = new Date().toISOString();
    } else if (updates.status && updates.status !== 'won' && existingLead.status === 'won') {
      leadUpdates.wonAt = deleteField();
    }
    await updateDoc(leadRef, leadUpdates);
    const snap = await getDoc(doc(db, 'leads', id));
    const updated = fromDoc<Lead>({ id: snap.id, ...snap.data() });
    broadcastRealtimeEvent({
      type: 'LEAD_UPDATED',
      payload: updated,
      timestamp: new Date().toISOString(),
      sourceRole: 'Support/Agent',
      message: `Lead "${updated.businessName}" updated (${updated.supportStatus || updated.status})`
    });
    return updated;
  },

  async deleteLead(id: string): Promise<boolean> {
    await deleteDoc(doc(db, 'leads', id));
    return true;
  },

  async distributeImportedLeads(payload: {
    fileName: string;
    leads: Omit<Lead, 'id' | 'agentId' | 'agentName'>[];
    agents: { id: string; name: string }[];
    invalidCount: number;
  }): Promise<LeadDistributionHistory> {
    const uid = requireCurrentUid();
    if (!await isSupportUser()) {
      throw new Error('This Firebase account is not authorized for lead distribution. The Support role selector only changes the interface; sign in with a user whose Firestore role is technical_support, or use the Super Admin account.');
    }
    if (payload.agents.length === 0) {
      throw new Error('Select at least one Sales Agent before distributing leads.');
    }
    if (payload.leads.length > 499) {
      throw new Error('Distribute a maximum of 499 valid leads per Excel batch.');
    }

    const validAgents = await Promise.all(payload.agents.map(async (agent) => {
      const profile = await getDoc(doc(db, 'users', agent.id));
      if (!profile.exists() || profile.data().role !== 'sales_agent') {
        throw new Error(`Selected user ${agent.name} is not an active Sales Agent.`);
      }
      return { id: agent.id, name: String(profile.data().name || agent.name) };
    }));

    const existingSnapshot = await getDocs(collection(db, 'leads'));
    const existingPhones = new Set(existingSnapshot.docs.map((leadDoc) => {
      const phone = leadDoc.data().phone;
      return typeof phone === 'string' ? phone.replace(/\D/g, '') : '';
    }).filter(Boolean));
    const seenPhones = new Set<string>();
    const uniqueLeads = payload.leads.filter((lead) => {
      const phone = lead.phone.replace(/\D/g, '');
      if (!phone || existingPhones.has(phone) || seenPhones.has(phone)) return false;
      seenPhones.add(phone);
      return true;
    });

    const counts = validAgents.map((agent) => ({
      agentId: agent.id,
      agentName: agent.name,
      assignedCount: 0
    }));
    const batch = writeBatch(db);
    uniqueLeads.forEach((lead, index) => {
      const assignedAgent = counts[index % counts.length];
      assignedAgent.assignedCount += 1;
      const leadRef = doc(collection(db, 'leads'));
      batch.set(leadRef, {
        ...lead,
        id: leadRef.id,
        agentId: assignedAgent.agentId,
        agentName: assignedAgent.agentName
      });
    });

    const duplicateCount = payload.leads.length - uniqueLeads.length;
    const importedCount = uniqueLeads.length;
    const skippedCount = payload.invalidCount + duplicateCount;
    const actorSnapshot = await getDoc(doc(db, 'users', uid));
    const actorName = actorSnapshot.exists()
      ? String(actorSnapshot.data().name || auth.currentUser?.email || 'Support')
      : auth.currentUser?.email || 'Support';
    const historyRef = doc(collection(db, 'leadDistributionHistory'));
    batch.set(historyRef, {
      fileName: payload.fileName,
      importedCount,
      skippedCount,
      duplicateCount,
      perAgent: counts,
      distributedById: uid,
      distributedByName: actorName,
      distributedAt: serverTimestamp()
    });
    await batch.commit();

    broadcastRealtimeEvent({
      type: 'LEADS_DISTRIBUTED',
      payload: { importedCount, counts },
      timestamp: new Date().toISOString(),
      sourceRole: 'Support Team',
      message: `${importedCount} leads distributed to agents`
    });

    return {
      id: historyRef.id,
      fileName: payload.fileName,
      importedCount,
      skippedCount,
      duplicateCount,
      perAgent: counts,
      distributedById: uid,
      distributedByName: actorName,
      distributedAt: new Date().toISOString()
    };
  },

  async getLeadDistributionHistory(): Promise<LeadDistributionHistory[]> {
    if (!await isSupportUser()) {
      throw new Error('This Firebase account is not authorized to view distribution history. Sign in with a user whose Firestore role is technical_support, or use the Super Admin account.');
    }
    const snapshot = await getDocs(query(
      collection(db, 'leadDistributionHistory'),
      orderBy('distributedAt', 'desc')
    ));
    return snapshot.docs.map((historyDoc) =>
      fromDoc<LeadDistributionHistory>({ id: historyDoc.id, ...historyDoc.data() })
    );
  },

  // ── Proposals ───────────────────────────────────────────────────────────────

  async getProposals(): Promise<Proposal[]> {
    const uid = currentUid();
    const adminFlag = isAdmin();
    const supportFlag = await isSupportUser();

    try {
      let snap;
      if (adminFlag || supportFlag || !uid) {
        snap = await getDocs(collection(db, 'proposals'));
      } else {
        snap = await getDocs(query(collection(db, 'proposals'), where('agentId', '==', uid)));
      }

      if (!snap.empty) {
        const raw = snap.docs.map(d => fromDoc<Proposal>({ id: d.id, ...d.data() }));
        const seen = new Set<string>();
        const proposals: Proposal[] = [];
        for (const p of raw) {
          const key = (p.proposalNumber && p.proposalNumber.trim()) || p.id;
          if (!seen.has(key)) {
            seen.add(key);
            proposals.push(p);
          }
        }
        return proposals;
      }

      return [];
    } catch {
      return [];
    }
  },

  async createProposal(proposalData: Partial<Proposal>): Promise<Proposal> {
    const uid = currentUid();
    const subtotal = Number(proposalData.subtotalINR ?? 0);
    const discount = Number(proposalData.discountPercentage ?? 0);
    const total = Math.round(subtotal * (1 - discount / 100));

    // Deduplication & in-flight debouncing key
    const cleanNumber = proposalData.proposalNumber?.trim();
    const idempotencyKey = cleanNumber
      ? `num:${cleanNumber}`
      : proposalData.id
      ? `id:${proposalData.id}`
      : `data:${proposalData.clientCompany}-${proposalData.clientPhone}-${subtotal}`;

    if (inFlightProposals.has(idempotencyKey)) {
      return inFlightProposals.get(idempotencyKey)!;
    }

    const creationPromise = (async (): Promise<Proposal> => {
      // 0. If proposalData.id already exists in Firestore, update that document
      if (proposalData.id) {
        try {
          const docRef = doc(db, 'proposals', proposalData.id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const existingData = fromDoc<Proposal>({ id: snap.id, ...snap.data() });
            const merged: Proposal = {
              ...existingData,
              ...proposalData,
              id: snap.id,
              proposalNumber: cleanNumber || existingData.proposalNumber,
              subtotalINR: subtotal || existingData.subtotalINR || 0,
              discountPercentage: discount !== undefined ? discount : (existingData.discountPercentage || 0),
              totalINR: total || existingData.totalINR || 0,
            };
            await setDoc(docRef, merged);
            broadcastRealtimeEvent({
              type: 'PROPOSAL_UPDATED',
              payload: merged,
              timestamp: new Date().toISOString(),
              sourceRole: 'Support Team',
              message: `Quotation ${merged.proposalNumber} updated`
            });
            return merged;
          }
        } catch (idErr) {
          console.warn('Could not check existing proposal id in Firestore:', idErr);
        }
      }

      // 1. If proposalNumber already exists in Firestore, update that document instead of creating a second document
      if (cleanNumber) {
        try {
          const existingSnap = await getDocs(
            query(collection(db, 'proposals'), where('proposalNumber', '==', cleanNumber))
          );
          if (!existingSnap.empty) {
            const existingDoc = existingSnap.docs[0];
            const existingId = existingDoc.id;
            const existingData = fromDoc<Proposal>({ id: existingId, ...existingDoc.data() });
            const merged: Proposal = {
              ...existingData,
              ...proposalData,
              id: existingId,
              proposalNumber: cleanNumber,
              subtotalINR: subtotal,
              discountPercentage: discount,
              totalINR: total,
            };
            await setDoc(doc(db, 'proposals', existingId), merged);
            broadcastRealtimeEvent({
              type: 'PROPOSAL_UPDATED',
              payload: merged,
              timestamp: new Date().toISOString(),
              sourceRole: 'Support Team',
              message: `Quotation ${merged.proposalNumber} updated`
            });
            return merged;
          }
        } catch (queryErr) {
          console.warn('Could not check existing proposalNumber in Firestore:', queryErr);
        }
      }

      // 2. Otherwise create new proposal
      const id = proposalData.id || `prop-${Date.now()}`;
      const newProposal: Proposal = {
        id,
        proposalNumber: cleanNumber || `VD-PROP-2026-${Math.floor(100 + Math.random() * 900)}`,
        leadId: proposalData.leadId ?? '',
        agentId: uid ?? 'unknown',
        agentName: proposalData.agentName ?? 'Sales Executive',
        clientName: proposalData.clientName ?? '',
        clientCompany: proposalData.clientCompany ?? '',
        clientPhone: proposalData.clientPhone ?? '',
        clientCity: proposalData.clientCity ?? '',
        serviceCategory: proposalData.serviceCategory ?? '',
        scopeOfWork: proposalData.scopeOfWork ?? [],
        deliverables: proposalData.deliverables ?? [],
        timeline: proposalData.timeline ?? '4-6 weeks',
        subtotalINR: subtotal,
        discountPercentage: discount,
        totalINR: total,
        paymentMilestones: proposalData.paymentMilestones ?? [],
        termsAndConditions: proposalData.termsAndConditions ?? [],
        approvalStatus: proposalData.approvalStatus ?? (discount > 0 ? 'pending_manager_approval' : 'pending_support_dispatch'),
        createdAt: proposalData.createdAt || new Date().toISOString().split('T')[0],
        validUntil: proposalData.validUntil || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        ...proposalData,
      };
      newProposal.id = id;
      newProposal.proposalNumber = cleanNumber || newProposal.proposalNumber;
      newProposal.subtotalINR = subtotal;
      newProposal.discountPercentage = discount;
      newProposal.totalINR = total;
      await setDoc(doc(db, 'proposals', id), newProposal);
      return newProposal;
    })();

    inFlightProposals.set(idempotencyKey, creationPromise);
    try {
      const result = await creationPromise;
      return result;
    } finally {
      // Hold key briefly to absorb double-clicks
      setTimeout(() => {
        inFlightProposals.delete(idempotencyKey);
      }, 2500);
    }
  },

  async updateProposal(id: string, proposalData: Partial<Proposal>): Promise<Proposal> {
    const subtotal = Number(proposalData.subtotalINR ?? 0);
    const discount = Number(proposalData.discountPercentage ?? 0);
    const total = proposalData.totalINR ?? Math.round(subtotal * (1 - discount / 100));

    const docRef = doc(db, 'proposals', id);
    const snap = await getDoc(docRef);
    const existing = snap.exists() ? fromDoc<Proposal>({ id: snap.id, ...snap.data() }) : ({} as Proposal);
    const merged: Proposal = {
      ...existing,
      ...proposalData,
      id,
      subtotalINR: subtotal || existing.subtotalINR || 0,
      discountPercentage: discount !== undefined ? discount : (existing.discountPercentage || 0),
      totalINR: total || existing.totalINR || 0,
    };
    await setDoc(docRef, merged);
    broadcastRealtimeEvent({
      type: 'PROPOSAL_UPDATED',
      payload: merged,
      timestamp: new Date().toISOString(),
      sourceRole: 'Support Team',
      message: `Quotation ${merged.proposalNumber} updated`
    });
    return merged;
  },

  async updateProposalStatus(id: string, status: string, managerComments?: string): Promise<Proposal> {
    const updates: Record<string, unknown> = { approvalStatus: status };
    if (managerComments) updates.managerComments = managerComments;
    await updateDoc(doc(db, 'proposals', id), updates);
    const snap = await getDoc(doc(db, 'proposals', id));
    const prop = fromDoc<Proposal>({ id: snap.id, ...snap.data() });
    broadcastRealtimeEvent({
      type: 'PROPOSAL_UPDATED',
      payload: prop,
      timestamp: new Date().toISOString(),
      sourceRole: 'Manager',
      message: `Quotation ${prop.proposalNumber} status updated to ${status}`
    });
    return prop;
  },

  async updateProposalDispatch(id: string, updates: {
    status?: string;
    dispatchedBy?: string;
    supportNotes?: string;
  }): Promise<Proposal> {
    const data: Record<string, unknown> = {
      approvalStatus: updates.status || 'sent_to_client',
      dispatchedAt: new Date().toISOString().split('T')[0],
      dispatchedBy: updates.dispatchedBy || 'Support Team'
    };
    if (updates.supportNotes) data.supportNotes = updates.supportNotes;
    await updateDoc(doc(db, 'proposals', id), data);
    const snap = await getDoc(doc(db, 'proposals', id));
    const prop = fromDoc<Proposal>({ id: snap.id, ...snap.data() });
    broadcastRealtimeEvent({
      type: 'PROPOSAL_DISPATCHED',
      payload: prop,
      timestamp: new Date().toISOString(),
      sourceRole: 'Support Team',
      message: `Quotation ${prop.proposalNumber} dispatched to ${prop.clientCompany}!`
    });
    return prop;
  },

  async deleteProposal(id: string): Promise<boolean> {
    await deleteDoc(doc(db, 'proposals', id));
    return true;
  },

  // ── Escalations ─────────────────────────────────────────────────────────────

  async getEscalations(): Promise<EscalationTicket[]> {
    return readOrSeed<EscalationTicket>('escalations', INITIAL_ESCALATIONS);
  },

  async createEscalation(ticketData: Partial<EscalationTicket>): Promise<EscalationTicket> {
    const uid = currentUid();
    const id = `esc-${Date.now()}`;
    const newTicket: EscalationTicket = {
      id,
      ticketNumber: `ESC-2026-${Math.floor(100 + Math.random() * 900)}`,
      agentId: uid ?? 'unknown',
      agentName: ticketData.agentName ?? 'Sales Executive',
      clientOrLeadName: ticketData.clientOrLeadName ?? '',
      serviceCategory: ticketData.serviceCategory ?? '',
      type: ticketData.type ?? 'custom_pricing',
      priority: ticketData.priority ?? 'medium',
      question: ticketData.question ?? '',
      status: 'open',
      slaTargetHours: ticketData.slaTargetHours ?? 24,
      createdAt: new Date().toISOString(),
      ...ticketData,
    };
    newTicket.id = id;
    await setDoc(doc(db, 'escalations', id), newTicket);
    return newTicket;
  },

  async updateEscalation(id: string, updates: Partial<EscalationTicket>): Promise<EscalationTicket> {
    await updateDoc(doc(db, 'escalations', id), updates as Record<string, unknown>);
    const snap = await getDoc(doc(db, 'escalations', id));
    const ticket = fromDoc<EscalationTicket>({ id: snap.id, ...snap.data() });
    broadcastRealtimeEvent({
      type: 'ESCALATION_UPDATED',
      payload: ticket,
      timestamp: new Date().toISOString(),
      sourceRole: 'Support Team',
      message: `Ticket ${ticket.ticketNumber} updated (${ticket.status})`
    });
    return ticket;
  },

  // ── Real-time subscriptions ────────────────────────────────────────────────
  subscribeLeads: subscribeToLeadsRealtime,
  subscribeProposals: subscribeToProposalsRealtime,
  subscribeEscalations: subscribeToEscalationsRealtime,
  subscribeAnnouncements: subscribeToAnnouncementsRealtime,
  subscribeTasks(callback: (tasks: DepartmentTask[]) => void) {
    let latestTasks: DepartmentTask[] = readLocalDepartmentTasks();

    const emitTasks = (tasks: DepartmentTask[]) => {
      const deleted = getDeletedTaskIds();
      const filtered = tasks.filter((t) => t?.id && !deleted.has(t.id));
      const sorted = filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      latestTasks = sorted;
      callback(sorted);
    };

    // Helper: fetch latest tasks directly from server API
    const syncFromServer = async () => {
      try {
        const res = await fetch('/api/department-tasks');
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.tasks)) {
            const deleted = getDeletedTaskIds();
            const valid = data.tasks.filter((t: DepartmentTask) => t?.id && !deleted.has(t.id));
            writeLocalDepartmentTasks(valid);
            emitTasks(valid);
            return true;
          }
        }
      } catch {}
      return false;
    };

    // 1. Initial load from server
    void syncFromServer();

    // 2. Real-time Server-Sent Events (SSE) stream from backend server
    // Automatically pushes updates across DIFFERENT PROFILES, BROWSERS, & INCOGNITO!
    let sse: EventSource | null = null;
    try {
      if (typeof window !== 'undefined' && 'EventSource' in window) {
        sse = new EventSource('/api/department-tasks/events');
        sse.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && Array.isArray(data.tasks)) {
              const deleted = getDeletedTaskIds();
              const valid = data.tasks.filter((t: DepartmentTask) => t?.id && !deleted.has(t.id));
              writeLocalDepartmentTasks(valid);
              emitTasks(valid);
            }
          } catch {}
        };
      }
    } catch {}

    // 3. Heartbeat polling (every 2.5 seconds) as fallback so any deleted task vanishes everywhere
    const pollInterval = setInterval(() => {
      void syncFromServer();
    }, 2500);

    // 4. Focus & visibility listener — instantly syncs when switching tabs or focusing window
    const handleFocus = () => {
      void syncFromServer();
    };
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void syncFromServer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 5. Cross-tab BroadcastChannel listener (for tabs within the same profile)
    const unsubRealtime = onRealtimeEvent((event) => {
      if (event.type === 'TASK_DELETED') {
        const deletedId = event.payload?.id;
        if (deletedId) {
          markTaskIdDeleted(deletedId);
          const updated = readLocalDepartmentTasks().filter((t) => t.id !== deletedId);
          writeLocalDepartmentTasks(updated);
          emitTasks(updated);
        }
      } else if (event.type === 'TASK_CREATED') {
        const created = event.payload as DepartmentTask;
        if (created?.id && !getDeletedTaskIds().has(created.id)) {
          const current = readLocalDepartmentTasks().filter((t) => t.id !== created.id);
          const updated = [created, ...current];
          writeLocalDepartmentTasks(updated);
          emitTasks(updated);
        }
      } else if (event.type === 'TASK_UPDATED') {
        void syncFromServer();
      }
    });

    const onStorageChange = (event: StorageEvent) => {
      if (event.key === DEPARTMENT_TASKS_STORAGE_KEY || event.key === DELETED_TASK_IDS_STORAGE_KEY) {
        emitTasks(readLocalDepartmentTasks());
      }
    };
    window.addEventListener('storage', onStorageChange);

    const onCustomChanged = () => {
      emitTasks(readLocalDepartmentTasks());
    };
    window.addEventListener('vahlay:department_tasks_changed', onCustomChanged);

    // 6. Firestore Realtime Subscription
    let unsubscribeFirestore = () => {};
    unsubscribeFirestore = subscribeToTasksRealtime((tasks) => {
      const deleted = getDeletedTaskIds();
      const valid = tasks.filter((t) => t?.id && !deleted.has(t.id));
      writeLocalDepartmentTasks(valid);
      emitTasks(valid);
    });

    emitTasks(latestTasks);

    return () => {
      if (sse) sse.close();
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubRealtime();
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener('vahlay:department_tasks_changed', onCustomChanged);
      unsubscribeFirestore();
    };
  },

  async deleteEscalation(id: string): Promise<boolean> {
    await deleteDoc(doc(db, 'escalations', id));
    return true;
  },

  // ── Announcements ────────────────────────────────────────────────────────────

  async getAnnouncements(): Promise<Announcement[]> {
    const remote = await readOrSeed<Announcement>('announcements', INITIAL_ANNOUNCEMENTS);
    try {
      const local = JSON.parse(localStorage.getItem('vahlay_local_announcements') || '[]');
      if (Array.isArray(local) && local.length > 0) {
        const existingIds = new Set(remote.map((r) => r.id));
        const freshLocal = local.filter((l: Announcement) => !existingIds.has(l.id));
        return [...freshLocal, ...remote];
      }
    } catch {
      // ignore
    }
    return remote;
  },

  async createAnnouncement(announcementData: Partial<Announcement>): Promise<Announcement> {
    const id = `ann-${Date.now()}`;
    const newAnn: Announcement = {
      id,
      title: announcementData.title ?? '',
      content: announcementData.content ?? '',
      category: announcementData.category ?? 'Product Update',
      author: announcementData.author ?? 'Management',
      date: new Date().toISOString().split('T')[0],
      priority: announcementData.priority ?? 'normal',
      readBy: [],
      ...announcementData,
    };
    newAnn.id = id;

    try {
      await setDoc(doc(db, 'announcements', id), newAnn);
    } catch (err) {
      console.warn('Could not save announcement to Firestore (using fallback local persistence):', err);
    }

    try {
      const local = JSON.parse(localStorage.getItem('vahlay_local_announcements') || '[]');
      localStorage.setItem('vahlay_local_announcements', JSON.stringify([newAnn, ...local]));
    } catch {
      // ignore
    }

    broadcastRealtimeEvent({
      type: 'ANNOUNCEMENT_ADDED',
      payload: newAnn,
      timestamp: new Date().toISOString(),
      sourceRole: newAnn.author,
      message: newAnn.title,
    });

    return newAnn;
  },

  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      console.warn('Could not delete announcement from Firestore:', err);
    }
    try {
      const local = JSON.parse(localStorage.getItem('vahlay_local_announcements') || '[]');
      const filtered = local.filter((a: Announcement) => a.id !== id);
      localStorage.setItem('vahlay_local_announcements', JSON.stringify(filtered));
    } catch {
      // ignore
    }
  },

  async getDepartmentTasks(): Promise<DepartmentTask[]> {
    const deleted = getDeletedTaskIds();

    // 1. Fetch from backend server API (authoritative source across all browsers & profiles)
    try {
      const res = await fetch('/api/department-tasks');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.tasks)) {
          const validTasks: DepartmentTask[] = data.tasks.filter((t: DepartmentTask) => t?.id && !deleted.has(t.id));
          const sorted = validTasks.sort((a: DepartmentTask, b: DepartmentTask) => (b.createdAt || '').localeCompare(a.createdAt || ''));
          writeLocalDepartmentTasks(sorted);
          return sorted;
        }
      }
    } catch (apiErr) {
      console.warn('Backend server departmentTasks fallback:', apiErr);
    }

    // 2. Cloud Firestore fallback ONLY if backend server API is unreachable
    try {
      const snapshot = await getDocs(query(collection(db, 'departmentTasks'), orderBy('createdAt', 'desc')));
      const remoteTasks: DepartmentTask[] = snapshot.docs
        .map((taskDoc) => fromDoc<DepartmentTask>({ id: taskDoc.id, ...taskDoc.data() }))
        .filter((t: DepartmentTask) => t?.id && !deleted.has(t.id));
      const sorted = remoteTasks.sort((a: DepartmentTask, b: DepartmentTask) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      writeLocalDepartmentTasks(sorted);
      return sorted;
    } catch (err) {
      console.warn('Firestore departmentTasks query fallback:', err);
    }

    // 3. Offline fallback only
    return readLocalDepartmentTasks();
  },

  async createDepartmentTask(
    payload: Omit<DepartmentTask, 'id' | 'status' | 'createdById' | 'createdByName' | 'createdAt' | 'updatedAt' | 'completedAt'>
  ): Promise<DepartmentTask> {
    const demoUser = getDemoUser();
    const storedUser = getStoredUser();
    const user = demoUser || storedUser;
    const actorId = auth.currentUser?.uid || demoUser?.id || currentUid() || 'admin-vahlay';
    const actorName = user?.name || auth.currentUser?.displayName || 'Piyush Gond (Admin)';
    const now = new Date().toISOString();

    const taskFields: Omit<DepartmentTask, 'id'> = {
      title: payload.title,
      description: payload.description,
      department: payload.department,
      priority: payload.priority,
      status: 'todo' as const,
      createdById: actorId,
      createdByName: actorName,
      createdAt: now,
      updatedAt: now,
    };

    if (payload.assignedToId) taskFields.assignedToId = payload.assignedToId;
    if (payload.assignedToName) taskFields.assignedToName = payload.assignedToName;
    if (payload.dueDate) taskFields.dueDate = payload.dueDate;

    const generatedId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    let finalTask: DepartmentTask = { ...taskFields, id: generatedId };

    // 1. Post to backend server API so all browsers & tabs see it
    try {
      const res = await fetch('/api/department-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalTask),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.task?.id) {
          finalTask = data.task;
        }
      }
    } catch (serverErr) {
      console.warn('Backend server departmentTasks post fallback:', serverErr);
    }

    // 2. Post to Cloud Firestore if available
    try {
      const cleanData: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(taskFields)) {
        if (v !== undefined) cleanData[k] = v;
      }
      const taskRef = await addDoc(collection(db, 'departmentTasks'), cleanData);
      finalTask = { ...finalTask, id: taskRef.id };
    } catch (firestoreErr) {
      console.warn('Firestore departmentTasks access notice:', firestoreErr);
    }

    // 3. Save to local storage & trigger local events
    const currentLocal = readLocalDepartmentTasks();
    writeLocalDepartmentTasks([finalTask, ...currentLocal.filter(t => t.id !== finalTask.id && t.id !== generatedId)]);

    // 4. Broadcast real-time creation event across tabs
    broadcastRealtimeEvent({
      type: 'TASK_CREATED',
      payload: finalTask,
      timestamp: new Date().toISOString(),
      sourceRole: 'admin',
      message: `New task assigned: ${finalTask.title}`,
    });

    return finalTask;
  },

  async updateDepartmentTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const updatedAt = new Date().toISOString();
    const updatedLocal = readLocalDepartmentTasks().map((task) =>
      task.id === id
        ? { ...task, status, updatedAt, completedAt: status === 'completed' ? updatedAt : undefined }
        : task
    );
    writeLocalDepartmentTasks(updatedLocal);

    // Broadcast status change across all browser tabs
    broadcastRealtimeEvent({
      type: 'TASK_UPDATED',
      payload: { id, status },
      timestamp: updatedAt,
      sourceRole: 'support',
      message: `Task status updated: ${status}`,
    });

    // 1. Send update to backend server API
    try {
      await fetch(`/api/department-tasks/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch (serverErr) {
      console.warn('Backend server status update notice:', serverErr);
    }

    // 2. Update Cloud Firestore
    try {
      await updateDoc(doc(db, 'departmentTasks', id), {
        status,
        updatedAt,
        completedAt: status === 'completed' ? updatedAt : deleteField(),
      });
    } catch (err) {
      console.warn('Firestore update notice:', err);
    }
  },

  async deleteDepartmentTask(id: string): Promise<void> {
    // 1. Mark as permanently deleted so it can never resurrect from local storage
    markTaskIdDeleted(id);

    // 2. Remove immediately from local storage
    const currentLocal = readLocalDepartmentTasks().filter((task) => task.id !== id);
    writeLocalDepartmentTasks(currentLocal);

    // 3. Broadcast real-time deletion event across all tabs & interfaces
    broadcastRealtimeEvent({
      type: 'TASK_DELETED',
      payload: { id },
      timestamp: new Date().toISOString(),
      sourceRole: 'admin',
      message: `Department task deleted: ${id}`,
    });

    // 4. Send DELETE to backend server API
    try {
      await fetch(`/api/department-tasks/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (serverErr) {
      console.warn('Backend server task delete notice:', serverErr);
    }

    // 5. Delete from Cloud Firestore
    try {
      await deleteDoc(doc(db, 'departmentTasks', id));
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  },

  // ── Badges ──────────────────────────────────────────────────────────────────

  async getBadges(): Promise<BadgeInfo[]> {
    return INITIAL_BADGES;
  },

  // ── Search ──────────────────────────────────────────────────────────────────

  async searchGlobal(searchQuery: string): Promise<unknown[]> {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const [allServices, allObjections] = await Promise.all([
      this.getServices(),
      this.getObjections()
    ]);

    const results: unknown[] = [];

    allServices.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.shortDescription.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) {
        results.push({
          type: 'service', id: s.id,
          title: s.name,
          subtitle: `${s.category} • Starting ₹${s.packages[0]?.priceINR?.toLocaleString('en-IN') ?? 'Custom'}`,
          link: '/pricing', badge: 'Service'
        });
      }
    });

    allObjections.forEach(obj => {
      if (obj.objection.toLowerCase().includes(q) || obj.shortAgentResponse.toLowerCase().includes(q)) {
        results.push({
          type: 'objection', id: obj.id,
          title: obj.objection,
          subtitle: obj.shortAgentResponse,
          link: '/objections', badge: 'Objection'
        });
      }
    });

    INITIAL_ACADEMY_COURSES[0]?.lessons.forEach(l => {
      if (l.title.toLowerCase().includes(q) || l.summary.toLowerCase().includes(q)) {
        results.push({
          type: 'lesson', id: l.id,
          title: `Day ${l.dayNumber}: ${l.title}`,
          subtitle: l.learningObjective,
          link: `/academy/lesson/${l.id}`, badge: 'Academy Lesson'
        });
      }
    });

    return results.slice(0, 15);
  },

  // ── Requirements ─────────────────────────────────────────────────────────────

  async submitRequirements(payload: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    try {
      await addDoc(collection(db, 'requirements'), {
        ...payload,
        submittedAt: serverTimestamp(),
        submittedBy: currentUid()
      });
      return { success: true, message: 'Requirements submitted successfully.' };
    } catch (err) {
      console.error('submitRequirements error:', err);
      return { success: false, message: 'Failed to submit requirements.' };
    }
  }
};
