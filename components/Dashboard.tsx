import {
  TrendingUp,
  Flame,
  Trophy,
  Code2,
  Dumbbell,
  Footprints,
  BrainCircuit,
  ArrowRight,
} from "lucide-react";
import { GithubIcon } from "./icons/GithubIcon";
import Link from "next/link";
import { currentUserStats, recentActivities } from "./data/mockData";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { StreakDisplay } from "./StreakDisplay";
import { ActivityCard } from "./ActivityCard";

const statSurface =
  "rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm ring-1 ring-foreground/10";

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
      {/* ClawMind Feature Card */}
      <Link href="/study" className="block mb-6">
        <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1">ClawMind</h2>
                <p className="text-indigo-100 text-sm">
                  AI-powered study assistant with Notes, Quizzes and Whiteboard
                </p>
              </div>
            </div>
            <ArrowRight className="w-6 h-6" />
          </div>
        </div>
      </Link>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={statSurface}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Points</p>
              <p className="text-2xl font-semibold text-foreground">{currentUserStats.totalPoints}</p>
            </div>
          </div>
        </div>

        <div className={statSurface}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-orange-500/15 text-orange-600 dark:bg-orange-500/25 dark:text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-2xl font-semibold text-foreground">
                {currentUserStats.currentStreak}
              </p>
            </div>
          </div>
        </div>

        <div className={statSurface}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">College Rank</p>
              <p className="text-2xl font-semibold text-foreground">#{currentUserStats.rank}</p>
            </div>
          </div>
        </div>

        <div className={statSurface}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/15 text-green-600 dark:bg-green-500/25 dark:text-green-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Streak</p>
              <p className="text-2xl font-semibold text-foreground">
                {currentUserStats.longestStreak}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className={statSurface}>
          <div className="flex items-center gap-2 mb-1">
            <GithubIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">GitHub</span>
          </div>
          <p className="text-xl font-semibold text-foreground">
            {currentUserStats.githubContributions}
          </p>
          <p className="text-xs text-muted-foreground">contributions</p>
        </div>

        <div className={statSurface}>
          <div className="flex items-center gap-2 mb-1">
            <Code2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">LeetCode</span>
          </div>
          <p className="text-xl font-semibold text-foreground">{currentUserStats.leetcodeSolved}</p>
          <p className="text-xs text-muted-foreground">problems solved</p>
        </div>

        <div className={statSurface}>
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Gym</span>
          </div>
          <p className="text-xl font-semibold text-foreground">{currentUserStats.gymSessions}</p>
          <p className="text-xs text-muted-foreground">sessions</p>
        </div>

        <div className={statSurface}>
          <div className="flex items-center gap-2 mb-1">
            <Footprints className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Jogging</span>
          </div>
          <p className="text-xl font-semibold text-foreground">
            {currentUserStats.joggingDistance}km
          </p>
          <p className="text-xs text-muted-foreground">distance</p>
        </div>
      </div>

      {/* Streak Display */}
      <StreakDisplay />

      {/* Activity Heatmap */}
      <ActivityHeatmap />

      {/* Recent Activities */}
      <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm ring-1 ring-foreground/10">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activities</h2>
        <div className="space-y-3">
          {recentActivities.slice(0, 5).map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}
