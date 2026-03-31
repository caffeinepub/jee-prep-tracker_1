import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Coffee,
  Pause,
  Play,
  Square,
  Target,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

function nowTimeStr() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatHours(h: number) {
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;
}

export default function TimerPage() {
  // Daily log: { "2026-03-31": 5.5, ... } — hours studied each day
  const [dailyLog, setDailyLog] = useLocalStorage<Record<string, number>>(
    "jee_daily_log",
    {},
  );
  // Overall target hours for entire JEE prep
  const [targetHours, setTargetHours] = useLocalStorage<number>(
    "jee_overall_target",
    3000,
  );

  // Live session timer state
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<string>("");

  // Daily input state
  const [todayInput, setTodayInput] = useState<string>("");

  const tick = useCallback(() => {
    setElapsed((prev) => prev + 1);
  }, []);

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
      startTimeRef.current = nowTimeStr();
      setRunning(true);
      setOnBreak(false);
    }
  };

  const handlePause = () => {
    setRunning((r) => !r);
  };

  const handleBreak = () => {
    setOnBreak((b) => !b);
  };

  const handleStop = () => {
    if (elapsed > 0) {
      const hoursElapsed = elapsed / 3600;
      const today = todayStr();
      setDailyLog((prev) => ({
        ...prev,
        [today]: Math.round(((prev[today] || 0) + hoursElapsed) * 100) / 100,
      }));
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
      toast.error("Please enter a valid number of hours");
      return;
    }
    const today = todayStr();
    setDailyLog((prev) => ({ ...prev, [today]: Math.round(val * 100) / 100 }));
    toast.success(`Logged ${formatHours(val)} for today!`);
    setTodayInput("");
  };

  // Compute stats
  const allDates = Object.keys(dailyLog).sort();
  const totalStudied = allDates.reduce((sum, d) => sum + (dailyLog[d] || 0), 0);
  const daysTracked = allDates.length;
  const avgPerDay = daysTracked > 0 ? totalStudied / daysTracked : 0;
  const progressPct = Math.min((totalStudied / targetHours) * 100, 100);
  const todayLogged = dailyLog[todayStr()] || 0;
  const remainingHours = Math.max(0, targetHours - totalStudied);
  const daysToFinish =
    avgPerDay > 0 ? Math.ceil(remainingHours / avgPerDay) : null;

  const timerClass = onBreak
    ? "font-mono text-6xl font-bold tracking-tight timer-glow-orange text-orange-400"
    : running
      ? "font-mono text-6xl font-bold tracking-tight timer-glow text-primary animate-pulse-glow"
      : "font-mono text-6xl font-bold tracking-tight text-foreground/80";

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gradient-text">
          Study Timer
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Track your overall JEE prep journey — every hour counts
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Live Timer Card */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Live Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* Timer Display */}
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

            {/* Controls */}
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
              Stopping the timer auto-adds the session to today's log
            </p>
          </CardContent>
        </Card>

        {/* Overall Progress Card */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Target className="w-4 h-4 text-primary" />
              JEE Prep Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Target setting */}
            <div
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "rgba(0,212,224,0.04)",
                border: "1px solid rgba(0,212,224,0.15)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Total Target Hours
                </span>
                <div className="flex items-center gap-2">
                  <input
                    data-ocid="timer.target.hours.input"
                    type="number"
                    min={100}
                    max={20000}
                    value={targetHours}
                    onChange={(e) => {
                      const v = Math.max(
                        100,
                        Number.parseInt(e.target.value) || 3000,
                      );
                      setTargetHours(v);
                    }}
                    className="w-20 text-center text-sm rounded-md px-2 py-1 input-dark border font-mono"
                  />
                  <span className="text-xs text-muted-foreground">hrs</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Set your total study hours target for the entire JEE prep (~700
                days)
              </p>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Overall Progress
                </span>
                <span className="text-sm font-mono font-medium text-primary">
                  {Math.round(totalStudied * 10) / 10}h / {targetHours}h
                </span>
              </div>
              <Progress
                value={progressPct}
                className="h-3 bg-muted/50 progress-cyan"
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[11px] text-muted-foreground">
                  {Math.round(progressPct)}% complete
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {Math.round(remainingHours * 10) / 10}h remaining
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div
                className="rounded-lg p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-lg font-mono font-bold text-primary">
                  {daysTracked}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Days Tracked
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
                  {formatHours(Math.round(avgPerDay * 10) / 10)}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Avg/Day
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
                  {todayLogged > 0 ? formatHours(todayLogged) : "—"}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Today
                </div>
              </div>
            </div>

            {daysToFinish !== null && remainingHours > 0 && (
              <div
                className="rounded-lg px-3 py-2 text-xs text-center"
                style={{
                  background: "rgba(168,85,247,0.06)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  color: "rgba(168,85,247,0.9)",
                }}
              >
                At your current pace, you'll hit your target in ~{daysToFinish}{" "}
                more days
              </div>
            )}
            {progressPct >= 100 && (
              <div
                className="rounded-lg px-3 py-2 text-xs text-center font-semibold"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: "rgb(74,222,128)",
                }}
              >
                🎉 Target Achieved! You're a beast!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log Today's Hours */}
      <Card className="glass border-0 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <TrendingUp className="w-4 h-4 text-primary" />
            Log Today's Study Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[220px]">
              <p className="text-xs text-muted-foreground mb-1.5">
                Date:{" "}
                <span className="font-mono text-foreground/70">
                  {todayStr()}
                </span>
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
                  id="today-hours-input"
                  data-ocid="timer.today.hours.input"
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={todayInput}
                  onChange={(e) => setTodayInput(e.target.value)}
                  placeholder="e.g. 5.5"
                  className="w-36 text-center text-lg font-mono rounded-xl px-3 py-2.5 input-dark border"
                  style={{
                    border: "1px solid rgba(0,212,224,0.3)",
                    boxShadow: "0 0 8px rgba(0,212,224,0.08)",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLogToday()}
                />
                <span className="text-sm text-muted-foreground font-medium">
                  hours
                </span>
                <Button
                  data-ocid="timer.log.today.primary_button"
                  onClick={handleLogToday}
                  className="px-6 font-medium text-primary-foreground"
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
              <p className="text-xs text-muted-foreground mt-2">
                Enter total hours studied today. This overwrites today's
                existing log entry.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Study Log */}
      <Card className="glass border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            Study Log{" "}
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
                const isToday = date === todayStr();
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
