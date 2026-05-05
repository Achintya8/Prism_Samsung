"use client"

import { useEffect, useState } from "react";
import { RefreshCcw, Save, Settings } from "lucide-react";
import { GithubIcon } from "./icons/GithubIcon";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileData = {
  name: string
  email: string
  avatarUrl: string
  githubUsername: string
  leetcodeUsername: string
  totalPoints: number
  currentStreak: number
  longestStreak: number
  rank: number
  githubContributions: number
  githubPublicRepos: number
  githubFollowers: number
  leetcodeSolved: number
  leetcodeEasySolved: number
  leetcodeMediumSolved: number
  leetcodeHardSolved: number
  gymSessions: number
  joggingDistance: number
  lastPlatformSyncAt: string | null
}

const emptyProfile: ProfileData = {
  name: '',
  email: '',
  avatarUrl: '',
  githubUsername: '',
  leetcodeUsername: '',
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  rank: 0,
  githubContributions: 0,
  githubPublicRepos: 0,
  githubFollowers: 0,
  leetcodeSolved: 0,
  leetcodeEasySolved: 0,
  leetcodeMediumSolved: 0,
  leetcodeHardSolved: 0,
  gymSessions: 0,
  joggingDistance: 0,
  lastPlatformSyncAt: null,
}

function initials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'ME'
}

export function Profile() {
  const [profile, setProfile] = useState<ProfileData>(emptyProfile)
  const [form, setForm] = useState({ name: '', githubUsername: '', leetcodeUsername: '' })
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [keys, setKeys] = useState({ openaiKey: '', anthropicKey: '', geminiKey: '', githubPat: '', leetcodePat: '' })
  const [hasKeys, setHasKeys] = useState({ hasOpenAI: false, hasAnthropic: false, hasGemini: false, hasGithubPat: false, hasLeetKey: false })
  const [keysSaving, setKeysSaving] = useState(false)
  const [keysStatus, setKeysStatus] = useState('')
  const [initialLoading, setInitialLoading] = useState(true)

  async function loadProfile() {
    setInitialLoading(true)
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const json = await response.json()
        if (json?.ok && json.profile) {
          setProfile(json.profile)
          setForm({
            name: json.profile.name || '',
            githubUsername: json.profile.githubUsername || '',
            leetcodeUsername: json.profile.leetcodeUsername || '',
          })
        }
      }
      const keysRes = await fetch('/api/profile/keys', { cache: 'no-store' })
      if (keysRes.ok) {
        const kjson = await keysRes.json()
        if (kjson?.ok) {
          setHasKeys({ hasOpenAI: kjson.hasOpenAI, hasAnthropic: kjson.hasAnthropic, hasGemini: kjson.hasGemini, hasGithubPat: kjson.hasGithubPat, hasLeetKey: kjson.hasLeetKey })
        }
      }
    } finally {
      setInitialLoading(false)
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadProfile()
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  async function saveProfile(options: { silent?: boolean } = {}) {
    setSaving(true)
    if (!options.silent) setStatus('')
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await response.json()
      if (!response.ok || !json?.ok) throw new Error(json?.error || 'Could not save profile')
      setProfile(json.profile)
      if (!options.silent) setStatus('Profile saved')
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save profile'
      setStatus(message)
      return false
    } finally {
      setSaving(false)
    }
  }

  async function syncPlatforms() {
    setSyncing(true)
    setStatus('')
    try {
      const saved = await saveProfile({ silent: true })
      if (!saved) return
      const response = await fetch('/api/platform/sync', { method: 'POST' })
      const json = await response.json()
      if (!response.ok || !json?.ok) throw new Error(json?.error || json?.errors?.join(', ') || 'Could not sync platforms')
      await loadProfile()
      const details = Array.isArray(json.results) ? json.results.map((result: { message: string }) => result.message).join(' | ') : 'Synced latest public data'
      setStatus(json.pointsAwarded > 0 ? `${details}. Awarded ${json.pointsAwarded} points.` : details)
      window.dispatchEvent(new Event('activity:logged'))
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not sync platforms')
    } finally {
      setSyncing(false)
    }
  }

  async function saveKeys() {
    setKeysSaving(true)
    setKeysStatus('')
    try {
      const payload: any = {}
      if (keys.openaiKey !== '') payload.openaiKey = keys.openaiKey
      if (keys.anthropicKey !== '') payload.anthropicKey = keys.anthropicKey
      if (keys.geminiKey !== '') payload.geminiKey = keys.geminiKey
      if (keys.githubPat !== '') payload.githubPat = keys.githubPat
      if (keys.leetcodePat !== '') payload.leetcodePat = keys.leetcodePat
      
      if (Object.keys(payload).length === 0) {
        setKeysStatus('Enter a key to save')
        setKeysSaving(false)
        return
      }

      const response = await fetch('/api/profile/keys', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await response.json()
      if (!response.ok || !json?.ok) throw new Error(json?.error || 'Could not save keys')
      
      setHasKeys({ hasOpenAI: json.hasOpenAI, hasAnthropic: json.hasAnthropic, hasGemini: json.hasGemini, hasGithubPat: json.hasGithubPat, hasLeetKey: json.hasLeetKey })
      setKeys({ openaiKey: '', anthropicKey: '', geminiKey: '', githubPat: '', leetcodePat: '' })
      setKeysStatus('Keys saved successfully')
    } catch (error) {
      setKeysStatus(error instanceof Error ? error.message : 'Could not save keys')
    } finally {
      setKeysSaving(false)
    }
  if (initialLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6 space-y-6">
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <Skeleton className="w-20 h-20 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-24 rounded-lg shrink-0" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Skeleton className="h-[88px] w-full rounded-lg" />
            <Skeleton className="h-[88px] w-full rounded-lg" />
            <Skeleton className="h-[88px] w-full rounded-lg" />
            <Skeleton className="h-[88px] w-full rounded-lg" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-[88px] w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-full mt-6 rounded-lg" />
        </div>
        <div className="bg-card rounded-xl p-6 border border-border mt-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full max-w-xl mb-6" />
          <div className="grid sm:grid-cols-3 gap-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
          <Skeleton className="h-6 w-48 mt-6 mb-3" />
          <Skeleton className="h-4 w-full max-w-xl mb-4" />
          <Skeleton className="h-16 w-full max-w-md mt-4 rounded-lg" />
          <Skeleton className="h-16 w-full max-w-md mt-4 rounded-lg" />
          <Skeleton className="h-10 w-full mt-6 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-6">
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-semibold text-white overflow-hidden">
            {profile.avatarUrl ? (
              <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.avatarUrl})` }} />
            ) : initials(profile.name)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-foreground">{profile.name || 'Your Profile'}</h1>
            <p className="text-muted-foreground">{profile.email || 'Signed-in student'}</p>
            {profile.lastPlatformSyncAt && (
              <p className="text-xs text-muted-foreground mt-1">Last synced {new Date(profile.lastPlatformSyncAt).toLocaleString()}</p>
            )}
          </div>
          <button
            id="tour-profile-sync"
            onClick={syncPlatforms}
            disabled={syncing || saving}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            <RefreshCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Points</p>
            <p className="text-xl font-semibold text-foreground">{profile.totalPoints}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Rank</p>
            <p className="text-xl font-semibold text-foreground">#{profile.rank || 1}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">GitHub Repos</p>
            <p className="text-xl font-semibold text-foreground">{profile.githubPublicRepos}</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">LeetCode</p>
            <p className="text-xl font-semibold text-foreground">{profile.leetcodeSolved}</p>
          </div>
        </div>

        <div id="tour-profile-usernames" className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-muted-foreground">Display name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">GitHub username</span>
            <div className="mt-1 flex items-center gap-2 px-3 py-2 border border-border bg-background rounded-lg">
              <GithubIcon className="w-4 h-4 text-muted-foreground" />
              <input
                value={form.githubUsername}
                onChange={(event) => setForm((prev) => ({ ...prev, githubUsername: event.target.value }))}
                className="w-full outline-none bg-transparent text-foreground"
                placeholder="octocat"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">LeetCode username</span>
            <input
              value={form.leetcodeUsername}
              onChange={(event) => setForm((prev) => ({ ...prev, leetcodeUsername: event.target.value }))}
              className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="leetcode_handle"
            />
          </label>
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Followers</p>
              <p className="font-semibold text-foreground">{profile.githubFollowers}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Easy</p>
              <p className="font-semibold text-foreground">{profile.leetcodeEasySolved}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Medium</p>
              <p className="font-semibold text-foreground">{profile.leetcodeMediumSolved}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Hard</p>
              <p className="font-semibold text-foreground">{profile.leetcodeHardSolved}</p>
            </div>
          </div>
        </div>

        {status && <p className="mt-4 text-sm text-muted-foreground">{status}</p>}

        <button
          onClick={() => saveProfile()}
          disabled={saving}
          className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted disabled:opacity-60"
        >
          {saving ? <Settings className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Profile
        </button>
      </div>

      <div id="tour-api-keys" className="bg-card rounded-xl p-6 border border-border mt-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">AI Provider Keys</h2>
        <p className="text-sm text-muted-foreground mb-6">Securely store your API keys to power the ClawMind study agent. Keys are encrypted in the database.</p>
        
        <div className="grid sm:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-sm text-muted-foreground">OpenAI Key {hasKeys.hasOpenAI && <span className="text-green-500 font-medium">(Saved)</span>}</span>
            <input
              type="password"
              value={keys.openaiKey}
              onChange={(event) => setKeys((prev) => ({ ...prev, openaiKey: event.target.value }))}
              className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={hasKeys.hasOpenAI ? "********" : "sk-..."}
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">Anthropic Key {hasKeys.hasAnthropic && <span className="text-green-500 font-medium">(Saved)</span>}</span>
            <input
              type="password"
              value={keys.anthropicKey}
              onChange={(event) => setKeys((prev) => ({ ...prev, anthropicKey: event.target.value }))}
              className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={hasKeys.hasAnthropic ? "********" : "sk-ant-..."}
            />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">Gemini Key {hasKeys.hasGemini && <span className="text-green-500 font-medium">(Saved)</span>}</span>
            <input
              type="password"
              value={keys.geminiKey}
              onChange={(event) => setKeys((prev) => ({ ...prev, geminiKey: event.target.value }))}
              className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={hasKeys.hasGemini ? "********" : "AIza..."}
            />
          </label>
        </div>

        <div id="tour-pats">
          <h3 className="text-lg font-semibold text-foreground mt-6 mb-3">GitHub Integration</h3>
          <p className="text-sm text-muted-foreground mb-4">Add a GitHub Personal Access Token (PAT) to fetch your full year of contribution history for accurate streaks.</p>
          <label className="block max-w-md">
            <span className="text-sm text-muted-foreground">GitHub PAT {hasKeys.hasGithubPat && <span className="text-green-500 font-medium">(Saved)</span>}</span>
            <input
              type="password"
              value={keys.githubPat}
              onChange={(event) => setKeys((prev) => ({ ...prev, githubPat: event.target.value }))}
              className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={hasKeys.hasGithubPat ? "********" : "ghp_..."}
            />
          </label>

          <label className="block max-w-md mt-4">
            <span className="text-sm text-muted-foreground">LeetCode Session Token {hasKeys.hasLeetKey && <span className="text-green-500 font-medium">(Saved)</span>}</span>
            <input
              type="password"
              value={keys.leetcodePat}
              onChange={(event) => setKeys((prev) => ({ ...prev, leetcodePat: event.target.value }))}
              className="mt-1 w-full px-3 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={hasKeys.hasLeetKey ? "********" : "session_..."}
            />
          </label>
        </div>

        {keysStatus && <p className={`mt-4 text-sm ${keysStatus.includes('successfully') ? 'text-green-600' : 'text-muted-foreground'}`}>{keysStatus}</p>}

        <button
          onClick={saveKeys}
          disabled={keysSaving}
          className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-500/20 disabled:opacity-60"
        >
          {keysSaving ? <Settings className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Update Keys
        </button>
      </div>
    </div>
  );
}
