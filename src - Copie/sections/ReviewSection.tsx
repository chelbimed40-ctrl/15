import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, MessagesSquare, BookOpenText,
  Volume2, ChevronRight, ChevronLeft,
  Check, X as XIco, Lightbulb, Plus
} from "lucide-react";
import { decks, phrases, grammarLessons } from "../data/content";
import { store, useProgress } from "../lib/store";
import { speak } from "../lib/speech";
import MasteryBadge from "../components/MasteryBadge";
import { cn } from "../utils/cn";

type Tab  = "cards" | "phrases" | "grammar";
type Filt = "all" | "weak" | "mastered";

/* ── Deck progress bar ─────────────────────────────────────── */
function DeckBar({ keys, stats }: { keys: string[]; stats: Record<string, any> }) {
  const total    = keys.length;
  const mastered = keys.filter(k => (stats[k]?.mastery ?? 0) === 5).length;
  const learning = keys.filter(k => { const m = stats[k]?.mastery ?? 0; return m >= 2 && m < 5; }).length;
  const pct      = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return (
    <div className="card p-4">
      <div className="mb-2 flex justify-between text-xs font-bold">
        <span className="text-sub">تقدم الحقيبة</span>
        <span className="font-en font-black text-gold-500">{pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-border">
        <motion.div className="pbar h-full rounded-full"
          initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:1 }} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
        <div className="rounded-lg bg-layer py-2">
          <div className="font-en text-sm font-black text-gold-500">{mastered}</div>
          <div className="text-sub">مُتقَن</div>
        </div>
        <div className="rounded-lg bg-layer py-2">
          <div className="font-en text-sm font-black text-accent-amber">{learning}</div>
          <div className="text-sub">قيد التعلم</div>
        </div>
        <div className="rounded-lg bg-layer py-2">
          <div className="font-en text-sm font-black text-muted">{total - mastered - learning}</div>
          <div className="text-sub">جديد</div>
        </div>
      </div>
    </div>
  );
}

/* ── Universal flash-card engine ───────────────────────────── */
interface CardItem { key: string }

function FlashEngine({
  items, filter, setFilter,
  renderFront, renderBack,
  onKnow, onDontKnow, progressKeys,
}: {
  items: CardItem[];
  filter: Filt;
  setFilter: (f: Filt) => void;
  renderFront: (oi: number) => React.ReactNode;
  renderBack:  (oi: number) => React.ReactNode;
  onKnow:      (oi: number) => void;
  onDontKnow:  (oi: number) => void;
  progressKeys: string[];
}) {
  const p = useProgress();
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const filtered = useMemo(() => {
    const all = items.map((it, oi) => ({ ...it, oi }));
    if (filter === "all")      return all;
    if (filter === "weak")     return all.filter(x => (p.wordStats[x.key]?.mastery ?? 0) < 3);
    return all.filter(x => (p.wordStats[x.key]?.mastery ?? 0) === 5);
  }, [items, filter, p.wordStats]);

  const safe = Math.min(cardIdx, Math.max(filtered.length - 1, 0));
  const cur  = filtered[safe];

  if (!cur) return (
    <div className="card p-8 text-center">
      <p className="text-lg font-black text-body">لا توجد عناصر في هذا الفلتر</p>
      <button onClick={() => setFilter("all")}
        className="btn btn-primary mt-4 px-6 py-2.5 text-sm">عرض الكل</button>
    </div>
  );

  const ws      = p.wordStats[cur.key];
  const mastery = ws?.mastery ?? 0;

  const go = (n: number) => {
    setFlipped(false);
    setTimeout(() => setCardIdx(((n % filtered.length) + filtered.length) % filtered.length), 110);
  };

  const flip = () => { setFlipped(f => !f); store.markSeen(cur.key); };

  return (
    <div>
      {/* filter row */}
      <div className="mb-4 space-y-2">
        <div className="grid grid-cols-3 gap-1.5">
          {(["all","weak","mastered"] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setCardIdx(0); }}
              className={cn("rounded-xl px-2 py-2 text-[11px] font-bold transition-all text-center",
                filter === f ? "pill-active" : "pill-idle")}>
              {f === "all" ? `الكل (${items.length})` : f === "weak" ? "يحتاج مراجعة" : "مُتقَنة ⭐"}
            </button>
          ))}
        </div>
        <div className="text-left">
          <span className="font-en text-xs font-bold text-sub">{safe + 1} / {filtered.length}</span>
        </div>
      </div>

      {/* 3-D card */}
      <div className="perspective-card mx-auto h-60 w-full cursor-pointer select-none" onClick={flip}>
        <motion.div className={cn("preserve-3d relative h-full w-full transition-transform duration-[580ms]",
          flipped && "flip-back")}>

          {/* front face */}
          <div className="backface-hidden face-front absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-2xl p-5 text-center">
            <div className="gold-line absolute inset-x-0 top-0 rounded-t-2xl" />
            <div className="absolute right-3 top-3"><MasteryBadge mastery={mastery} compact /></div>
            {renderFront(cur.oi)}
            <p className="mt-4 text-[10px] text-muted">انقر للكشف</p>
          </div>

          {/* back face */}
          <div className="backface-hidden flip-back face-back absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-2xl p-5 text-center">
            <div className="gold-line absolute inset-x-0 top-0 rounded-t-2xl" />
            {renderBack(cur.oi)}
          </div>
        </motion.div>
      </div>

      {/* action buttons — 2×2 grid */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button onClick={() => go(safe - 1)} className="btn btn-ghost h-12 text-sm">
          <ChevronRight className="h-5 w-5" /> السابق
        </button>
        <button onClick={() => go(safe + 1)} className="btn btn-ghost h-12 text-sm">
          التالي <ChevronLeft className="h-5 w-5" />
        </button>
        <button onClick={() => { onDontKnow(cur.oi); go(safe + 1); }}
          className="btn btn-danger h-12 text-sm">
          <XIco className="h-4 w-4" /> لا أعرفها
        </button>
        <button onClick={() => { onKnow(cur.oi); go(safe + 1); }}
          className="btn btn-success h-12 text-sm">
          <Check className="h-4 w-4" /> أعرفها ✓
        </button>
      </div>

      {/* mastery detail */}
      <div className="mt-4 card p-4">
        <MasteryBadge mastery={mastery} />
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-bold">
          <div className="rounded-lg bg-layer py-2.5 state-gold border-0">
            <div className="font-en text-xl font-black text-gold-500">{ws?.correctCount ?? 0}</div>
            <div className="text-sub">صحيح</div>
          </div>
          <div className="state-err rounded-lg py-2.5">
            <div className="font-en text-xl font-black">{ws?.wrongCount ?? 0}</div>
            <div className="text-sub">خطأ</div>
          </div>
        </div>
        {(ws?.streakCorrect ?? 0) >= 2 && (
          <div className="state-gold mt-2 rounded-lg py-1.5 text-center text-xs font-black">
            🔥 {ws!.streakCorrect} إجابة صحيحة متتالية
          </div>
        )}
      </div>

      {/* deck progress */}
      <div className="mt-3">
        <DeckBar keys={progressKeys} stats={p.wordStats} />
      </div>
    </div>
  );
}

/* ═══ VOCAB CARDS ════════════════════════════════════════════ */
function VocabCards() {
  const [di, setDi]     = useState(0);
  const [filter, setF]  = useState<Filt>("all");
  const deck  = decks[di];
  const items = useMemo(() => deck.words.map((_, i) => ({ key: `${deck.id}:${i}` })), [deck]);

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {decks.map((d, i) => (
          <button key={d.id} onClick={() => { setDi(i); setF("all"); }}
            className={cn("rounded-xl px-3 py-2.5 text-[12px] font-bold transition-all",
              di === i ? "pill-active" : "pill-idle")}>
            <span className="truncate">{d.name}</span>
            <span className="font-en ml-1 text-[10px] opacity-60">({d.words.length})</span>
          </button>
        ))}
      </div>
      <FlashEngine
        items={items} filter={filter} setFilter={setF}
        renderFront={oi => (
          <div>
            <div className="font-en break-words text-2xl font-black text-heading sm:text-3xl" dir="ltr">
              {deck.words[oi].en}
            </div>
            <button onClick={e => { e.stopPropagation(); speak(deck.words[oi].en); }}
              className="btn btn-secondary mt-3 px-4 py-2 text-xs" dir="ltr">
              <Volume2 className="h-3.5 w-3.5" /> Listen
            </button>
          </div>
        )}
        renderBack={oi => (
          <div>
            <div className="font-display mb-1 break-words text-3xl font-bold text-gold-600 sm:text-4xl">
              {deck.words[oi].ar}
            </div>
            {deck.words[oi].example && (
              <button onClick={e => { e.stopPropagation(); speak(deck.words[oi].example!); }}
                className="font-en mt-3 flex items-center gap-2 text-sm text-body" dir="ltr">
                <Volume2 className="h-3.5 w-3.5 shrink-0 text-gold-500" />
                {deck.words[oi].example}
              </button>
            )}
            {deck.words[oi].exampleAr && (
              <p className="mt-1 text-xs text-sub">{deck.words[oi].exampleAr}</p>
            )}
          </div>
        )}
        onKnow={oi => store.recordAnswer(`${deck.id}:${oi}`, true)}
        onDontKnow={oi => store.recordAnswer(`${deck.id}:${oi}`, false)}
        progressKeys={items.map(x => x.key)}
      />
    </div>
  );
}

/* ═══ PHRASE CARDS ═══════════════════════════════════════════ */
function PhraseCards() {
  const [filter, setF] = useState<Filt>("all");
  const p = useProgress();
  const items = useMemo(() => phrases.map((_, i) => ({ key: `phrase:${i}` })), []);
  const masteredCount = items.filter(it => (p.wordStats[it.key]?.mastery ?? 0) === 5).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        <h3 className="text-base font-black text-heading">العبارات اليومية</h3>
        <span className="badge-gold text-[10px]">{phrases.length} عبارة</span>
        <span className="badge-gold text-[10px]">{masteredCount} مُتقَنة ⭐</span>
      </div>
      <FlashEngine
        items={items} filter={filter} setFilter={setF}
        renderFront={oi => (
          <div>
            <div className="font-en max-w-full break-words text-lg font-bold leading-snug text-heading sm:text-xl" dir="ltr">
              "{phrases[oi].en}"
            </div>
            <button onClick={e => { e.stopPropagation(); speak(phrases[oi].en); }}
              className="btn btn-secondary mt-3 px-4 py-2 text-xs" dir="ltr">
              <Volume2 className="h-3.5 w-3.5" /> Listen
            </button>
            {phrases[oi].note && (
              <p className="mt-3 text-xs text-sub">{phrases[oi].note}</p>
            )}
          </div>
        )}
        renderBack={oi => (
          <div>
            <div className="font-display max-w-full break-words text-2xl font-bold text-gold-600 sm:text-3xl">
              {phrases[oi].ar}
            </div>
            <button onClick={e => { e.stopPropagation(); speak(phrases[oi].en); }}
              className="font-en mt-3 flex items-center gap-2 text-xs text-body" dir="ltr">
              <Volume2 className="h-3.5 w-3.5 shrink-0 text-gold-500" /> استمع مرة أخرى
            </button>
            <p className="font-en mt-2 max-w-full break-words text-sm text-sub" dir="ltr">
              {phrases[oi].en}
            </p>
          </div>
        )}
        onKnow={oi => { store.recordAnswer(`phrase:${oi}`, true); store.hearPhrase(oi); }}
        onDontKnow={oi => store.recordAnswer(`phrase:${oi}`, false)}
        progressKeys={items.map(x => x.key)}
      />
    </div>
  );
}

/* ═══ GRAMMAR / TENSES ═══════════════════════════════════════ */
function GrammarTenses() {
  const [open, setOpen] = useState<string | null>(grammarLessons[0].id);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-lg font-black text-heading">الأزمنة الإنجليزية</h3>
        <span className="badge-gold">{grammarLessons.length} زمن</span>
      </div>
      <div className="space-y-2.5">
        {grammarLessons.map(l => {
          const isO = open === l.id;
          return (
            <div key={l.id} className={cn("overflow-hidden rounded-2xl transition-all",
              isO ? "card-glow" : "card")}>
              <button onClick={() => setOpen(isO ? null : l.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-right">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all",
                    isO ? "btn-primary" : "bg-layer border border-[var(--color-border)]")}>
                    <BookOpenText className={cn("h-4 w-4", isO ? "text-heading" : "text-sub")} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-heading">{l.title}</div>
                    <div className="font-en truncate text-[10px] font-bold tracking-wider text-muted">{l.latin}</div>
                  </div>
                </div>
                <motion.div animate={{ rotate: isO ? 45 : 0 }} transition={{ duration:.25 }}>
                  <Plus className={cn("h-5 w-5 shrink-0", isO ? "text-gold-500" : "text-muted")} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isO && (
                  <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
                    exit={{ height:0, opacity:0 }} transition={{ duration:.35, ease:[.4,0,.2,1] }}>
                    <div className="px-4 pb-5 pt-2">
                      <div className="gold-line mb-4" />
                      <p className="text-sm leading-relaxed text-body">{l.body}</p>
                      <div className="mt-3 space-y-2">
                        {l.examples.map(ex => (
                          <div key={ex.en} className="state-gold rounded-xl p-3">
                            <button onClick={() => speak(ex.en)}
                              className="font-en flex items-center gap-2 text-sm font-semibold text-heading" dir="ltr">
                              <Volume2 className="h-3.5 w-3.5 shrink-0 text-gold-500" /> {ex.en}
                            </button>
                            <p className="mt-1 text-xs text-sub">{ex.ar}</p>
                          </div>
                        ))}
                      </div>
                      <div className="state-gold mt-3 flex gap-2.5 rounded-xl p-3">
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
                        <p className="text-xs leading-relaxed text-body">
                          <span className="font-black text-gold-600">القاعدة الذهبية: </span>
                          {l.tip}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ TABS ═══════════════════════════════════════════════════ */
const TABS = [
  { id: "cards"   as Tab, label: "المفردات",      icon: Layers },
  { id: "phrases" as Tab, label: "العبارات (185)", icon: MessagesSquare },
  { id: "grammar" as Tab, label: "الازمنة (12)",   icon: BookOpenText },
];

export default function ReviewSection() {
  const [tab, setTab] = useState<Tab>("cards");
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="gold-line flex-1" />
        <span className="font-en text-[10px] font-black tracking-[.3em] text-gold-600">REVIEW</span>
        <div className="gold-line flex-1" />
      </div>
      <div className="mb-5 grid grid-cols-3 gap-2">
        {TABS.map(t => {
          const I = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("btn flex items-center justify-center gap-1 rounded-xl px-2 py-2.5 text-[12px]",
                tab === t.id ? "pill-active" : "pill-idle")}>
              <I className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab}
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
          transition={{ duration:.28 }}>
          {tab === "cards"   && <VocabCards />}
          {tab === "phrases" && <PhraseCards />}
          {tab === "grammar" && <GrammarTenses />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
