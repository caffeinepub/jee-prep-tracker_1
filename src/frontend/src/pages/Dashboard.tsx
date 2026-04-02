import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Layers,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { SUBJECTS, buildInitialChapterData } from "../data/syllabusData";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { ClassMap } from "../types";

type Page = "dashboard" | "syllabus" | "timer" | "dailytracker" | "missionjeet";

interface Props {
  onNavigate: (p: Page) => void;
}

const STAT_ACCENTS = [
  "card-accent-green",
  "card-accent-cyan",
  "card-accent-purple",
  "card-accent-orange",
] as const;

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

const MOTIVATIONAL_QUOTES = [
  // Rocky / Movie Quotes
  { quote: "There is no tomorrow!", author: "Rocky Balboa (Rocky III)" },
  {
    quote:
      "It ain't about how hard you hit. It's about how hard you can get hit and keep moving forward.",
    author: "Rocky Balboa (Rocky Balboa)",
  },
  {
    quote:
      "Every second you spend in doubt is a second where someone else is outworking you.",
    author: "Rocky Balboa (Rocky IV)",
  },
  {
    quote:
      "Going in one more round when you don't think you can — that's what makes all the difference in your life.",
    author: "Rocky Balboa",
  },
  {
    quote:
      "You, me, or nobody is gonna hit as hard as life. But it ain't about how hard you hit. It's about how hard you can get hit and keep moving forward.",
    author: "Rocky Balboa",
  },
  {
    quote: "I must break you.",
    author: "Ivan Drago (Rocky IV) — become unbreakable first",
  },
  {
    quote:
      "To win the fight, you need to want it more than the other guy. Want it more.",
    author: "Mickey Goldmill (Rocky)",
  },
  {
    quote: "What are we waiting for? Get up, because Mickey loves ya.",
    author: "Mickey Goldmill (Rocky)",
  },
  // Elon Musk
  {
    quote:
      "When something is important enough, you do it even if the odds are not in your favour.",
    author: "Elon Musk",
  },
  {
    quote:
      "I don't ever give up. It's not possible. No — it's not possible. It's necessary.",
    author: "Elon Musk",
  },
  {
    quote:
      "The first step is to establish that something is possible; then probability will occur.",
    author: "Elon Musk",
  },
  {
    quote:
      "Failure is an option here. If things are not failing, you are not innovating enough.",
    author: "Elon Musk",
  },
  {
    quote:
      "Work like hell. I mean you just have to put in 80 to 100 hour weeks every week.",
    author: "Elon Musk",
  },
  {
    quote:
      "If you get up in the morning and think the future is going to be better, it is a bright day. Otherwise, it's not.",
    author: "Elon Musk",
  },
  {
    quote:
      "Persistence is very important. You should not give up unless you are forced to give up.",
    author: "Elon Musk",
  },
  {
    quote:
      "You shouldn't do things differently just because they're different. They need to be better.",
    author: "Elon Musk",
  },
  // Interstellar / Sci-Fi
  {
    quote:
      "Do not go gentle into that good night. Rage, rage against the dying of the light.",
    author: "Dr. Brand (Interstellar)",
  },
  {
    quote:
      "We used to look up at the sky and wonder at our place in the stars. Now we just look down and worry about our place in the dirt.",
    author: "Cooper (Interstellar)",
  },
  {
    quote: "Mankind was born on Earth. It was never meant to die here.",
    author: "Cooper (Interstellar)",
  },
  // The Dark Knight / Batman
  {
    quote: "Why do we fall? So we can learn to pick ourselves up.",
    author: "Alfred Pennyworth (Batman Begins)",
  },
  {
    quote: "It's not who I am underneath, but what I do that defines me.",
    author: "Bruce Wayne (Batman Begins)",
  },
  {
    quote:
      "You either die a hero, or you live long enough to see yourself become the villain. Don't become the villain of your own story.",
    author: "Harvey Dent (The Dark Knight)",
  },
  {
    quote:
      "Endure, Master Wayne. Take it. They'll hate you for it, but that's the point of Batman.",
    author: "Alfred Pennyworth (The Dark Knight)",
  },
  // Pursuit of Happyness
  {
    quote:
      "Don't ever let somebody tell you, you can't do something. Not even me.",
    author: "Chris Gardner (The Pursuit of Happyness)",
  },
  {
    quote: "You got a dream, you gotta protect it.",
    author: "Chris Gardner (The Pursuit of Happyness)",
  },
  {
    quote: "This part of my life, this little part, is called happiness.",
    author: "Chris Gardner (The Pursuit of Happyness)",
  },
  // Good Will Hunting
  {
    quote:
      "You're sitting on a winning lottery ticket and you're too scared to cash it in.",
    author: "Sean Maguire (Good Will Hunting)",
  },
  {
    quote:
      "Most days I wish I never met you. But some days... some days I think it's the only good thing that happened to me.",
    author: "Good Will Hunting — because one good reason is enough",
  },
  // Gladiator
  {
    quote: "What we do in life echoes in eternity.",
    author: "Maximus (Gladiator)",
  },
  {
    quote: "Strength and honour.",
    author: "Maximus (Gladiator) — say it every morning",
  },
  // 3 Idiots / Indian
  {
    quote: "Chase excellence and success will follow, pants down.",
    author: "Rancho (3 Idiots)",
  },
  {
    quote: "All is well.",
    author: "Rancho (3 Idiots) — say it when the pressure hits",
  },
  // Wolf of Wall Street
  {
    quote:
      "The only thing standing between you and your goal is the story you keep telling yourself.",
    author: "Jordan Belfort (Wolf of Wall Street)",
  },
  {
    quote: "I'm not gonna die sober!",
    author: "Jordan Belfort — replace sober with 'without trying'",
  },
  // Remember the Titans
  {
    quote: "Attitude reflects leadership. You lead your own life.",
    author: "Herman Boone (Remember the Titans)",
  },
  {
    quote: "Left side, strong side.",
    author: "Remember the Titans — your mind is your strong side",
  },
  // Whiplash
  {
    quote:
      "There are no two words in the English language more harmful than 'good job'.",
    author: "Terence Fletcher (Whiplash)",
  },
  {
    quote: "I will push you beyond what you ever thought was possible.",
    author: "Terence Fletcher (Whiplash) — push yourself",
  },
  {
    quote: "The next Charlie Parker will be discouraged. Not if I can help it.",
    author: "Terence Fletcher (Whiplash)",
  },
  // Kobe Bryant
  {
    quote:
      "I have nothing in common with lazy people who blame others for their lack of success. Great things come from hard work and perseverance. No excuses.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "The most important thing is to try and inspire people so that they can be great in whatever they want to do.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "Once you know what failure feels like, determination chases success.",
    author: "Kobe Bryant",
  },
  {
    quote: "I can't relate to lazy people. We don't speak the same language.",
    author: "Kobe Bryant",
  },
  {
    quote:
      "Those times when you get up early and you work hard — those times when you stay up late and you work hard — that stuff matters.",
    author: "Kobe Bryant",
  },
  // Cristiano Ronaldo
  {
    quote: "Talent without working hard is nothing.",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "I am not a perfectionist, but I like to feel that things are done well. More important than that, I feel an endless need to learn.",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "Your love for what you do and willingness to push yourself where others aren't willing to go is what will make you great.",
    author: "Cristiano Ronaldo",
  },
  {
    quote:
      "Dreams are not what you see in sleep. Dreams are things which don't let you sleep.",
    author: "Cristiano Ronaldo",
  },
  // Muhammad Ali
  {
    quote:
      "I hated every minute of training, but I said, don't quit. Suffer now and live the rest of your life as a champion.",
    author: "Muhammad Ali",
  },
  {
    quote: "I am the greatest. I said that even before I knew I was.",
    author: "Muhammad Ali",
  },
  {
    quote:
      "Float like a butterfly, sting like a bee — your hands can't hit what your eyes can't see.",
    author: "Muhammad Ali",
  },
  {
    quote: "The will must be stronger than the skill.",
    author: "Muhammad Ali",
  },
  {
    quote: "Impossible is just a big word thrown around by small men.",
    author: "Muhammad Ali",
  },
  // Michael Jordan
  {
    quote:
      "I've missed more than 9,000 shots in my career. I've lost almost 300 games. I've failed over and over and over again in my life. And that is why I succeed.",
    author: "Michael Jordan",
  },
  {
    quote:
      "Some people want it to happen, some wish it would happen, others make it happen.",
    author: "Michael Jordan",
  },
  {
    quote:
      "If you do the work you get rewarded. There are no shortcuts in life.",
    author: "Michael Jordan",
  },
  {
    quote: "Always turn a negative situation into a positive situation.",
    author: "Michael Jordan",
  },
  // Virat Kohli
  {
    quote: "Self-belief and hard work will always earn you success.",
    author: "Virat Kohli",
  },
  {
    quote:
      "If you want to be the best, you have to do things that other people aren't willing to do.",
    author: "Virat Kohli",
  },
  {
    quote:
      "I don't think about what might go wrong. I only think about what I need to do.",
    author: "Virat Kohli",
  },
  // Arnold Schwarzenegger
  {
    quote:
      "The mind is the limit. As long as the mind can envision the fact that you can do something, you can do it.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote:
      "For every day that you don't work out, someone else is getting stronger.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote: "Everybody pities the weak; jealousy you have to earn.",
    author: "Arnold Schwarzenegger",
  },
  {
    quote: "You can have results or excuses. Not both.",
    author: "Arnold Schwarzenegger",
  },
  // Steve Jobs
  {
    quote:
      "The people who are crazy enough to think they can change the world are the ones who do.",
    author: "Steve Jobs",
  },
  {
    quote: "Your time is limited. Don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
  { quote: "Stay hungry. Stay foolish.", author: "Steve Jobs" },
  {
    quote:
      "Have the courage to follow your heart and intuition. They somehow already know what you truly want to become.",
    author: "Steve Jobs",
  },
  // APJ Abdul Kalam
  {
    quote:
      "Dream is not that which you see while sleeping — it is something that does not let you sleep.",
    author: "APJ Abdul Kalam",
  },
  {
    quote:
      "All of us do not have equal talent, but all of us have an equal opportunity to develop our talents.",
    author: "APJ Abdul Kalam",
  },
  {
    quote:
      "To succeed in life and achieve results, you must understand and master three mighty forces — desire, belief, and expectation.",
    author: "APJ Abdul Kalam",
  },
  {
    quote: "Excellence is a continuous process and not an accident.",
    author: "APJ Abdul Kalam",
  },
  // Avengers / MCU
  {
    quote: "Part of the journey is the end.",
    author: "Tony Stark (Avengers: Endgame) — finish what you started",
  },
  {
    quote: "I am Iron Man.",
    author: "Tony Stark — own your identity, own your goal",
  },
  { quote: "Whatever it takes.", author: "Avengers: Endgame — your mantra" },
  {
    quote: "I can do this all day.",
    author: "Steve Rogers (Captain America) — every single day",
  },
  {
    quote: "The hardest choices require the strongest wills.",
    author: "Thanos (Avengers: Infinity War) — out-will the challenge",
  },
  // Forrest Gump
  {
    quote:
      "Life is like a box of chocolates — you never know what you're gonna get. But you keep going.",
    author: "Forrest Gump",
  },
  {
    quote: "Stupid is as stupid does — and quitting is the stupidest move.",
    author: "Forrest Gump",
  },
  // The Social Network
  {
    quote:
      "A million dollars isn't cool. You know what's cool? A billion dollars.",
    author: "Sean Parker (The Social Network) — think bigger",
  },
  {
    quote:
      "We lived on farms, then we lived in cities, and now we're going to live on the internet.",
    author: "The Social Network — be ahead of your time",
  },
  // Matrix
  {
    quote: "There is no spoon.",
    author: "The Matrix — the limits you see aren't real",
  },
  {
    quote:
      "I'm trying to free your mind, Neo. But I can only show you the door. You're the one that has to walk through it.",
    author: "Morpheus (The Matrix)",
  },
  {
    quote: "Stop trying to hit me and hit me!",
    author: "Morpheus (The Matrix) — stop hesitating, execute",
  },
  // Misc Legends
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    quote: "In the middle of every difficulty lies opportunity.",
    author: "Albert Einstein",
  },
  {
    quote: "A smooth sea never made a skilled sailor.",
    author: "Franklin D. Roosevelt",
  },
  {
    quote:
      "Success is stumbling from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
  },
  { quote: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  {
    quote: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky",
  },
  {
    quote: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
  },
  {
    quote:
      "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
  {
    quote: "Opportunities don't happen. You create them.",
    author: "Chris Grosser",
  },
  {
    quote: "I find that the harder I work, the more luck I seem to have.",
    author: "Thomas Jefferson",
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    quote: "Energy and persistence conquer all things.",
    author: "Benjamin Franklin",
  },
  {
    quote: "Act as if what you do makes a difference. It does.",
    author: "William James",
  },
  {
    quote:
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    quote:
      "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
  },
  {
    quote: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
  },
];

function getWeekStart(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

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

function CompactQuoteCard() {
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  const { quote, author } =
    MOTIVATIONAL_QUOTES[(dayOfYear + offset) % MOTIVATIONAL_QUOTES.length];

  return (
    <>
      <div
        className="max-w-xs rounded-xl px-3 py-2.5 shrink-0"
        style={{
          border: "1px solid rgba(251,191,36,0.4)",
          boxShadow:
            "0 0 24px rgba(251,191,36,0.45), 0 0 8px rgba(251,191,36,0.3), 0 2px 8px rgba(0,0,0,0.5)",
          background:
            "linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(40,30,5,0.92) 100%)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-1">
          <div className="flex-1 min-w-0">
            <p
              className="text-xs leading-snug line-clamp-3"
              style={{ color: "rgba(255,245,210,0.88)" }}
            >
              <Zap
                className="inline w-3 h-3 mr-1 shrink-0"
                style={{
                  color: "#fbbf24",
                  filter: "drop-shadow(0 0 3px rgba(251,191,36,0.5))",
                  verticalAlign: "middle",
                }}
              />
              {quote}
            </p>
            <p
              className="text-xs mt-1 font-semibold tracking-wide"
              style={{
                background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              — {author}
            </p>
          </div>
          <button
            type="button"
            data-ocid="quote.button"
            onClick={() => setOffset((prev) => prev + 1)}
            className="shrink-0 p-0.5 rounded hover:opacity-80 transition-opacity"
            style={{
              color: "#fbbf24",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
            title="Next quote"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export default function Dashboard({ onNavigate }: Props) {
  const [chapters] = useLocalStorage<ClassMap>(
    "jee_chapters",
    buildInitialChapterData(),
  );
  const [dailyLog] = useLocalStorage<Record<string, number>>(
    "jee_daily_log",
    {},
  );
  const [weeklyTarget] = useLocalStorage<number>("jee_weekly_target", 40);

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

  // Weekly study stats
  const studyStats = useMemo(() => {
    const allDates = Object.keys(dailyLog).sort();
    const totalStudied = allDates.reduce(
      (sum, d) => sum + (dailyLog[d] || 0),
      0,
    );
    const daysTracked = allDates.length;
    const todayHours = dailyLog[today] || 0;

    // This week
    const weekStart = getWeekStart(today);
    const weekDays = getWeekDays(weekStart);
    const thisWeekHours = weekDays.reduce(
      (sum, d) => sum + (dailyLog[d] || 0),
      0,
    );
    const weekProgressPct = Math.min((thisWeekHours / weeklyTarget) * 100, 100);

    return {
      totalStudied,
      daysTracked,
      todayHours,
      thisWeekHours,
      weekProgressPct,
    };
  }, [dailyLog, weeklyTarget, today]);

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
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold gradient-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Track your JEE preparation progress
          </p>
        </div>
        <CompactQuoteCard />
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

      {/* Middle section: Subject Targets + Study Journey */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Subject-wise Chapter Progress */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <Target className="w-4 h-4 text-primary" />
              <span>Subject Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SUBJECTS.map((sub) => {
              const allChapters = [
                ...Object.entries(chapters.class11?.[sub] || {}),
                ...Object.entries(chapters.class12?.[sub] || {}),
              ];
              const total = allChapters.length;
              const done = allChapters.filter(([, v]) => v.done).length;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div key={sub}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {sub}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {done}/{total} chapters done
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
              data-ocid="dashboard.syllabus.link"
              onClick={() => onNavigate("syllabus")}
              className="text-xs text-primary hover:underline mt-1 transition-colors"
            >
              Open Syllabus →
            </button>
          </CardContent>
        </Card>

        {/* Weekly Study Journey */}
        <Card className="glass glass-hover border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-foreground">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Study Journey</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">This Week</span>
                <span className="text-sm font-mono font-medium text-primary">
                  {Math.round(studyStats.thisWeekHours * 10) / 10}h /{" "}
                  {weeklyTarget}h
                </span>
              </div>
              <Progress
                value={studyStats.weekProgressPct}
                className="h-3 bg-muted/50 progress-cyan"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-muted-foreground">
                  {Math.round(studyStats.weekProgressPct)}% of weekly target
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {studyStats.daysTracked} days tracked
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-lg p-3 text-center"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-xl font-mono font-bold text-emerald-400">
                  {studyStats.todayHours > 0
                    ? `${studyStats.todayHours}h`
                    : "—"}
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
                <div className="text-xl font-mono font-bold text-purple-400">
                  {Math.round(studyStats.thisWeekHours * 10) / 10}h
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  This Week
                </div>
              </div>
            </div>

            <button
              type="button"
              data-ocid="dashboard.timer.link"
              onClick={() => onNavigate("timer")}
              className="text-xs text-primary hover:underline transition-colors"
            >
              Log today's hours in Timer →
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress detail */}
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

      {/* Footer clock */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/50">
        <Clock className="w-3 h-3" />
        <span>Last updated: {today}</span>
      </div>
    </div>
  );
}
