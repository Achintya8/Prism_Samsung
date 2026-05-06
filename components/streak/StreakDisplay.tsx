"use client"

import { Calendar as CalendarIcon, Loader2, Dumbbell, Route, Code, SearchCode, BookOpen, Presentation } from "lucide-react";
import { useEffect, useState } from 'react'
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import {ActivityEvent} from "@/types"
// type ActivityEvent = {
//   id: string
//   type: 'github' | 'leetcode' | 'gym' | 'jogging' | 'study' | 'project'
//   title: string
//   date: string
//   points: number
//   details: string
// }

function getActivityIcon(type: string) {
  switch (type) {
    case 'gym': return <Dumbbell className="w-4 h-4" />
    case 'jogging': return <Route className="w-4 h-4" />
    case 'github': return <Code className="w-4 h-4" />
    case 'leetcode': return <SearchCode className="w-4 h-4" />
    case 'study': return <BookOpen className="w-4 h-4" />
    case 'project': return <Presentation className="w-4 h-4" />
    default: return <img src="/fire.png?v=2" alt="Activity" className="w-4 h-4 object-contain" />
  }
}


export function StreakDisplay() {
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set())
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loadingActivities, setLoadingActivities] = useState(false)

  useEffect(() => {
    async function loadStats() {
      try {
        const sres = await fetch('/api/stats')
        if (sres.ok) {
          const json = await sres.json()
          if (json?.ok && json.stats) {
            setCurrentStreak(json.stats.currentStreak ?? 0)
            setLongestStreak(json.stats.longestStreak ?? 0)
          }
        }
      } catch {}

      try {
        const year = new Date().getFullYear()
        const hres = await fetch(`/api/heatmap?year=${year}`)
        if (hres.ok) {
          const j = await hres.json()
          const heatmap = j?.heatmap ?? j?.data
          if (j?.ok && Array.isArray(heatmap)) {
            const activeSet = new Set<string>()
            heatmap.forEach((p: { date: string; count: number }) => {
              if (p.count > 0) activeSet.add(p.date)
            })
            setActiveDates(activeSet)
          }
        }
      } catch {}
    }
    loadStats()
    window.addEventListener('activity:logged', loadStats)
    return () => window.removeEventListener('activity:logged', loadStats)
  }, [])

  useEffect(() => {
    async function loadActivities() {
      setLoadingActivities(true)
      try {
        // Adjust date to match local timezone YYYY-MM-DD
        const offset = selectedDate.getTimezoneOffset()
        const dateString = new Date(selectedDate.getTime() - (offset*60*1000)).toISOString().split('T')[0]
        
        const res = await fetch(`/api/activities?date=${dateString}`)
        if (res.ok) {
          const json = await res.json()
          if (json?.ok && Array.isArray(json.activities)) {
            setActivities(json.activities)
          } else {
            setActivities([])
          }
        } else {
          setActivities([])
        }
      } catch {
        setActivities([])
      } finally {
        setLoadingActivities(false)
      }
    }
    loadActivities()
  }, [selectedDate])

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm ring-1 ring-foreground/10 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src="/fire.png?v=2" alt="Streak" className={`w-6 h-6 object-contain ${currentStreak > 0 ? '' : 'opacity-40 grayscale'}`} />
          <h2 className="text-lg font-semibold text-foreground">Activity Calendar</h2>
        </div>
        <div className="text-right">
          <p className={`text-3xl font-bold ${currentStreak > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>{currentStreak}</p>
          <p className="text-sm text-muted-foreground">day streak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* First Half: Calendar */}
        <div className="flex justify-center lg:border-r border-border lg:pr-8">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="rounded-md mx-auto [--cell-size:2.5rem] sm:[--cell-size:3rem] w-full max-w-sm"
            components={{
              DayButton: (props) => {
                const { day } = props;
                // Get YYYY-MM-DD from day.date accounting for local timezone
                const offset = day.date.getTimezoneOffset()
                const dateStr = new Date(day.date.getTime() - (offset*60*1000)).toISOString().split('T')[0]
                
                const hasActivity = activeDates.has(dateStr);
                
                // Today at midnight for comparing past/future
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const isPastOrToday = day.date <= today;

                return (
                  <div className="relative w-full h-full flex items-center justify-center group/daywrapper">
                    {hasActivity ? (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform group-hover/daywrapper:scale-110">
                        <img 
                          src="/fire.png?v=2" 
                          alt="" 
                          className="w-9 h-9 sm:w-11 sm:h-11 object-contain drop-shadow-md" 
                        />
                      </div>
                    ) : (
                      isPastOrToday ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 absolute bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none" />
                      ) : null
                    )}
                    <CalendarDayButton 
                      {...props} 
                      className={`${props.className} relative z-10 w-full h-full bg-transparent hover:bg-transparent data-[selected-single=true]:bg-transparent data-[selected-single=true]:text-foreground data-[selected-single=true]:ring-2 data-[selected-single=true]:ring-orange-500 ${hasActivity ? '!text-white font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-xs sm:text-sm mt-1' : ''}`} 
                    />
                  </div>
                )
              }
            }}
          />
        </div>

        {/* Second Half: Activities for Date */}
        <div className="flex flex-col h-full min-h-[350px]">
          <h3 className="font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center justify-between">
            <span>
              {selectedDate.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-sm font-normal text-muted-foreground">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </span>
          </h3>

          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {loadingActivities ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-md">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{activity.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{activity.type}</p>
                  </div>
                  <div className="font-semibold text-sm text-orange-600 dark:text-orange-400">
                    +{activity.points}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center text-muted-foreground">
                <CalendarIcon className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No activities logged on this date.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
