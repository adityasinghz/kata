import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize empty DB if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    interviews: [],
    auditLogs: [],
    nextIdCounter: 1000
  }, null, 2));
}

// Load data
function loadDB() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading DB:", err);
    return { interviews: [], auditLogs: [], nextIdCounter: 1000 };
  }
}

// Save data
function saveDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing DB:", err);
  }
}

// Generate unique ID
function generateId(prefix = 'INT') {
  const db = loadDB();
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  db.nextIdCounter++;
  saveDB(db);
  return `${prefix}-${date}-${db.nextIdCounter}`;
}

// === Interview CRUD ===
export function getAllInterviews() {
  return loadDB().interviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getInterview(id) {
  return loadDB().interviews.find(i => i.id === id) || null;
}

export function createInterview(config) {
  const db = loadDB();
  const interview = {
    id: generateId('INT'),
    role: config.role,
    level: config.level,
    skills: config.skills,
    jdText: config.jdText || '',
    resumeText: config.resumeText || '',
    candidateName: config.candidateName || 'Candidate',
    createdBy: 'Hiring Manager',
    status: 'DRAFT',
    questionCount: 0,
    responseCount: 0,
    progress: 0,
    coverageMap: { TECHNICAL: 0, BEHAVIORAL: 0, PROBLEM_SOLVING: 0, SYSTEM_DESIGN: 0 },
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    scores: null,
    review: null,
    questions: [],
    responses: [],
    costRecord: {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCostUsd: 0,
      modelUsed: 'gpt-4o-mini',
      totalApiCalls: 0,
      avgLatencyMs: 0,
      breakdown: []
    }
  };

  db.interviews.push(interview);
  saveDB(db);
  return interview;
}

export function updateInterview(id, updates) {
  const db = loadDB();
  const idx = db.interviews.findIndex(i => i.id === id);
  if (idx === -1) return null;
  db.interviews[idx] = { ...db.interviews[idx], ...updates };
  saveDB(db);
  return db.interviews[idx];
}

export function addQuestions(interviewId, questions) {
  const db = loadDB();
  const idx = db.interviews.findIndex(i => i.id === interviewId);
  const interview = db.interviews.find(i => i.id === interviewId);
  if (!interview) return null;
  interview.questions = questions;
  interview.questionCount = questions.length;
  saveDB(db);
  return interview;
}

export function addResponse(interviewId, response) {
  const db = loadDB();
  const interview = db.interviews.find(i => i.id === interviewId);
  if (!interview) return null;
  interview.responses.push(response);
  interview.responseCount = interview.responses.length;
  saveDB(db);
  return interview;
}

export function setInterviewScores(interviewId, scores) {
  const db = loadDB();
  const interview = db.interviews.find(i => i.id === interviewId);
  if (!interview) return null;
  interview.scores = scores;
  saveDB(db);
  return interview;
}

export function submitReview(interviewId, review) {
  const db = loadDB();
  const interview = db.interviews.find(i => i.id === interviewId);
  if (!interview) return null;
  interview.review = {
    ...review,
    decidedAt: new Date().toISOString()
  };
  interview.status = 'REVIEWED';
  saveDB(db);
  return interview;
}

// === Audit Log ===
export function addAuditLog(entry) {
  const db = loadDB();
  const log = {
    id: generateId('AL'),
    ...entry,
    createdAt: new Date().toISOString()
  };
  db.auditLogs.push(log);
  saveDB(db);
  return log;
}

export function getAuditLogs(filters = {}) {
  let logs = [...loadDB().auditLogs];
  if (filters.interviewId) {
    logs = logs.filter(l => l.interviewId === filters.interviewId);
  }
  if (filters.agentName) {
    logs = logs.filter(l => l.agentName === filters.agentName);
  }
  return logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// === Cost Tracking ===
export function updateCostRecord(interviewId, agentName, inputTokens, outputTokens) {
  const db = loadDB();
  const interview = db.interviews.find(i => i.id === interviewId);
  if (!interview) return null;

  const cost = interview.costRecord;
  cost.totalInputTokens += inputTokens;
  cost.totalOutputTokens += outputTokens;

  // OpenAI gpt-4o-mini pricing: $0.150 per 1M input, $0.600 per 1M output
  const callCost = (inputTokens * 0.150 + outputTokens * 0.600) / 1000000;
  cost.totalCostUsd += callCost;
  cost.totalApiCalls += 1;

  let agentEntry = cost.breakdown.find(b => b.agent === agentName);
  if (agentEntry) {
    agentEntry.inputTokens += inputTokens;
    agentEntry.outputTokens += outputTokens;
    agentEntry.cost += callCost;
    agentEntry.calls += 1;
  } else {
    cost.breakdown.push({
      agent: agentName,
      inputTokens,
      outputTokens,
      cost: callCost,
      calls: 1
    });
  }

  saveDB(db);
  return cost;
}

export function getAggregateCosts() {
  const allInterviews = loadDB().interviews;
  const completed = allInterviews.filter(i => i.costRecord && i.costRecord.totalApiCalls > 0);

  const totalCost = completed.reduce((sum, i) => sum + i.costRecord.totalCostUsd, 0);
  const totalTokens = completed.reduce((sum, i) => sum + i.costRecord.totalInputTokens + i.costRecord.totalOutputTokens, 0);
  const totalCalls = completed.reduce((sum, i) => sum + i.costRecord.totalApiCalls, 0);

  const agentMap = {};
  completed.forEach(i => {
    i.costRecord.breakdown.forEach(b => {
      if (!agentMap[b.agent]) {
        agentMap[b.agent] = { agent: b.agent, totalCost: 0, totalCalls: 0, totalTokens: 0 };
      }
      agentMap[b.agent].totalCost += b.cost;
      agentMap[b.agent].totalCalls += b.calls;
      agentMap[b.agent].totalTokens += b.inputTokens + b.outputTokens;
    });
  });

  return {
    totalInterviews: completed.length,
    totalCostUsd: totalCost,
    avgCostPerInterview: completed.length > 0 ? totalCost / completed.length : 0,
    totalTokens,
    totalCalls,
    byAgent: Object.values(agentMap),
    trend: completed.map(i => ({
      date: i.createdAt.slice(0, 10),
      interviews: 1,
      cost: i.costRecord.totalCostUsd,
      tokens: i.costRecord.totalInputTokens + i.costRecord.totalOutputTokens
    }))
  };
}

// === Dashboard Stats ===
export function getDashboardStats() {
  const all = loadDB().interviews;
  return {
    totalInterviews: all.length,
    completed: all.filter(i => i.status === 'COMPLETED' || i.status === 'REVIEWED').length,
    inProgress: all.filter(i => i.status === 'IN_PROGRESS').length,
    pendingReview: all.filter(i => i.status === 'COMPLETED').length,
    reviewed: all.filter(i => i.status === 'REVIEWED').length,
    totalCost: all.reduce((sum, i) => sum + (i.costRecord?.totalCostUsd || 0), 0),
    avgConfidence: (() => {
      const scored = all.filter(i => i.scores?.overallConfidence);
      return scored.length > 0
        ? scored.reduce((sum, i) => sum + i.scores.overallConfidence, 0) / scored.length
        : 0;
    })(),
    recommendations: {
      STRONG_HIRE: all.filter(i => i.scores?.aiRecommendation === 'STRONG_HIRE').length,
      HIRE: all.filter(i => i.scores?.aiRecommendation === 'HIRE').length,
      MAYBE: all.filter(i => i.scores?.aiRecommendation === 'MAYBE').length,
      NO_HIRE: all.filter(i => i.scores?.aiRecommendation === 'NO_HIRE').length
    }
  };
}
