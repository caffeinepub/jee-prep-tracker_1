import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CHEMISTRY_SECTIONS_11,
  CHEMISTRY_SECTIONS_12,
  SCHOOL_CHEMISTRY_SECTIONS_11,
  SCHOOL_CHEMISTRY_SECTIONS_12,
  SCHOOL_CLASS_11_CHAPTERS,
  SCHOOL_CLASS_12_CHAPTERS,
  SCHOOL_SUBJECTS,
  SUBJECTS,
  buildInitialChapterData,
} from "../data/syllabusData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { ChapterData, ClassMap } from "../types";

type ChapterMode = "jee" | "jeeChemistry" | "school";

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
  English: {
    border: "rgba(251,191,36,0.3)",
    text: "text-yellow-400",
    progress: "",
  },
  "Physical Education": {
    border: "rgba(249,115,22,0.3)",
    text: "text-orange-400",
    progress: "",
  },
};

function isChapterFullyDone(data: ChapterData, mode: ChapterMode): boolean {
  if (mode === "jee") return data.done && data.notesDone && data.moduleDone;
  if (mode === "jeeChemistry")
    return (
      data.done &&
      data.notesDone &&
      data.moduleDone &&
      (data.ncertDone ?? false)
    );
  // school
  return data.done && data.notesDone && (data.ncertDone ?? false);
}

function ChapterRow({
  chapter,
  data,
  onChange,
  index,
  mode = "jee",
}: {
  chapter: string;
  data: ChapterData;
  onChange: (updated: ChapterData) => void;
  index: number;
  mode?: ChapterMode;
}) {
  const safeData = { ...data, ncertDone: data.ncertDone ?? false };
  const isFullyDone = isChapterFullyDone(safeData, mode);

  const toggle = (field: keyof ChapterData) => {
    const updated = { ...safeData, [field]: !safeData[field] };
    onChange(updated);
    if (field === "done" && !safeData.done)
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
            safeData.done
              ? "toggle-chapter-active"
              : "text-white/60 border-white/40 hover:border-emerald-500/70 hover:text-emerald-400 bg-transparent"
          }`}
        >
          ✓ Chapter
        </button>

        <button
          type="button"
          data-ocid={`syllabus.notes.toggle.${index}`}
          onClick={() => toggle("notesDone")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
            safeData.notesDone
              ? "toggle-notes-active"
              : "text-white/60 border-white/40 hover:border-cyan-500/70 hover:text-cyan-400 bg-transparent"
          }`}
        >
          📝 Notes
        </button>

        {(mode === "jee" || mode === "jeeChemistry") && (
          <button
            type="button"
            data-ocid={`syllabus.module.toggle.${index}`}
            onClick={() => toggle("moduleDone")}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${
              safeData.moduleDone
                ? "toggle-module-active"
                : "text-white/60 border-white/40 hover:border-purple-500/70 hover:text-purple-400 bg-transparent"
            }`}
          >
            📦 Module
          </button>
        )}

        {(mode === "jeeChemistry" || mode === "school") && (
          <button
            type="button"
            data-ocid={`syllabus.ncert.toggle.${index}`}
            onClick={() => toggle("ncertDone")}
            className="px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200"
            style={
              safeData.ncertDone
                ? {
                    background: "rgba(251,146,60,0.18)",
                    color: "rgb(251,146,60)",
                    borderColor: "rgba(251,146,60,0.6)",
                    boxShadow:
                      "0 0 8px rgba(251,146,60,0.35), inset 0 0 6px rgba(251,146,60,0.1)",
                  }
                : {
                    background: "transparent",
                    color: "rgba(255,255,255,0.6)",
                    borderColor: "rgba(255,255,255,0.4)",
                  }
            }
          >
            📚 NCERT
          </button>
        )}

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Rev:</span>
          <input
            data-ocid={`syllabus.revisions.input.${index}`}
            type="number"
            min={0}
            max={99}
            value={safeData.revisions}
            onChange={(e) => {
              const val = Math.max(
                0,
                Math.min(99, Number.parseInt(e.target.value) || 0),
              );
              onChange({ ...safeData, revisions: val });
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

function ChemistrySectionGroup({
  sections,
  chapters,
  classKey,
  onUpdate,
  mode,
}: {
  sections: Record<string, string[]>;
  chapters: Record<string, ChapterData>;
  classKey: string;
  onUpdate: (
    classKey: string,
    subject: string,
    chapter: string,
    data: ChapterData,
  ) => void;
  mode: "jeeChemistry" | "school";
}) {
  return (
    <div className="space-y-3">
      {Object.entries(sections).map(([sectionName, chapterNames]) => (
        <div key={sectionName}>
          <div className="text-xs font-semibold uppercase tracking-widest text-emerald-300/70 mb-2 pl-1 border-l-2 border-emerald-500/40 ml-1">
            {sectionName} Chemistry
          </div>
          <div className="space-y-1.5 pl-2">
            {chapterNames.map((ch, idx) =>
              chapters[ch] ? (
                <ChapterRow
                  key={ch}
                  chapter={ch}
                  data={chapters[ch]}
                  index={idx + 1}
                  mode={mode}
                  onChange={(updated) =>
                    onUpdate(classKey, "Chemistry", ch, updated)
                  }
                />
              ) : null,
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SubjectSection({
  subject,
  chapters,
  classKey,
  onUpdate,
  mode = "jee",
  sections,
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
  mode?: ChapterMode;
  sections?: Record<string, string[]>;
}) {
  const [open, setOpen] = useState(false);
  const chList = Object.entries(chapters);
  const donePct = chList.length
    ? Math.round(
        (chList.filter(([, v]) => v.done).length / chList.length) * 100,
      )
    : 0;
  const fullyDone = chList.filter(([, v]) =>
    isChapterFullyDone({ ...v, ncertDone: v.ncertDone ?? false }, mode),
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
        <div className="mt-2 pl-2">
          {sections ? (
            <ChemistrySectionGroup
              sections={sections}
              chapters={chapters}
              classKey={classKey}
              onUpdate={onUpdate}
              mode={mode as "jeeChemistry" | "school"}
            />
          ) : (
            <div className="space-y-1.5">
              {chList.map(([ch, data], idx) => (
                <ChapterRow
                  key={ch}
                  chapter={ch}
                  data={data}
                  index={idx + 1}
                  mode={mode}
                  onChange={(updated) =>
                    onUpdate(classKey, subject, ch, updated)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const DEFAULT_CHAPTER_DATA: ChapterData = {
  done: false,
  notesDone: false,
  moduleDone: false,
  ncertDone: false,
  revisions: 0,
};

export default function Syllabus() {
  const [chapters, setChapters] = useLocalStorage<ClassMap>(
    "jee_chapters",
    buildInitialChapterData(),
  );

  // Migration: fill in any missing school11/school12 subjects or chapters
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only migration
  useEffect(() => {
    const schoolDefaults: Record<string, Record<string, string[]>> = {
      school11: SCHOOL_CLASS_11_CHAPTERS,
      school12: SCHOOL_CLASS_12_CHAPTERS,
    };

    let needsUpdate = false;
    const merged = { ...chapters };

    for (const [classKey, subjectChapters] of Object.entries(schoolDefaults)) {
      const existingClass = merged[classKey] ?? {};
      const newClass = { ...existingClass };

      for (const [subject, chapterList] of Object.entries(subjectChapters)) {
        const existingSubject = newClass[subject] ?? {};
        const newSubject = { ...existingSubject };

        for (const ch of chapterList) {
          if (!newSubject[ch]) {
            newSubject[ch] = { ...DEFAULT_CHAPTER_DATA };
            needsUpdate = true;
          }
        }

        newClass[subject] = newSubject;
      }

      merged[classKey] = newClass;
    }

    if (needsUpdate) {
      setChapters(merged);
    }
  }, []);

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

  const getSummary = (classKey: string, isSchool = false) => {
    let total = 0;
    let done = 0;
    for (const sub of Object.values(chapters[classKey] || {})) {
      for (const ch of Object.values(sub)) {
        total++;
        const safeData = { ...ch, ncertDone: ch.ncertDone ?? false };
        const fullyDone = isSchool
          ? safeData.done && safeData.notesDone && safeData.ncertDone
          : safeData.done && safeData.notesDone && safeData.moduleDone;
        if (fullyDone) done++;
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
            JEE Class 11{" "}
            <span className="ml-1 text-xs opacity-60">
              ({getSummary("class11").done}/{getSummary("class11").total})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="class12"
            data-ocid="syllabus.class12.tab"
            className="data-[state=active]:text-primary"
          >
            JEE Class 12{" "}
            <span className="ml-1 text-xs opacity-60">
              ({getSummary("class12").done}/{getSummary("class12").total})
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="school"
            data-ocid="syllabus.school.tab"
            className="data-[state=active]:text-primary"
          >
            🏫 School Level
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
                      mode={sub === "Chemistry" ? "jeeChemistry" : "jee"}
                      sections={
                        sub === "Chemistry"
                          ? cls === "class11"
                            ? CHEMISTRY_SECTIONS_11
                            : CHEMISTRY_SECTIONS_12
                          : undefined
                      }
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="school">
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm text-muted-foreground"
            style={{
              background: "rgba(251,146,60,0.06)",
              border: "1px solid rgba(251,146,60,0.15)",
            }}
          >
            📚 School NCERT level tracking — Chapter Done, Notes Done, NCERT
            Completed, Revisions (no Module)
          </div>

          <Tabs defaultValue="school11">
            <TabsList
              className="mb-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <TabsTrigger
                value="school11"
                data-ocid="syllabus.school11.tab"
                className="data-[state=active]:text-primary"
              >
                Class 11{" "}
                <span className="ml-1 text-xs opacity-60">
                  ({getSummary("school11", true).done}/
                  {getSummary("school11", true).total})
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="school12"
                data-ocid="syllabus.school12.tab"
                className="data-[state=active]:text-primary"
              >
                Class 12{" "}
                <span className="ml-1 text-xs opacity-60">
                  ({getSummary("school12", true).done}/
                  {getSummary("school12", true).total})
                </span>
              </TabsTrigger>
            </TabsList>

            {(["school11", "school12"] as const).map((cls) => (
              <TabsContent key={cls} value={cls}>
                <div className="grid md:grid-cols-1 gap-4">
                  {SCHOOL_SUBJECTS.map((sub) => (
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
                          mode="school"
                          sections={
                            sub === "Chemistry"
                              ? cls === "school11"
                                ? SCHOOL_CHEMISTRY_SECTIONS_11
                                : SCHOOL_CHEMISTRY_SECTIONS_12
                              : undefined
                          }
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
