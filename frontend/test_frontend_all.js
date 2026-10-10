// Frontend Comprehensive Unit & Service Test Suite with Environment Polyfills
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Blob & URL & DOM for Node
global.Blob = class Blob {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
};
global.URL = {
  createObjectURL: () => 'blob:mock-url',
  revokeObjectURL: () => {}
};
global.document = {
  createElement: (tag) => ({
    tagName: tag,
    href: '',
    download: '',
    click: () => {}
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

const results = [];

function record(category, testName, passed, details = '', error = '') {
  const status = passed ? 'PASS' : 'FAIL';
  results.push({ category, name: testName, status, details, error });
  const symbol = passed ? '✅' : '❌';
  console.log(`${symbol} [${category}] ${testName}: ${status}`);
  if (error) console.log(`    Error: ${error}`);
  else if (details) console.log(`    Note: ${details}`);
}

console.log('\n================================================================================');
console.log('  MEETSIGHT FRONTEND SERVICES & UTILITIES UNIT TESTS (POST-FIX)');
console.log('================================================================================\n');

// 1. Math functions in embeddingService
const { cosineSimilarity, splitTextIntoChunks } = await import('./src/services/embeddingService.js');

try {
  const sim1 = cosineSimilarity([1, 0, 0], [1, 0, 0]);
  record('EmbeddingMath', 'cosineSimilarity: Identical vectors = 1.0', Math.abs(sim1 - 1.0) < 1e-5, `Result: ${sim1}`);

  const sim2 = cosineSimilarity([1, 0, 0], [0, 1, 0]);
  record('EmbeddingMath', 'cosineSimilarity: Orthogonal vectors = 0.0', Math.abs(sim2 - 0.0) < 1e-5, `Result: ${sim2}`);

  const sim3 = cosineSimilarity([1, 2, 3], [-1, -2, -3]);
  record('EmbeddingMath', 'cosineSimilarity: Opposite vectors = -1.0', Math.abs(sim3 - (-1.0)) < 1e-5, `Result: ${sim3}`);

  const simZero = cosineSimilarity([0, 0, 0], [1, 2, 3]);
  record('EmbeddingMath', 'cosineSimilarity: Zero vector returns 0 (no NaN)', simZero === 0);

  let caughtDim = false;
  try { cosineSimilarity([1, 2], [1, 2, 3]); } catch (e) { caughtDim = true; }
  record('EmbeddingMath', 'cosineSimilarity: Mismatched dimensions throws Error', caughtDim);

  // 2500 chars with chunkSize 1000 and overlap 200:
  // step = 1000 - 200 = 800.
  // chunks: 0..1000, 800..1800, 1600..2500, 2400..2500 -> 4 chunks
  const chunks = splitTextIntoChunks('A'.repeat(2500), 1000, 200);
  record('EmbeddingMath', 'splitTextIntoChunks: 2500 chars with overlap', chunks.length === 4, `Chunks: ${chunks.length}`);

  // Test safety against infinite loop when chunkSize <= overlap
  const safeChunks = splitTextIntoChunks('Hello world', 5, 5);
  record('EmbeddingMath', 'splitTextIntoChunks: chunkSize <= overlap terminates safely', safeChunks.length > 0);

  const emptyChunks = splitTextIntoChunks('', 1000, 200);
  record('EmbeddingMath', 'splitTextIntoChunks: Empty string handling', emptyChunks.length === 0);
} catch (err) {
  record('EmbeddingMath', 'Math functions execution', false, '', err.message);
}

// 2. Groq Helpers
const { formatDuration, countWords } = await import('./src/services/groqService.js');

try {
  const f1 = formatDuration(0);
  const f2 = formatDuration(65);
  const f3 = formatDuration(3605);
  record('GroqHelpers', 'formatDuration: 0s, 65s, 3605s', f1 === '0:00' && f2 === '1:05' && f3 === '60:05', `${f1}, ${f2}, ${f3}`);

  const c1 = countWords('Hello world from MeetSight');
  const c2 = countWords('   Lots   of   spaces   between   words   ');
  record('GroqHelpers', 'countWords: Standard & whitespace text', c1 === 4 && c2 === 5);

  const c3 = countWords('');
  record('GroqHelpers', 'countWords: Empty string boundary returns 0', c3 === 0, `Returned ${c3}`);
} catch (err) {
  record('GroqHelpers', 'Groq helper execution', false, '', err.message);
}

// 3. Local Auth Service
try {
  const { signUpLocal, signInLocal, signOutLocal, getCurrentUserLocal, isAuthenticatedLocal } = await import('./src/services/localAuthService.js');
  localStorage.clear();

  const r1 = signUpLocal('test@example.com', 'pass123', 'Tester');
  record('LocalAuth', 'signUpLocal: Successful registration', r1.success && r1.user.email === 'test@example.com');

  const rDup = signUpLocal('test@example.com', 'pass123', 'Tester');
  record('LocalAuth', 'signUpLocal: Rejects duplicate email', !rDup.success && rDup.error === 'Email already registered');

  const rIn = signInLocal('test@example.com', 'pass123');
  record('LocalAuth', 'signInLocal: Successful login with valid password', rIn.success);

  const rWrong = signInLocal('test@example.com', 'wrong');
  record('LocalAuth', 'signInLocal: Rejects incorrect password', !rWrong.success && rWrong.error === 'Invalid email or password');

  signOutLocal();
  record('LocalAuth', 'signOutLocal: Clears session', getCurrentUserLocal() === null && !isAuthenticatedLocal());
} catch (err) {
  record('LocalAuth', 'Local auth execution', false, '', err.message);
}

// 4. RAG Service Helper
try {
  const { generateConversationSummary } = await import('./src/services/ragService.js');

  const s1 = generateConversationSummary([]);
  const s2 = generateConversationSummary([{ role: 'user', content: 'Short question' }]);
  const s3 = generateConversationSummary([{ role: 'user', content: 'A'.repeat(80) }]);
  record('RAGHelpers', 'generateConversationSummary: Empty array', s1 === 'New Conversation');
  record('RAGHelpers', 'generateConversationSummary: Short content', s2 === 'Short question');
  record('RAGHelpers', 'generateConversationSummary: Truncates > 50 chars', s3.endsWith('...'));
} catch (err) {
  record('RAGHelpers', 'RAG helper execution', false, '', err.message);
}

// 5. Test exportHelpers with both formats and PDF instantiation
try {
  const { exportAsText, exportAsPDF, exportAsJSON, exportAsMarkdown } = await import('./src/utils/exportHelpers.js');

  const sampleFE = {
    transcript: { text: "Meeting transcript text." },
    summary: {
      keyPoints: [{ title: "Point 1", description: "Desc 1" }],
      topics: ["Topic A"],
      sentiment: "positive"
    },
    actionItems: [{ text: "Task 1", priority: "high", completed: false, assignee: "Dev", dueDate: "2026-10-10" }]
  };

  exportAsText(sampleFE.transcript, sampleFE.summary, sampleFE.actionItems);
  record('ExportText', 'exportAsText: Frontend schema', true);

  exportAsJSON(sampleFE.transcript, sampleFE.summary, sampleFE.actionItems);
  record('ExportJSON', 'exportAsJSON: Frontend schema', true);

  exportAsMarkdown(sampleFE.transcript, sampleFE.summary, sampleFE.actionItems);
  record('ExportMD', 'exportAsMarkdown: Frontend schema', true);

  exportAsPDF(sampleFE.transcript, sampleFE.summary, sampleFE.actionItems);
  record('ExportPDF', 'exportAsPDF: Frontend schema instantiation & generation', true);

  // Test backend schema (string array key_points / keyPoints, task instead of text)
  const sampleBE = {
    transcript: { text: "Meeting transcript." },
    summary: {
      keyPoints: ["Direct string key point from Lyzr DAG"],
      topics: ["Backend"],
      sentiment: "Constructive"
    },
    actionItems: [{ task: "Configure PostgreSQL", priority: "high", deadline: "Wednesday" }]
  };

  exportAsText(sampleBE.transcript, sampleBE.summary, sampleBE.actionItems);
  record('ExportText', 'exportAsText: Backend schema (handles string keyPoints)', true);

  exportAsMarkdown(sampleBE.transcript, sampleBE.summary, sampleBE.actionItems);
  record('ExportMD', 'exportAsMarkdown: Backend schema (handles string keyPoints)', true);

  exportAsPDF(sampleBE.transcript, sampleBE.summary, sampleBE.actionItems);
  record('ExportPDF', 'exportAsPDF: Backend schema with string keyPoints and tasks', true);

  // Null inputs check
  exportAsText(null, null, null);
  record('ExportText', 'exportAsText: Null inputs handling', true);

  exportAsPDF(null, null, null);
  record('ExportPDF', 'exportAsPDF: Null inputs handling', true);

} catch (err) {
  record('ExportHelpers', 'Export helper execution', false, '', err.message);
}

// 6. Check external API models
const groqCode = fs.readFileSync(path.join(__dirname, 'src/services/groqService.js'), 'utf-8');
const geminiCode = fs.readFileSync(path.join(__dirname, 'src/services/geminiService.js'), 'utf-8');
const ragCode = fs.readFileSync(path.join(__dirname, 'src/services/ragService.js'), 'utf-8');
const embCode = fs.readFileSync(path.join(__dirname, 'src/services/embeddingService.js'), 'utf-8');

record('AIConfig', 'groqService: Model is openai/gpt-oss-20b', groqCode.includes('openai/gpt-oss-20b'));
record('AIConfig', 'geminiService: Model is gemini-3.8-flash', geminiCode.includes('gemini-3.8-flash'));
record('AIConfig', 'ragService: Model is gemini-3.8-flash', ragCode.includes('gemini-3.8-flash'));
record('AIConfig', 'embeddingService: Model is gemini-embedding-001', embCode.includes('gemini-embedding-001'));

// Check ragService import with .js extension
const hasValidExt = ragCode.includes("from './embeddingService.js';");
record('ESMCompliance', "ragService import has .js extension", hasValidExt);

const passes = results.filter(r => r.status === 'PASS');
const fails = results.filter(r => r.status === 'FAIL');

console.log('\n================================================================================');
console.log(`FRONTEND UNIT TEST SUMMARY: ${passes.length} PASSED, ${fails.length} FAILED (Total: ${results.length})`);
console.log('================================================================================\n');

if (fails.length > 0) {
  console.log('REMAINING FAILED TESTS:');
  fails.forEach(f => {
    console.log(`❌ [${f.category}] ${f.name}: ${f.error || f.details}`);
  });
}
