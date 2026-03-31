import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import { SUBJECTS, buildInitialChapterData } from "../data/syllabusData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { ClassMap } from "../types";

type Page = "dashboard" | "syllabus" | "timer" | "dailytracker" | "missionjeet";

interface Props {
  onNavigate: (p: Page) => void;
}

const STAT_ACCENTS = [
  "card-accent-green",
  "card-accent-cyan",
  "card-accent-purple",
  "card-accent-orange",
] as const;

const SUBJECT_PROGRESS: Record<string, string> = {
  Physics: "progress-cyan",
  Chemistry: "progress-green",
  Maths: "progress-purple",
};

const STAT_ICON_COLORS = [
  "text-emerald-400",
  "text-cyan-400",
  "text-purple-400",
  "text-orange-400",
];

const MOTIVATIONAL_QUOTES = [
  {
    quote:
      "You didn't come this far to only come this far. Keep going — you are unstoppable.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "The pain you feel today is the strength you will feel tomorrow. Don't you dare stop now.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "Every single day is a chance to become better than the person you were yesterday. Take it.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "The fight is won or lost far away from witnesses — in the study room, in the silence, in the grind.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "Rest if you must, but don't you quit. You are closer to your dream than you think.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "Suffer now in the dark so you can shine later in the light. No shortcuts. No excuses.",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "Your only competition is who you were yesterday. Show up today and beat him.",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "I wake up every morning and ask — how can I work harder today than I did yesterday? So should you.",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "You are not behind. You are exactly where you need to be. Trust the process and keep going.",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "Don't wait for the perfect moment. Take this moment right now and make it perfect.",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "You are not going to be remembered for playing it safe. Go all in. Bet on yourself.",
    author: "Elon Musk",
  },
  {
    quote:
      "Failure is not the end — it is data. Learn from it, adapt, and go again harder.",
    author: "Elon Musk",
  },
  {
    quote:
      "You have more potential locked inside you than you have ever used in your life. Unlock it today.",
    author: "Elon Musk",
  },
  {
    quote:
      "Stop waiting for motivation. Discipline is what gets you there when motivation is long gone.",
    author: "Elon Musk",
  },
  {
    quote:
      "The people who change their world are the ones who were told it was impossible — and did it anyway.",
    author: "Elon Musk",
  },
  {
    quote:
      "The day you plant the seed is not the day you eat the fruit. Be patient. Be consistent. Keep going.",
    author: "APJ Abdul Kalam",
  },
  {
    quote:
      "Your dream is valid. Now go build the version of yourself that is worthy of it.",
    author: "APJ Abdul Kalam",
  },
  {
    quote:
      "One more page. One more problem. One more hour. That is how legends are built — slowly, then all at once.",
    author: "APJ Abdul Kalam",
  },
  {
    quote:
      "Stars shine the brightest in the darkest nights. This struggle you are going through is making you shine.",
    author: "APJ Abdul Kalam",
  },
  {
    quote:
      "You were born to do something extraordinary. Don't let fear or laziness steal that destiny from you.",
    author: "APJ Abdul Kalam",
  },
  {
    quote:
      "I hated every minute of training. But I said — don't quit. Suffer now and live the rest of your life as a champion.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "Don't count the days. Make the days count. Every single one of them.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "Impossible is not a fact. It is an opinion. Impossible is temporary. Impossible is nothing.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "He who is not courageous enough to take risks will accomplish nothing in life. Take the risk.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "Champions are made from something deep inside them — a hunger, a dream, an unbreakable will. Find yours.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "When you feel like quitting, think about why you started. That reason is still waiting for you.",
    author: "Virat Kohli",
  },
  {
    quote:
      "You don't need anyone's permission to be great. Give that permission to yourself — right now.",
    author: "Virat Kohli",
  },
  {
    quote:
      "Stop doubting yourself. The world will be convinced the moment you are.",
    author: "Virat Kohli",
  },
  {
    quote:
      "Success is not given. It is earned — in the books, in the practice, in the grind, every single day.",
    author: "Virat Kohli",
  },
  {
    quote:
      "Be so relentlessly good that the world has no choice but to notice you.",
    author: "Virat Kohli",
  },
  {
    quote:
      "I've failed over and over in my life. That is exactly why I succeed. Failure is the path, not the stop.",
    author: "Michael Jordan",
  },
  {
    quote:
      "The ceiling you see right now is just the floor of the next level. Break through it.",
    author: "Michael Jordan",
  },
  {
    quote:
      "Talent will get you in the room. Relentless, obsessive work will make you the one who owns it.",
    author: "Michael Jordan",
  },
  {
    quote:
      "Your mind gives up long before your body does. Train your mind first, everything else follows.",
    author: "Michael Jordan",
  },
  {
    quote:
      "The people who are crazy enough to think they can change the world are the ones who do. Be that person.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Your time here is limited. Don't waste a single day living someone else's version of your life.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Every morning you have two choices: keep sleeping with your dreams, or wake up and go build them.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote:
      "The last few reps are the ones that build strength. The last hour of study is where breakthroughs happen.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote:
      "No matter what — outwork everyone. That is the one thing you have complete control over.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote:
      "Your future self is watching you right now through your memories. Make him proud today.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote:
      "You are one decision away from a completely different life. Make that decision today.",
    author: "Jeff Bezos",
  },
  {
    quote:
      "The regret of not trying will always be heavier than the regret of trying and failing. Always.",
    author: "Jeff Bezos",
  },
  {
    quote:
      "The best investment you will ever make is in yourself. Your mind is your greatest asset — sharpen it.",
    author: "Warren Buffett",
  },
  {
    quote:
      "Today's preparation is tomorrow's achievement. What you do in the next hour matters more than you know.",
    author: "Benjamin Franklin",
  },
  {
    quote:
      "Genius is 1% inspiration and 99% showing up when you don't feel like it. Show up today.",
    author: "Thomas Edison",
  },
  {
    quote:
      "The secret to getting ahead is getting started — not tomorrow, not later. Right now, this very moment.",
    author: "Mark Twain",
  },
];

function getDailyQuote() {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
}

function CompactQuoteCard() {
  const { quote, author } = getDailyQuote();

  return (
    <>
      <style>{`
        @keyframes quoteGlow {
          from { box-shadow: 0 0 18px rgba(251,191,36,0.45), 0 0 40px rgba(251,191,36,0.2), 0 0 80px rgba(251,191,36,0.08), 0 2px 12px rgba(0,0,0,0.6); border-color: rgba(251,191,36,0.6); }
          to   { box-shadow: 0 0 28px rgba(251,191,36,0.75), 0 0 60px rgba(251,191,36,0.35), 0 0 100px rgba(251,191,36,0.15), 0 2px 12px rgba(0,0,0,0.6); border-color: rgba(251,191,36,0.9); }
        }
      `}</style>
      <div
        className="max-w-xs rounded-xl px-3 py-2.5 shrink-0"
        style={{
          border: "1px solid rgba(251,191,36,0.6)",
          boxShadow:
            "0 0 18px rgba(251,191,36,0.45), 0 0 40px rgba(251,191,36,0.2), 0 0 80px rgba(251,191,36,0.08), 0 2px 12px rgba(0,0,0,0.6)",
          background:
            "linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(40,30,5,0.92) 100%)",
          backdropFilter: "blur(16px)",
          animation: "quoteGlow 3s ease-in-out infinite alternate",
        }}
      >
        <p
          className="text-xs leading-snug line-clamp-3"
          style={{ color: "rgba(255,245,210,0.88)" }}
        >
          <Zap
            className="inline w-3 h-3 mr-1 shrink-0"
            style={{
              color: "#fbbf24",
              filter: "drop-shadow(0 0 6px rgba(251,191,36,0.9))",
              verticalAlign: "middle",
            }}
          />
          {quote}
        </p>
        <p
          className="text-xs mt-1 font-semibold tracking-wide"
          style={{
            background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          — {author}
        </p>
      </div>
    </>
  );
}

export default function Dashboard({ onNavigate }: Props) {
  const [chapters] = useLocalStorage<ClassMap>(
    "jee_chapters",
    buildInitialChapterData(),
  );
  const [dailyLog] = useLocalStorage<Record<string, number>>(
    "jee_daily_log",
    {},
  );
  const [targetHours] = useLocalStorage<number>("jee_overall_target", 3000);

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    let totalChapters = 0;
    let doneChapters = 0;
    let notesDone = 0;
    let moduleDone = 0;
    for (const cls of Object.values(chapters)) {
      for (const subject of Object.values(cls)) {
        for (const ch of Object.values(subject)) {
          totalChapters++;
          if (ch.done) doneChapters++;
          if (ch.notesDone) notesDone++;
          if (ch.moduleDone) moduleDone++;
        }
      }
    }
    return { totalChapters, doneChapters, notesDone, moduleDone };
  }, [chapters]);

  // Overall study stats
  const studyStats = useMemo(() => {
    const allDates = Object.keys(dailyLog).sort();
    const totalStudied = allDates.reduce(
      (sum, d) => sum + (dailyLog[d] || 0),
      0,
    );
    const daysTracked = allDates.length;
    const todayHours = dailyLog[today] || 0;
    const progressPct = Math.min((totalStudied / targetHours) * 100, 100);
    return { totalStudied, daysTracked, todayHours, progressPct };
  }, [dailyLog, targetHours, today]);

  const statCards = [
    {
      label: "Chapters Done",
      value: stats.doneChapters,
      total: stats.totalChapters,
      icon: CheckCircle2,
    },
    {
      label: "Notes Done",
      value: stats.notesDone,
      total: stats.totalChapters,
      icon: FileText,
    },
    {
      label: "Modules Done",
      value: stats.moduleDone,
      total: stats.totalChapters,
      icon: Layers,
    },
    {
      label: "Total Chapters",
      value: stats.totalChapters,
      total: null as number | null,
      icon: BookOpen,
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold gradient-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Track your JEE preparation progress
          </p>
        </div>
        <CompactQuoteCard />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => (
          <Card
            key={stat.label}
            className={`glass glass-hover ${STAT_ACCENTS[i]} border-0`}
          >
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold font-display text-foreground mt-0.5">
                    {stat.value}
                    {stat.total && (
                      <span className="text-sm font-normal text-muted-foreground">
                        /{stat.total}
                      </span>
                    )}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg bg-muted/50 ${STAT_ICON_COLORS[i]}`}
                >
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
              {stat.total && (
                <Progress
                  value={(stat.value / stat.total) * 100}
                  className={`mt-2.5 h-1.5 bg-muted/50 ${["progress-green", "progress-cyan", "progress-purple", ""][i]}`}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle section: Subject Targets + Study Journey */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Subject-wise Chapter Progress */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Target className="w-4 h-4 text-primary" />
              <span>Subject Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUBJECTS.map((sub) => {
              const allChapters = [
                ...Object.entries(chapters.class11?.[sub] || {}),
                ...Object.entries(chapters.class12?.[sub] || {}),
              ];
              const total = allChapters.length;
              const done = allChapters.filter(([, v]) => v.done).length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div key={sub}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {sub}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {done}/{total} chapters done
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-2 bg-muted/50 ${SUBJECT_PROGRESS[sub]}`}
                  />
                </div>
              );
            })}
            <button
              type="button"
              data-ocid="dashboard.syllabus.link"
              onClick={() => onNavigate("syllabus")}
              className="text-xs text-primary hover:underline mt-1 transition-colors"
            >
              Open Syllabus →
            </button>
          </CardContent>
        </Card>

        {/* Overall Study Journey */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Study Journey</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Total Hours
                </span>
                <span className="text-sm font-mono font-medium text-primary">
                  {Math.round(studyStats.totalStudied * 10) / 10}h /{" "}
                  {targetHours}h
                </span>
              </div>
              <Progress
                value={studyStats.progressPct}
                className="h-3 bg-muted/50 progress-cyan"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-muted-foreground">
                  {Math.round(studyStats.progressPct)}% of target
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {studyStats.daysTracked} days tracked
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-lg p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-xl font-mono font-bold text-emerald-400">
                  {studyStats.todayHours > 0
                    ? `${studyStats.todayHours}h`
                    : "—"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Today
                </div>
              </div>
              <div
                className="rounded-lg p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-xl font-mono font-bold text-purple-400">
                  {studyStats.daysTracked > 0
                    ? `${
                        Math.round(
                          (studyStats.totalStudied / studyStats.daysTracked) *
                            10,
                        ) / 10
                      }h`
                    : "—"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Avg/Day
                </div>
              </div>
            </div>

            <button
              type="button"
              data-ocid="dashboard.timer.link"
              onClick={() => onNavigate("timer")}
              className="text-xs text-primary hover:underline transition-colors"
            >
              Log today's hours in Timer →
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress detail */}
      <Card className="glass glass-hover border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Subject-wise Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {SUBJECTS.map((sub) => {
              const allChapters = [
                ...Object.entries(chapters.class11?.[sub] || {}),
                ...Object.entries(chapters.class12?.[sub] || {}),
              ];
              const total = allChapters.length;
              const done = allChapters.filter(
                ([, v]) => v.done && v.notesDone && v.moduleDone,
              ).length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              const cl11Chapters = Object.entries(
                chapters.class11?.[sub] || {},
              );
              const cl12Chapters = Object.entries(
                chapters.class12?.[sub] || {},
              );
              const cl11Done = cl11Chapters.filter(([, v]) => v.done).length;
              const cl12Done = cl12Chapters.filter(([, v]) => v.done).length;
              return (
                <div key={sub} className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground font-display">
                      {sub}
                    </span>
                    <span className="text-sm text-primary font-mono">
                      {pct}%
                    </span>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-2.5 bg-muted/50 ${SUBJECT_PROGRESS[sub]}`}
                  />
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>
                      Class 11: {cl11Done}/{cl11Chapters.length}
                    </span>
                    <span>
                      Class 12: {cl12Done}/{cl12Chapters.length}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
