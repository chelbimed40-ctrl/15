import { GraduationCap, BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(145deg, #1e1407 0%, #0f0a04 100%)",
        border: "1.5px solid rgba(234,179,8,.20)",
      }}>

      {/* top gold line */}
      <div style={{
        height: "2px",
        background: "linear-gradient(90deg, transparent, #eab308 30%, #fde047 70%, transparent)"
      }} />

      <div className="mx-auto max-w-2xl px-6 py-8">
        {/* ── Main row ── */}
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:justify-between sm:text-right">

          {/* Logo + App name */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #92400e, #f59e0b)",
                  boxShadow: "0 4px 16px rgba(234,179,8,.35)"
                }}>
                <BookOpen className="h-5 w-5 text-amber-50" />
              </div>
              <div className="leading-none">
                <div className="font-en text-[9px] font-black tracking-[.35em] text-amber-600/70 uppercase">Titans</div>
                <div className="font-en text-lg font-black text-white" style={{ textShadow:"0 0 20px rgba(234,179,8,.4)" }}>
                  ENGLISH MASTERY
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-amber-800/60">
              منصة متكاملة لإتقان الإنجليزية
            </p>
          </div>

          {/* ── Professor card ── */}
          <div className="flex flex-col items-center gap-3 sm:items-end">
            <div className="relative overflow-hidden rounded-2xl px-5 py-4 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(120,60,4,.55), rgba(161,98,7,.35))",
                border: "1.5px solid rgba(234,179,8,.40)",
                boxShadow: "0 4px 20px rgba(161,98,7,.30), inset 0 1px 0 rgba(253,224,71,.15)"
              }}>
              {/* shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  background: "linear-gradient(120deg, transparent 30%, rgba(253,224,71,.25) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 3s linear infinite"
                }} />

              <div className="relative">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-en text-[10px] font-black uppercase tracking-widest opacity-80">Professeur</span>
                </div>
                <div className="font-display mt-1 text-2xl font-black"
                  style={{
                    color: "#fde047",
                    textShadow: "0 0 20px rgba(253,224,71,.6), 0 0 40px rgba(234,179,8,.3)"
                  }}>
                  محمد شلبي
                </div>
                <div className="font-en mt-1 text-[9px] font-bold tracking-[.3em] text-amber-600/60 uppercase">
                  Mohamed Chelbi
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="my-6" style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(234,179,8,.25) 50%, transparent)"
        }} />

        {/* ── Bottom row ── */}
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <p className="text-[11px] text-amber-800/50">
            Titans · تقدّمك محفوظ على جهازك
          </p>
          <p className="font-en text-[10px] font-black tracking-[.25em] text-amber-700/40 uppercase">
            ENGLISH MASTERY PLATFORM
          </p>
        </div>
      </div>
    </footer>
  );
}
