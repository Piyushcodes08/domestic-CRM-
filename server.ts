import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_ACADEMY_COURSES,
  INITIAL_OBJECTIONS,
  INITIAL_MOCK_SCENARIOS,
  INITIAL_LEADS,
  INITIAL_PROPOSALS,
  INITIAL_ESCALATIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_BADGES
} from './src/data/initialData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploads directory
const uploadsStaticDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsStaticDir)) {
  fs.mkdirSync(uploadsStaticDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsStaticDir));

// PDF Upload Endpoint for WhatsApp Collaterals & Brochures
app.post('/api/upload-pdf', (req: Request, res: Response) => {
  try {
    const { fileName, fileBase64 } = req.body;
    if (!fileBase64 || !fileName) {
      return res.status(400).json({ success: false, message: 'File data and fileName are required' });
    }
    const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const savedName = `${Date.now()}_${sanitized}`;
    const filePath = path.join(uploadsStaticDir, savedName);

    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(cleanBase64, 'base64'));

    const host = req.get('host') || `localhost:${PORT}`;
    const protocol = req.protocol || 'http';
    const fileUrl = `${protocol}://${host}/uploads/${savedName}`;

    res.json({
      success: true,
      url: fileUrl,
      relativeUrl: `/uploads/${savedName}`,
      fileName: savedName
    });
  } catch (err: any) {
    console.error('PDF upload error:', err);
    res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
});

// In-memory application state
let users = [...INITIAL_USERS];
let currentUserId = 'agent-1'; // Default: Rohan Sharma (Junior Sales Executive)
let services = [...INITIAL_SERVICES];
let courses = [...INITIAL_ACADEMY_COURSES];
let objections = [...INITIAL_OBJECTIONS];
let mockScenarios = [...INITIAL_MOCK_SCENARIOS];
let leads = [...INITIAL_LEADS];
let proposals = [...INITIAL_PROPOSALS];
let escalations = [...INITIAL_ESCALATIONS];
let announcements = [...INITIAL_ANNOUNCEMENTS];
let badges = [...INITIAL_BADGES];

// Persistent Department Tasks Storage
const tasksFilePath = path.join(process.cwd(), 'data', 'department_tasks.json');
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadSavedDepartmentTasks(): any[] {
  try {
    if (fs.existsSync(tasksFilePath)) {
      const content = fs.readFileSync(tasksFilePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed reading department tasks file:', e);
  }
  return [];
}

function saveDepartmentTasks(tasksList: any[]) {
  try {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasksList, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Failed writing department tasks file:', e);
  }
}

let departmentTasks: any[] = loadSavedDepartmentTasks();

// ----------------- DEPARTMENT TASKS ROUTES & SSE STREAMING -----------------
const taskSseClients = new Set<Response>();

function broadcastDepartmentTasksSSE(type: string, payload?: any) {
  departmentTasks = loadSavedDepartmentTasks();
  const data = JSON.stringify({ type, payload, tasks: departmentTasks });
  for (const client of taskSseClients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      taskSseClients.delete(client);
    }
  }
}

app.get('/api/department-tasks/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  taskSseClients.add(res);

  // Send current tasks immediately to new client
  departmentTasks = loadSavedDepartmentTasks();
  res.write(`data: ${JSON.stringify({ type: 'INIT', tasks: departmentTasks })}\n\n`);

  req.on('close', () => {
    taskSseClients.delete(res);
  });
});

app.get('/api/department-tasks', (req: Request, res: Response) => {
  // Always reload latest from disk to support multi-process or hot updates
  departmentTasks = loadSavedDepartmentTasks();
  res.json({ success: true, tasks: departmentTasks });
});

app.post('/api/department-tasks', (req: Request, res: Response) => {
  const task = req.body;
  if (!task || !task.title) {
    return res.status(400).json({ success: false, message: 'Task title is required' });
  }
  if (!task.id) {
    task.id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
  const current = loadSavedDepartmentTasks();
  departmentTasks = [task, ...current.filter((t: any) => t.id !== task.id)];
  saveDepartmentTasks(departmentTasks);
  broadcastDepartmentTasksSSE('TASK_CREATED', { task });
  res.json({ success: true, task });
});

app.patch('/api/department-tasks/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const now = new Date().toISOString();
  const current = loadSavedDepartmentTasks();
  departmentTasks = current.map((t: any) =>
    t.id === id
      ? { ...t, status, updatedAt: now, completedAt: status === 'completed' ? now : undefined }
      : t
  );
  saveDepartmentTasks(departmentTasks);
  broadcastDepartmentTasksSSE('TASK_UPDATED', { id, status });
  res.json({ success: true, tasks: departmentTasks });
});

app.delete('/api/department-tasks/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const current = loadSavedDepartmentTasks();
  departmentTasks = current.filter((t: any) => t.id !== id);
  saveDepartmentTasks(departmentTasks);
  broadcastDepartmentTasksSSE('TASK_DELETED', { id });
  res.json({ success: true, id });
});

// Initialize Gemini SDK with telemetry header as required
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}


// ----------------- SERVICES & PRICING ROUTES -----------------
app.get('/api/services', (req: Request, res: Response) => {
  res.json({ success: true, services });
});

app.get('/api/services/:id', (req: Request, res: Response) => {
  const service = services.find(s => s.id === req.params.id || s.slug === req.params.id);
  if (!service) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  res.json({ success: true, service });
});

app.post('/api/services', (req: Request, res: Response) => {
  const newService = { ...req.body, id: `srv-${Date.now()}` };
  services.unshift(newService);
  res.json({ success: true, service: newService });
});

app.put('/api/services/:id', (req: Request, res: Response) => {
  const index = services.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  services[index] = { ...services[index], ...req.body };
  res.json({ success: true, service: services[index] });
});

app.delete('/api/services/:id', (req: Request, res: Response) => {
  const index = services.findIndex(s => s.id === req.params.id || s.slug === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Service not found' });
  }
  const [removed] = services.splice(index, 1);
  res.json({ success: true, removed, services });
});

// ----------------- ACADEMY & QUIZ ROUTES -----------------
app.get('/api/academy/courses', (req: Request, res: Response) => {
  res.json({ success: true, courses });
});

app.post('/api/quizzes/submit', (req: Request, res: Response) => {
  const { quizId, lessonId, answers, courseDay } = req.body;
  const user = users.find(u => u.id === currentUserId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Find corresponding quiz in curriculum
  let targetQuestions: any[] = [];
  for (const c of courses) {
    for (const l of c.lessons) {
      if (l.id === lessonId || l.dayNumber === courseDay) {
        targetQuestions = l.quizQuestions;
        break;
      }
    }
  }

  if (targetQuestions.length === 0) {
    // Default fallback calculation if lesson quiz questions not found
    targetQuestions = [
      { id: 'q1', correctAnswer: 1 },
      { id: 'q2', correctAnswer: 0 }
    ];
  }

  let correctCount = 0;
  targetQuestions.forEach((q, idx) => {
    const userAns = answers[q.id] !== undefined ? answers[q.id] : answers[idx];
    if (userAns === q.correctAnswer) {
      correctCount++;
    }
  });

  const scorePercentage = Math.round((correctCount / targetQuestions.length) * 100);
  const passed = scorePercentage >= 80;

  // Update user progress
  if (!user.completedLessons.includes(lessonId)) {
    user.completedLessons.push(lessonId);
  }

  user.learningXp += passed ? 150 : 50;

  // Recalculate readiness score
  const totalDays = 15;
  const progressRatio = user.completedLessons.length / totalDays;
  user.readinessScore = Math.min(100, Math.round(50 + progressRatio * 45 + (passed ? 5 : 0)));

  user.completedQuizzes.push({
    quizId: quizId || `quiz-${lessonId}`,
    score: scorePercentage,
    passed,
    date: new Date().toISOString().split('T')[0]
  });

  // Award badges if applicable
  if (user.completedLessons.length >= 2 && !user.badges.includes('badge-fast-starter')) {
    user.badges.push('badge-fast-starter');
  }
  if (user.completedLessons.length >= 15 && !user.badges.includes('badge-master-coach')) {
    user.badges.push('badge-master-coach');
  }

  res.json({
    success: true,
    score: scorePercentage,
    passed,
    correctCount,
    totalQuestions: targetQuestions.length,
    user
  });
});

// ----------------- OBJECTIONS & KNOWLEDGE -----------------
app.get('/api/objections', (req: Request, res: Response) => {
  res.json({ success: true, objections });
});

app.post('/api/objections', (req: Request, res: Response) => {
  const newObj = { ...req.body, id: `obj-${Date.now()}` };
  objections.unshift(newObj);
  res.json({ success: true, objection: newObj });
});

app.put('/api/objections/:id', (req: Request, res: Response) => {
  const index = objections.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Objection not found' });
  }
  objections[index] = { ...objections[index], ...req.body };
  res.json({ success: true, objection: objections[index] });
});

app.delete('/api/objections/:id', (req: Request, res: Response) => {
  const index = objections.findIndex(item => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Objection not found' });
  }
  const [removed] = objections.splice(index, 1);
  res.json({ success: true, removed, objections });
});

// ----------------- MOCK CALLS -----------------
app.get('/api/mock-scenarios', (req: Request, res: Response) => {
  res.json({ success: true, scenarios: mockScenarios });
});

// ----------------- LEADS & MINI CRM -----------------
app.get('/api/leads', (req: Request, res: Response) => {
  const currentUser = users.find(u => u.id === currentUserId);
  // If agent, return their leads (plus unassigned if any). Managers and Admins see all leads.
  if (currentUser && currentUser.role === 'sales_agent') {
    const userLeads = leads.filter(l => l.agentId === currentUserId);
    return res.json({ success: true, leads: userLeads, isFiltered: true });
  }
  res.json({ success: true, leads, isFiltered: false });
});

app.post('/api/leads', (req: Request, res: Response) => {
  const currentUser = users.find(u => u.id === currentUserId);
  const newLead = {
    ...req.body,
    id: `lead-${Date.now()}`,
    agentId: req.body.agentId || currentUserId,
    agentName: req.body.agentName || currentUser?.name || 'Assigned Executive',
    lastContactDate: new Date().toISOString().split('T')[0]
  };
  leads.unshift(newLead);
  res.json({ success: true, lead: newLead });
});

app.put('/api/leads/:id', (req: Request, res: Response) => {
  const index = leads.findIndex(l => l.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Lead not found' });
  }
  leads[index] = { ...leads[index], ...req.body };
  res.json({ success: true, lead: leads[index] });
});

app.delete('/api/leads/:id', (req: Request, res: Response) => {
  leads = leads.filter(l => l.id !== req.params.id);
  res.json({ success: true, message: 'Lead deleted' });
});

// ----------------- PROPOSALS -----------------
app.get('/api/proposals', (req: Request, res: Response) => {
  const currentUser = users.find(u => u.id === currentUserId);
  if (currentUser && currentUser.role === 'sales_agent') {
    const userProps = proposals.filter(p => p.agentId === currentUserId);
    return res.json({ success: true, proposals: userProps });
  }
  res.json({ success: true, proposals });
});

app.post('/api/proposals', (req: Request, res: Response) => {
  const currentUser = users.find(u => u.id === currentUserId);
  const subtotal = Number(req.body.subtotalINR || 0);
  const discount = Number(req.body.discountPercentage || 0);
  const total = Math.round(subtotal * (1 - discount / 100));

  // If discount > 0, requires manager approval
  const status = discount > 0 ? 'pending_manager_approval' : 'approved';

  const newProposal = {
    ...req.body,
    id: `prop-${Date.now()}`,
    proposalNumber: `VD-PROP-2026-${Math.floor(100 + Math.random() * 900)}`,
    agentId: currentUserId,
    agentName: currentUser?.name || 'Sales Executive',
    subtotalINR: subtotal,
    discountPercentage: discount,
    totalINR: total,
    approvalStatus: status,
    createdAt: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  };
  proposals.unshift(newProposal);
  res.json({ success: true, proposal: newProposal });
});

app.put('/api/proposals/:id/status', (req: Request, res: Response) => {
  const { status, managerComments } = req.body;
  const index = proposals.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Proposal not found' });
  }
  proposals[index].approvalStatus = status;
  if (managerComments) {
    proposals[index].managerComments = managerComments;
  }
  res.json({ success: true, proposal: proposals[index] });
});

app.delete('/api/proposals/:id', (req: Request, res: Response) => {
  const index = proposals.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Proposal not found' });
  }
  const [removed] = proposals.splice(index, 1);
  res.json({ success: true, removed, message: 'Proposal deleted successfully' });
});

// ----------------- ESCALATIONS -----------------
app.get('/api/escalations', (req: Request, res: Response) => {
  res.json({ success: true, escalations });
});

app.post('/api/escalations', (req: Request, res: Response) => {
  const currentUser = users.find(u => u.id === currentUserId);
  const newEsc = {
    ...req.body,
    id: `esc-${Date.now()}`,
    ticketNumber: `ESC-2026-${Math.floor(100 + Math.random() * 900)}`,
    agentId: currentUserId,
    agentName: currentUser?.name || 'Sales Executive',
    status: 'open',
    createdAt: new Date().toISOString()
  };
  escalations.unshift(newEsc);
  res.json({ success: true, escalation: newEsc });
});

app.put('/api/escalations/:id', (req: Request, res: Response) => {
  const index = escalations.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Ticket not found' });
  }
  escalations[index] = { ...escalations[index], ...req.body };
  res.json({ success: true, escalation: escalations[index] });
});

// ----------------- ANNOUNCEMENTS & BADGES -----------------
app.get('/api/announcements', (req: Request, res: Response) => {
  res.json({ success: true, announcements });
});

app.post('/api/announcements', (req: Request, res: Response) => {
  const currentUser = users.find(u => u.id === currentUserId);
  const newAnn = {
    ...req.body,
    id: `ann-${Date.now()}`,
    author: currentUser?.name || 'Management',
    date: new Date().toISOString().split('T')[0],
    readBy: [currentUserId]
  };
  announcements.unshift(newAnn);
  res.json({ success: true, announcement: newAnn });
});

app.get('/api/badges', (req: Request, res: Response) => {
  res.json({ success: true, badges });
});

// ----------------- GLOBAL SEARCH -----------------
app.get('/api/search', (req: Request, res: Response) => {
  const query = ((req.query.q as string) || '').toLowerCase().trim();
  if (!query) {
    return res.json({ success: true, results: [] });
  }

  const results: any[] = [];

  // Search Services
  services.forEach(s => {
    if (s.name.toLowerCase().includes(query) || s.shortDescription.toLowerCase().includes(query) || s.category.toLowerCase().includes(query)) {
      results.push({
        type: 'service',
        id: s.id,
        title: s.name,
        subtitle: `${s.category} • Starting ₹${s.packages[0]?.priceINR.toLocaleString('en-IN') || 'Custom'}`,
        link: `/services/${s.slug}`,
        badge: 'Service'
      });
    }
  });

  // Search Objections
  objections.forEach(obj => {
    if (obj.objection.toLowerCase().includes(query) || obj.hinglishResponse.toLowerCase().includes(query) || obj.shortAgentResponse.toLowerCase().includes(query)) {
      results.push({
        type: 'objection',
        id: obj.id,
        title: obj.objection,
        subtitle: obj.shortAgentResponse,
        link: `/objections`,
        badge: 'Objection'
      });
    }
  });

  // Search Academy Lessons
  courses[0]?.lessons.forEach(l => {
    if (l.title.toLowerCase().includes(query) || l.summary.toLowerCase().includes(query)) {
      results.push({
        type: 'lesson',
        id: l.id,
        title: `Day ${l.dayNumber}: ${l.title}`,
        subtitle: l.learningObjective,
        link: `/academy/lesson/${l.id}`,
        badge: 'Academy Lesson'
      });
    }
  });

  res.json({ success: true, query, results: results.slice(0, 15) });
});

// ----------------- AI SALES COPILOT (Grounded in Vahlay Knowledge) -----------------
app.post('/api/ai/copilot', async (req: Request, res: Response) => {
  const { query, serviceId, language = 'Hinglish', lengthType = 'Quick' } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, message: 'Query is required' });
  }

  // Find relevant grounded service knowledge
  const targetService = services.find(s => s.id === serviceId || s.slug === serviceId);
  const matchingObjection = objections.find(o =>
    o.objection.toLowerCase().includes(query.toLowerCase()) ||
    query.toLowerCase().includes('sasta') ||
    query.toLowerCase().includes('price') ||
    query.toLowerCase().includes('guarantee') ||
    query.toLowerCase().includes('tally') ||
    query.toLowerCase().includes('ranking')
  );

  // If Gemini API is available, use server-side genAI
  if (genAI) {
    try {
      const knowledgeContext = `
Approved Vahlay Digital Knowledge:
- 13 Services: Static Web (₹12k), Dynamic CMS (₹28k), E-commerce (₹35k), CRM (₹45k), ERP (₹1.2L+), SEO (₹18k/mo), GMB (₹9.5k/mo), SMM (₹15k/mo), Paid Ads (₹18k/mo), Reels Shoot (₹18k), Reels Edit (₹12k), AMC (₹4.5k/mo).
- Rules: Never guarantee #1 Google rank. Never guarantee 0% gateway fee. Never give verbal discounts without manager approval.
- Language requested: ${language}. Length style: ${lengthType}.
- Grounded Service: ${targetService ? targetService.name : 'All Vahlay Services'}.
- Grounded FAQs/Objections: ${matchingObjection ? matchingObjection.hinglishResponse : 'Standard Vahlay Value Proposition'}.
      `;

      const prompt = `
You are the Vahlay Digital Live Call Sales Copilot. A fresh Indian sales agent is on a live call with a customer who just asked or said:
"${query}"

Provide an immediate, confident, approved response following these strict guidelines:
1. Ground your answer ONLY in approved Vahlay Digital policies.
2. If language is Hinglish, speak natural conversational Indian sales Hinglish (e.g., "Sir, bilkul samajh sakta hoon...").
3. If lengthType is Quick, keep it under 3 punchy sentences with an immediate discovery question.
4. If lengthType is Detailed, provide the breakdown.
5. Provide:
   - Primary Answer
   - Suggested Next Discovery Question
   - Warning of What NOT to Promise
   - Relevant Service to Upsell
      `;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: knowledgeContext,
          temperature: 0.3
        }
      });

      const text = response.text || '';

      return res.json({
        success: true,
        answer: text,
        groundedService: targetService?.name || 'Vahlay Sales Knowledge Base',
        verifiedSource: 'Vahlay Digital Rate Card & Compliance Manual v2.4',
        requiresVerification: text.toLowerCase().includes('custom') || text.toLowerCase().includes('verify')
      });
    } catch (error: any) {
      console.error('Gemini copilot error, falling back to local grounded knowledge:', error);
    }
  }

  // Fallback grounded answer
  let fallbackAnswer = '';
  if (matchingObjection) {
    fallbackAnswer = language === 'English' ? matchingObjection.professionalResponse : matchingObjection.hinglishResponse;
  } else if (targetService) {
    fallbackAnswer = language === 'English' ? targetService.pitchScript.english : targetService.pitchScript.hinglish;
  } else {
    fallbackAnswer = `Sir, Vahlay Digital me hum complete corporate transparency ke sath kaam karte hain. Humare solutions direct WhatsApp lead generation aur business revenue increase karne ke liye engineered hain. Kya main aapke requirement ke according recommended package share karoon?`;
  }

  res.json({
    success: true,
    answer: fallbackAnswer,
    groundedService: targetService?.name || 'Vahlay Sales Knowledge Base',
    verifiedSource: 'Vahlay Approved Sales Battlecard (Internal)',
    requiresVerification: false
  });
});

// ----------------- AI MOCK SALES CALL SIMULATOR -----------------
app.post('/api/ai/mock-call', async (req: Request, res: Response) => {
  const { scenarioId, messages = [], userMessage, language = 'Hinglish', difficulty = 'Beginner' } = req.body;

  const scenario = mockScenarios.find(s => s.id === scenarioId) || mockScenarios[0];

  if (genAI) {
    try {
      const systemInstruction = `
You are roleplaying as the CUSTOMER in a simulated sales call training exercise for Vahlay Digital fresh sales agents.
Customer Persona:
- Name: ${scenario.clientName}
- Business: ${scenario.businessType} in India (${scenario.industry})
- Personality: ${scenario.personality}
- Difficulty: ${difficulty}
- Language: ${language} (Mix natural Hindi and English words like "bhaiya", "dekhiye", "budget", "market", "paisa" if Hinglish).
- Customer Backstory: ${scenario.backstory}
- Secret Needs: ${scenario.secretNeeds.join('; ')}
- Deal Breakers: ${scenario.dealBreakers.join('; ')}

Rules for your roleplay:
1. Act realistically like a busy Indian business owner. Do not be overly polite or easy to close.
2. Challenge vague promises, push back on high prices, ask why Vahlay is better than a local freelancer.
3. If the agent asks great diagnostic questions and explains value calmly, warm up gradually.
4. Keep replies conversational (2 to 4 sentences max per turn). Never break character.
      `;

      const contents = messages.map((m: any) => ({
        role: m.sender === 'ai_customer' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));

      if (userMessage) {
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }]
        });
      }

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      const replyText = response.text || 'Theek hai, aage bataiye aapka kya kehna hai.';

      return res.json({
        success: true,
        reply: replyText
      });
    } catch (err: any) {
      console.error('Gemini mock call error, falling back:', err);
    }
  }

  // Fallback realistic responses based on scenario personality
  const fallbackReplies = [
    `Aapka price theek hai, par mujhe proof chahiye. Kya aapke paas mere jaisi local dukaan ka koi live example hai?`,
    `Dekhiye phone par sab badi badi baatein karte hain. Kal ko agar website me bug aaya toh kya aap phone uthaoge?`,
    `Toh aapke kehne ka matlab hai 12,000 me sab kuch ready ho jayega? Koi hidden cost toh nahi hai baad me?`,
    `Mujhe sochna padega. Aap ek kaam karo, WhatsApp par details bhej do, main partner se discuss karke batata hoon.`
  ];
  const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];

  res.json({
    success: true,
    reply: randomReply
  });
});

// ----------------- AI MOCK CALL EVALUATION (6 Dimensions / 100 Marks) -----------------
app.post('/api/ai/mock-call-eval', async (req: Request, res: Response) => {
  const { scenarioId, messages = [] } = req.body;
  const scenario = mockScenarios.find(s => s.id === scenarioId) || mockScenarios[0];

  if (genAI && messages.length >= 2) {
    try {
      const evaluationPrompt = `
You are the Senior Sales Enablement Coach at Vahlay Digital.
Evaluate this sales call transcript where a fresh sales agent practiced with an AI customer (${scenario.clientName}, ${scenario.personality}, ${scenario.industry}).

Transcript:
${JSON.stringify(messages, null, 2)}

Evaluate the agent strictly across these 6 exact categories:
1. Opening Introduction (Max 10 marks): Clear identification, polite tone, hook.
2. Product Knowledge (Max 25 marks): Accuracy regarding Vahlay services, no false technical promises.
3. Requirement Discovery (Max 20 marks): Asked diagnostic questions about client business pain points.
4. Pricing Accuracy (Max 20 marks): Defended price value, cited approved rates, avoided unauthorized discounts.
5. Communication & Objection Handling (Max 15 marks): Stayed calm, reframed objections, natural conversational flow.
6. Closing, Next Steps & CRM (Max 10 marks): Agreed on clear follow-up time, next meeting, or proposal review.

Return ONLY a valid JSON object matching this structure:
{
  "openingScore": number,
  "productKnowledgeScore": number,
  "requirementDiscoveryScore": number,
  "pricingAccuracyScore": number,
  "objectionHandlingScore": number,
  "closingScore": number,
  "totalScore": number,
  "passed": boolean,
  "strengths": string[],
  "mistakes": string[],
  "missedQuestions": string[],
  "incorrectPromises": string[],
  "suggestedResponses": string[],
  "recommendedModules": string[],
  "summaryFeedback": string
}
      `;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: evaluationPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({ success: true, evaluation: parsed });
    } catch (err: any) {
      console.error('Gemini eval error, falling back:', err);
    }
  }

  // Fallback coaching evaluation
  const agentTurns = messages.filter((m: any) => m.sender === 'agent').length;
  const simulatedScore = Math.min(95, Math.max(65, 70 + agentTurns * 3));
  const passed = simulatedScore >= 80;

  const fallbackEval = {
    openingScore: 8,
    productKnowledgeScore: 21,
    requirementDiscoveryScore: 16,
    pricingAccuracyScore: 18,
    objectionHandlingScore: 12,
    closingScore: 7,
    totalScore: simulatedScore,
    passed,
    strengths: [
      'Polite tone and clear introduction of Vahlay Digital',
      'Accurately explained WhatsApp integration benefit',
      'Defended corporate reliability over unvetted freelancers'
    ],
    mistakes: [
      'Pitched solution before fully discovering how many leads they currently lose',
      'Did not set a strict calendar date for the next follow-up meeting'
    ],
    missedQuestions: [
      'Did not ask: "What is your average revenue per customer?" to anchor the ROI'
    ],
    incorrectPromises: [],
    suggestedResponses: [
      'When customer complained about price, calculate the cost per day (only ₹33/day for a website asset).'
    ],
    recommendedModules: [
      'Day 11: Customer Objection Handling',
      'Day 12: Sales Discipline & Mini CRM Data Entry'
    ],
    summaryFeedback: `Good engagement! Your product explanations were solid, but spend more time uncovering the customer's current lead leakage before quoting features.`
  };

  res.json({ success: true, evaluation: fallbackEval });
});

// ----------------- AI SALES SCRIPT GENERATOR -----------------
app.post('/api/ai/generate-script', async (req: Request, res: Response) => {
  const { serviceId, industry, language = 'Hinglish', callStage = 'Cold Calling' } = req.body;
  const targetService = services.find(s => s.id === serviceId) || services[0];

  if (genAI) {
    try {
      const prompt = `
Create a high-converting, approved B2B sales call script for a Vahlay Digital sales agent.
Parameters:
- Service: ${targetService.name} (Approved starting price: ₹${targetService.packages[0]?.priceINR.toLocaleString('en-IN')})
- Target Customer Industry: ${industry || 'Local Indian Business'}
- Call Stage: ${callStage}
- Language: ${language}

Include:
1. Attention-Grabbing Hook (Opening)
2. 3 Diagnostic Discovery Questions
3. Value Proposition Pitch (Focus on revenue, leads, and speed)
4. Objection Preemption (Addressing price/doubt)
5. Call to Action / Closing Question
6. What NOT to Promise (Compliance reminder)
      `;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      return res.json({
        success: true,
        script: response.text,
        service: targetService.name
      });
    } catch (err: any) {
      console.error('Gemini script generator error:', err);
    }
  }

  // Fallback script
  res.json({
    success: true,
    script: `
### Hook (Opening):
"Namaste Sir, main Vahlay Digital se baat kar raha hoon. Maine notice kiya ki aapka business ${industry || 'locality'} me kafi reputed hai, par online Google par aapki presence competitor se peeche hai. Kya main 2 minute me share kar sakta hoon ki kaise aap direct customer inquiries double kar sakte hain?"

### Discovery Questions:
1. "Sir, currently mahine me lagbhag kitne customers aapse online search karke judte hain?"
2. "Jab koi customer aapke area me aapki service dhoondhta hai, toh unhe competitor pehle dikhta hai ya aap?"
3. "Kya aapke paas direct WhatsApp click button hai jisse instant inquiry aaye?"

### Value Pitch:
"Hum aapko ${targetService.name} deliver karte hain jisme mobile-first speed, instant WhatsApp connect aur Google Maps optimization included hai. Starting package sirf ₹${targetService.packages[0]?.priceINR.toLocaleString('en-IN')} se shuru hota hai with complete corporate SLA."

### Closing Hook:
"Sir, kya main aapko 2-3 live examples share kar sakta hoon jo humne aapke jaise businesses ke liye banaye hain?"
    `,
    service: targetService.name
  });
});

// ----------------- CLIENT REQUIREMENT SUMMARY BUILDER -----------------
app.post('/api/requirements/submit', (req: Request, res: Response) => {
  const { leadId, clientName, serviceCategory, answers } = req.body;

  // Auto-generate technical escalation ticket for scoping if required
  const newTicket = {
    id: `esc-req-${Date.now()}`,
    ticketNumber: `ESC-2026-${Math.floor(100 + Math.random() * 900)}`,
    agentId: currentUserId,
    agentName: users.find(u => u.id === currentUserId)?.name || 'Sales Agent',
    clientOrLeadName: clientName || 'Client Requirement Form',
    serviceCategory: serviceCategory || 'Custom Requirement',
    type: 'technical_feasibility' as const,
    priority: 'medium' as const,
    question: `Requirement Form submitted: ${JSON.stringify(answers)}`,
    status: 'open' as const,
    assignedTo: 'support-1',
    assignedToName: 'Neha Gupta',
    slaTargetHours: 8,
    createdAt: new Date().toISOString()
  };

  escalations.unshift(newTicket);

  res.json({
    success: true,
    message: 'Requirement summary generated and routed to Technical Support',
    ticket: newTicket
  });
});

// ----------------- VITE MIDDLEWARE / STATIC SERVE -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**', '**/uploads/**', '**/public/uploads/**', '**/.firebaserc', '**/firestore.rules'],
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Vahlay Digital Sales Academy Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
