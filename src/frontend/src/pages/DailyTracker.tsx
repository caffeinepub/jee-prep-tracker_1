import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DayLog {
  moduleDone: boolean;
  dppDone: boolean;
  rev1Done: boolean;
  rev2Done: boolean;
}

type DayField = "moduleDone" | "dppDone" | "rev1Done" | "rev2Done";

function generateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const cur = new Date(start);
  const endDate = new Date(end);
  while (cur <= endDate) {
    dates.push(cur.toISOString().split("T")[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function formatDay(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMonthKey(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function DayRow({
  dateStr,
  log,
  onToggle,
  index,
  isToday,
}: {
  dateStr: string;
  log: DayLog;
  onToggle: (field: DayField) => void;
  index: number;
  isToday: boolean;
}) {
  const allDone = log.moduleDone && log.dppDone && log.rev1Done && log.rev2Done;

  return (
    <div
      data-ocid={`daily.item.${index}`}
      id={`day-${dateStr}`}
      className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 rounded-lg transition-all duration-200"
      style={{
        background: allDone
          ? "rgba(34,197,94,0.05)"
          : isToday
            ? "rgba(0,212,224,0.05)"
            : "rgba(255,255,255,0.02)",
        border: allDone
          ? "1px solid rgba(34,197,94,0.15)"
          : isToday
            ? "1px solid rgba(0,212,224,0.25)"
            : "1px solid rgba(255,255,255,0.05)",
        boxShadow: isToday ? "0 0 8px rgba(0,212,224,0.08)" : "none",
      }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-[160px]">
        {isToday && (
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(0,212,224,0.15)",
              color: "rgb(0,212,224)",
              border: "1px solid rgba(0,212,224,0.3)",
            }}
          >
            TODAY
          </span>
        )}
        <span className="text-sm font-medium text-foreground/90">
          {formatDay(dateStr)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Module */}
        <button
          type="button"
          data-ocid={`daily.module.toggle.${index}`}
          onClick={() => onToggle("moduleDone")}
          title="Module completed for this day"
          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200"
          style={
            log.moduleDone
              ? {
                  background: "rgba(34,197,94,0.15)",
                  color: "rgb(74,222,128)",
                  borderColor: "rgba(34,197,94,0.3)",
                }
              : {
                  background: "transparent",
                  color: "var(--muted-foreground)",
                  borderColor: "var(--border)",
                }
          }
        >
          📦 Module
        </button>

        {/* DPP */}
        <button
          type="button"
          data-ocid={`daily.dpp.toggle.${index}`}
          onClick={() => onToggle("dppDone")}
          title="DPP completed for this day"
          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200"
          style={
            log.dppDone
              ? {
                  background: "rgba(0,212,224,0.12)",
                  color: "rgb(0,212,224)",
                  borderColor: "rgba(0,212,224,0.3)",
                }
              : {
                  background: "transparent",
                  color: "var(--muted-foreground)",
                  borderColor: "var(--border)",
                }
          }
        >
          📝 DPP
        </button>

        {/* REV1 — latest lecture revision (done right after lecture) */}
        <button
          type="button"
          data-ocid={`daily.rev1.toggle.${index}`}
          onClick={() => onToggle("rev1Done")}
          title="REV1: Revision of today's latest lecture topic (do right after the lecture)"
          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200"
          style={
            log.rev1Done
              ? {
                  background: "rgba(251,146,60,0.15)",
                  color: "rgb(251,146,60)",
                  borderColor: "rgba(251,146,60,0.35)",
                  boxShadow: "0 0 6px rgba(251,146,60,0.15)",
                }
              : {
                  background: "transparent",
                  color: "var(--muted-foreground)",
                  borderColor: "var(--border)",
                }
          }
        >
          🔥 REV1
        </button>

        {/* REV2 — all past topics revision (done before next lecture) */}
        <button
          type="button"
          data-ocid={`daily.rev2.toggle.${index}`}
          onClick={() => onToggle("rev2Done")}
          title="REV2: Revision of all past topics (do before the upcoming lecture)"
          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200"
          style={
            log.rev2Done
              ? {
                  background: "rgba(168,85,247,0.15)",
                  color: "rgb(192,132,252)",
                  borderColor: "rgba(168,85,247,0.35)",
                  boxShadow: "0 0 6px rgba(168,85,247,0.15)",
                }
              : {
                  background: "transparent",
                  color: "var(--muted-foreground)",
                  borderColor: "var(--border)",
                }
          }
        >
          🔁 REV2
        </button>

        {allDone && (
          <Badge
            className="text-xs border"
            style={{
              background: "rgba(34,197,94,0.12)",
              color: "rgb(74,222,128)",
              borderColor: "rgba(34,197,94,0.3)",
            }}
          >
            ✦ Done
          </Badge>
        )}
      </div>
    </div>
  );
}

function MonthSection({
  monthKey,
  dates,
  dailyLog,
  onToggle,
  defaultOpen,
  globalOffset,
}: {
  monthKey: string;
  dates: string[];
  dailyLog: Record<string, DayLog>;
  onToggle: (date: string, field: DayField) => void;
  defaultOpen: boolean;
  globalOffset: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const today = getTodayStr();

  const moduleCount = dates.filter((d) => dailyLog[d]?.moduleDone).length;
  const dppCount = dates.filter((d) => dailyLog[d]?.dppDone).length;
  const rev1Count = dates.filter((d) => dailyLog[d]?.rev1Done).length;
  const rev2Count = dates.filter((d) => dailyLog[d]?.rev2Done).length;
  const allCount = dates.filter(
    (d) =>
      dailyLog[d]?.moduleDone &&
      dailyLog[d]?.dppDone &&
      dailyLog[d]?.rev1Done &&
      dailyLog[d]?.rev2Done,
  ).length;
  const pct = dates.length ? Math.round((allCount / dates.length) * 100) : 0;

  return (
    <div className="mb-3">
      <button
        type="button"
        data-ocid="daily.month.toggle"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all duration-200 hover:brightness-110"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(0,212,224,0.2)",
          boxShadow: open ? "0 0 20px rgba(0,212,224,0.06)" : "none",
        }}
      >
        <div className="flex items-center gap-2.5">
          {open ? (
            <ChevronDown className="w-4 h-4 text-cyan-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-cyan-400" />
          )}
          <span className="font-semibold font-display text-cyan-400">
            {monthKey}
          </span>
          <span className="text-xs text-muted-foreground">
            {allCount}/{dates.length} complete
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span style={{ color: "rgb(74,222,128)" }}>M: {moduleCount}</span>
          <span style={{ color: "rgb(0,212,224)" }}>D: {dppCount}</span>
          <span style={{ color: "rgb(251,146,60)" }}>R1: {rev1Count}</span>
          <span style={{ color: "rgb(192,132,252)" }}>R2: {rev2Count}</span>
          <span
            className="font-mono font-medium"
            style={{
              color: pct === 100 ? "rgb(74,222,128)" : "rgb(0,212,224)",
            }}
          >
            {pct}%
          </span>
        </div>
      </button>

      {open && (
        <div className="mt-2 pl-2 space-y-1.5">
          {dates.map((d, i) => (
            <DayRow
              key={d}
              dateStr={d}
              log={
                dailyLog[d] || {
                  moduleDone: false,
                  dppDone: false,
                  rev1Done: false,
                  rev2Done: false,
                }
              }
              onToggle={(field) => onToggle(d, field)}
              index={globalOffset + i + 1}
              isToday={d === today}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DailyTracker() {
  const [dateRange, setDateRange] = useLocalStorage<DateRange | null>(
    "jee_daily_range",
    null,
  );
  const [dailyLog, setDailyLog] = useLocalStorage<Record<string, DayLog>>(
    "jee_daily_log",
    {},
  );

  const [startInput, setStartInput] = useState(dateRange?.startDate || "");
  const [endInput, setEndInput] = useState(dateRange?.endDate || "");
  const [rangeError, setRangeError] = useState("");

  const dates = dateRange
    ? generateDates(dateRange.startDate, dateRange.endDate)
    : [];
  const today = getTodayStr();

  // Group by month
  const months: Record<string, string[]> = {};
  for (const d of dates) {
    const mk = getMonthKey(d);
    if (!months[mk]) months[mk] = [];
    months[mk].push(d);
  }

  const currentMonthKey = getMonthKey(today);

  // Summary stats
  const totalDays = dates.length;
  const moduleDoneCount = dates.filter((d) => dailyLog[d]?.moduleDone).length;
  const dppDoneCount = dates.filter((d) => dailyLog[d]?.dppDone).length;
  const rev1DoneCount = dates.filter((d) => dailyLog[d]?.rev1Done).length;
  const rev2DoneCount = dates.filter((d) => dailyLog[d]?.rev2Done).length;
  const allDoneCount = dates.filter(
    (d) =>
      dailyLog[d]?.moduleDone &&
      dailyLog[d]?.dppDone &&
      dailyLog[d]?.rev1Done &&
      dailyLog[d]?.rev2Done,
  ).length;

  const saveRange = () => {
    if (!startInput || !endInput) {
      setRangeError("Please enter both start and end dates.");
      return;
    }
    if (new Date(startInput) > new Date(endInput)) {
      setRangeError("Start date must be before end date.");
      return;
    }
    const diff =
      (new Date(endInput).getTime() - new Date(startInput).getTime()) /
      (1000 * 60 * 60 * 24);
    if (diff > 730) {
      setRangeError("Date range too large (max 2 years).");
      return;
    }
    setRangeError("");
    setDateRange({ startDate: startInput, endDate: endInput });
  };

  const toggleDay = (date: string, field: DayField) => {
    setDailyLog((prev) => ({
      ...prev,
      [date]: {
        moduleDone: prev[date]?.moduleDone ?? false,
        dppDone: prev[date]?.dppDone ?? false,
        rev1Done: prev[date]?.rev1Done ?? false,
        rev2Done: prev[date]?.rev2Done ?? false,
        [field]: !(prev[date]?.[field] ?? false),
      },
    }));
  };

  const jumpToToday = () => {
    const el = document.getElementById(`day-${today}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.style.outline = "2px solid rgba(0,212,224,0.6)";
      setTimeout(() => {
        el.style.outline = "";
      }, 1500);
    }
  };

  // Calculate global offset for deterministic markers
  const monthKeys = Object.keys(months);
  const monthOffsets: Record<string, number> = {};
  let offset = 0;
  for (const mk of monthKeys) {
    monthOffsets[mk] = offset;
    offset += months[mk].length;
  }

  useEffect(() => {
    if (dateRange) {
      setStartInput(dateRange.startDate);
      setEndInput(dateRange.endDate);
    }
  }, [dateRange]);

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gradient-text">
          Daily Tracker
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Track Module, DPP, and Revisions for every day of your JEE prep
        </p>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
          <span>
            <span style={{ color: "rgb(74,222,128)" }}>📦 Module</span> — module
            completed
          </span>
          <span>
            <span style={{ color: "rgb(0,212,224)" }}>📝 DPP</span> — daily
            practice problems
          </span>
          <span>
            <span style={{ color: "rgb(251,146,60)" }}>🔥 REV1</span> — revision
            of latest lecture (do right after lecture)
          </span>
          <span>
            <span style={{ color: "rgb(192,132,252)" }}>🔁 REV2</span> —
            revision of all past topics (do before next lecture)
          </span>
        </div>
      </div>

      {/* Date Range Setup */}
      <Card
        className="glass border-0 mb-6"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-foreground/90 font-display">
              Set Date Range
            </span>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="daily-start-date"
                className="text-xs text-muted-foreground uppercase tracking-wider"
              >
                Start Date
              </label>
              <input
                id="daily-start-date"
                data-ocid="daily.start_date.input"
                type="date"
                value={startInput}
                onChange={(e) => setStartInput(e.target.value)}
                className="input-dark border rounded-lg px-3 py-2 text-sm min-w-[160px]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "var(--foreground)",
                }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="daily-end-date"
                className="text-xs text-muted-foreground uppercase tracking-wider"
              >
                End Date
              </label>
              <input
                id="daily-end-date"
                data-ocid="daily.end_date.input"
                type="date"
                value={endInput}
                onChange={(e) => setEndInput(e.target.value)}
                className="input-dark border rounded-lg px-3 py-2 text-sm min-w-[160px]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "var(--foreground)",
                }}
              />
            </div>
            <button
              type="button"
              data-ocid="daily.save_range.button"
              onClick={saveRange}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={{
                background: "rgba(0,212,224,0.15)",
                color: "rgb(0,212,224)",
                border: "1px solid rgba(0,212,224,0.3)",
                boxShadow: "0 0 12px rgba(0,212,224,0.1)",
              }}
            >
              Save Range
            </button>
          </div>
          {rangeError && (
            <p
              data-ocid="daily.range.error_state"
              className="text-xs mt-2"
              style={{ color: "rgb(248,113,113)" }}
            >
              {rangeError}
            </p>
          )}
          {dateRange && (
            <p className="text-xs mt-2 text-muted-foreground">
              Current range:{" "}
              <span className="text-cyan-400">{dateRange.startDate}</span> →{" "}
              <span className="text-cyan-400">{dateRange.endDate}</span>{" "}
              <span className="opacity-60">({totalDays} days)</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Bar */}
      {totalDays > 0 && (
        <Card
          className="glass border-0 mb-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <CardContent className="p-5">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div
                  className="text-2xl font-bold font-mono"
                  style={{ color: "rgb(0,212,224)" }}
                >
                  {totalDays}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Total Days
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold font-mono"
                  style={{ color: "rgb(74,222,128)" }}
                >
                  {moduleDoneCount}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Modules (
                  {totalDays
                    ? Math.round((moduleDoneCount / totalDays) * 100)
                    : 0}
                  %)
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold font-mono"
                  style={{ color: "rgb(0,212,224)" }}
                >
                  {dppDoneCount}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  DPPs (
                  {totalDays ? Math.round((dppDoneCount / totalDays) * 100) : 0}
                  %)
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold font-mono"
                  style={{ color: "rgb(251,146,60)" }}
                >
                  {rev1DoneCount}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  REV1 (
                  {totalDays
                    ? Math.round((rev1DoneCount / totalDays) * 100)
                    : 0}
                  %)
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold font-mono"
                  style={{ color: "rgb(192,132,252)" }}
                >
                  {rev2DoneCount}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  REV2 (
                  {totalDays
                    ? Math.round((rev2DoneCount / totalDays) * 100)
                    : 0}
                  %)
                </div>
              </div>
              <div className="text-center">
                <div
                  className="text-2xl font-bold font-mono"
                  style={{
                    color:
                      allDoneCount > 0 ? "rgb(74,222,128)" : "rgb(148,163,184)",
                  }}
                >
                  {allDoneCount}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  All Done (
                  {totalDays ? Math.round((allDoneCount / totalDays) * 100) : 0}
                  %)
                </div>
              </div>
            </div>

            {dates.includes(today) && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  data-ocid="daily.jump_today.button"
                  onClick={jumpToToday}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110"
                  style={{
                    background: "rgba(0,212,224,0.1)",
                    color: "rgb(0,212,224)",
                    border: "1px solid rgba(0,212,224,0.25)",
                    boxShadow: "0 0 8px rgba(0,212,224,0.08)",
                  }}
                >
                  ⚡ Jump to Today
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!dateRange && (
        <div
          data-ocid="daily.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <div className="text-5xl mb-4">📅</div>
          <p className="text-lg font-medium">Set a date range to get started</p>
          <p className="text-sm mt-1 opacity-60">
            Enter your prep start and end dates above, then hit Save Range
          </p>
        </div>
      )}

      {/* Monthly Sections */}
      {monthKeys.length > 0 && (
        <div>
          {monthKeys.map((mk) => (
            <MonthSection
              key={mk}
              monthKey={mk}
              dates={months[mk]}
              dailyLog={dailyLog}
              onToggle={toggleDay}
              defaultOpen={mk === currentMonthKey}
              globalOffset={monthOffsets[mk]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
