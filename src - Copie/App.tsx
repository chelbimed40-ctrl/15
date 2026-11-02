import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FlaskConical, TrendingUp, Flame, Trophy, GraduationCap } from "lucide-react";
import { store, useProgress, XP_PER_LEVEL, type ToastEvent } from "./lib/store";
import ReviewSection   from "./sections/ReviewSection";
import QuizSection     from "./sections/QuizSection";
import ProgressSection from "./sections/ProgressSection";
import Footer          from "./components/Footer";
import { decks, phrases, grammarLessons } from "./data/content";
import { cn } from "./utils/cn";

const SECTIONS = [
  { id: "review",   label: "المراجعة",   icon: BookOpen    },
  { id: "quiz",     label: "الاختبارات", icon: FlaskConical },
  { id: "progress", label: "التقدم",     icon: TrendingUp   },
] as const;
type Sec = (typeof SECTIONS)[number]["id"];

/* ── Progress Hook ─────────────────────────────────────────── */
function useStats() {
  const p = useProgress();
  const wordKeys: string[] = [];
  decks.forEach(d => d.words.forEach((_, i) => wordKeys.push(`${d.id}:${i}`)));
  const phraseKeys = phrases.map((_, i) => `phrase:${i}`);
  const tenseKeys  = grammarLessons.map(l => `tense:${l.id}`);

  const total = wordKeys.length + phraseKeys.length + tenseKeys.length;
  const masteredCount =
    wordKeys.filter(k => (p.wordStats[k]?.mastery ?? 0) === 5).length +
    phraseKeys.filter(k => (p.wordStats[k]?.mastery ?? 0) === 5).length +
    tenseKeys.filter(k => (p.wordStats[k]?.mastery ?? 0) >= 3).length;

  const pct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
  return { pct, masteredCount, total };
}

/* ── SVG Progress Ring ─────────────────────────────────────── */
function Ring({ pct, r = 38, stroke = 10, glow = true }: { pct: number; r?: number; stroke?: number; glow?: boolean }) {
  const circ   = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 drop-shadow-sm">
      <circle cx="50" cy="50" r={r} fill="none" strokeWidth={stroke} className="stroke-border/20" />
      <motion.circle cx="50" cy="50" r={r} fill="none" strokeWidth={stroke}
        stroke="url(#gr)" strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "circOut" }}
        style={glow ? { filter: "drop-shadow(0 0 8px rgba(234,179,8,0.7))" } : {}}
      />
      <defs>
        <linearGradient id="gr" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="var(--gold-600)" />
          <stop offset="50%"  stopColor="var(--gold-400)" />
          <stop offset="100%" stopColor="var(--gold-200)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── Toast Notifications ───────────────────────────────────── */
function Toasts() {
  const [list, setList] = useState<ToastEvent[]>([]);
  useEffect(() => store.subscribeToast(t => {
    setList(p => [...p.slice(-2), t]);
    setTimeout(() => setList(p => p.filter(x => x.id !== t.id)), 2800);
  }), []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex flex-col items-center gap-2 px-4 sm:bottom-10">
      <AnimatePresence>
        {list.map(t => (
          <motion.div key={t.id}
            initial={{ opacity:0, y:24, scale:.8 }}
            animate={{ opacity:1, y:0,  scale:1   }}
            exit={{    opacity:0, y:-16, scale:.9  }}
            className="card-dark flex items-center gap-3 rounded-2xl px-5 py-3 shadow-gold-xl">
            <span className="text-xl">{t.emoji ?? "✨"}</span>
            <span className="font-en text-lg font-black gold-text">+{t.amount} XP</span>
            <span className="text-sm font-bold text-muted">{t.label}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ── Header / Hero ─────────────────────────────────────────── */
function Hero({ setActive }: { setActive: (s: Sec) => void }) {
  const p = useProgress();
  const { pct, masteredCount, total } = useStats();
  const level = Math.floor(p.xp / XP_PER_LEVEL) + 1;
  const into  = p.xp % XP_PER_LEVEL;
  const xpPct = Math.round((into / XP_PER_LEVEL) * 100);

  return (
    <div className="card-dark relative overflow-hidden rounded-3xl">
      <div className="gold-line absolute inset-x-0 top-0 opacity-80" />

      <div className="relative p-6 sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {/* Professor name badge — prominent & elegant */}
          <div className="flex items-center gap-2 rounded-2xl border border-gold-400/50 px-3 py-1.5"
            style={{ background: "linear-gradient(120deg,rgba(161,98,7,.18),rgba(234,179,8,.10))" }}>
            <GraduationCap className="h-4 w-4 text-gold-400" />
            <div className="leading-none">
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted">Prof.</div>
              <div className="font-display text-sm font-black text-gold-300" style={{ textShadow:"0 0 12px rgba(234,179,8,.4)" }}>
                محمد شلبي
              </div>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="state-gold flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black">
                <Flame className="h-3.5 w-3.5 text-accent-orange" /> {p.streak} يوم
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {/* Main info */}
          <div className="flex-1">
            <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">
              <span>تعلّم بذكاء، مع</span>
              <br />
              <span className="gold-text gold-glow whitespace-nowrap">Titans</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted/90 sm:text-base">
              منصتك المتكاملة لإتقان الإنجليزية · مراجعة ذكية · تتبع إنجاز دقيق
            </p>

            {/* Overall progress visual */}
            <div className="mt-5 space-y-2 rounded-2xl bg-white/5 p-4 border border-white/5 shadow-inner">
               <div className="flex items-center justify-between text-xs font-bold text-muted">
                  <span>التقدم العام في المحتوى</span>
                  <span className="font-en text-gold-300">{pct}%</span>
               </div>
               <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="pbar h-full rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.6, ease: "circOut" }} />
               </div>
               <div className="flex justify-between text-[10px] font-bold text-muted/60">
                  <span>{masteredCount} عنصر مُتقَن</span>
                  <span className="font-en">{total} إجمالي العناصر</span>
               </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setActive("review")} className="btn btn-primary flex-1 py-3.5 text-sm sm:flex-none sm:px-10">ابدأ المراجعة</button>
              <button onClick={() => setActive("quiz")} className="btn btn-quiz flex-1 py-3.5 text-sm sm:flex-none sm:px-10">الاختبارات</button>
            </div>
          </div>

          {/* Right: Big Progress Ring */}
          <div className="flex shrink-0 flex-col items-center justify-center gap-4 sm:ml-4">
             <div className="relative h-28 w-28 sm:h-36 sm:w-36">
                <Ring pct={xpPct} r={40} stroke={9} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="text-[10px] font-bold text-muted">مستوى</div>
                   <div className="font-en text-4xl font-black text-gold-400 drop-shadow-md sm:text-5xl">{level}</div>
                   <div className="gold-divider w-1/2 opacity-30 mt-1" />
                </div>
             </div>
             <div className="badge-gold px-4 py-1.5 shadow-gold-sm">
                <Trophy className="h-3.5 w-3.5" />
                <span className="font-en text-sm font-black">{p.xp.toLocaleString()} XP</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Bottom nav (mobile) ───────────────────────────────────── */
function BottomNav({ sec, setSec }: { sec: Sec; setSec: (s: Sec) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 sm:hidden"
      style={{ background:"rgba(255,255,255,.98)", backdropFilter:"blur(24px)", borderTop:"1px solid var(--color-border)" }}>
      <div className="mx-auto flex max-w-lg">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          const on   = sec === s.id;
          return (
            <button key={s.id} onClick={() => setSec(s.id)}
              className={cn("flex flex-1 flex-col items-center gap-0.5 pb-2.5 pt-3 transition-all",
                on ? "text-gold-600" : "text-sub")}>
              <div className={cn("mb-1 flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300",
                on ? "pill-active -translate-y-1 shadow-gold" : "hover:bg-layer")}>
                <Icon className={cn("h-5 w-5", on && "animate-gpulse")} />
              </div>
              <span className="text-[10px] font-black">{s.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/* ── Top nav (desktop) ─────────────────────────────────────── */
function TopNav({ sec, setSec }: { sec: Sec; setSec: (s: Sec) => void }) {
  const { pct } = useStats();
  const p = useProgress();
  return (
    <nav className="fixed inset-x-0 top-0 z-50 hidden sm:block shadow-sm"
      style={{ background:"rgba(250,247,240,.92)", backdropFilter:"blur(16px)", borderBottom:"1px solid var(--color-border)" }}>
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3">
        {/* logo */}
        <div className="flex items-center gap-3">
          <div className="btn btn-primary h-10 w-10 items-center justify-center rounded-xl !p-0 shadow-gold-sm">
             <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-none">
             <div className="font-en text-base font-black text-heading uppercase tracking-tighter">Titans</div>
             <div className="font-en text-[7px] font-black tracking-[.3em] text-muted opacity-80">ENGLISH MASTERY</div>
          </div>
        </div>
        {/* pills */}
        <div className="flex gap-1.5 rounded-2xl bg-layer p-1 border border-border/50">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSec(s.id)}
              className={cn("btn flex items-center gap-2 px-5 py-2 text-sm transition-all duration-300",
                sec===s.id ? "pill-active" : "text-sub hover:text-mocha")}>
              <s.icon className="h-4 w-4" /> {s.label}
            </button>
          ))}
        </div>
        {/* chips */}
        <div className="flex items-center gap-3">
           <div className="flex flex-col items-end">
              <span className="font-en text-[10px] font-black text-gold-600">{pct}% إنجاز</span>
              <div className="h-1.5 w-12 overflow-hidden rounded-full bg-border/40">
                 <div className="pbar h-full rounded-full" style={{ width: `${pct}%` }} />
              </div>
           </div>
           <div className="h-8 w-px bg-border/40" />
           <div className="flex items-center gap-1 text-accent-amber">
              <Flame className="h-4 w-4" /> <span className="font-en text-sm font-black">{p.streak}</span>
           </div>
        </div>
      </div>
    </nav>
  );
}

/* ── Main App ──────────────────────────────────────────────── */
export default function App() {
  const [sec, setSec] = useState<Sec>("review");
  return (
    <div className="min-h-screen pb-28 sm:pb-12 sm:pt-20">
      <TopNav sec={sec} setSec={setSec} />
      <main className="mx-auto max-w-2xl px-4 sm:px-6">
        <Hero setActive={setSec} />
        <AnimatePresence mode="wait">
          <motion.div key={sec}
            initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
            transition={{ duration:.35, ease: "easeOut" }}
            className="mt-6">
            {sec === "review"   && <ReviewSection />}
            {sec === "quiz"     && <QuizSection />}
            {sec === "progress" && <ProgressSection />}
          </motion.div>
        </AnimatePresence>

        {/* Professor signature footer */}
        <div className="mt-8 pb-4">
          <Footer />
        </div>
      </main>
      <BottomNav sec={sec} setSec={setSec} />
      <Toasts />
    </div>
  );
}
