import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  kicker,
  title,
  desc,
}: {
  kicker: string;
  title: ReactNode;
  desc?: string;
}) {
  return (
    <div className="mx-auto mb-14 max-w-3xl text-center">
      <Reveal>
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-glow/25 bg-glow/5 px-4 py-1.5 text-sm font-bold tracking-wide text-glow-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-glow animate-pulse-soft" />
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="mt-4 text-4xl font-black leading-[1.25] text-white md:text-[3.4rem] md:leading-[1.2]">
          {title}
        </h2>
      </Reveal>
      {desc && (
        <Reveal delay={0.2}>
          <p className="mt-5 text-lg leading-relaxed text-mist">{desc}</p>
        </Reveal>
      )}
    </div>
  );
}

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1800, bounce: 0 });

  useEffect(() => {
    if (inView) mv.set(to);
  }, [inView, to, mv]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("en-US") + suffix;
    });
    return unsub;
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}
