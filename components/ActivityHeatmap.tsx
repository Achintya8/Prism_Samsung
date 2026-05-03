import { heatmapData } from "./data/mockData";

export function ActivityHeatmap() {
  const getColor = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count <= 2) return "bg-emerald-500/35 dark:bg-emerald-400/30";
    if (count <= 4) return "bg-emerald-500/55 dark:bg-emerald-500/45";
    if (count <= 6) return "bg-emerald-600 dark:bg-emerald-500";
    return "bg-emerald-700 dark:bg-emerald-600";
  };

  // Group data by weeks
  const weeks: (typeof heatmapData)[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  // Get month labels
  const getMonthLabel = (weekIndex: number) => {
    const date = new Date(weeks[weekIndex][0].date);
    return date.toLocaleDateString("en-US", { month: "short" });
  };

  const monthLabels: { month: string; position: number }[] = [];
  let currentMonth = "";
  weeks.forEach((week, index) => {
    const month = getMonthLabel(index);
    if (month !== currentMonth) {
      monthLabels.push({ month, position: index });
      currentMonth = month;
    }
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm ring-1 ring-foreground/10 mb-6 overflow-x-auto">
      <h2 className="text-lg font-semibold text-foreground mb-4">Activity Heatmap</h2>

      <div className="min-w-max">
        {/* Month labels */}
        <div className="flex gap-[2px] mb-2 ml-8">
          {monthLabels.map(({ month, position }) => (
            <div
              key={position}
              style={{ marginLeft: position * 12 }}
              className="text-xs text-muted-foreground"
            >
              {month}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-[2px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[2px] mr-2">
            <div className="h-[10px]"></div>
            <div className="h-[10px] text-xs text-muted-foreground flex items-center">Mon</div>
            <div className="h-[10px]"></div>
            <div className="h-[10px] text-xs text-muted-foreground flex items-center">Wed</div>
            <div className="h-[10px]"></div>
            <div className="h-[10px] text-xs text-muted-foreground flex items-center">Fri</div>
            <div className="h-[10px]"></div>
          </div>

          {/* Weeks */}
          {weeks.slice(-52).map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[2px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-[10px] h-[10px] rounded-sm ${getColor(day.count)} hover:ring-2 hover:ring-ring cursor-pointer transition-all`}
                  title={`${day.date}: ${day.count} activities`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-500/35 dark:bg-emerald-400/30"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-500/55 dark:bg-emerald-500/45"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500"></div>
            <div className="w-3 h-3 rounded-sm bg-emerald-700 dark:bg-emerald-600"></div>
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
