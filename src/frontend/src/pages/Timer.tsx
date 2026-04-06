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

function formatHours(h: unknown) {
  const n = typeof h === "number" && !Number.isNaN(h) ? h : 0;
  if (n === 0) return "0h";
  return n % 1 === 0 ? `${n}h` : `${n.toFixed(1)}h`;
}

function getWeekStart(dateStr: string): string {
  try {
    const d = new Date(`${dateStr}T12:00:00`);
    if (Number.isNaN(d.getTime())) return getWeekStart(todayStr());
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
  } catch {
    return getWeekStart(todayStr());
  }
}

function getWeekDays(weekStartStr: string): string[] {
  try {
    const start = new Date(`${weekStartStr}T12:00:00`);
    if (Number.isNaN(start.getTime())) {
      const t = todayStr();
      return Array(7).fill(t);
    }
    const days: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
    }
    return days;
  } catch {
    const t = todayStr();
    return Array(7).fill(t);
  }
}

function getWeekLabel(weekStartStr: string): string {
  try {
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
  } catch {
    return "";
  }
}

function getWeeksInMonth(year: number, month: number): string[] {
  try {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const seen = new Set<string>();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
      seen.add(getWeekStart(dateStr));
    }
    return Array.from(seen).sort();
  } catch {
    return [];
  }
}

function sumHours(dates: string[], log: Record<string, number>): number {
  if (!log || typeof log !== "object") return 0;
  return dates.reduce((sum, d) => {
    const v = log[d];
    return sum + (typeof v === "number" && !Number.isNaN(v) ? v : 0);
  }, 0);
}

function calcPrepDay(prepStart: string, targetDate: string): number {
  try {
    const start = new Date(`${prepStart}T00:00:00`);
    const target = new Date(`${targetDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(target.getTime()))
      return 1;
    const diffMs = target.getTime() - start.getTime();
    return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);
  } catch {
    return 1;
  }
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

const DEFAULT_PREP_START = "2026-04-06";

// Live timer session state, persisted to localStorage so navigation doesn't wipe it
interface TimerSession {
  running: boolean;
  onBreak: boolean;
  accumulatedMs: number; // ms from finished segments
  startTimestamp: number | null; // wall-clock epoch ms when current run segment began
}

const DEFAULT_SESSION: TimerSession = {
  running: false,
  onBreak: false,
  accumulatedMs: 0,
  startTimestamp: null,
};

function readSession(): TimerSession {
  try {
    const raw = window.localStorage.getItem("jee_timer_session");
    if (!raw) return DEFAULT_SESSION;
    const parsed = JSON.parse(raw) as Partial<TimerSession>;
    return {
      running: typeof parsed.running === "boolean" ? parsed.running : false,
      onBreak: typeof parsed.onBreak === "boolean" ? parsed.onBreak : false,
      accumulatedMs:
        typeof parsed.accumulatedMs === "number" &&
        !Number.isNaN(parsed.accumulatedMs)
          ? parsed.accumulatedMs
          : 0,
      startTimestamp:
        typeof parsed.startTimestamp === "number"
          ? parsed.startTimestamp
          : null,
    };
  } catch {
    return DEFAULT_SESSION;
  }
}

function writeSession(s: TimerSession) {
  try {
    window.localStorage.setItem("jee_timer_session", JSON.stringify(s));
  } catch {
    // ignore
  }
}

function clearSession() {
  try {
    window.localStorage.removeItem("jee_timer_session");
  } catch {
    // ignore
  }
}

export default function TimerPage() {
  const [rawDailyLog, setDailyLog] = useLocalStorage<Record<string, number>>(
    "jee_daily_log",
    {},
  );
  const [weeklyTarget, setWeeklyTarget] = useLocalStorage<number>(
    "jee_weekly_target",
    40,
  );
  const [prepStartDate, setPrepStartDate] = useLocalStorage<string>(
    "jee_prep_start_date",
    DEFAULT_PREP_START,
  );

  const dailyLog = useMemo((): Record<string, number> => {
    try {
      if (
        !rawDailyLog ||
        typeof rawDailyLog !== "object" ||
        Array.isArray(rawDailyLog)
      )
        return {};
      return Object.fromEntries(
        Object.entries(rawDailyLog).filter(
          ([k, v]) =>
            /^\d{4}-\d{2}-\d{2}$/.test(k) &&
            typeof v === "number" &&
            !Number.isNaN(v),
        ),
      );
    } catch {
      return {};
    }
  }, [rawDailyLog]);

  const safeTarget =
    typeof weeklyTarget === "number" &&
    !Number.isNaN(weeklyTarget) &&
    weeklyTarget > 0
      ? weeklyTarget
      : 40;
  const safePrepStart =
    typeof prepStartDate === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(prepStartDate)
      ? prepStartDate
      : DEFAULT_PREP_START;
  const defaultLogDate =
    todayStr() >= safePrepStart ? todayStr() : safePrepStart;
  const [selectedLogDate, setSelectedLogDate] =
    useState<string>(defaultLogDate);

  // ── PERSISTED TIMESTAMP-BASED TIMER ──────────────────────────────────────
  // All live timer state is loaded from localStorage on mount and written back
  // on every change, so navigation away and back never loses state.

  const initialSession = useMemo(() => readSession(), []);

  const [running, setRunning] = useState(initialSession.running);
  const [onBreak, setOnBreak] = useState(initialSession.onBreak);
  const [accumulatedMs, setAccumulatedMs] = useState(
    initialSession.accumulatedMs,
  );
  const [startTimestamp, setStartTimestamp] = useState<number | null>(
    initialSession.startTimestamp,
  );
  const [displaySeconds, setDisplaySeconds] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Persist session state whenever it changes
  useEffect(() => {
    writeSession({ running, onBreak, accumulatedMs, startTimestamp });
  }, [running, onBreak, accumulatedMs, startTimestamp]);

  const getElapsedSeconds = useCallback((): number => {
    let ms = accumulatedMs;
    if (running && !onBreak && startTimestamp !== null) {
      ms += Date.now() - startTimestamp;
    }
    return Math.floor(ms / 1000);
  }, [accumulatedMs, running, onBreak, startTimestamp]);

  // rAF loop: updates display ~every second
  useEffect(() => {
    let lastSec = -1;
    const loop = () => {
      const sec = getElapsedSeconds();
      if (sec !== lastSec) {
        lastSec = sec;
        setDisplaySeconds(sec);
      }
      if (running && !onBreak) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    if (running && !onBreak) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      setDisplaySeconds(getElapsedSeconds());
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [running, onBreak, getElapsedSeconds]);

  // Re-sync display when tab becomes visible again
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) setDisplaySeconds(getElapsedSeconds());
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [getElapsedSeconds]);

  const handleStart = () => {
    if (!running) {
      const ts = Date.now();
      setStartTimestamp(ts);
      setRunning(true);
      setOnBreak(false);
    }
  };

  const handlePause = () => {
    if (running) {
      if (!onBreak && startTimestamp !== null) {
        setAccumulatedMs((prev) => prev + (Date.now() - startTimestamp));
        setStartTimestamp(null);
      }
      setRunning(false);
    } else {
      setStartTimestamp(Date.now());
      setRunning(true);
    }
  };

  const handleBreak = () => {
    if (!running) return;
    if (!onBreak) {
      if (startTimestamp !== null) {
        setAccumulatedMs((prev) => prev + (Date.now() - startTimestamp));
        setStartTimestamp(null);
      }
      setOnBreak(true);
    } else {
      setStartTimestamp(Date.now());
      setOnBreak(false);
    }
  };

  const handleStop = () => {
    let finalMs = accumulatedMs;
    if (running && !onBreak && startTimestamp !== null) {
      finalMs += Date.now() - startTimestamp;
    }
    const totalSeconds = Math.floor(finalMs / 1000);
    if (totalSeconds > 0) {
      const hrs = totalSeconds / 3600;
      const today = todayStr();
      setDailyLog((prev) => {
        const safePrev =
          prev && typeof prev === "object" && !Array.isArray(prev) ? prev : {};
        const current =
          typeof safePrev[today] === "number" ? safePrev[today] : 0;
        return {
          ...safePrev,
          [today]: Math.round((current + hrs) * 100) / 100,
        };
      });
      toast.success(
        `Session saved: ${formatTime(totalSeconds)} added to today's log`,
      );
    }
    setRunning(false);
    setOnBreak(false);
    setStartTimestamp(null);
    setAccumulatedMs(0);
    setDisplaySeconds(0);
    clearSession();
  };

  const [todayInput, setTodayInput] = useState("");
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  const handleLogDate = () => {
    const val = Number.parseFloat(todayInput);
    if (Number.isNaN(val) || val < 0) {
      toast.error("Please enter a valid number");
      return;
    }
    const logDate = selectedLogDate;
    setDailyLog((prev) => {
      const safePrev =
        prev && typeof prev === "object" && !Array.isArray(prev) ? prev : {};
      return { ...safePrev, [logDate]: Math.round(val * 100) / 100 };
    });
    const isToday = logDate === todayStr();
    toast.success(
      `Logged ${formatHours(val)} for ${isToday ? "today" : logDate}!`,
    );
    setTodayInput("");
  };

  const today = todayStr();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentMonthKey = `${currentYear}-${pad(currentMonth + 1)}`;

  const currentWeekStart = getWeekStart(today);
  const currentWeekDays = getWeekDays(currentWeekStart);
  const thisWeekHours = sumHours(currentWeekDays, dailyLog);
  const weekPct = Math.min((thisWeekHours / safeTarget) * 100, 100);
  const selectedDateLogged = dailyLog[selectedLogDate] || 0;

  const prepDayDisplay = useMemo(() => {
    try {
      if (today < safePrepStart) {
        const daysUntil = calcPrepDay(today, safePrepStart) - 1;
        return { label: `Starts in ${daysUntil}d`, sublabel: "Prep Day" };
      }
      const dayNum = calcPrepDay(safePrepStart, today);
      return { label: `Day ${dayNum}`, sublabel: "Prep Day" };
    } catch {
      return { label: "Day 1", sublabel: "Prep Day" };
    }
  }, [today, safePrepStart]);

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

  const allDates = Object.keys(dailyLog)
    .filter((d) => d >= safePrepStart)
    .sort();
  const daysTracked = allDates.length;

  const timerClass = onBreak
    ? "font-mono text-6xl font-bold tracking-tight timer-glow-orange text-orange-400"
    : running
      ? "font-mono text-6xl font-bold tracking-tight timer-glow text-primary animate-pulse-glow"
      : "font-mono text-6xl font-bold tracking-tight text-foreground/80";

  const maxMonthHours = Math.max(
    ...yearMonths.map((m) => m.hours).filter((h) => !Number.isNaN(h)),
    1,
  );

  const dateInputStyle = {
    border: "1px solid rgba(0,212,224,0.3)",
    background: "rgba(0,0,0,0.3)",
    colorScheme: "dark" as const,
  };

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

      {/* Row 1: Live Timer + Log Study Hours */}
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
              <span className={timerClass}>{formatTime(displaySeconds)}</span>
            </div>
            {onBreak && (
              <Badge
                className="text-orange-400 border-orange-400/40 text-sm px-3 py-1"
                style={{ background: "rgba(251,146,60,0.12)" }}
              >
                ☕ On Break
              </Badge>
            )}
            {running && (
              <p className="text-[11px] text-primary/60 text-center">
                ✓ Timer running — safe to switch pages
              </p>
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
                  <Pause className="w-4 h-4 mr-2" />
                  {running && !onBreak ? "Pause" : "Resume"}
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
                <Coffee className="w-4 h-4 mr-2" />
                {onBreak ? "End Break" : "Break"}
              </Button>
              <Button
                data-ocid="timer.stop.delete_button"
                variant="outline"
                onClick={handleStop}
                disabled={displaySeconds === 0 && accumulatedMs === 0}
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

        {/* Log Study Hours + Settings */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Log Study Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Prep Start Date setting */}
            <div
              className="rounded-xl p-3 flex items-center justify-between"
              style={{
                background: "rgba(168,85,247,0.04)",
                border: "1px solid rgba(168,85,247,0.18)",
              }}
            >
              <div>
                <span className="text-sm font-medium text-foreground">
                  Prep Starts
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Day 1 of your JEE journey
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  data-ocid="timer.prep.start.input"
                  type="date"
                  value={safePrepStart}
                  onChange={(e) => {
                    if (e.target.value) {
                      setPrepStartDate(e.target.value);
                      if (selectedLogDate < e.target.value) {
                        const newDefault =
                          today >= e.target.value ? today : e.target.value;
                        setSelectedLogDate(newDefault);
                      }
                    }
                  }}
                  className="input-dark border rounded-md px-2 py-1 text-sm"
                  style={dateInputStyle}
                />
              </div>
            </div>

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

            {/* Date picker + hours input */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Select date to log:
                {selectedDateLogged > 0 && (
                  <span
                    className="ml-2 font-semibold"
                    style={{ color: "rgba(0,212,224,0.9)" }}
                  >
                    (Current: {formatHours(selectedDateLogged)})
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2 mb-3">
                <input
                  data-ocid="timer.log.date.input"
                  type="date"
                  value={selectedLogDate}
                  min={safePrepStart}
                  onChange={(e) => {
                    if (e.target.value) setSelectedLogDate(e.target.value);
                  }}
                  className="input-dark border rounded-md px-2 py-1 text-sm"
                  style={dateInputStyle}
                />
                {selectedLogDate === today && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: "rgba(0,212,224,0.15)",
                      color: "rgba(0,212,224,0.9)",
                      border: "1px solid rgba(0,212,224,0.25)",
                    }}
                  >
                    today
                  </span>
                )}
              </div>
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
                  onKeyDown={(e) => e.key === "Enter" && handleLogDate()}
                />
                <span className="text-sm text-muted-foreground">hours</span>
                <Button
                  data-ocid="timer.log.today.primary_button"
                  onClick={handleLogDate}
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
                Overwrites the selected date's entry
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
                  {selectedDateLogged > 0
                    ? formatHours(selectedDateLogged)
                    : "\u2014"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Selected
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
                <div
                  className="text-lg font-mono font-bold"
                  style={{ color: "rgba(168,85,247,0.9)" }}
                >
                  {prepDayDisplay.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {prepDayDisplay.sublabel}
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
                          {isExpanded ? "▲" : "▼"}
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
                <TrendingUp className="w-4 h-4 text-amber-400" /> Year{" "}
                {currentYear}
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
                const safeHours = Number.isNaN(m.hours) ? 0 : m.hours;
                const barPct =
                  maxMonthHours > 0
                    ? Math.min((safeHours / maxMonthHours) * 100, 100)
                    : 0;
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
                            : safeHours > 0
                              ? "linear-gradient(90deg, rgba(251,191,36,0.4), rgba(251,191,36,0.2))"
                              : "transparent",
                          boxShadow:
                            isCurrent && safeHours > 0
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
                          : safeHours > 0
                            ? "rgba(255,255,255,0.6)"
                            : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {safeHours > 0
                        ? formatHours(Math.round(safeHours * 10) / 10)
                        : "\u2014"}
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
            {safePrepStart && (
              <span className="text-[10px] font-normal text-muted-foreground/60 ml-1">
                from {safePrepStart}
              </span>
            )}
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
                No study hours logged yet. Start the timer or log your hours
                above!
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Prep starts {safePrepStart} — entries before that date are
                hidden.
              </p>
            </div>
          ) : (
            <div className="space-y-0 max-h-80 overflow-y-auto pr-1">
              {[...allDates].reverse().map((date, i) => {
                const hrs = dailyLog[date] || 0;
                const isToday = date === today;
                const barPct = Math.min((hrs / 12) * 100, 100);
                const prepDay = calcPrepDay(safePrepStart, date);
                return (
                  <div
                    key={date}
                    data-ocid={`timer.log.item.${i + 1}`}
                    className="flex items-center gap-4 py-2.5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="w-28 shrink-0">
                      <span
                        className="font-mono text-sm block"
                        style={{
                          color: isToday
                            ? "rgba(0,212,224,0.9)"
                            : "rgba(255,255,255,0.6)",
                          fontWeight: isToday ? 600 : 400,
                        }}
                      >
                        {isToday ? "Today" : date}
                      </span>
                      <span
                        className="font-mono text-[10px]"
                        style={{ color: "rgba(168,85,247,0.6)" }}
                      >
                        Day {prepDay}
                      </span>
                    </div>
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
