import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Languages, Shuffle, Mic, BookOpenText,
  Volume2, Check, X as XIco, RotateCcw, Trophy, ChevronRight
} from "lucide-react";
import { decks, phrases, tenseQuestions, grammarLessons, type TenseDifficulty } from "../data/content";
import { store } from "../lib/store";
import { speak } from "../lib/speech";
import { cn } from "../utils/cn";

type QType = "en-ar" | "ar-en" | "mixed" | "pronunciation" | "tenses";
type QSrc  = "words" | "phrases" | "both";
type Diff  = "progressive" | "easy" | "medium" | "hard";

interface QItem {
  key: string; en: string; ar: string; type: QType;
  options: string[]; correct: number;
  tenseId?: string; tenseName?: string; hint?: string; sentence?: string;
  difficulty?: TenseDifficulty;
}

/* ── helpers ─────────────────────────────────────────────────── */
function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function buildPool(src: QSrc) {
  const r: { key: string; en: string; ar: string }[] = [];
  if (src !== "phrases") decks.forEach(d => d.words.forEach((w, i) => r.push({ key: `${d.id}:${i}`, en: w.en, ar: w.ar })));
  if (src !== "words")   phrases.forEach((ph, i) => r.push({ key: `phrase:${i}`, en: ph.en, ar: ph.ar }));
  return r;
}

function buildVocabQuiz(src: QSrc, qt: QType, n: number): QItem[] {
  const pool = buildPool(src), sel = shuffle(pool).slice(0, n);
  const allAr = pool.map(x => x.ar), allEn = pool.map(x => x.en);
  return sel.map(it => {
    const et: "en-ar" | "ar-en" | "pronunciation" =
      qt === "mixed" ? (["en-ar","ar-en","pronunciation"] as const)[Math.floor(Math.random()*3)]
      : qt === "pronunciation" ? "pronunciation" : qt as "en-ar"|"ar-en";
    if (et === "ar-en" || et === "pronunciation") {
      const w = shuffle(allEn.filter(e => e !== it.en)).slice(0,3), o = shuffle([it.en,...w]);
      return { ...it, type:et, options:o, correct:o.indexOf(it.en) };
    }
    const w = shuffle(allAr.filter(a => a !== it.ar)).slice(0,3), o = shuffle([it.ar,...w]);
    return { ...it, type:et, options:o, correct:o.indexOf(it.ar) };
  });
}

const DIFF_ORDER: Record<TenseDifficulty, number> = { easy:0, medium:1, hard:2 };
function buildTenseQuiz(n: number, tf?: string, df?: Diff): QItem[] {
  let pool = tf ? tenseQuestions.filter(q => q.tenseId===tf) : [...tenseQuestions];
  if (df && df !== "progressive") pool = pool.filter(q => q.difficulty === df);
  let sel = shuffle(pool).slice(0, n);
  if (!df || df === "progressive") sel.sort((a,b) => DIFF_ORDER[a.difficulty]-DIFF_ORDER[b.difficulty]);
  return sel.map((q,i) => ({
    key:`tense:${q.tenseId}:${i}`, en:q.sentence, ar:q.hint, type:"tenses" as QType,
    options:q.options, correct:q.answer, tenseId:q.tenseId, tenseName:q.tenseName,
    hint:q.hint, sentence:q.sentence, difficulty:q.difficulty,
  }));
}

/* ── Quiz type metadata ───────────────────────────────────────── */
interface TypeMeta { id:QType; label:string; ar:string; desc:string; icon:typeof Globe; pill:string }
const TYPES: TypeMeta[] = [
  { id:"tenses",        label:"TENSES",  ar:"الأزمنة",      desc:"fill-in-the-blank اختبار الأزمنة", icon:BookOpenText, pill:"tense-pill" },
  { id:"en-ar",         label:"EN → AR", ar:"إنجليزي→عربي", desc:"اقرأ بالإنجليزية واختر المعنى",   icon:Globe,        pill:"badge-gold" },
  { id:"ar-en",         label:"AR → EN", ar:"عربي→إنجليزي", desc:"اقرأ بالعربية واختر المقابل",      icon:Languages,    pill:"badge-gold" },
  { id:"mixed",         label:"MIXED",   ar:"مختلط",         desc:"خليط من جميع الأنواع",             icon:Shuffle,      pill:"badge-gold" },
  { id:"pronunciation", label:"LISTEN",  ar:"الاستماع",      desc:"استمع ثم اختر الكلمة",             icon:Mic,          pill:"badge-gold" },
];

/* ── Difficulty metadata ─────────────────────────────────────── */
const DIFFS: { id:Diff; label:string; ar:string; cls:string; activeCls:string }[] = [
  { id:"progressive", label:"PROGRESSIVE", ar:"تدريجي سهل→صعب", cls:"pill-idle", activeCls:"pill-active" },
  { id:"easy",        label:"EASY",        ar:"سهل",              cls:"pill-idle", activeCls:"diff-easy font-black"   },
  { id:"medium",      label:"MEDIUM",      ar:"متوسط",            cls:"pill-idle", activeCls:"diff-medium font-black" },
  { id:"hard",        label:"HARD",        ar:"صعب",              cls:"pill-idle", activeCls:"diff-hard font-black"   },
];

/* ═══ CONFIG ════════════════════════════════════════════════ */
function Config({ onStart }: { onStart:(t:QType,s:QSrc,n:number,tf?:string,d?:Diff)=>void }) {
  const [type,  setType]  = useState<QType>("tenses");
  const [src,   setSrc]   = useState<QSrc>("both");
  const [count, setCount] = useState(10);
  const [tf,    setTf]    = useState("all");
  const [diff,  setDiff]  = useState<Diff>("progressive");
  const isTense = type === "tenses";

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="gold-line flex-1" />
        <span className="font-en text-[10px] font-black tracking-[.3em] text-gold-600">QUIZ</span>
        <div className="gold-line flex-1" />
      </div>
      <h2 className="text-xl font-black text-heading">اختر نوع الاختبار</h2>
      <p className="mb-5 text-sm text-sub">5 أنواع تقيس مهاراتك من زوايا مختلفة</p>

      {/* type grid */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {TYPES.map(t => {
          const Icon = t.icon;
          const active = type === t.id;
          return (
            <button key={t.id} onClick={() => setType(t.id)}
              className={cn("rounded-2xl p-4 text-right transition-all",
                active ? "card-glow" : "card")}>
              <div className="mb-2 flex items-center gap-2">
                <Icon className={cn("h-4 w-4", active ? "text-gold-500" : "text-sub")} />
                <span className={cn("font-en text-xs font-black",
                  active ? "text-gold-600" : "text-sub")}>{t.label}</span>
                {active && <span className="ml-auto h-2 w-2 animate-gpulse rounded-full bg-[var(--gold-300)]" />}
              </div>
              <div className={cn("text-sm font-black", active ? "text-heading" : "text-[var(--color-body)]")}>
                {t.ar}
              </div>
              <div className="mt-0.5 text-[10px] text-muted">{t.desc}</div>
            </button>
          );
        })}
      </div>

      {/* tense options */}
      {isTense && (
        <div className="card mb-5 p-4">
          <div className="gold-line mb-3" />
          {/* tense filter */}
          <p className="mb-2 text-xs font-black tense-pill inline rounded-lg px-2.5 py-1">الزمن</p>
          <div className="mb-4 mt-2 flex flex-wrap gap-1.5">
            {[{ id:"all", latin:"ALL TENSES" }, ...grammarLessons].map(l => {
              const lid = "id" in l && l.id !== "all" ? l.id : "all";
              return (
                <button key={lid} onClick={() => setTf(lid)}
                  className={cn("font-en rounded-xl px-2.5 py-1.5 text-[10px] font-bold transition-all",
                    tf === lid ? "tense-pill" : "pill-idle")}>
                  {"latin" in l ? l.latin : "ALL TENSES"}
                </button>
              );
            })}
          </div>
          {/* difficulty */}
          <p className="mb-2 text-xs font-black tense-pill inline rounded-lg px-2.5 py-1">الصعوبة</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {DIFFS.map(d => (
              <button key={d.id} onClick={() => setDiff(d.id)}
                className={cn("rounded-xl py-3 text-center transition-all",
                  diff === d.id ? d.activeCls : d.cls)}>
                <div className="font-en text-[10px] font-black">{d.label}</div>
                <div className="text-[11px] font-bold">{d.ar}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* source */}
      {!isTense && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-black text-gold-600">مصدر الأسئلة</p>
          <div className="flex gap-2">
            {([["both","الكل"],["words","مفردات"],["phrases","عبارات"]] as [QSrc,string][]).map(([id,lb]) => (
              <button key={id} onClick={() => setSrc(id)}
                className={cn("btn flex-1 py-3 text-sm", src===id ? "pill-active" : "pill-idle")}>
                {lb}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* count */}
      <div className="mb-6">
        <p className="mb-2 text-xs font-black text-gold-600">
          عدد الأسئلة: <span className="font-en text-lg text-heading">{count}</span>
        </p>
        <div className="flex gap-2">
          {[5,10,15,20].map(n => (
            <button key={n} onClick={() => setCount(n)}
              className={cn("btn font-en flex-1 py-2.5 text-sm", count===n ? "pill-active" : "pill-idle")}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => onStart(type,src,count,isTense&&tf!=="all"?tf:undefined,isTense?diff:undefined)}
        className="btn btn-primary w-full py-4 text-base">
        ابدأ الاختبار الآن <ChevronRight className="inline h-5 w-5" />
      </button>
    </div>
  );
}

/* ═══ ACTIVE QUIZ ════════════════════════════════════════════ */
function Active({ items, onFinish }: { items:QItem[]; onFinish:(s:number,t:number,tp:QType)=>void }) {
  const [idx,   setIdx]   = useState(0);
  const [pick,  setPick]  = useState<number|null>(null);
  const [score, setScore] = useState(0);
  const q    = items[idx];
  const last = idx === items.length - 1;
  const ok   = pick !== null && pick === q.correct;
  const T    = TYPES.find(t => t.id === q.type)!;

  const choose = (i: number) => {
    if (pick !== null) return; setPick(i);
    const c = i === q.correct; if (c) setScore(s => s + 1);
    store.recordAnswer(q.type === "tenses" ? `tense:${q.tenseId}` : q.key, c);
  };
  const next = () => {
    if (last) { onFinish(score, items.length, items[0].type); return; }
    setIdx(i => i+1); setPick(null);
  };

  const pct = ((idx + (pick!==null?1:0)) / items.length) * 100;
  const Icon = T.icon;

  return (
    <div>
      {/* header */}
      <div className="mb-3 flex items-center justify-between text-xs font-bold">
        <span className={cn("btn flex items-center gap-1.5 px-3 py-1.5 text-xs", T.pill)}>
          <Icon className="h-3.5 w-3.5" /> {T.label}
          {q.tenseName && <span className="text-muted">/ {q.tenseName}</span>}
          {q.difficulty && (
            <span className={cn("ml-1 rounded px-1.5 py-0.5 text-[9px] font-black",
              q.difficulty==="easy" ? "diff-easy" : q.difficulty==="medium" ? "diff-medium" : "diff-hard")}>
              {q.difficulty.toUpperCase()}
            </span>
          )}
        </span>
        <span className="font-en text-sub">
          {idx+1}/{items.length} · <span className="font-black text-gold-500">{score}✓</span>
        </span>
      </div>

      {/* gold progress bar */}
      <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-[var(--color-border)]">
        <motion.div className="pbar h-full rounded-full" animate={{ width:`${pct}%` }} transition={{ duration:.45 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity:0, x:-26 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:26 }}
          transition={{ duration:.3, ease:[.4,0,.2,1] }}>
          <div className="card overflow-hidden">
            <div className="gold-line" />
            <div className="p-5">
              {/* pronunciation */}
              {q.type === "pronunciation" && (
                <div className="mb-5 flex justify-center">
                  <button onClick={() => speak(q.en)}
                    className="state-gold grid h-24 w-24 place-items-center rounded-full transition-all hover:shadow-lg">
                    <Volume2 className="h-10 w-10 text-gold-500" />
                  </button>
                </div>
              )}

              {/* question */}
              <div className="mb-6 text-center">
                {q.type === "tenses" ? (
                  <>
                    <p className="mb-2 text-xs font-bold text-sub">{q.hint}</p>
                    <p className="font-en text-lg font-bold text-heading sm:text-xl" dir="ltr">{q.sentence}</p>
                  </>
                ) : q.type === "ar-en" ? (
                  <>
                    <p className="mb-2 text-xs font-bold text-sub">ما المقابل الإنجليزي؟</p>
                    <p className="font-display text-3xl text-heading">{q.ar}</p>
                  </>
                ) : q.type === "pronunciation" ? (
                  <p className="text-sm font-bold text-sub">استمع ثم اختر الكلمة الصحيحة</p>
                ) : (
                  <>
                    <p className="mb-2 text-xs font-bold text-sub">ما المعنى بالعربية؟</p>
                    <p className="font-en text-2xl font-black text-heading sm:text-3xl" dir="ltr">{q.en}</p>
                    <button onClick={() => speak(q.en)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-gold-500" dir="ltr">
                      <Volume2 className="h-3.5 w-3.5" /> Listen
                    </button>
                  </>
                )}
              </div>

              {/* options */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                {q.options.map((opt, i) => {
                  const isAns = i===q.correct, isPk = i===pick;
                  return (
                    <button key={opt} onClick={() => choose(i)} disabled={pick!==null}
                      className={cn("rounded-xl p-4 text-sm font-bold transition-all",
                        pick===null && "card hover:card-glow",
                        pick!==null && isAns  && "state-ok",
                        pick!==null && isPk && !isAns && "state-err",
                        pick!==null && !isPk && !isAns && "bg-[var(--color-layer)] border border-[var(--color-border)] text-muted"
                      )} dir="ltr">
                      <span className="flex items-center justify-between">
                        {opt}
                        {pick!==null && isAns  && <Check className="h-4 w-4 shrink-0" />}
                        {pick!==null && isPk && !isAns && <XIco className="h-4 w-4 shrink-0" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* feedback */}
              {pick !== null && (
                <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                  className={cn("mt-4 flex items-center justify-between rounded-xl p-4",
                    ok ? "state-ok" : "state-err")}>
                  <span className="text-sm font-bold">
                    {ok ? "🎯 أحسنت!" : `❌ الصحيح: ${q.options[q.correct]}`}
                  </span>
                  <button onClick={next} className="btn btn-primary px-5 py-2 text-xs">
                    {last ? "النتيجة" : "التالي"}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══ RESULT ═════════════════════════════════════════════════ */
function Result({ score, total, type, onRetry, onHome }: {
  score:number; total:number; type:QType; onRetry:()=>void; onHome:()=>void;
}) {
  const pct = Math.round((score/total)*100);
  const xp  = Math.round((score/total)*50) + (score===total?20:0);
  const T   = TYPES.find(t => t.id===type)!;
  const Icon = T.icon;
  const grade =
    pct===100 ? {e:"🏆",l:"إنجاز تام!",    cls:"gold-glow text-[var(--gold-300)]"} :
    pct>=80   ? {e:"🌟",l:"ممتاز",         cls:"text-gold-500"           } :
    pct>=60   ? {e:"👍",l:"جيد جداً",     cls:"text-[var(--accent-amber)]"        } :
    pct>=40   ? {e:"📚",l:"جيد",           cls:"text-[var(--accent-terra)]"        } :
                {e:"💪",l:"واصل التدريب", cls:"text-[var(--accent-danger)]"        };

  return (
    <motion.div initial={{ opacity:0, scale:.93 }} animate={{ opacity:1, scale:1 }}
      transition={{ duration:.4, ease:[.4,0,.2,1] }}
      className="card-dark overflow-hidden rounded-2xl">
      <div className="gold-line" />
      <div className="p-6 text-center">
        <div className="state-gold mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full text-5xl">
          {grade.e}
        </div>
        <div className={cn("text-2xl font-black", grade.cls)}>{grade.l}</div>
        <div className="font-en mt-3 text-6xl font-black text-[var(--gold-300)] gold-glow">{pct}%</div>
        <p className="mt-2 text-sm text-muted">
          أجبت صحيحاً عن{" "}
          <span className="font-en font-black text-white">{score}</span>{" "}
          من{" "}
          <span className="font-en font-black text-white">{total}</span>
        </p>
        <div className={cn("mt-2 inline-flex items-center gap-1.5 text-xs font-bold", T.pill, "rounded-full px-3 py-1")}>
          <Icon className="h-3.5 w-3.5" /> {T.ar}
        </div>

        {/* score dots */}
        <div className="mx-auto mt-4 flex max-w-xs flex-wrap justify-center gap-1.5" dir="ltr">
          {Array.from({length:total}).map((_,i) => (
            <motion.span key={i}
              initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:.2+i*.04 }}
              className={cn("h-3 w-3 rounded-full",
                i < score ? "ms-5" : "ms-0")} />
          ))}
        </div>

        {/* XP chip */}
        <div className="state-gold mx-auto mt-4 inline-flex items-center gap-2 rounded-2xl px-5 py-2.5">
          <Trophy className="h-5 w-5 text-[var(--gold-300)]" />
          <span className="font-en font-black text-[var(--gold-300)]">+{xp} XP</span>
          <span className="text-xs text-muted">مكتسبة</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onRetry} className="btn btn-primary py-3.5 text-base">
            <RotateCcw className="h-4 w-4" /> إعادة
          </button>
          <button onClick={onHome} className="btn btn-secondary py-3.5 text-base">
            نوع آخر
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══ MAIN ═══════════════════════════════════════════════════ */
export default function QuizSection() {
  const [phase, setPhase] = useState<"config"|"quiz"|"result">("config");
  const [items, setItems] = useState<QItem[]>([]);
  const [fs,setFs]=useState(0); const [ft,setFt]=useState(0); const [ftp,setFtp]=useState<QType>("tenses");
  const [qs,setQs]=useState<QSrc>("both"); const [qt,setQt]=useState<QType>("tenses");
  const [qn,setQn]=useState(10); const [qtf,setQtf]=useState<string|undefined>();
  const [qd,setQd]=useState<Diff>("progressive");

  const start = useCallback((t:QType,s:QSrc,n:number,tf?:string,d?:Diff) => {
    setQt(t); setQs(s); setQn(n); setQtf(tf); setQd(d??"progressive");
    setItems(t==="tenses" ? buildTenseQuiz(n,tf,d) : buildVocabQuiz(s,t,n));
    setPhase("quiz");
  },[]);

  const finish = useCallback((s:number,t:number,tp:QType) => {
    store.saveQuizResult(tp as any,s,t); setFs(s); setFt(t); setFtp(tp); setPhase("result");
  },[]);

  const retry = () => {
    setItems(qt==="tenses" ? buildTenseQuiz(qn,qtf,qd) : buildVocabQuiz(qs,qt,qn));
    setPhase("quiz");
  };

  return (
    <AnimatePresence mode="wait">
      {phase==="config" && (
        <motion.div key="c" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <Config onStart={start} />
        </motion.div>
      )}
      {phase==="quiz" && (
        <motion.div key="q" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <Active items={items} onFinish={finish} />
        </motion.div>
      )}
      {phase==="result" && (
        <motion.div key="r" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <Result score={fs} total={ft} type={ftp} onRetry={retry} onHome={()=>setPhase("config")} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
