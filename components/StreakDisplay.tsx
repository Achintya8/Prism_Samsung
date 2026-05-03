import { Flame, Calendar } from "lucide-react";
import { currentUserStats } from "./data/mockData";

export function StreakDisplay() {
  const today = new Date("2026-04-30");
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  // Mock data - in real app, this would come from backend
  const completedDays = [true, true, true, false, true, true, true];

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm ring-1 ring-foreground/10 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500 dark:text-orange-400" />
          <h2 className="text-lg font-semibold text-foreground">Current Streak</h2>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {currentUserStats.currentStreak}
          </p>
          <p className="text-sm text-muted-foreground">days</p>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        {last7Days.map((date, index) => {
          const isToday = date.toDateString() === today.toDateString();
          const isCompleted = completedDays[index];

          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full aspect-square rounded-lg flex items-center justify-center mb-1 transition-all ${
                  isCompleted
                    ? "bg-orange-500 text-white dark:bg-orange-600"
                    : "bg-muted text-muted-foreground"
                } ${isToday ? "ring-2 ring-orange-400 ring-offset-2 ring-offset-background" : ""}`}
              >
                {isCompleted ? <Flame className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              </div>
              <span className="text-xs text-muted-foreground">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-orange-500/10 dark:bg-orange-500/15">
        <p className="text-sm text-orange-900 dark:text-orange-100 text-center">
          Keep it up! You're {currentUserStats.longestStreak - currentUserStats.currentStreak} days
          away from your best streak!
        </p>
      </div>
    </div>
  );
}
