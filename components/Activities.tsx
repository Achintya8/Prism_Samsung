"use client";

import { useState } from "react";
import { Plus, Code2, X } from "lucide-react";
import { GithubIcon } from "./icons/GithubIcon";
import { recentActivities, extracurricularCategories } from "./data/mockData";
import { ActivityCard } from "./ActivityCard";

export function Activities() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState(extracurricularCategories);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customActivity, setCustomActivity] = useState("");
  const [isOther, setIsOther] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If "Other" was selected and custom activity was entered, add it to the list
    if (isOther && customActivity.trim()) {
      setCategories([...categories, customActivity.trim()]);
    }

    // Reset form
    setSelectedCategory("");
    setCustomActivity("");
    setIsOther(false);
    setShowAddForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Activities</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your daily progress</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          <span className="hidden sm:inline">{showAddForm ? "Cancel" : "Add Activity"}</span>
        </button>
      </div>

      {/* Add Activity Form */}
      {showAddForm && (
        <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Log Extracurricular Activity</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Activity
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsOther(false);
                    }}
                    className={`p-3 rounded-lg border-2 text-sm transition-colors ${
                      selectedCategory === category && !isOther
                        ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-500"
                        : "border-input hover:border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setIsOther(true);
                    setSelectedCategory("");
                  }}
                  className={`p-3 rounded-lg border-2 text-sm transition-colors ${
                    isOther
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-500"
                      : "border-input hover:border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Other
                </button>
              </div>
            </div>

            {isOther && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Activity Name
                </label>
                <input
                  type="text"
                  value={customActivity}
                  onChange={(e) => setCustomActivity(e.target.value)}
                  placeholder="e.g., Badminton, Dance, etc."
                  className="w-full px-4 py-2 border border-input bg-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedCategory && !customActivity.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors"
            >
              Log Activity
            </button>
          </form>
        </div>
      )}

      {/* Connected Platforms */}
      <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Connected Platforms</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <GithubIcon className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">GitHub</p>
                <p className="text-sm text-muted-foreground">Auto-sync contributions</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              Connected
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Code2 className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">LeetCode</p>
                <p className="text-sm text-muted-foreground">Auto-sync solved problems</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
              Connected
            </span>
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-card text-card-foreground rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Activity History</h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  );
}
