import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Coffee, Pause, Play, Square, Target } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { TimerSession, WeeklyTargets } from "../types";

const SUBJECTS = ["Physics", "Chemistry", "Maths"];

const SUBJECT_BADGE: Record<string, string> = {
  Physics: "badge-physics",
  Chemistry: "badge-chemistry",
  Maths: "badge-maths",
};

const SUBJECT_PROGRESS: Record<string, string> = {
  Physics: "progress-cyan",
  Chemistry: "progress-green",
  Maths: "progress-purple",
};

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

function getWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function TimerPage() {
  const [sessions, setSessions] = useLocalStorage<TimerSession[]>(
    "jee_sessions",
    [],
  );
  const [targets, setTargets] = useLocalStorage<WeeklyTargets>("jee_targets", {
    Physics: 10,
    Chemistry: 10,
    Maths: 10,
  });

  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [onBreak, setOnBreak] = useState(false);
  const [subject, setSubject] = useState("Physics");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<string>("");

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
      const session: TimerSession = {
        id: Date.now().toString(),
        date: todayStr(),
        subject,
        duration: elapsed,
        startTime: startTimeRef.current,
      };
      setSessions((prev) => [session, ...prev]);
      toast.success(`Session logged: ${formatTime(elapsed)} of ${subject}`);
    }
    setRunning(false);
    setOnBreak(false);
    setElapsed(0);
  };

  const weeklyStudied: Record<string, number> = {};
  const weekStart = getWeekStart();
  for (const s of sessions) {
    const sDate = new Date(s.date);
    if (sDate >= weekStart) {
      weeklyStudied[s.subject] = (weeklyStudied[s.subject] || 0) + s.duration;
    }
  }

  const todaySessions = sessions.filter((s) => s.date === todayStr());

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
          Track your study sessions and weekly targets
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Timer Card */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Timer
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {/* Subject Selector */}
            <Select
              value={subject}
              onValueChange={setSubject}
              disabled={running}
            >
              <SelectTrigger
                data-ocid="timer.subject.select"
                className="w-48 input-dark border"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
          </CardContent>
        </Card>

        {/* Weekly Targets */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Target className="w-4 h-4 text-primary" />
              Weekly Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {SUBJECTS.map((sub) => {
              const studied =
                Math.round(((weeklyStudied[sub] || 0) / 3600) * 10) / 10;
              const target = targets[sub] || 10;
              const pct = Math.min((studied / target) * 100, 100);
              return (
                <div key={sub}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {sub}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {studied}h /
                      </span>
                      <input
                        data-ocid={`timer.target.${sub.toLowerCase()}.input`}
                        type="number"
                        min={1}
                        max={168}
                        value={target}
                        onChange={(e) => {
                          const v = Math.max(
                            1,
                            Number.parseInt(e.target.value) || 1,
                          );
                          setTargets((prev) => ({ ...prev, [sub]: v }));
                        }}
                        className="w-14 text-center text-sm rounded-md px-2 py-0.5 input-dark border"
                      />
                      <span className="text-xs text-muted-foreground">h</span>
                    </div>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-2.5 bg-muted/50 ${SUBJECT_PROGRESS[sub]}`}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-[11px] text-muted-foreground">
                      {Math.round(pct)}% complete
                    </span>
                    <span
                      className={`text-[11px] font-medium ${pct >= 100 ? "text-success" : "text-muted-foreground"}`}
                    >
                      {pct >= 100
                        ? "🎉 Target Met!"
                        : `${Math.max(0, Math.round((target - studied) * 10) / 10)}h remaining`}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Session Log */}
      <Card className="glass border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            Today's Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaySessions.length === 0 ? (
            <div
              data-ocid="timer.sessions.empty_state"
              className="text-center py-8 text-muted-foreground"
            >
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                No sessions logged today. Start the timer!
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <TableHead className="text-muted-foreground">
                    Subject
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Start Time
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Duration
                  </TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaySessions.map((s, i) => (
                  <TableRow
                    key={s.id}
                    data-ocid={`timer.session.item.${i + 1}`}
                    style={{ borderColor: "rgba(255,255,255,0.04)" }}
                  >
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs border ${SUBJECT_BADGE[s.subject] || ""}`}
                      >
                        {s.subject}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {s.startTime}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium text-primary">
                      {formatTime(s.duration)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
