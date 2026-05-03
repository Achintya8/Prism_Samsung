"use client";

import { useState } from "react";
import {
  Plus,
  BookOpen,
  BrainCircuit,
  Pencil,
  ChevronRight,
  ArrowLeft,
  FileText,
} from "lucide-react";
import { subjects } from "./data/mockData";
import type { Subject, Note } from "@/types";

export function AIStudy() {
  const [view, setView] = useState<"subjects" | "notes" | "noteDetail" | "quiz" | "whiteboard">(
    "subjects",
  );
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setView("notes");
  };

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setView("noteDetail");
  };

  const handleBack = () => {
    if (view === "noteDetail") {
      setView("notes");
      setSelectedNote(null);
    } else if (view === "notes") {
      setView("subjects");
      setSelectedSubject(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          {view !== "subjects" && (
            <button onClick={handleBack} className="p-2 hover:bg-muted rounded-lg">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
          <h1 className="text-2xl font-semibold text-foreground">ClawMind</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {view === "subjects" && "Organize your study materials by subject"}
          {view === "notes" &&
            selectedSubject &&
            `${selectedSubject.name} - ${selectedSubject.notesCount} notes`}
          {view === "noteDetail" && selectedNote && selectedNote.title}
        </p>
      </div>

      {/* Subjects View */}
      {view === "subjects" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-foreground">Your Subjects</h2>
            <button
              onClick={() => setShowNewSubject(!showNewSubject)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Subject
            </button>
          </div>

          {showNewSubject && (
            <div className="bg-card rounded-xl border border-border p-4">
              <input
                type="text"
                placeholder="Subject name (e.g., Machine Learning)"
                className="w-full px-4 py-2 border border-input bg-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              />
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create
                </button>
                <button
                  onClick={() => setShowNewSubject(false)}
                  className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => handleSubjectClick(subject)}
                className="bg-card rounded-xl p-4 border border-border hover:border-blue-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 ${subject.color} rounded-lg flex items-center justify-center`}
                  >
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">{subject.notesCount} notes</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes View */}
      {view === "notes" && selectedSubject && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-foreground">Notes</h2>
            <button
              onClick={() => setShowNewNote(!showNewNote)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>

          {showNewNote && (
            <div className="bg-card rounded-xl border border-border p-4">
              <input
                type="text"
                placeholder="Note title"
                className="w-full px-4 py-2 border border-input bg-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              />
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Create
                </button>
                <button
                  onClick={() => setShowNewNote(false)}
                  className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {selectedSubject.notes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className="bg-card rounded-xl p-4 border border-border hover:border-blue-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{note.title}</p>
                    <p className="text-sm text-muted-foreground">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">Created {note.createdDate}</p>
                  </div>
                  {note.hasQuiz && (
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">
                      Has Quiz
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => setView("quiz")}
              className="p-4 bg-card border border-border rounded-xl hover:border-purple-500 transition-colors"
            >
              <BrainCircuit className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-foreground">Practice Quiz</p>
              <p className="text-sm text-muted-foreground">Test your knowledge</p>
            </button>
            <button
              onClick={() => setView("whiteboard")}
              className="p-4 bg-card border border-border rounded-xl hover:border-blue-500 transition-colors"
            >
              <Pencil className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium text-foreground">Whiteboard</p>
              <p className="text-sm text-muted-foreground">Draw diagrams</p>
            </button>
          </div>
        </div>
      )}

      {/* Note Detail View */}
      {view === "noteDetail" && selectedNote && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">{selectedNote.title}</h2>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h3 className="text-base font-semibold text-foreground mt-4 mb-2">Key Concepts</h3>
              <ul className="text-muted-foreground space-y-1">
                <li>
                  Binary Trees: hierarchical data structure with nodes having at most two children
                </li>
                <li>Tree Traversal: In-order, Pre-order, Post-order, Level-order</li>
                <li>
                  Binary Search Trees (BST): left subtree contains smaller values, right contains
                  larger
                </li>
                <li>Time Complexity: Search O(log n) average, O(n) worst case</li>
              </ul>

              <h3 className="text-base font-semibold text-foreground mt-4 mb-2">
                Important Formulas
              </h3>
              <ul className="text-muted-foreground space-y-1">
                <li>Maximum nodes at level L: 2^L</li>
                <li>Maximum nodes in tree of height H: 2^(H+1) - 1</li>
                <li>Height of complete binary tree: log₂(n+1) - 1</li>
              </ul>

              <h3 className="text-base font-semibold text-foreground mt-4 mb-2">Summary</h3>
              <p className="text-muted-foreground">
                Binary trees are fundamental data structures used for efficient searching, sorting,
                and hierarchical data representation. Understanding tree traversal algorithms is
                crucial for problem-solving.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex gap-3">
              <button
                onClick={() => setView("quiz")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Take Quiz
              </button>
              <button className="px-4 py-2 border border-input text-foreground rounded-lg hover:bg-muted">
                Edit Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz View */}
      {view === "quiz" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-foreground">Practice Quiz</h2>
              <span className="text-sm text-muted-foreground">Question 1 of 5</span>
            </div>

            <div className="mb-6">
              <p className="text-foreground mb-4">
                What is the time complexity of searching in a balanced Binary Search Tree?
              </p>
              <div className="space-y-2">
                {["O(1)", "O(log n)", "O(n)", "O(n log n)"].map((option, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left p-3 border-2 border-border rounded-lg hover:border-blue-500 transition-colors"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 px-4 py-2 border border-input text-foreground rounded-lg hover:bg-muted"
              >
                Back to Notes
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Next Question
              </button>
            </div>
          </div>

          <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Earn 30 points by completing this quiz with 80% or higher score!
            </p>
          </div>
        </div>
      )}

      {/* Whiteboard View */}
      {view === "whiteboard" && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-3 border-b border-border flex items-center gap-2">
              <button onClick={handleBack} className="p-2 hover:bg-muted rounded">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded">
                <Pencil className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {["#000000", "#EF4444", "#3B82F6", "#10B981", "#F59E0B"].map((color) => (
                  <button
                    key={color}
                    className="w-6 h-6 rounded border-2 border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex-1" />
              <button className="px-3 py-1 text-sm border border-input rounded hover:bg-muted">
                Clear
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Save
              </button>
            </div>
            <div className="bg-white" style={{ height: "400px" }}>
              <canvas className="w-full h-full cursor-crosshair" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Draw diagrams, flowcharts, and visualize concepts
          </p>
        </div>
      )}
    </div>
  );
}
