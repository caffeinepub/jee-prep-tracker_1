export interface ChapterData {
  done: boolean;
  notesDone: boolean;
  moduleDone: boolean;
  ncertDone: boolean;
  revisions: number;
  questionsSolved: number;
}

export type SubjectChapters = Record<string, ChapterData>;
export type SubjectMap = Record<string, SubjectChapters>;
export type ClassMap = Record<string, SubjectMap>;

export interface ScheduleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  subject: string;
  topic: string;
  duration: number; // minutes
}

export interface TimerSession {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  duration: number; // seconds
  startTime: string; // HH:MM
}

export type WeeklyTargets = Record<string, number>; // subject -> hours
