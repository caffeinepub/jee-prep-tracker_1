import {
  BookOpen,
  CheckCircle,
  Clock,
  Rocket,
  Star,
  Target,
  Timer,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CLASS_11_CHAPTERS,
  CLASS_12_CHAPTERS,
  buildInitialChapterData,
} from "../data/syllabusData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { ClassMap } from "../types";

type Page = "dashboard" | "syllabus" | "schedule" | "timer" | "missionjeet";

interface Props {
  onNavigate: (page: Page) => void;
}

interface MissionGoal {
  targetRank: string;
  dreamCollege: string;
  dreamBranch: string;
}

const QUOTES = [
  "The expert in anything was once a beginner. Start now.",
  "Hard work beats talent when talent doesn't work hard.",
  "IIT is not a dream, it's a decision. Decide today.",
  "Every chapter you complete is a step closer to your IIT seat.",
  "Pain is temporary. An IIT degree is forever.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Study not to pass the exam, but to change your life.",
  "The only way to do great work is to love what you do.",
  "Don't wish it were easier. Wish you were better.",
  "Your future self is counting on you. Don't let them down.",
];

const MILESTONES = [
  {
    pct: 0,
    label: "Just beginning.",
    sub: "Every journey starts with a single step.",
    color: "#00d4e0",
    glow: "rgba(0,212,224,0.4)",
  },
  {
    pct: 25,
    label: "Building momentum!",
    sub: "You're 25% there. Keep the fire alive.",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.4)",
  },
  {
    pct: 50,
    label: "Halfway there.",
    sub: "Stay hungry. The best half is ahead.",
    color: "#22c55e",
    glow: "rgba(34,197,94,0.4)",
  },
  {
    pct: 75,
    label: "Almost there!",
    sub: "75% done. Push harder than ever.",
    color: "#f97316",
    glow: "rgba(249,115,22,0.4)",
  },
  {
    pct: 100,
    label: "Mission accomplished!",
    sub: "IIT awaits. You did it!",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.4)",
  },
];

export default function MissionJeet({ onNavigate }: Props) {
  const [chapters] = useLocalStorage<ClassMap>(
    "jee_chapters",
    buildInitialChapterData(),
  );
  const [goal, setGoal] = useLocalStorage<MissionGoal>("jee_mission_goal", {
    targetRank: "",
    dreamCollege: "",
    dreamBranch: "",
  });
  const [form, setForm] = useState<MissionGoal>(goal);

  const completionPct = useMemo(() => {
    const total =
      Object.values(CLASS_11_CHAPTERS).flat().length +
      Object.values(CLASS_12_CHAPTERS).flat().length;
    if (total === 0) return 0;
    let done = 0;
    for (const subject of Object.keys(CLASS_11_CHAPTERS)) {
      for (const ch of CLASS_11_CHAPTERS[subject]) {
        if (chapters?.class11?.[subject]?.[ch]?.done) done++;
      }
    }
    for (const subject of Object.keys(CLASS_12_CHAPTERS)) {
      for (const ch of CLASS_12_CHAPTERS[subject]) {
        if (chapters?.class12?.[subject]?.[ch]?.done) done++;
      }
    }
    return Math.round((done / total) * 100);
  }, [chapters]);

  const jeeDate = new Date("2026-04-05");
  const today = new Date();
  const msLeft = jeeDate.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  const weeksLeft = Math.floor(daysLeft / 7);

  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const quote = QUOTES[dayOfYear % QUOTES.length];

  const activeMilestoneIdx = MILESTONES.reduce((acc, m, i) => {
    if (completionPct >= m.pct) return i;
    return acc;
  }, 0);

  function saveGoal() {
    setGoal(form);
    toast.success("Mission goal saved! You've got this! 🚀");
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      <section className="text-center py-10" data-ocid="mission.section">
        <div className="flex justify-center mb-4">
          <div
            className="p-4 rounded-full"
            style={{
              background: "rgba(0,212,224,0.12)",
              boxShadow:
                "0 0 40px rgba(0,212,224,0.3), inset 0 0 20px rgba(0,212,224,0.05)",
              border: "1px solid rgba(0,212,224,0.25)",
            }}
          >
            <Rocket
              className="w-10 h-10 text-primary"
              style={{ filter: "drop-shadow(0 0 10px #00d4e0)" }}
            />
          </div>
        </div>
        <h1
          className="font-display font-black text-5xl md:text-6xl tracking-widest mb-4 gradient-text"
          style={{ textShadow: "0 0 40px rgba(0,212,224,0.4)" }}
        >
          MISSION JEET
        </h1>
        <p className="text-foreground/60 text-lg md:text-xl max-w-xl mx-auto">
          Your path to IIT starts here.{" "}
          <span className="text-primary font-semibold">
            One chapter at a time.
          </span>
        </p>
        <div
          className="mt-8 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, #00d4e0, #a855f7, #00d4e0, transparent)",
            boxShadow: "0 0 12px rgba(0,212,224,0.5)",
          }}
        />
      </section>

      {/* Countdown + Goal row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Countdown */}
        <div
          className="glass rounded-2xl p-6"
          data-ocid="mission.countdown.card"
          style={{ border: "1px solid rgba(0,212,224,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-base text-foreground/80 tracking-wider uppercase">
              Countdown to JEE Main
            </h2>
          </div>
          <div className="text-center py-4">
            <div
              className="font-display font-black text-7xl text-primary"
              style={{
                textShadow:
                  "0 0 30px rgba(0,212,224,0.6), 0 0 60px rgba(0,212,224,0.3)",
              }}
            >
              {daysLeft}
            </div>
            <div className="text-foreground/50 text-sm mt-2 uppercase tracking-widest">
              Days to JEE Main
            </div>
            <div
              className="mt-4 inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{
                background: "rgba(168,85,247,0.15)",
                border: "1px solid rgba(168,85,247,0.3)",
                color: "#a855f7",
              }}
            >
              {weeksLeft} weeks remaining
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-foreground/30">
            Target: April 5, 2026
          </div>
        </div>

        {/* Goal Card */}
        <div
          className="glass rounded-2xl p-6"
          data-ocid="mission.goal.card"
          style={{ border: "1px solid rgba(168,85,247,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-5 h-5" style={{ color: "#a855f7" }} />
            <h2 className="font-display font-bold text-base text-foreground/80 tracking-wider uppercase">
              My Dream Goal
            </h2>
          </div>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="goal-rank"
                className="text-xs text-foreground/50 uppercase tracking-wider mb-1 block"
              >
                Target Rank
              </label>
              <input
                id="goal-rank"
                type="number"
                data-ocid="mission.goal.rank.input"
                value={form.targetRank}
                onChange={(e) =>
                  setForm((p) => ({ ...p, targetRank: e.target.value }))
                }
                placeholder="e.g. 500"
                className="w-full bg-white/5 border border-primary/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="goal-college"
                className="text-xs text-foreground/50 uppercase tracking-wider mb-1 block"
              >
                Dream College
              </label>
              <input
                id="goal-college"
                type="text"
                data-ocid="mission.goal.college.input"
                value={form.dreamCollege}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dreamCollege: e.target.value }))
                }
                placeholder="e.g. IIT Bombay"
                className="w-full bg-white/5 border border-primary/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="goal-branch"
                className="text-xs text-foreground/50 uppercase tracking-wider mb-1 block"
              >
                Dream Branch
              </label>
              <input
                id="goal-branch"
                type="text"
                data-ocid="mission.goal.branch.input"
                value={form.dreamBranch}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dreamBranch: e.target.value }))
                }
                placeholder="e.g. Computer Science"
                className="w-full bg-white/5 border border-primary/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-colors"
              />
            </div>
            <button
              type="button"
              data-ocid="mission.goal.save.button"
              onClick={saveGoal}
              className="w-full mt-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, rgba(168,85,247,0.3), rgba(0,212,224,0.2))",
                border: "1px solid rgba(168,85,247,0.4)",
                color: "#a855f7",
                boxShadow: "0 0 20px rgba(168,85,247,0.15)",
              }}
            >
              Save My Goal 🎯
            </button>
          </div>
          {goal.dreamCollege && (
            <div
              className="mt-4 p-3 rounded-lg text-center text-sm"
              style={{
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.15)",
              }}
            >
              <span className="text-foreground/50">Your goal: </span>
              <span style={{ color: "#a855f7" }} className="font-semibold">
                {goal.dreamCollege} – {goal.dreamBranch}
              </span>
              {goal.targetRank && (
                <span className="text-foreground/50">
                  {" "}
                  (Rank {goal.targetRank})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Milestones */}
      <div
        className="glass rounded-2xl p-6"
        data-ocid="mission.milestones.card"
        style={{ border: "1px solid rgba(34,197,94,0.15)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5" style={{ color: "#22c55e" }} />
            <h2 className="font-display font-bold text-base text-foreground/80 tracking-wider uppercase">
              Progress Milestones
            </h2>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(0,212,224,0.12)",
              border: "1px solid rgba(0,212,224,0.25)",
              color: "#00d4e0",
            }}
          >
            {completionPct}% Complete
          </div>
        </div>

        <div className="mb-8 h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${completionPct}%`,
              background: "linear-gradient(90deg, #00d4e0, #a855f7, #22c55e)",
              boxShadow: "0 0 10px rgba(0,212,224,0.5)",
            }}
          />
        </div>

        <div className="space-y-4">
          {MILESTONES.map((m, i) => {
            const isActive = i === activeMilestoneIdx;
            const isPast = completionPct >= m.pct;
            const bgRgb = m.glow
              .replace("rgba(", "")
              .replace(")", "")
              .split(",")
              .slice(0, 3)
              .join(",");
            return (
              <div
                key={m.pct}
                data-ocid={`mission.milestone.item.${i + 1}`}
                className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300"
                style={{
                  background: isActive
                    ? `rgba(${bgRgb}, 0.08)`
                    : "rgba(255,255,255,0.02)",
                  border: isActive
                    ? `1px solid ${m.color}40`
                    : "1px solid rgba(255,255,255,0.04)",
                  boxShadow: isActive ? `0 0 20px ${m.glow}` : "none",
                }}
              >
                <div
                  className="flex-shrink-0 w-1 self-stretch rounded-full"
                  style={{
                    background: isPast ? m.color : "rgba(255,255,255,0.1)",
                  }}
                />
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle
                    className="w-5 h-5"
                    style={{
                      color: isPast ? m.color : "rgba(255,255,255,0.2)",
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-bold text-sm"
                      style={{
                        color: isActive
                          ? m.color
                          : isPast
                            ? `${m.color}cc`
                            : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {m.pct}% —
                    </span>
                    <span
                      className="font-semibold text-sm"
                      style={{
                        color: isActive
                          ? m.color
                          : isPast
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {m.label}
                    </span>
                    {isActive && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: `${m.color}22`,
                          color: m.color,
                          border: `1px solid ${m.color}44`,
                        }}
                      >
                        YOU ARE HERE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/40 mt-0.5">{m.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Affirmation */}
      <div
        className="glass rounded-2xl p-6"
        data-ocid="mission.affirmation.card"
        style={{ border: "1px solid rgba(251,191,36,0.15)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4" style={{ color: "#fbbf24" }} />
          <h2 className="font-display font-bold text-sm text-foreground/60 tracking-widest uppercase">
            Today's Affirmation
          </h2>
        </div>
        <blockquote
          className="pl-4 italic text-lg text-foreground/80 leading-relaxed"
          style={{
            borderLeft: "3px solid #fbbf24",
            textShadow: "0 0 20px rgba(251,191,36,0.1)",
          }}
        >
          "{quote}"
        </blockquote>
      </div>

      {/* Quick Nav */}
      <div
        className="flex flex-col sm:flex-row gap-4 pb-4"
        data-ocid="mission.quicknav.section"
      >
        <button
          type="button"
          data-ocid="mission.syllabus.button"
          onClick={() => onNavigate("syllabus")}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-[1.02]"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,212,224,0.2), rgba(0,212,224,0.05))",
            border: "1px solid rgba(0,212,224,0.3)",
            color: "#00d4e0",
            boxShadow: "0 0 30px rgba(0,212,224,0.15)",
          }}
        >
          <BookOpen className="w-5 h-5" />
          Start Studying →
        </button>
        <button
          type="button"
          data-ocid="mission.timer.button"
          onClick={() => onNavigate("timer")}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-200 hover:scale-[1.02]"
          style={{
            background:
              "linear-gradient(135deg, rgba(168,85,247,0.2), rgba(168,85,247,0.05))",
            border: "1px solid rgba(168,85,247,0.3)",
            color: "#a855f7",
            boxShadow: "0 0 30px rgba(168,85,247,0.15)",
          }}
        >
          <Timer className="w-5 h-5" />
          Track Timer →
        </button>
      </div>
    </div>
  );
}
