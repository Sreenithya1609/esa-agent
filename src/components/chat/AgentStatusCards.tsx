import { CheckCircle2, Loader2, Clock } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  color: string;
  glowColor: string;
  borderColor: string;
  bgColor: string;
  icon: React.ReactNode;
}

function StatCard({ label, value, sub, color, glowColor, borderColor, bgColor, icon }: StatCardProps) {
  return (
    <div
      className="flex flex-col items-center gap-3 group"
      style={{ flex: "1 1 0", minWidth: 0 }}
    >
      {/* Circular glassmorphism card */}
      <div
        className="relative flex flex-col items-center justify-center transition-transform duration-300 group-hover:scale-105"
        style={{
          width: "clamp(120px, 14vw, 200px)",
          height: "clamp(120px, 14vw, 200px)",
          borderRadius: "50%",
          background: bgColor,
          border: `1.5px solid ${borderColor}`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: `0 0 clamp(20px, 3vw, 48px) ${glowColor}, 0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)`,
        }}
      >
        {/* Ambient inner glow ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.55) 0%, transparent 65%)`,
          }}
        />

        {/* Icon */}
        <div className="relative z-10 mb-1" style={{ color }}>
          {icon}
        </div>

        {/* Value */}
        <span
          className="relative z-10 font-bold leading-none tabular-nums"
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2.8rem)",
            color,
            textShadow: `0 0 20px ${glowColor}`,
          }}
        >
          {value}
        </span>
      </div>

      {/* Label below circle */}
      <div className="text-center space-y-0.5">
        <span
          className="block font-bold text-text-primary leading-tight"
          style={{ fontSize: "clamp(11px, 1.1vw, 14px)" }}
        >
          {label}
        </span>
        <span
          className="block text-text-tertiary leading-snug"
          style={{ fontSize: "clamp(9px, 0.9vw, 11px)" }}
        >
          {sub}
        </span>
      </div>
    </div>
  );
}

export function AgentStatusCards({
  inProgress = 0,
  completed = 17,
  inQueue = 1,
}: {
  inProgress?: number;
  completed?: number;
  inQueue?: number;
}) {
  const cards: StatCardProps[] = [
    {
      label: "In Progress",
      value: inProgress,
      sub: "Active agents working",
      color: "#4F6EF7",
      glowColor: "rgba(79,110,247,0.22)",
      borderColor: "rgba(79,110,247,0.25)",
      bgColor: "rgba(79,110,247,0.07)",
      icon:
        inProgress > 0 ? (
          <Loader2
            className="animate-spin"
            style={{ width: "clamp(18px, 2vw, 28px)", height: "clamp(18px, 2vw, 28px)" }}
            strokeWidth={2}
          />
        ) : (
          <div
            className="rounded-full border-2 opacity-30"
            style={{
              width: "clamp(18px, 2vw, 28px)",
              height: "clamp(18px, 2vw, 28px)",
              borderColor: "#4F6EF7",
            }}
          />
        ),
    },
    {
      label: "Completed",
      value: completed,
      sub: "Tasks finished",
      color: "#0FC4A7",
      glowColor: "rgba(15,196,167,0.25)",
      borderColor: "rgba(15,196,167,0.28)",
      bgColor: "rgba(15,196,167,0.07)",
      icon: (
        <CheckCircle2
          style={{ width: "clamp(18px, 2vw, 28px)", height: "clamp(18px, 2vw, 28px)" }}
          strokeWidth={2}
        />
      ),
    },
    {
      label: "In Queue",
      value: inQueue,
      sub: "Waiting to start",
      color: "#9B72F7",
      glowColor: "rgba(155,114,247,0.22)",
      borderColor: "rgba(155,114,247,0.25)",
      bgColor: "rgba(155,114,247,0.07)",
      icon: (
        <Clock
          style={{ width: "clamp(18px, 2vw, 28px)", height: "clamp(18px, 2vw, 28px)" }}
          strokeWidth={2}
        />
      ),
    },
  ];

  return (
    <div
      className="w-full select-none"
      style={{
        display: "flex",
        gap: "clamp(16px, 4vw, 64px)",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "clamp(8px, 2vw, 24px) 0",
      }}
    >
      {cards.map((card, i) => (
        <StatCard key={i} {...card} />
      ))}
    </div>
  );
}
