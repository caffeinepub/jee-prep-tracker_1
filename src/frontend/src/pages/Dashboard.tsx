import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Layers,
  Target,
  Zap,
} from "lucide-react";
import { useMemo } from "react";
import { SUBJECTS, buildInitialChapterData } from "../data/syllabusData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type {
  ClassMap,
  ScheduleEntry,
  TimerSession,
  WeeklyTargets,
} from "../types";

type Page = "dashboard" | "syllabus" | "schedule" | "timer";

interface Props {
  onNavigate: (p: Page) => void;
}

const STAT_ACCENTS = [
  "card-accent-green",
  "card-accent-cyan",
  "card-accent-purple",
  "card-accent-orange",
] as const;

const SUBJECT_BADGE: Record<string, string> = {
  Physics: "badge-physics",
  Chemistry: "badge-chemistry",
  Maths: "badge-maths",
  Other: "badge-other",
};

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
      "When something is important enough, you do it even if the odds are not in your favor.",
    author: "Elon Musk",
  },
  {
    quote:
      "I think it's very important to have a feedback loop, where you're constantly thinking about what you've done and how you could be doing it better.",
    author: "Elon Musk",
  },
  {
    quote:
      "Persistence is very important. You should not give up unless you are forced to give up.",
    author: "Elon Musk",
  },
  {
    quote:
      "Work like hell. I mean you just have to put in 80 to 100 hour weeks every week.",
    author: "Elon Musk",
  },
  {
    quote:
      "The first step is to establish that something is possible; then probability will occur.",
    author: "Elon Musk",
  },
  {
    quote:
      "I wake up every morning and I think — how can I work harder today than yesterday?",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "Talent without working hard is nothing. Success is not a gift, you have to earn it.",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "Your love for what you do and willingness to push yourself where others aren't willing to go is what will make you great.",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "I am not finished yet. There is still so much more I want to achieve.",
    author: "Cristiano Ronaldo",
  },
  {
    quote: "Hard work beats talent when talent doesn't work hard.",
    author: "Cristiano Ronaldo",
  },
  {
    quote: "I have self-doubt. I have insecurity. But I don't let it stop me.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "The most important thing is to try and inspire people so that they can be great in whatever they want to do.",
    author: "Kobe Bryant",
  },
  {
    quote: "If you're afraid to fail, then you're probably going to fail.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "Everything negative — pressure, challenges — is all an opportunity for me to rise.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "Once you know what failure feels like, determination chases success.",
    author: "Kobe Bryant",
  },
  { quote: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  {
    quote:
      "The people who are crazy enough to think they can change the world are the ones who do.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
  {
    quote: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
  },
  {
    quote:
      "I'm convinced that about half of what separates successful entrepreneurs from the non-successful ones is pure perseverance.",
    author: "Steve Jobs",
  },
  {
    quote:
      "Float like a butterfly, sting like a bee. The hands can't hit what the eyes can't see.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'",
    author: "Muhammad Ali",
  },
  {
    quote:
      "It's the repetition of affirmations that leads to belief. Once that belief becomes a deep conviction, things begin to happen.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "Champions aren't made in gyms. Champions are made from something they have deep inside them — a desire, a dream, a vision.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "Impossible is not a fact. It's an opinion. Impossible is potential. Impossible is temporary. Impossible is nothing.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "The mind is the limit. As long as the mind can envision the fact that you can do something, you can do it.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote: "You can have results or excuses. Not both.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote:
      "Strength does not come from winning. Your struggles develop your strengths.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote: "You'll get more from being a peacemaker than a warrior.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote: "The worst thing I can be is the same as everybody else.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote:
      "Dream, Dream, Dream. Dreams transform into thoughts and thoughts result in action.",
    author: "APJ Abdul Kalam",
  },
  {
    quote: "Excellence is a continuous process and not an accident.",
    author: "APJ Abdul Kalam",
  },
  {
    quote:
      "All of us do not have equal talent. But all of us have an equal opportunity to develop our talents.",
    author: "APJ Abdul Kalam",
  },
  {
    quote: "You have to dream before your dreams can come true.",
    author: "APJ Abdul Kalam",
  },
  {
    quote:
      "Failure will never overtake me if my determination to succeed is strong enough.",
    author: "APJ Abdul Kalam",
  },
  {
    quote: "Self-belief and hard work will always earn you success.",
    author: "Virat Kohli",
  },
  {
    quote:
      "If you don't back yourself in life, nobody else will. Believe in yourself.",
    author: "Virat Kohli",
  },
  {
    quote:
      "I don't just want to be there, I want to be the best version of myself every time.",
    author: "Virat Kohli",
  },
  {
    quote: "Limits exist only in the mind. If you believe you can, you will.",
    author: "Virat Kohli",
  },
  {
    quote:
      "Talent is God given. Be humble. Fame is man-given. Be grateful. Conceit is self-given. Be careful.",
    author: "John Wooden",
  },
  {
    quote:
      "I've missed more than 9000 shots in my career. I've lost almost 300 games. I've failed over and over and that is why I succeed.",
    author: "Michael Jordan",
  },
  {
    quote:
      "Some people want it to happen, some wish it would happen, others make it happen.",
    author: "Michael Jordan",
  },
  {
    quote:
      "Obstacles are necessary for success because in selling, as in all careers of importance, victory comes only after many struggles and countless defeats.",
    author: "Og Mandino",
  },
  {
    quote:
      "Risk more than others think is safe. Dream more than others think is practical.",
    author: "Howard Schultz",
  },
  {
    quote:
      "It's not about how bad you want it. It's about how hard you're willing to work for it.",
    author: "Jeff Bezos",
  },
  { quote: "Work hard, have fun, make history.", author: "Jeff Bezos" },
  {
    quote: "Rule No.1: Never lose money. Rule No.2: Never forget rule No.1.",
    author: "Warren Buffett",
  },
  {
    quote:
      "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable ones.",
    author: "Mark Twain",
  },
  {
    quote: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
  {
    quote:
      "Genius is one percent inspiration and ninety-nine percent perspiration.",
    author: "Thomas Edison",
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
          className="text-xs leading-snug line-clamp-2"
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

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function Dashboard({ onNavigate }: Props) {
  const [chapters] = useLocalStorage<ClassMap>(
    "jee_chapters",
    buildInitialChapterData(),
  );
  const [sessions] = useLocalStorage<TimerSession[]>("jee_sessions", []);
  const [targets] = useLocalStorage<WeeklyTargets>("jee_targets", {
    Physics: 10,
    Chemistry: 10,
    Maths: 10,
  });
  const [schedule] = useLocalStorage<ScheduleEntry[]>("jee_schedule", []);

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

  const weeklyStudied = useMemo(() => {
    const weekStart = getWeekStart();
    const bySubject: Record<string, number> = {};
    for (const s of sessions) {
      const sDate = new Date(s.date);
      if (sDate >= weekStart) {
        bySubject[s.subject] = (bySubject[s.subject] || 0) + s.duration;
      }
    }
    return bySubject;
  }, [sessions]);

  const todaySchedule = useMemo(
    () => schedule.filter((e) => e.date === today).slice(0, 3),
    [schedule, today],
  );

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

      {/* Middle section: Targets + Schedule */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Weekly Targets */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Target className="w-4 h-4 text-primary" />
              <span>Weekly Targets</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUBJECTS.map((sub) => {
              const studied =
                Math.round(((weeklyStudied[sub] || 0) / 3600) * 10) / 10;
              const target = targets[sub] || 10;
              const pct = Math.min((studied / target) * 100, 100);
              return (
                <div key={sub}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {sub}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {studied}h / {target}h
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
              data-ocid="dashboard.timer.link"
              onClick={() => onNavigate("timer")}
              className="text-xs text-primary hover:underline mt-1 transition-colors"
            >
              Update targets in Timer →
            </button>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              <span>Today's Schedule</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div
                data-ocid="dashboard.schedule.empty_state"
                className="text-center py-6 text-muted-foreground text-sm"
              >
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No schedule for today.
                <br />
                <button
                  type="button"
                  data-ocid="dashboard.schedule.link"
                  onClick={() => onNavigate("schedule")}
                  className="text-primary hover:underline mt-1 block mx-auto transition-colors"
                >
                  Add to schedule →
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todaySchedule.map((entry, i) => (
                  <div
                    key={entry.id}
                    data-ocid={`dashboard.schedule.item.${i + 1}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">
                      {entry.time}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs shrink-0 border ${SUBJECT_BADGE[entry.subject] || SUBJECT_BADGE.Other}`}
                    >
                      {entry.subject}
                    </Badge>
                    <span className="text-sm text-foreground truncate">
                      {entry.topic}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-auto">
                      {entry.duration}m
                    </span>
                  </div>
                ))}
                <button
                  type="button"
                  data-ocid="dashboard.schedule.viewall.link"
                  onClick={() => onNavigate("schedule")}
                  className="text-xs text-primary hover:underline transition-colors"
                >
                  View full schedule →
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress */}
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
