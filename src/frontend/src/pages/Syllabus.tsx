import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SUBJECTS, buildInitialChapterData } from "../data/syllabusData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { ChapterData, ClassMap } from "../types";

const SUBJECT_HEADER: Record<
  string,
  { border: string; text: string; progress: string }
> = {
  Physics: {
    border: "rgba(0,212,224,0.3)",
    text: "text-cyan-400",
    progress: "progress-cyan",
  },
  Chemistry: {
    border: "rgba(34,197,94,0.3)",
    text: "text-emerald-400",
    progress: "progress-green",
  },
  Maths: {
    border: "rgba(168,85,247,0.3)",
    text: "text-purple-400",
    progress: "progress-purple",
  },
};

function ChapterRow({
  chapter,
  data,
  onChange,
  index,
}: {
  chapter: string;
  data: ChapterData;
  onChange: (updated: ChapterData) => void;
  index: number;
}) {
  const isFullyDone = data.done && data.notesDone && data.moduleDone;

  const toggle = (field: keyof ChapterData) => {
    const updated = { ...data, [field]: !data[field] };
    onChange(updated);
    if (field === "done" && !data.done)
      toast.success(`${chapter} marked as done!`);
  };

  return (
    <div
      data-ocid={`syllabus.chapter.item.${index}`}
      className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 rounded-lg transition-all duration-200"
      style={{
        background: isFullyDone
          ? "rgba(34,197,94,0.06)"
          : "rgba(255,255,255,0.03)",
        border: isFullyDone
          ? "1px solid rgba(34,197,94,0.2)"
          : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span className="text-sm font-medium text-foreground flex-1 min-w-[150px]">
        {chapter}
      </span>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          data-ocid={`syllabus.done.toggle.${index}`}
          onClick={() => toggle("done")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
            data.done
              ? "toggle-chapter-active"
              : "text-muted-foreground border-border hover:border-emerald-500/50 hover:text-emerald-400 bg-transparent"
          }`}
        >
          ✓ Chapter
        </button>

        <button
          type="button"
          data-ocid={`syllabus.notes.toggle.${index}`}
          onClick={() => toggle("notesDone")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
            data.notesDone
              ? "toggle-notes-active"
              : "text-muted-foreground border-border hover:border-cyan-500/50 hover:text-cyan-400 bg-transparent"
          }`}
        >
          📝 Notes
        </button>

        <button
          type="button"
          data-ocid={`syllabus.module.toggle.${index}`}
          onClick={() => toggle("moduleDone")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
            data.moduleDone
              ? "toggle-module-active"
              : "text-muted-foreground border-border hover:border-purple-500/50 hover:text-purple-400 bg-transparent"
          }`}
        >
          📦 Module
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Rev:</span>
          <input
            data-ocid={`syllabus.revisions.input.${index}`}
            type="number"
            min={0}
            max={99}
            value={data.revisions}
            onChange={(e) => {
              const val = Math.max(
                0,
                Math.min(99, Number.parseInt(e.target.value) || 0),
              );
              onChange({ ...data, revisions: val });
            }}
            className="w-12 h-7 text-center text-sm rounded-md input-dark border"
          />
        </div>

        {isFullyDone && (
          <Badge
            className="text-xs border"
            style={{
              background: "rgba(34,197,94,0.12)",
              color: "rgb(74,222,128)",
              borderColor: "rgba(34,197,94,0.3)",
            }}
          >
            ✦ Complete
          </Badge>
        )}
      </div>
    </div>
  );
}

function SubjectSection({
  subject,
  chapters,
  classKey,
  onUpdate,
}: {
  subject: string;
  chapters: Record<string, ChapterData>;
  classKey: string;
  onUpdate: (
    classKey: string,
    subject: string,
    chapter: string,
    data: ChapterData,
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const chList = Object.entries(chapters);
  const donePct = chList.length
    ? Math.round(
        (chList.filter(([, v]) => v.done).length / chList.length) * 100,
      )
    : 0;
  const fullyDone = chList.filter(
    ([, v]) => v.done && v.notesDone && v.moduleDone,
  ).length;
  const theme = SUBJECT_HEADER[subject] || {
    border: "rgba(255,255,255,0.2)",
    text: "text-foreground",
    progress: "",
  };

  return (
    <div className="mb-3">
      <button
        type="button"
        data-ocid={`syllabus.${classKey}.${subject.toLowerCase()}.toggle`}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all duration-200 hover:brightness-110"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${theme.border}`,
          boxShadow: open
            ? `0 0 20px ${theme.border.replace("0.3", "0.1")}`
            : "none",
        }}
      >
        <div className="flex items-center gap-2.5">
          {open ? (
            <ChevronDown className={`w-4 h-4 ${theme.text}`} />
          ) : (
            <ChevronRight className={`w-4 h-4 ${theme.text}`} />
          )}
          <span className={`font-semibold font-display ${theme.text}`}>
            {subject}
          </span>
          <span className="text-xs text-muted-foreground">
            {fullyDone}/{chList.length} fully done
          </span>
        </div>
        <div className="flex items-center gap-3 min-w-[130px]">
          <Progress
            value={donePct}
            className={`h-2 w-24 bg-muted/50 ${theme.progress}`}
          />
          <span
            className={`text-xs font-mono font-medium w-8 text-right ${theme.text}`}
          >
            {donePct}%
          </span>
        </div>
      </button>

      {open && (
        <div className="mt-2 space-y-1.5 pl-2">
          {chList.map(([ch, data], idx) => (
            <ChapterRow
              key={ch}
              chapter={ch}
              data={data}
              index={idx + 1}
              onChange={(updated) => onUpdate(classKey, subject, ch, updated)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Syllabus() {
  const [chapters, setChapters] = useLocalStorage<ClassMap>(
    "jee_chapters",
    buildInitialChapterData(),
  );

  const handleUpdate = (
    classKey: string,
    subject: string,
    chapter: string,
    data: ChapterData,
  ) => {
    setChapters((prev) => ({
      ...prev,
      [classKey]: {
        ...prev[classKey],
        [subject]: {
          ...prev[classKey]?.[subject],
          [chapter]: data,
        },
      },
    }));
  };

  const getSummary = (classKey: string) => {
    let total = 0;
    let done = 0;
    for (const sub of Object.values(chapters[classKey] || {})) {
      for (const ch of Object.values(sub)) {
        total++;
        if (ch.done && ch.notesDone && ch.moduleDone) done++;
      }
    }
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold gradient-text">
          Syllabus Tracker
        </h1>
        <p className="text-muted-foreground text-sm mt-1.5">
          Track chapter completion, notes, modules, and revisions
        </p>
      </div>

      <Tabs defaultValue="class11" data-ocid="syllabus.class.tab">
        <TabsList
          className="mb-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <TabsTrigger
            value="class11"
            data-ocid="syllabus.class11.tab"
            className="data-[state=active]:text-primary"
          >
            Class 11{" "}
            <span className="ml-1 text-xs opacity-60">
              ({getSummary("class11").done}/{getSummary("class11").total})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="class12"
            data-ocid="syllabus.class12.tab"
            className="data-[state=active]:text-primary"
          >
            Class 12{" "}
            <span className="ml-1 text-xs opacity-60">
              ({getSummary("class12").done}/{getSummary("class12").total})
            </span>
          </TabsTrigger>
        </TabsList>

        {(["class11", "class12"] as const).map((cls) => (
          <TabsContent key={cls} value={cls}>
            <div className="grid md:grid-cols-1 gap-4">
              {SUBJECTS.map((sub) => (
                <Card key={sub} className="glass border-0">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                      {sub}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <SubjectSection
                      subject={sub}
                      chapters={chapters[cls]?.[sub] || {}}
                      classKey={cls}
                      onUpdate={handleUpdate}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
