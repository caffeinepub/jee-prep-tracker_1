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
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gradient-text">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Track your JEE preparation progress
        </p>
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
