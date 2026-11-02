import { useSyncExternalStore } from "react";

// ─── Mastery levels 0-5 ─────────────────────────────────────────────
// 0 = unseen, 1 = seen, 2 = tried, 3 = learning, 4 = almost, 5 = mastered
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const MASTERY_LABELS: Record<MasteryLevel, string> = {
  0: "لم يُدرَس",
  1: "مرئية",
  2: "مجرّب",
  3: "قيد التعلّم",
  4: "قريب من الإنجاز الكامل",
  5: "مُتقَن تماماً",
};

export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  0: "#2e2200",
  1: "#78350f",
  2: "#92400e",
  3: "#b45309",
  4: "#d97706",
  5: "#f5c842",
};

export interface WordStats {
  mastery: MasteryLevel;
  correctCount: number;
  wrongCount: number;
  lastSeen: string | null;
  streakCorrect: number; // consecutive correct answers
}

export interface QuizResult {
  id: number;
  type: "en-ar" | "ar-en" | "mixed" | "pronunciation" | "tenses";
  score: number;
  total: number;
  date: string;
  xpEarned: number;
}

export interface ProgressState {
  xp: number;
  streak: number;
  lastActive: string | null;
  activity: Record<string, number>;
  wordStats: Record<string, WordStats>;  // key: deckId:wordIndex
  phrasesHeard: number[];
  dictationDone: number[];
  quizHistory: QuizResult[];
}

const STORAGE_KEY = "itqan-v3";

const DEFAULT_WORD_STATS: WordStats = {
  mastery: 0,
  correctCount: 0,
  wrongCount: 0,
  lastSeen: null,
  streakCorrect: 0,
};

const empty: ProgressState = {
  xp: 0,
  streak: 0,
  lastActive: null,
  activity: {},
  wordStats: {},
  phrasesHeard: [],
  dictationDone: [],
  quizHistory: [],
};

function todayISO() { return new Date().toISOString().slice(0, 10); }
function yesterdayISO() {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...empty };
    const p = JSON.parse(raw) as ProgressState;
    let streak = p.streak ?? 0;
    if (p.lastActive && p.lastActive !== todayISO() && p.lastActive !== yesterdayISO()) streak = 0;
    return { ...empty, ...p, streak };
  } catch { return { ...empty }; }
}

let state: ProgressState = load();
const listeners = new Set<() => void>();
function notify() { listeners.forEach(l => l()); }
function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }
function setState(patch: Partial<ProgressState>) { state = { ...state, ...patch }; save(); notify(); }

function touchStreak() {
  const today = todayISO();
  const streak = state.lastActive === today
    ? state.streak
    : state.lastActive === yesterdayISO()
      ? state.streak + 1
      : 1;
  return { streak: Math.max(streak, 1), lastActive: today };
}

function addActivity(xp: number) {
  const today = todayISO();
  const activity = { ...state.activity };
  activity[today] = (activity[today] ?? 0) + xp;
  return activity;
}

// ─── Mastery logic ───────────────────────────────────────────────────
function calcMastery(ws: WordStats): MasteryLevel {
  const { correctCount, wrongCount, streakCorrect } = ws;
  const total = correctCount + wrongCount;
  if (total === 0) return 0;
  if (streakCorrect >= 5 && correctCount >= 7) return 5;
  if (streakCorrect >= 3 && correctCount >= 5) return 4;
  if (correctCount >= 3 && wrongCount <= 1) return 3;
  if (correctCount >= 1 && wrongCount <= 2) return 2;
  return 1;
}

// ─── Toast ───────────────────────────────────────────────────────────
export type ToastEvent = { id: number; amount: number; label: string; emoji?: string };
const toastListeners = new Set<(t: ToastEvent) => void>();
let toastId = 0;
function emitToast(amount: number, label: string, emoji = "✨") {
  toastId++;
  toastListeners.forEach(l => l({ id: toastId, amount, label, emoji }));
}

// ─── Public store ────────────────────────────────────────────────────
let quizResultId = 0;

export const store = {
  subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb); },
  subscribeToast(cb: (t: ToastEvent) => void) { toastListeners.add(cb); return () => { toastListeners.delete(cb); }; },
  get: () => state,

  getWordStats(key: string): WordStats {
    return state.wordStats[key] ?? { ...DEFAULT_WORD_STATS };
  },

  // Called when user answers a flashcard or quiz question
  recordAnswer(key: string, correct: boolean) {
    const old = store.getWordStats(key);
    const streakCorrect = correct ? old.streakCorrect + 1 : 0;
    const updated: WordStats = {
      mastery: 0,
      correctCount: old.correctCount + (correct ? 1 : 0),
      wrongCount: old.wrongCount + (correct ? 0 : 1),
      lastSeen: todayISO(),
      streakCorrect,
    };
    updated.mastery = calcMastery(updated);

    const xpGained = correct ? (updated.mastery === 5 ? 15 : 10) : 2;
    const wordStats = { ...state.wordStats, [key]: updated };
    const activity = addActivity(xpGained);
    const { streak, lastActive } = touchStreak();
    setState({ wordStats, xp: state.xp + xpGained, activity, streak, lastActive });
    if (correct) emitToast(xpGained, updated.mastery === 5 ? "إنجاز تام!" : "إجابة صحيحة", updated.mastery === 5 ? "🏆" : "✨");
  },

  markSeen(key: string) {
    const old = store.getWordStats(key);
    if (old.mastery > 0) return;
    const updated: WordStats = { ...old, mastery: 1, lastSeen: todayISO() };
    setState({ wordStats: { ...state.wordStats, [key]: updated } });
  },

  hearPhrase(index: number) {
    if (state.phrasesHeard.includes(index)) return;
    const activity = addActivity(5);
    const { streak, lastActive } = touchStreak();
    setState({ phrasesHeard: [...state.phrasesHeard, index], xp: state.xp + 5, activity, streak, lastActive });
    emitToast(5, "عبارة جديدة", "🗣️");
  },

  completeDictation(index: number) {
    const already = state.dictationDone.includes(index);
    const xp = already ? 5 : 25;
    const activity = addActivity(xp);
    const { streak, lastActive } = touchStreak();
    const dictationDone = already ? state.dictationDone : [...state.dictationDone, index];
    setState({ dictationDone, xp: state.xp + xp, activity, streak, lastActive });
    emitToast(xp, already ? "مراجعة إضافية" : "إملاء صحيح!", "🎯");
  },

  saveQuizResult(type: QuizResult["type"], score: number, total: number) {
    const xpEarned = Math.round((score / total) * 50) + (score === total ? 20 : 0);
    quizResultId++;
    const result: QuizResult = { id: quizResultId, type, score, total, date: todayISO(), xpEarned };
    const activity = addActivity(xpEarned);
    const { streak, lastActive } = touchStreak();
    setState({
      quizHistory: [result, ...state.quizHistory].slice(0, 50),
      xp: state.xp + xpEarned,
      activity, streak, lastActive,
    });
    emitToast(xpEarned, `نتيجة الاختبار: ${score}/${total}`, "🏅");
  },

  addXp(amount: number, label: string) {
    const activity = addActivity(amount);
    const { streak, lastActive } = touchStreak();
    setState({ xp: state.xp + amount, activity, streak, lastActive });
    emitToast(amount, label);
  },
};

export function useProgress(): ProgressState { return useSyncExternalStore(store.subscribe, store.get, store.get); }

export function getLast7Days(activity: Record<string, number>) {
  const names = ["أحد","إثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    return { label: names[d.getDay()], xp: activity[iso] ?? 0, iso };
  });
}

export const XP_PER_LEVEL = 250;
