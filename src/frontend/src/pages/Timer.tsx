import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Coffee,
  Pause,
  Play,
  Square,
  Target,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// Safe: handles non-numbers that may come from corrupted localStorage
function formatHours(h: unknown) {
  const n = typeof h === "number" && !Number.isNaN(h) ? h : 0;
  if (n === 0) return "0h";
  return n % 1 === 0 ? `${n}h` : `${n.toFixed(1)}h`;
}

// Get Monday of the week containing the given date
function getWeekStart(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

// Get all 7 days Mon–Sun of a week
function getWeekDays(weekStartStr: string): string[] {
  const days: string[] = [];
  const start = new Date(`${weekStartStr}T12:00:00`);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

// "28 Mar – 3 Apr" style label
function getWeekLabel(weekStartStr: string): string {
  const start = new Date(`${weekStartStr}T12:00:00`);
  const end = new Date(`${weekStartStr}T12:00:00`);
  end.setDate(start.getDate() + 6);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${start.getDate()} ${months[start.getMonth()]} \u2013 ${end.getDate()} ${months[end.getMonth()]}`;
}

// All week-starts that overlap with a calendar month
function getWeeksInMonth(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const seen = new Set<string>();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    seen.add(getWeekStart(dateStr));
  }
  return Array.from(seen).sort();
}

// Safe: handles undefined/null log
function sumHours(dates: string[], log: Record<string, number>): number {
  if (!log || typeof log !== "object") return 0;
  return dates.reduce((sum, d) => {
    const v = log[d];
    return sum + (typeof v === "number" && !Number.isNaN(v) ? v : 0);
  }, 0);
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const FULL_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TimerPage() {
  // Raw storage — may contain old data from previous timer versions
  const [rawDailyLog, setDailyLog] = useLocalStorage<Record<string, number>>(
    "jee_daily_log",
    {},
  );
  const [weeklyTarget, setWeeklyTarget] = useLocalStorage<number>(
    "jee_weekly_target",
    40,
  );

  // Normalize: only keep YYYY-MM-DD keys with numeric values.
  // This prevents crashes caused by data from old timer versions stored
  // under the same localStorage key with a different structure.
  const dailyLog = useMemo((): Record<string, number> => {
    if (
      !rawDailyLog ||
      typeof rawDailyLog !== "object" ||
      Array.isArray(rawDailyLog)
    ) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(rawDailyLog).filter(
        ([k, v]) =>
          /^\d{4}-\d{2}-\d{2}$/.test(k) &&
          typeof v === "number" &&
          !Number.isNaN(v),
      ),
    );
  }, [rawDailyLog]);

  // Safe weeklyTarget fallback
  const safeTarget =
    typeof weeklyTarget === "number" &&
    !Number.isNaN(weeklyTarget) &&
    weeklyTarget > 0
      ? weeklyTarget
      : 40;

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [todayInput, setTodayInput] = useState("");
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  const tick = useCallback(() => setElapsed((p) => p + 1), []);

  useEffect(() => {
    if (running && !onBreak) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onBreak, tick]);

  const handleStart = () => {
    if (!running) {
      setRunning(true);
      setOnBreak(false);
    }
  };
  const handlePause = () => setRunning((r) => !r);
  const handleBreak = () => setOnBreak((b) => !b);

  const handleStop = () => {
    if (elapsed > 0) {
      const hrs = elapsed / 3600;
      const today = todayStr();
      const current = dailyLog[today] || 0;
      setDailyLog({
        ...dailyLog,
        [today]: Math.round((current + hrs) * 100) / 100,
      });
      toast.success(
        `Session saved: ${formatTime(elapsed)} added to today's log`,
      );
    }
    setRunning(false);
    setOnBreak(false);
    setElapsed(0);
  };

  const handleLogToday = () => {
    const val = Number.parseFloat(todayInput);
    if (Number.isNaN(val) || val < 0) {
      toast.error("Please enter a valid number");
      return;
    }
    const today = todayStr();
    setDailyLog({ ...dailyLog, [today]: Math.round(val * 100) / 100 });
    toast.success(`Logged ${formatHours(val)} for today!`);
    setTodayInput("");
  };

  // --- Computed ---
  const today = todayStr();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentMonthKey = `${currentYear}-${pad(currentMonth + 1)}`;

  // This week
  const currentWeekStart = getWeekStart(today);
  const currentWeekDays = getWeekDays(currentWeekStart);
  const thisWeekHours = sumHours(currentWeekDays, dailyLog);
  const weekPct = Math.min((thisWeekHours / safeTarget) * 100, 100);
  const todayLogged = dailyLog[today] || 0;

  // This month
  const daysInCurrentMonth = new Date(
    currentYear,
    currentMonth + 1,
    0,
  ).getDate();
  const currentMonthDays: string[] = [];
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    currentMonthDays.push(`${currentYear}-${pad(currentMonth + 1)}-${pad(d)}`);
  }
  const thisMonthHours = sumHours(currentMonthDays, dailyLog);
  const weeksInCurrentMonth = getWeeksInMonth(currentYear, currentMonth);

  // This year
  const yearMonths = Array.from({ length: 12 }, (_, m) => {
    const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
    const days: string[] = [];
    for (let d = 1; d <= daysInMonth; d++)
      days.push(`${currentYear}-${pad(m + 1)}-${pad(d)}`);
    return {
      key: `${currentYear}-${pad(m + 1)}`,
      label: FULL_MONTH_NAMES[m],
      shortLabel: MONTH_NAMES[m],
      hours: sumHours(days, dailyLog),
    };
  });
  const thisYearHours = yearMonths.reduce((sum, m) => sum + m.hours, 0);

  // All-time
  const allDates = Object.keys(dailyLog).sort();
  const daysTracked = allDates.length;

  const timerClass = onBreak
    ? "font-mono text-6xl font-bold tracking-tight timer-glow-orange text-orange-400"
    : running
      ? "font-mono text-6xl font-bold tracking-tight timer-glow text-primary animate-pulse-glow"
      : "font-mono text-6xl font-bold tracking-tight text-foreground/80";

  const maxMonthHours = Math.max(...yearMonths.map((m) => m.hours), 1);

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gradient-text">
          Study Timer
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Track daily hours → weekly target → monthly → yearly
        </p>
      </div>

      {/* Row 1: Live Timer + Log Today */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Live Timer */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> Live Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div
              data-ocid="timer.display"
              className="relative scanlines rounded-2xl px-8 py-6"
              style={{
                background: "rgba(0,0,0,0.4)",
                border:
                  running && !onBreak
                    ? "1px solid rgba(0,212,224,0.3)"
                    : onBreak
                      ? "1px solid rgba(251,146,60,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  running && !onBreak
                    ? "0 0 30px rgba(0,212,224,0.15), inset 0 0 30px rgba(0,212,224,0.03)"
                    : "none",
              }}
            >
              <span className={timerClass}>{formatTime(elapsed)}</span>
            </div>
            {onBreak && (
              <Badge
                className="text-orange-400 border-orange-400/40 text-sm px-3 py-1"
                style={{ background: "rgba(251,146,60,0.12)" }}
              >
                ☕ On Break
              </Badge>
            )}
            <div className="flex gap-3 flex-wrap justify-center">
              {!running ? (
                <Button
                  data-ocid="timer.start.primary_button"
                  onClick={handleStart}
                  className="px-6 font-medium text-primary-foreground"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.22 200), oklch(0.68 0.22 210))",
                    boxShadow:
                      "0 0 20px rgba(0,212,224,0.35), 0 2px 8px rgba(0,0,0,0.4)",
                    border: "none",
                  }}
                >
                  <Play className="w-4 h-4 mr-2" /> Start
                </Button>
              ) : (
                <Button
                  data-ocid="timer.pause.secondary_button"
                  variant="outline"
                  onClick={handlePause}
                  className="px-6 border-primary/40 text-primary hover:bg-primary/10"
                >
                  <Pause className="w-4 h-4 mr-2" />{" "}
                  {onBreak ? "Resume" : "Pause"}
                </Button>
              )}
              <Button
                data-ocid="timer.break.secondary_button"
                variant="outline"
                onClick={handleBreak}
                disabled={!running}
                className={
                  onBreak
                    ? "border-orange-400/40 text-orange-400 hover:bg-orange-400/10"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-white/5"
                }
              >
                <Coffee className="w-4 h-4 mr-2" />{" "}
                {onBreak ? "End Break" : "Break"}
              </Button>
              <Button
                data-ocid="timer.stop.delete_button"
                variant="outline"
                onClick={handleStop}
                disabled={elapsed === 0}
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                <Square className="w-4 h-4 mr-2" /> Stop & Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Stopping auto-saves to today's log
            </p>
          </CardContent>
        </Card>

        {/* Log Today + Weekly Target */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Log Today's Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Weekly target */}
            <div
              className="rounded-xl p-3 flex items-center justify-between"
              style={{
                background: "rgba(0,212,224,0.04)",
                border: "1px solid rgba(0,212,224,0.15)",
              }}
            >
              <div>
                <span className="text-sm font-medium text-foreground">
                  Weekly Target
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hours to study per week
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  data-ocid="timer.weekly.target.input"
                  type="number"
                  min={1}
                  max={168}
                  value={safeTarget}
                  onChange={(e) =>
                    setWeeklyTarget(
                      Math.max(1, Number.parseInt(e.target.value) || 40),
                    )
                  }
                  className="w-16 text-center text-sm rounded-md px-2 py-1 input-dark border font-mono"
                />
                <span className="text-xs text-muted-foreground">hrs/wk</span>
              </div>
            </div>

            {/* Today input */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Date:{" "}
                <span className="font-mono text-foreground/70">{today}</span>
                {todayLogged > 0 && (
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: "rgba(0,212,224,0.9)" }}
                  >
                    (Current: {formatHours(todayLogged)})
                  </span>
                )}
              </p>
              <div className="flex items-center gap-3">
                <input
                  data-ocid="timer.today.hours.input"
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={todayInput}
                  onChange={(e) => setTodayInput(e.target.value)}
                  placeholder="e.g. 5.5"
                  className="w-32 text-center text-lg font-mono rounded-xl px-3 py-2.5 input-dark border"
                  style={{
                    border: "1px solid rgba(0,212,224,0.3)",
                    boxShadow: "0 0 8px rgba(0,212,224,0.08)",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogToday()}
                />
                <span className="text-sm text-muted-foreground">hours</span>
                <Button
                  data-ocid="timer.log.today.primary_button"
                  onClick={handleLogToday}
                  className="px-5 font-medium text-primary-foreground"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.22 200), oklch(0.68 0.22 210))",
                    boxShadow:
                      "0 0 20px rgba(0,212,224,0.3), 0 2px 8px rgba(0,0,0,0.4)",
                    border: "none",
                  }}
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Overwrites today's existing entry
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              <div
                className="rounded-lg p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-lg font-mono font-bold text-primary">
                  {todayLogged > 0 ? formatHours(todayLogged) : "—"}
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
                <div className="text-lg font-mono font-bold text-emerald-400">
                  {formatHours(Math.round(thisWeekHours * 10) / 10)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  This Week
                </div>
              </div>
              <div
                className="rounded-lg p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-lg font-mono font-bold text-purple-400">
                  {daysTracked}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Days Logged
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: This Week */}
      <Card className="glass border-0 mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              This Week
              <span className="text-xs font-normal text-muted-foreground">
                ({getWeekLabel(currentWeekStart)})
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-emerald-400">
                {formatHours(Math.round(thisWeekHours * 10) / 10)}
              </span>
              <span className="text-xs text-muted-foreground">
                / {safeTarget}h target
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div>
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${weekPct}%`,
                  background:
                    "linear-gradient(90deg, rgba(52,211,153,0.85), rgba(52,211,153,0.55))",
                  boxShadow:
                    weekPct > 0 ? "0 0 12px rgba(52,211,153,0.4)" : "none",
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-muted-foreground">
                {Math.round(weekPct)}% of weekly target
              </span>
              <span className="text-[11px] text-muted-foreground">
                {safeTarget - thisWeekHours > 0
                  ? `${formatHours(Math.round(Math.max(0, safeTarget - thisWeekHours) * 10) / 10)} remaining`
                  : "\u2713 Target reached!"}
              </span>
            </div>
          </div>
          {/* 7-day bar chart */}
          <div className="grid grid-cols-7 gap-1.5">
            {currentWeekDays.map((date, i) => {
              const hrs = dailyLog[date] || 0;
              const isToday = date === today;
              const dayDate = new Date(`${date}T12:00:00`);
              const isFuture = dayDate > now;
              const dailyTarget = safeTarget / 7;
              const barPct =
                dailyTarget > 0 ? Math.min((hrs / dailyTarget) * 100, 100) : 0;
              return (
                <div key={date} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">
                    {DAY_NAMES[i]}
                  </span>
                  <div
                    className="w-full h-16 rounded-lg flex items-end overflow-hidden"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: isToday
                        ? "1px solid rgba(0,212,224,0.4)"
                        : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="w-full transition-all duration-500 rounded-b-lg"
                      style={{
                        height: `${Math.max(barPct, hrs > 0 ? 6 : 0)}%`,
                        background: isToday
                          ? "linear-gradient(180deg, rgba(0,212,224,0.7), rgba(0,212,224,0.4))"
                          : hrs > 0
                            ? "linear-gradient(180deg, rgba(52,211,153,0.6), rgba(52,211,153,0.3))"
                            : "transparent",
                        boxShadow:
                          isToday && hrs > 0
                            ? "0 0 8px rgba(0,212,224,0.3)"
                            : "none",
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-mono font-medium"
                    style={{
                      color: isToday
                        ? "rgba(0,212,224,0.9)"
                        : hrs > 0
                          ? "rgba(255,255,255,0.7)"
                          : isFuture
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(255,255,255,0.3)",
                    }}
                  >
                    {hrs > 0 ? formatHours(hrs) : isFuture ? "" : "0h"}
                  </span>
                  <span className="text-[9px] text-muted-foreground/40">
                    {dayDate.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
          {weekPct >= 100 && (
            <div
              className="rounded-lg px-3 py-2 text-xs text-center font-semibold"
              style={{
                background: "rgba(52,211,153,0.1)",
                border: "1px solid rgba(52,211,153,0.3)",
                color: "rgb(52,211,153)",
              }}
            >
              🔥 Weekly target smashed!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row 3: This Month + This Year */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* This Month */}
        <Card className="glass border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                {FULL_MONTH_NAMES[currentMonth]} {currentYear}
              </CardTitle>
              <span className="font-mono text-sm font-semibold text-purple-400">
                {formatHours(Math.round(thisMonthHours * 10) / 10)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weeksInCurrentMonth.map((weekStart) => {
                const weekDays = getWeekDays(weekStart);
                const weekHours = sumHours(weekDays, dailyLog);
                const isCurrentWeek = weekStart === currentWeekStart;
                const pct =
                  safeTarget > 0
                    ? Math.min((weekHours / safeTarget) * 100, 100)
                    : 0;
                const isExpanded = expandedWeek === weekStart;
                return (
                  <div key={weekStart}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors hover:bg-white/5"
                      style={{
                        background: isCurrentWeek
                          ? "rgba(168,85,247,0.07)"
                          : "rgba(255,255,255,0.02)",
                        border: isCurrentWeek
                          ? "1px solid rgba(168,85,247,0.25)"
                          : "1px solid rgba(255,255,255,0.05)",
                      }}
                      onClick={() =>
                        setExpandedWeek(isExpanded ? null : weekStart)
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-foreground/70">
                          {getWeekLabel(weekStart)}
                        </span>
                        {isCurrentWeek && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{
                              background: "rgba(168,85,247,0.2)",
                              color: "rgba(168,85,247,0.9)",
                            }}
                          >
                            current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-16 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.08)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background:
                                pct >= 100
                                  ? "rgba(52,211,153,0.7)"
                                  : "rgba(168,85,247,0.6)",
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs font-medium text-purple-300 w-12 text-right">
                          {formatHours(Math.round(weekHours * 10) / 10)}
                        </span>
                        <span className="text-[10px] text-muted-foreground/40">
                          {isExpanded ? "\u25b2" : "\u25bc"}
                        </span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="pl-3 pt-1 space-y-0.5 pb-1">
                        {weekDays.map((date, i) => {
                          const hrs = dailyLog[date] || 0;
                          const isT = date === today;
                          const dayDate = new Date(`${date}T12:00:00`);
                          if (!hrs && dayDate > now) return null;
                          return (
                            <div
                              key={date}
                              className="flex items-center gap-2 py-1 px-2"
                            >
                              <span className="text-[10px] text-muted-foreground w-7">
                                {DAY_NAMES[i]}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground/40 w-20">
                                {date}
                              </span>
                              <div
                                className="flex-1 h-1 rounded-full overflow-hidden"
                                style={{ background: "rgba(255,255,255,0.06)" }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min((hrs / Math.max(safeTarget / 7, 1)) * 100, 100)}%`,
                                    background: isT
                                      ? "rgba(0,212,224,0.6)"
                                      : "rgba(168,85,247,0.5)",
                                  }}
                                />
                              </div>
                              <span
                                className="font-mono text-[10px] w-10 text-right"
                                style={{
                                  color: isT
                                    ? "rgba(0,212,224,0.8)"
                                    : "rgba(255,255,255,0.5)",
                                }}
                              >
                                {hrs > 0 ? formatHours(hrs) : "0h"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className="mt-3 pt-3 flex justify-between items-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-xs text-muted-foreground">
                Monthly total
              </span>
              <span className="font-mono text-sm font-bold text-purple-400">
                {formatHours(Math.round(thisMonthHours * 10) / 10)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* This Year */}
        <Card className="glass border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Year {currentYear}
              </CardTitle>
              <span className="font-mono text-sm font-semibold text-amber-400">
                {formatHours(Math.round(thisYearHours * 10) / 10)}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {yearMonths.map((m) => {
                const isCurrent = m.key === currentMonthKey;
                const barPct = (m.hours / maxMonthHours) * 100;
                return (
                  <div
                    key={m.key}
                    className="flex items-center gap-3 py-1.5 px-2 rounded-lg"
                    style={{
                      background: isCurrent
                        ? "rgba(251,191,36,0.05)"
                        : "transparent",
                      border: isCurrent
                        ? "1px solid rgba(251,191,36,0.18)"
                        : "1px solid transparent",
                    }}
                  >
                    <span
                      className="text-xs w-7 text-muted-foreground font-medium"
                      style={{
                        color: isCurrent ? "rgba(251,191,36,0.9)" : undefined,
                      }}
                    >
                      {m.shortLabel}
                    </span>
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barPct}%`,
                          background: isCurrent
                            ? "linear-gradient(90deg, rgba(251,191,36,0.75), rgba(251,191,36,0.4))"
                            : m.hours > 0
                              ? "linear-gradient(90deg, rgba(251,191,36,0.4), rgba(251,191,36,0.2))"
                              : "transparent",
                          boxShadow:
                            isCurrent && m.hours > 0
                              ? "0 0 8px rgba(251,191,36,0.3)"
                              : "none",
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-xs w-12 text-right"
                      style={{
                        color: isCurrent
                          ? "rgba(251,191,36,0.9)"
                          : m.hours > 0
                            ? "rgba(255,255,255,0.6)"
                            : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {m.hours > 0
                        ? formatHours(Math.round(m.hours * 10) / 10)
                        : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            <div
              className="mt-3 pt-3 flex justify-between items-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-xs text-muted-foreground">
                Yearly total
              </span>
              <span className="font-mono text-sm font-bold text-amber-400">
                {formatHours(Math.round(thisYearHours * 10) / 10)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Daily Log */}
      <Card className="glass border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Full Daily Log
            <span className="text-xs font-normal text-muted-foreground ml-1">
              ({daysTracked} days logged)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allDates.length === 0 ? (
            <div
              data-ocid="timer.log.empty_state"
              className="text-center py-8 text-muted-foreground"
            >
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                No study hours logged yet. Start the timer or log today!
              </p>
            </div>
          ) : (
            <div className="space-y-0 max-h-80 overflow-y-auto pr-1">
              {[...allDates].reverse().map((date, i) => {
                const hrs = dailyLog[date] || 0;
                const barPct = Math.min((hrs / 12) * 100, 100);
                const isToday = date === today;
                return (
                  <div
                    key={date}
                    data-ocid={`timer.log.item.${i + 1}`}
                    className="flex items-center gap-4 py-2.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <span
                      className="font-mono text-sm w-28 shrink-0"
                      style={{
                        color: isToday
                          ? "rgba(0,212,224,0.9)"
                          : "rgba(255,255,255,0.6)",
                        fontWeight: isToday ? 600 : 400,
                      }}
                    >
                      {isToday ? "Today" : date}
                    </span>
                    <div
                      className="flex-1 relative h-3 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barPct}%`,
                          background: isToday
                            ? "linear-gradient(90deg, rgba(0,212,224,0.8), rgba(0,212,224,0.5))"
                            : "linear-gradient(90deg, rgba(168,85,247,0.6), rgba(168,85,247,0.4))",
                          boxShadow: isToday
                            ? "0 0 6px rgba(0,212,224,0.4)"
                            : "none",
                        }}
                      />
                    </div>
                    <span
                      className="font-mono text-sm font-medium w-14 text-right shrink-0"
                      style={{
                        color: isToday
                          ? "rgba(0,212,224,0.9)"
                          : "rgba(255,255,255,0.75)",
                      }}
                    >
                      {formatHours(hrs)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...dailyLog };
                        delete updated[date];
                        setDailyLog(updated);
                        toast.success("Entry removed");
                      }}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors w-5 text-center shrink-0"
                      title="Remove entry"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
