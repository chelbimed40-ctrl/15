import { motion } from "framer-motion";
import { Trophy, BarChart3, MessagesSquare, BookOpenText, Layers, Target } from "lucide-react";
import { useProgress, getLast7Days, XP_PER_LEVEL } from "../lib/store";
import { decks, phrases, grammarLessons } from "../data/content";
import { cn } from "../utils/cn";

/* ── Progress Card Helper ── */
function ProgressStat({ label, value, total, colorCls, icon: Icon }: any) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="card group relative overflow-hidden p-5 transition-all duration-300 hover:border-gold-300 hover:shadow-sh-raised">
       <div className={cn("absolute right-0 top-0 h-1 w-full opacity-50 transition-opacity group-hover:opacity-100", colorCls)} />
       <div className="flex items-start justify-between">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colorCls.replace("bg-","bg-") + "/10")}>
             <Icon className={cn("h-5 w-5", colorCls.replace("bg-","text-"))} />
          </div>
          <div className="text-right">
             <div className="font-en text-2xl font-black text-heading">{pct}%</div>
             <div className="text-[10px] font-black text-sub uppercase tracking-wider">{label}</div>
          </div>
       </div>
       <div className="mt-4 space-y-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-layer">
             <motion.div
               initial={{ width: 0 }}
               whileInView={{ width: `${pct}%` }}
               viewport={{ once: true }}
               transition={{ duration: 1.2, ease: "circOut" }}
               className={cn("h-full rounded-full", colorCls)}
             />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-muted">
             <span>{value} مُتقَن</span>
             <span>{total} إجمالي</span>
          </div>
       </div>
    </div>
  );
}

export default function ProgressSection() {
  const p     = useProgress();
  const level = Math.floor(p.xp / XP_PER_LEVEL) + 1;
  const into  = p.xp % XP_PER_LEVEL;
  const week  = getLast7Days(p.activity);
  const maxD  = Math.max(...week.map(d => d.xp), 10);
  const today = new Date().toISOString().slice(0, 10);

  const wordKeys: string[] = [];
  decks.forEach(d => d.words.forEach((_, i) => wordKeys.push(`${d.id}:${i}`)));
  const totalW    = wordKeys.length;
  const masteredW = wordKeys.filter(k => (p.wordStats[k]?.mastery ?? 0) === 5).length;

  const phraseKeys = phrases.map((_, i) => `phrase:${i}`);
  const masteredP = phraseKeys.filter(k => (p.wordStats[k]?.mastery ?? 0) === 5).length;

  const tenseKeys = grammarLessons.map(l => `tense:${l.id}`);
  const tenseTC   = tenseKeys.reduce((s, k) => s + (p.wordStats[k]?.correctCount ?? 0), 0);
  const tenseTW   = tenseKeys.reduce((s, k) => s + (p.wordStats[k]?.wrongCount ?? 0), 0);
  const tenseTA   = tenseTC + tenseTW;
  const tPct    = tenseTA > 0 ? Math.round((tenseTC / tenseTA) * 100) : 0;
  const masteredT= tenseKeys.filter(k => (p.wordStats[k]?.mastery ?? 0) >= 3).length;

  const quizzes  = p.quizHistory.length;
  const avgScore = quizzes > 0 ? Math.round(p.quizHistory.reduce((s, q) => s + q.score / q.total, 0) / quizzes * 100) : 0;
  const QL: Record<string, string> = { "en-ar":"EN→AR","ar-en":"AR→EN","mixed":"MIXED","pronunciation":"LISTEN","tenses":"TENSES" };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
         <div className="gold-line flex-1" />
         <h2 className="text-xl font-black text-heading">لوحة الإنجازات</h2>
         <div className="gold-line flex-1" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
         <ProgressStat label="المفردات" value={masteredW} total={totalW} colorCls="bg-gold-400" icon={Layers} />
         <ProgressStat label="العبارات" value={masteredP} total={phrases.length} colorCls="bg-accent-terra" icon={MessagesSquare} />
         <ProgressStat label="الأزمنة"  value={masteredT} total={grammarLessons.length} colorCls="bg-accent-teal" icon={BookOpenText} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
         <div className="card-dark relative flex flex-col items-center justify-center p-8 text-center">
            <div className="absolute right-4 top-4">
               <Trophy className="h-6 w-6 text-gold-300 opacity-50" />
            </div>
            <div className="font-en text-[11px] font-black uppercase tracking-widest text-muted">Current Rank</div>
            <div className="gold-text mt-2 font-display text-5xl font-black gold-glow sm:text-6xl">الريادة</div>
            <div className="mt-4 flex items-center gap-2">
               <div className="font-en text-4xl font-black text-white">{level}</div>
               <div className="text-right leading-none">
                  <div className="text-[10px] font-bold text-muted uppercase">Level</div>
                  <div className="font-en text-xs font-black text-gold-400">{p.xp.toLocaleString()} XP</div>
               </div>
            </div>
            <div className="mt-6 w-full max-w-[200px]">
               <div className="mb-2 flex justify-between text-[10px] font-bold text-muted/60">
                  <span>Progress to {level + 1}</span>
                  <span>{Math.round((into / XP_PER_LEVEL) * 100)}%</span>
               </div>
               <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="pbar h-full rounded-full" style={{ width: `${(into / XP_PER_LEVEL) * 100}%` }} />
               </div>
            </div>
         </div>

         <div className="card p-6">
            <div className="mb-6 flex items-center justify-between">
               <div className="flex items-center gap-2 font-black text-heading">
                  <BarChart3 className="h-4 w-4 text-gold-500" />
                  <span>نشاط الأسبوع</span>
               </div>
               <div className="badge-gold">XP Activity</div>
            </div>
            <div className="flex h-32 items-end justify-between gap-2" dir="ltr">
               {week.map((d, i) => (
                  <div key={d.iso} className="flex flex-1 flex-col items-center gap-2">
                     {d.xp > 0 && <span className="font-en text-[10px] font-black text-gold-600">{d.xp}</span>}
                     <motion.div
                       initial={{ height: 0 }}
                       whileInView={{ height: `${Math.max((d.xp / maxD) * 100, 4)}%` }}
                       viewport={{ once: true }}
                       transition={{ duration: 0.8, delay: i * 0.05 }}
                       className={cn("w-full max-w-[24px] rounded-t-lg transition-all",
                         d.xp > 0 ? "chart-bar shadow-gold-sm" : "chart-bar-empty",
                         d.iso === today && "ring-2 ring-gold-300 ring-offset-2 ring-offset-surface")}
                     />
                     <span className={cn("text-[10px] font-black uppercase tracking-tighter",
                       d.iso === today ? "text-gold-600" : "text-muted")}>{d.label}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      <div className="card p-6">
         <div className="mb-6 flex items-center justify-between border-b border-layer pb-4">
            <div className="flex items-center gap-2">
               <BookOpenText className="h-5 w-5 text-accent-teal" />
               <h3 className="text-lg font-black text-heading">تفاصيل إنجاز الأزمنة</h3>
            </div>
            <span className="font-en badge-gold text-accent-teal">{tPct}% Accuracy</span>
         </div>
         <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
               { title: "المضارع", ids: ["present-simple", "present-continuous", "present-perfect", "present-perfect-continuous"], accent: "emerald" },
               { title: "الماضي",  ids: ["past-simple", "past-continuous", "past-perfect", "past-perfect-continuous"], accent: "amber" },
               { title: "المستقبل", ids: ["future-simple", "future-continuous", "future-perfect", "future-perfect-continuous"], accent: "crimson" }
            ].map(g => (
               <div key={g.title} className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-sub uppercase tracking-widest">
                     <div className={cn("h-2 w-2 rounded-full", `bg-accent-${g.accent}`)} />
                     {g.title}
                  </div>
                  <div className="space-y-2">
                     {g.ids.map(id => {
                        const l = grammarLessons.find(x => x.id === id)!;
                        const ws = p.wordStats[`tense:${id}`];
                        const c = ws?.correctCount ?? 0, w = ws?.wrongCount ?? 0, t = c + w;
                        const pc = t > 0 ? Math.round((c / t) * 100) : 0;
                        const m = ws?.mastery ?? 0;
                        return (
                           <div key={id} className="group rounded-xl border border-layer bg-layer/30 p-2.5 transition-colors hover:border-gold-300">
                              <div className="mb-1 flex items-center justify-between font-en text-[10px] font-black">
                                 <span className="truncate text-mocha opacity-70">{l.latin}</span>
                                 <span className={cn(pc >= 80 ? "text-accent-success" : pc >= 50 ? "text-accent-amber" : "text-accent-danger")}>
                                    {t > 0 ? `${pc}%` : "—"}
                                 </span>
                              </div>
                              <div className="flex gap-0.5">
                                 {[1,2,3,4,5].map(s => (
                                    <div key={s} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
                                      s <= m ? (s === 5 ? "ms-5" : "ms-3") : "ms-0")} />
                                 ))}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="card p-6">
         <div className="mb-6 flex items-center justify-between border-b border-layer pb-4">
            <div className="flex items-center gap-2">
               <Target className="h-5 w-5 text-gold-500" />
               <h3 className="text-lg font-black text-heading">سجل المحاولات الأخيرة</h3>
            </div>
            {quizzes > 0 && <span className="badge-gold">AVG {avgScore}%</span>}
         </div>
         {quizzes === 0 ? (
            <div className="py-12 text-center">
               <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-layer">
                  <Target className="h-8 w-8 text-muted" />
               </div>
               <p className="font-bold text-sub">لم تقم بأي اختبارات بعد</p>
               <p className="text-xs text-muted">ابدأ أول اختبار لك في قسم الاختبارات!</p>
            </div>
         ) : (
            <div className="space-y-3">
               {p.quizHistory.slice(0, 5).map(q => {
                  const pc = Math.round((q.score / q.total) * 100);
                  return (
                     <div key={q.id} className="flex items-center justify-between rounded-2xl bg-layer/50 p-4 transition-transform hover:scale-[1.01]">
                        <div className="flex items-center gap-4">
                           <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl font-en text-sm font-black",
                             pc >= 80 ? "state-ok shadow-sh-card" : pc >= 60 ? "state-gold border-gold-300" : "state-err")}>
                              {pc}%
                           </div>
                           <div>
                              <div className="text-sm font-black text-heading">{QL[q.type] || q.type}</div>
                              <div className="font-en text-[11px] font-bold text-sub tracking-tight">{q.score} Correct / {q.total} Total</div>
                           </div>
                        </div>
                        <div className="text-left">
                           <div className="font-en text-xs font-black text-gold-600">+{q.xpEarned} XP</div>
                           <div className="font-en text-[10px] font-bold text-muted uppercase tracking-tighter">{q.date}</div>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}
      </div>
    </div>
  );
}
