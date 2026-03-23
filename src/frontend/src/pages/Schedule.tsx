import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { ScheduleEntry } from "../types";

const SUBJECTS = ["Physics", "Chemistry", "Maths", "Other"];

const SUBJECT_BADGE: Record<string, string> = {
  Physics: "badge-physics",
  Chemistry: "badge-chemistry",
  Maths: "badge-maths",
  Other: "badge-other",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(diff + i);
    return d.toISOString().split("T")[0];
  });
}

interface FormState {
  time: string;
  subject: string;
  topic: string;
  duration: string;
}

export default function Schedule() {
  const [entries, setEntries] = useLocalStorage<ScheduleEntry[]>(
    "jee_schedule",
    [],
  );
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [open, setOpen] = useState(false);
  const [editDate, setEditDate] = useState(todayStr());
  const [form, setForm] = useState<FormState>({
    time: "9:00 AM",
    subject: "Physics",
    topic: "",
    duration: "60",
  });

  const addEntry = () => {
    if (!form.topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    const entry: ScheduleEntry = {
      id: Date.now().toString(),
      date: editDate,
      time: form.time,
      subject: form.subject,
      topic: form.topic,
      duration: Number.parseInt(form.duration) || 60,
    };
    setEntries((prev) =>
      [...prev, entry].sort((a, b) => a.time.localeCompare(b.time)),
    );
    setForm({ time: "9:00 AM", subject: "Physics", topic: "", duration: "60" });
    setOpen(false);
    toast.success("Schedule entry added!");
  };

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
    toast.success("Entry removed");
  };

  const dayEntries = entries.filter((e) => e.date === selectedDate);
  const weekDates = getWeekDates();

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gradient-text">
          Schedule
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Plan your daily and weekly study sessions
        </p>
      </div>

      <Tabs defaultValue="daily">
        <TabsList
          className="mb-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <TabsTrigger
            value="daily"
            data-ocid="schedule.daily.tab"
            className="data-[state=active]:text-primary"
          >
            Daily Schedule
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            data-ocid="schedule.weekly.tab"
            className="data-[state=active]:text-primary"
          >
            Weekly Schedule
          </TabsTrigger>
        </TabsList>

        {/* Daily */}
        <TabsContent value="daily">
          <Card className="glass border-0">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <input
                    data-ocid="schedule.date.input"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="text-sm rounded-lg px-3 py-1.5 input-dark border"
                  />
                </div>
                <Button
                  data-ocid="schedule.add.primary_button"
                  size="sm"
                  onClick={() => {
                    setEditDate(selectedDate);
                    setOpen(true);
                  }}
                  className="text-primary-foreground font-medium"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.72 0.22 200), oklch(0.68 0.22 210))",
                    boxShadow: "0 0 16px rgba(0,212,224,0.3)",
                    border: "none",
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Entry
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dayEntries.length === 0 ? (
                <div
                  data-ocid="schedule.daily.empty_state"
                  className="text-center py-10 text-muted-foreground"
                >
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No entries for this date</p>
                  <p className="text-xs mt-1">
                    Click "Add Entry" to schedule a session
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dayEntries.map((entry, i) => (
                    <div
                      key={entry.id}
                      data-ocid={`schedule.daily.item.${i + 1}`}
                      className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <span className="text-sm font-mono text-muted-foreground w-20 shrink-0">
                        {entry.time}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 border ${SUBJECT_BADGE[entry.subject] || SUBJECT_BADGE.Other}`}
                      >
                        {entry.subject}
                      </Badge>
                      <span className="text-sm text-foreground flex-1">
                        {entry.topic}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {entry.duration} min
                      </span>
                      <button
                        type="button"
                        data-ocid={`schedule.daily.delete_button.${i + 1}`}
                        onClick={() => deleteEntry(entry.id)}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 rounded opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly */}
        <TabsContent value="weekly">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              This Week
            </h2>
            <Button
              data-ocid="schedule.weekly.add.primary_button"
              size="sm"
              onClick={() => {
                setEditDate(todayStr());
                setOpen(true);
              }}
              className="text-primary-foreground font-medium"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.22 200), oklch(0.68 0.22 210))",
                boxShadow: "0 0 16px rgba(0,212,224,0.3)",
                border: "none",
              }}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Entry
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {weekDates.map((date, di) => {
              const dayEnt = entries.filter((e) => e.date === date);
              const isToday = date === todayStr();
              return (
                <div
                  key={date}
                  className="rounded-xl p-2.5 transition-all duration-200"
                  style={{
                    background: isToday
                      ? "rgba(0,212,224,0.06)"
                      : "rgba(255,255,255,0.03)",
                    border: isToday
                      ? "1px solid rgba(0,212,224,0.3)"
                      : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: isToday
                      ? "0 0 16px rgba(0,212,224,0.08)"
                      : "none",
                  }}
                >
                  <div
                    className={`text-xs font-semibold mb-2 ${isToday ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {DAYS[di]}
                    <span className="block text-[10px] font-normal opacity-70">
                      {date.slice(5)}
                    </span>
                  </div>
                  {dayEnt.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground/50 italic">
                      Free
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {dayEnt.map((e) => (
                        <div
                          key={e.id}
                          data-ocid={`schedule.weekly.item.${di + 1}`}
                          className={`text-[10px] rounded px-1.5 py-0.5 truncate border ${SUBJECT_BADGE[e.subject] || SUBJECT_BADGE.Other}`}
                        >
                          {e.time} {e.topic}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Entry Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          data-ocid="schedule.add.dialog"
          className="max-w-md glass border-0"
        >
          <DialogHeader>
            <DialogTitle className="gradient-text font-display">
              Add Schedule Entry
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Date
              </Label>
              <input
                data-ocid="schedule.entry.date.input"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="mt-1 w-full text-sm rounded-lg px-3 py-2 input-dark border"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Time
                </Label>
                <Input
                  data-ocid="schedule.entry.time.input"
                  value={form.time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time: e.target.value }))
                  }
                  placeholder="9:00 AM"
                  className="mt-1 input-dark border"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">
                  Duration (min)
                </Label>
                <Input
                  data-ocid="schedule.entry.duration.input"
                  type="number"
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: e.target.value }))
                  }
                  className="mt-1 input-dark border"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Subject
              </Label>
              <Select
                value={form.subject}
                onValueChange={(v) => setForm((f) => ({ ...f, subject: v }))}
              >
                <SelectTrigger
                  data-ocid="schedule.entry.subject.select"
                  className="mt-1 input-dark border"
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
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">
                Topic
              </Label>
              <Input
                data-ocid="schedule.entry.topic.input"
                value={form.topic}
                onChange={(e) =>
                  setForm((f) => ({ ...f, topic: e.target.value }))
                }
                placeholder="e.g. Newton's Laws of Motion"
                className="mt-1 input-dark border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="schedule.add.cancel_button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              data-ocid="schedule.add.submit_button"
              onClick={addEntry}
              className="text-primary-foreground font-medium"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.22 200), oklch(0.68 0.22 210))",
                boxShadow: "0 0 16px rgba(0,212,224,0.3)",
                border: "none",
              }}
            >
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
