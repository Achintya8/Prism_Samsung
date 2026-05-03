import { Code2, Dumbbell, Footprints, BookOpen, Briefcase } from "lucide-react";
import { GithubIcon } from "./icons/GithubIcon";
import type { Activity } from "@/types";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const getIcon = () => {
    switch (activity.type) {
      case "github":
        return <GithubIcon className="w-5 h-5 text-muted-foreground" />;
      case "leetcode":
        return <Code2 className="w-5 h-5 text-muted-foreground" />;
      case "gym":
        return <Dumbbell className="w-5 h-5 text-muted-foreground" />;
      case "jogging":
        return <Footprints className="w-5 h-5 text-muted-foreground" />;
      case "study":
        return <BookOpen className="w-5 h-5 text-muted-foreground" />;
      case "project":
        return <Briefcase className="w-5 h-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getColor = () => {
    switch (activity.type) {
      case "github":
        return "bg-purple-500/15 dark:bg-purple-500/25";
      case "leetcode":
        return "bg-yellow-500/15 dark:bg-yellow-500/25";
      case "gym":
        return "bg-red-500/15 dark:bg-red-500/25";
      case "jogging":
        return "bg-green-500/15 dark:bg-green-500/25";
      case "study":
        return "bg-blue-500/15 dark:bg-blue-500/25";
      case "project":
        return "bg-indigo-500/15 dark:bg-indigo-500/25";
      default:
        return "bg-muted";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date("2026-04-30");
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/80 transition-colors">
      <div className={`p-2 rounded-lg ${getColor()}`}>{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{activity.title}</p>
        {activity.details && (
          <p className="text-sm text-muted-foreground truncate">{activity.details}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-primary">+{activity.points}</p>
        <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
      </div>
    </div>
  );
}
