"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, BookOpen, BrainCircuit, Pencil, ChevronRight, ArrowLeft, FileText, Trash2, Eraser } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
// import { NavBar } from "../navbar/navbar";
import {QuizQuestion, Note, Subject, Whiteboard} from "@/types"
// ClawMind's study workspace keeps subjects, notes, quizzes, and whiteboards in one guided flow.
// type QuizQuestion = {
//   question: string
//   options: string[]
//   correctAnswer: string
//   explanation: string
// }

// type Note = {
//   id: string
//   subjectId: string
//   title: string
//   content: string
//   createdDate: string
//   hasQuiz: boolean
//   quiz?: QuizQuestion[]
// }

// type Subject = {
//   id: string
//   name: string
//   color: string
//   notesCount: number
//   notes?: Note[]
// }

// type Whiteboard = {
//   _id?: string
//   title?: string
//   image: string
//   createdDate?: string
// }

export function AIStudy() {
  const [view, setView] = useState<'subjects' | 'notes' | 'noteDetail' | 'quiz' | 'whiteboard'>('subjects');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [provider, setProvider] = useState<'openai' | 'claude' | 'gemini'>('openai');
  const [activeQuiz, setActiveQuiz] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
  const [pendingWhiteboard, setPendingWhiteboard] = useState<string | null>(null);
  const skipLoadRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const QUIZ_COUNT = 8;

  // The whiteboard canvas needs to resize with the view so drawings land in the right place.
  useEffect(() => {
    if (view === 'whiteboard' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = 500;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = 3;
        }
      }
    }
  }, [view]);

  // If a saved whiteboard is waiting, draw it back into the canvas once the whiteboard view is ready.
  useEffect(() => {
    if (view !== 'whiteboard' || !pendingWhiteboard) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
      setPendingWhiteboard(null);
    };
    img.src = pendingWhiteboard;
  }, [pendingWhiteboard, view]);

  // Drawing starts when the user presses down on the canvas and ends when they lift off.
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && pos) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  // Extend the current stroke only while the pointer remains active.
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && pos) {
      ctx.strokeStyle = brushColor;
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  // StopDrawing closes the active stroke so the next line starts cleanly.
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Pointer coordinates are normalized against the canvas bounding box so mouse and touch behave the same.
  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Clearing the canvas gives the user a quick way to restart a diagram from scratch.
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Export the canvas as an image, scaling it down if needed so saved whiteboards stay lightweight.
  const getWhiteboardImage = (canvas: HTMLCanvasElement) => {
    const maxWidth = 900;
    const maxHeight = 500;
    const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height, 1);

    let outputCanvas = canvas;
    if (scale < 1) {
      const scaled = document.createElement('canvas');
      scaled.width = Math.round(canvas.width * scale);
      scaled.height = Math.round(canvas.height * scale);
      const scaledCtx = scaled.getContext('2d');
      if (scaledCtx) {
        scaledCtx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
        outputCanvas = scaled;
      }
    }

    let image = outputCanvas.toDataURL('image/webp', 0.7);
    if (!image || image === 'data:,') {
      image = outputCanvas.toDataURL('image/png');
    }
    return image;
  };

  // Subjects are the top-level study folders that everything else hangs off.
  async function loadSubjects() {
    const response = await fetch('/api/ai/directories');
    if (!response.ok) return;
    const json = await response.json();
    if (json?.ok && Array.isArray(json.subjects || json.directories)) {
      setSubjects(json.subjects || json.directories);
    }
  }

  // Loading notes also refreshes the subject in state so the note count stays truthful.
  async function loadNotes(subject: Subject) {
    const response = await fetch(`/api/ai/notes?subjectId=${subject.id}`);
    if (!response.ok) return;
    const json = await response.json();
    if (json?.ok && Array.isArray(json.notes)) {
      const nextSubject = { ...subject, notes: json.notes, notesCount: json.notes.length };
      setSelectedSubject(nextSubject);
      setSubjects((current) => current.map((item) => item.id === nextSubject.id ? nextSubject : item));
      await loadWhiteboards(subject.id);
    }
  }

  useEffect(() => {
    void loadSubjects();
  }, []);

  // Clicking a subject drills into its notes instead of jumping straight into the note editor.
  const handleSubjectClick = async (subject: Subject) => {
    setSelectedSubject(subject);
    setView('notes');
    await loadNotes(subject);
  };

  // Opening a note switches to the markdown preview so the generated content is easy to read.
  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setView("noteDetail");
  };

  // The back button behaves like a breadcrumb, unwinding the current view one level at a time.
  const handleBack = () => {
    if (view === 'quiz' && quizLoading) return;
    if (view === 'quiz') {
      setActiveQuiz([]);
      setView(selectedNote ? 'noteDetail' : 'notes');
    } else if (view === 'whiteboard') {
      setView('notes');
    } else if (view === 'noteDetail') {
      setView('notes');
      setSelectedNote(null);
    } else if (view === "notes") {
      setView("subjects");
      setSelectedSubject(null);
    }
  };

  // Create subject only when the name is non-empty so the directory list stays tidy.
  async function createSubject() {
    if (!subjectName.trim()) return;
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch('/api/ai/directories', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: subjectName.trim() }),
      });
      const json = await response.json();
      if (!response.ok || !json?.ok) throw new Error(json?.error || 'Could not create subject');
      setSubjectName('');
      setShowNewSubject(false);
      await loadSubjects();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not create subject');
    } finally {
      setLoading(false);
    }
  }

  // Notes are generated from either pasted text or a prompt, depending on what the user typed.
  async function createNote() {
    if (!selectedSubject || !noteTitle.trim()) return;
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch('/api/ai/notes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubject.id, title: noteTitle.trim(), text: noteText.trim() || noteTitle.trim(), provider }),
      });
      const json = await response.json();
      if (!response.ok || !json?.ok) throw new Error(json?.error || 'Could not create note');
      setNoteTitle('');
      setNoteText('');
      setShowNewNote(false);
      await loadNotes(selectedSubject);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not create note');
    } finally {
      setLoading(false);
    }
  }

  // Quizzes can be created from a single note or from the subject as a whole.
  async function generateQuiz() {
    if (!selectedNote) return;
    if (selectedNote.hasQuiz && selectedNote.quiz && selectedNote.quiz.length > 0) {
      setActiveQuiz(selectedNote.quiz);
      setView('quiz');
      return;
    }
    setLoading(true);
    setQuizLoading(true);
    setActiveQuiz([]);
    setView('quiz');
    setStatus('');
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ noteId: selectedNote.id, provider, count: QUIZ_COUNT }),
      });
      const json = await response.json();
      if (!response.ok || !json?.ok) throw new Error(json?.error || 'Could not create quiz');
      const nextNote = { ...selectedNote, hasQuiz: true, quiz: json.quiz.questions };
      setSelectedNote(nextNote);
      setActiveQuiz(json.quiz.questions);
      if (selectedSubject) await loadNotes(selectedSubject);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not create quiz');
    } finally {
      setLoading(false);
      setQuizLoading(false);
    }
  }

  // Practice quizzes reuse the current subject content to create fresh recall questions.
  async function generatePracticeQuiz() {
    if (!selectedSubject) return;
    const currentNotes = selectedSubject.notes ?? [];
    if (currentNotes.length === 0) {
      setStatus('Add a note first to generate a practice quiz.');
      return;
    }
    setLoading(true);
    setQuizLoading(true);
    setActiveQuiz([]);
    setView('quiz');
    setStatus('');
    try {
      const response = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubject.id, provider, count: QUIZ_COUNT }),
      });
      const json = await response.json();
      if (!response.ok || !json?.ok) throw new Error(json?.error || 'Could not create quiz');
      setSelectedNote(null);
      setActiveQuiz(json.quiz.questions);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not create quiz');
    } finally {
      setLoading(false);
      setQuizLoading(false);
    }
  }

  // Removing a note also clears it from the current selection so the view does not point at deleted data.
  async function deleteNote(note: Note) {
    if (!selectedSubject) return;
    setLoading(true);
    setStatus('');
    try {
      const response = await fetch('/api/ai/notes', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubject.id, noteId: note.id }),
      });
      const json = await response.json();
      if (!response.ok || !json?.ok) throw new Error(json?.error || 'Could not delete note');
      setSelectedNote(null);
      await loadNotes(selectedSubject);
      setView('notes');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not delete note');
    } finally {
      setLoading(false);
    }
  }

  // Whiteboards are saved as images because the drawing experience is intentionally freeform.
  async function saveWhiteboard() {
    if (!selectedSubject) {
      setStatus('Select a subject before saving a whiteboard.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);
    setStatus('');
    try {
      const image = getWhiteboardImage(canvas);
      const response = await fetch('/api/ai/whiteboards', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subjectId: selectedSubject.id, image }),
      });
      const json = await response.json();
      if (!response.ok || !json?.ok) throw new Error(json?.error || 'Could not save whiteboard');
      if (Array.isArray(json.whiteboards)) {
        setWhiteboards(json.whiteboards);
        skipLoadRef.current = true;
      } else if (json?.whiteboard) {
        setWhiteboards((current) => [json.whiteboard, ...current]);
        skipLoadRef.current = true;
      }
      setStatus('Whiteboard saved.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not save whiteboard');
    } finally {
      setLoading(false);
    }
  }

  // Whiteboards are loaded separately because they are attached to the current subject, not the current note.
  async function loadWhiteboards(subjectId: string) {
    const response = await fetch(`/api/ai/whiteboards?subjectId=${subjectId}`, { cache: 'no-store' });
    const json = await response.json();
    if (json?.ok && Array.isArray(json.whiteboards)) {
      setWhiteboards(json.whiteboards);
    } else {
        console.error('Failed to load whiteboards:', json?.error);
    }
  }

  // Deleting a whiteboard uses the subject id and board id so the server can remove the exact record.
  async function deleteWhiteboard(whiteboardId: string, createdDate?: string) {
    console.log('Attempting to delete whiteboard with ID:', whiteboardId);
    if (!selectedSubject) {
      console.error('No selected subject');
      return;
    }
    try {
      setLoading(true);
      const url = `/api/ai/whiteboards?subjectId=${selectedSubject.id}&whiteboardId=${whiteboardId}${createdDate ? `&createdDate=${encodeURIComponent(createdDate)}` : ''}`;
      console.log('Delete URL:', url);
      const response = await fetch(url, {
        method: 'DELETE',
        cache: 'no-store'
      });
      const json = await response.json();
      if (json.ok && Array.isArray(json.whiteboards)) {
        setWhiteboards(json.whiteboards);
        setStatus('Whiteboard deleted.');
      } else {
        alert('Delete failed: ' + (json.error || 'Unknown error'));
        throw new Error(json.error || 'Could not delete whiteboard');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Error deleting whiteboard');
    } finally {
      setLoading(false);
    }
  }

  // Opening a saved board switches the view into the drawing canvas with the image already loaded.
  function openWhiteboard(board: Whiteboard) {
    if (!board?.image) return;
    setPendingWhiteboard(board.image);
    setView('whiteboard');
  }

  const notes = selectedSubject?.notes ?? [];
  const quizQuestions = activeQuiz;

  useEffect(() => {
    // Refresh boards whenever the user lands back on notes or whiteboard for the active subject.
    if (selectedSubject?.id && (view === 'notes' || view === 'whiteboard')) {
      if (skipLoadRef.current) {
        skipLoadRef.current = false;
        return;
      }
      void loadWhiteboards(selectedSubject.id);
    }
  }, [view, selectedSubject?.id]);

  return (
    <div className={view === 'whiteboard' ? 'w-full h-screen flex flex-col p-2 sm:p-4' : 'max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6'}>
      {view === 'whiteboard' && (
        <>
          {/* In whiteboard mode the back button is the main way to leave the canvas without losing context. */}
          <button
            onClick={handleBack}
            className="p-2 hover:bg-muted rounded-lg w-fit"
          >
            <ArrowLeft className="w-5 h-5 text-foreground/70" />
          </button>
          <div className="flex-1 flex items-start justify-center pt-4">
            <div className="w-full max-w-2xl sm:max-w-4xl lg:max-w-6xl h-5/6 rounded-lg border border-border overflow-hidden shadow-lg">
              <Tldraw />
            </div>
          </div>
        </>
      )}
      
      {/* The non-whiteboard views share the same header and navigation structure. */}
      {view !== 'whiteboard' && (
        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              {view !== 'subjects' && (
                <button
                  onClick={handleBack}
                  disabled={view === 'quiz' && quizLoading}
                  className="p-2 hover:bg-muted rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-5 h-5 text-foreground/70" />
                </button>
              )}
              <h1 className="text-2xl font-semibold text-foreground">ClawMind</h1>
              {/* The model picker lets the user choose which AI provider generates the study content. */}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">AI Model:</span>
                <select 
                  value={provider} 
                  onChange={e => setProvider(e.target.value as any)}
                  className="text-sm border border-border rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-foreground"
                >
                  <option value="openai">OpenAI</option>
                  <option value="claude">Claude</option>
                  <option value="gemini">Gemini</option>
                </select>
              </div>
            </div>
        <p className="text-sm text-muted-foreground">
          {view === 'subjects' && 'Organize your study materials by subject'}
          {view === 'notes' && selectedSubject && `${selectedSubject.name} - ${selectedSubject.notesCount} notes`}
          {view === 'noteDetail' && selectedNote && selectedNote.title}
          {view === 'quiz' && 'Practice quiz'}
        </p>
        {status && (
          <p className={`text-sm mt-2 ${status.includes('saved') || status.includes('created') ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        )}
      </div>

      {/* Subjects are the top-level entry point into the study workspace. */}
      {view === 'subjects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 id="tour-study-subjects" className="font-semibold text-foreground">Your Subjects</h2>
            <button id="tour-study-new-subject" onClick={() => setShowNewSubject(!showNewSubject)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              New Subject
            </button>
          </div>

          {/* New subject creation stays inline so the user does not leave the current flow. */}
          {showNewSubject && (
            <div className="bg-card rounded-xl border border-border p-4">
              <input value={subjectName} onChange={(event) => setSubjectName(event.target.value)} type="text" placeholder="Subject name" className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3" />
              <div className="flex gap-2">
                <button onClick={createSubject} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">Create</button>
                <button onClick={() => setShowNewSubject(false)} className="px-4 py-2 border border-border text-foreground/80 rounded-lg hover:bg-muted">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {subjects.map((subject) => (
              <div 
                key={subject.id} 
                onClick={() => handleSubjectClick(subject)} 
                className="bg-card rounded-2xl p-4 sm:p-5 border border-border hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${subject.color} rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}>
                    <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate">{subject.name}</p>
                    <p className="text-sm text-muted-foreground">{subject.notesCount} notes</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
            {subjects.length === 0 && <div className="sm:col-span-2 lg:col-span-3 bg-card rounded-2xl p-8 border border-dashed border-border text-center text-muted-foreground">Create your first subject to start using ClawMind.</div>}
          </div>
        </div>
      )}

      {/* Notes show the generated study material for the selected subject. */}
      {view === 'notes' && selectedSubject && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-foreground">Notes</h2>
            <button onClick={() => setShowNewNote(!showNewNote)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>

          {/* Note creation lives inline because the source text is usually already in the user's head or clipboard. */}
          {showNewNote && (
            <div className="bg-card rounded-xl border border-border p-4">
              <input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} type="text" placeholder="Note title" className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3" />
              <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Paste text, syllabus points, or a topic for ClawMind to turn into notes" className="w-full min-h-28 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3" />
              <div className="flex gap-2">
                <button onClick={createNote} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">Generate</button>
                <button onClick={() => setShowNewNote(false)} className="px-4 py-2 border border-border text-foreground/80 rounded-lg hover:bg-muted">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                onClick={() => handleNoteClick(note)} 
                className="bg-card rounded-2xl p-5 border border-border hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-blue-100/60 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  {note.hasQuiz && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-100/60 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-purple-200 dark:border-purple-800">
                      <BrainCircuit className="w-3 h-3" />
                      Quiz Ready
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-foreground text-lg mb-2 line-clamp-1">{note.title}</h3>
                
                <div className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                  {note.content.replace(/[#*`]/g, '').slice(0, 150)}...
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <span className="text-xs text-muted-foreground font-medium">{note.createdDate || 'Recently added'}</span>
                  <div className="flex items-center text-blue-600 text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
                    View Full Note
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="sm:col-span-2 bg-muted/50 rounded-2xl p-12 border-2 border-dashed border-border text-center">
                <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">No notes yet. Start by generating one!</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button onClick={generatePracticeQuiz} className="p-4 bg-card border border-border rounded-xl hover:border-purple-300 transition-colors text-left">
              <BrainCircuit className="w-6 h-6 text-purple-600 mb-2" />
              <p className="font-medium text-foreground">Practice Quiz</p>
              <p className="text-sm text-muted-foreground">Quiz across all notes</p>
            </button>
            <button onClick={() => setView('whiteboard')} className="p-4 bg-card border border-border rounded-xl hover:border-blue-300 transition-colors text-left">
              <Pencil className="w-6 h-6 text-blue-600 mb-2" />
              <p className="font-medium text-foreground">Whiteboard</p>
              <p className="text-sm text-muted-foreground">Draw diagrams</p>
            </button>
          </div>
        </div>
      )}

      {/* The note detail view turns the generated markdown into a readable article-like page. */}
      {view === 'noteDetail' && selectedNote && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">{selectedNote.title}</h2>
              <div className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground">Created: {selectedNote.createdDate}</div>
                <button
                  onClick={() => deleteNote(selectedNote)}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
            
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedNote.content}
              </ReactMarkdown>
            </div>
            <div className="mt-6 pt-4 border-t border-border flex gap-3">
              <button onClick={generateQuiz} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
                {selectedNote.hasQuiz ? 'Open Quiz' : 'Generate Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz mode is focused on recall, so the UI strips away everything except questions and answers. */}
      {view === 'quiz' && (
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="font-semibold text-foreground mb-4">Practice Quiz</h2>
            {quizLoading && (
              <div className="py-10 text-center text-muted-foreground">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-muted-foreground" />
                Generating your quiz...
              </div>
            )}
            <div className="space-y-5">
              {quizQuestions.map((question, index) => (
                <div key={`${index}-${question.question}`} className="border border-border rounded-lg p-4">
                  <p className="font-medium text-foreground mb-3">{index + 1}. {question.question}</p>
                  <div className="grid gap-2">
                    {question.options.map((option) => (
                      <div key={option} className={`p-3 border rounded-lg ${option === question.correctAnswer ? 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-700' : 'border-border'}`}>{option}</div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{question.explanation}</p>
                </div>
              ))}
              {!quizLoading && quizQuestions.length === 0 && (
                <p className="text-muted-foreground">Generate a quiz from a note or use Practice Quiz.</p>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}
