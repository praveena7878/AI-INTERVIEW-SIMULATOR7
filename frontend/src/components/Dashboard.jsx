import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Play, Calendar, Trophy, BarChart2, Star, Sparkles, HelpCircle, Loader2 } from 'lucide-react'
import { safeFetch } from '../api'

function Dashboard({ user, onStartInterview, onViewReport }) {
  const [history, setHistory] = useState([])
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [startDiff, setStartDiff] = useState('EASY')

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const histRes = await safeFetch(`/api/user/${user.id}/history`)
        if (histRes.ok) {
          const histData = await histRes.json()
          setHistory(histData)
        }

        const trendRes = await safeFetch(`/api/user/${user.id}/trends`)
        if (trendRes.ok) {
          const trendData = await trendRes.json()
          setTrends(trendData)
        }
      } catch (error) {
        console.warn('Dashboard data fetch using offline fallback:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [user.id])

  const getLatestScore = () => {
    const completed = history.filter(h => h.status === 'COMPLETED')
    if (completed.length === 0) return 0
    return completed[0].overall_score
  }

  const getHighestScore = () => {
    const scores = history.filter(h => h.status === 'COMPLETED').map(h => h.overall_score)
    if (scores.length === 0) return 0
    return Math.max(...scores)
  }

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'EASY': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'HARD': return 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      default: return 'text-zinc-400 bg-zinc-500/10'
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-zinc-400 text-sm">Loading dashboard stats...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Welcome Banner */}
      <div className="glass-card p-6 border-zinc-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl -z-10"></div>
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Ready to interview, {user.name}? <Sparkles className="w-5 h-5 text-indigo-400" />
            <button 
              onClick={() => {
                if ('speechSynthesis' in window) {
                  window.speechSynthesis.cancel()
                  const u = new SpeechSynthesisUtterance(`Welcome back ${user.name}! Choose your starting difficulty level and click Start Session when you are ready.`)
                  const voices = window.speechSynthesis.getVoices()
                  const ev = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('David'))) || voices.find(v => v.lang.startsWith('en'))
                  if (ev) u.voice = ev
                  window.speechSynthesis.speak(u)
                }
              }}
              className="text-xs font-semibold bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors ml-2"
              title="Hear Welcome Greeting"
            >
              🔊 Welcome Voice
            </button>
          </h2>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            Launch a simulation session. The AI will adaptively query you based on: 
            <span className="text-zinc-300 font-medium ml-1">{user.skills.slice(0, 4).join(', ')}{user.skills.length > 4 && ' and more...'}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900/60 p-3 border border-zinc-800 rounded-xl shrink-0">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Starting Difficulty</span>
            <div className="flex gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              {['EASY', 'MEDIUM', 'HARD'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setStartDiff(diff)}
                  className={`text-[10px] font-bold px-3 py-1 rounded transition-colors ${
                    startDiff === diff ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => onStartInterview(startDiff)} className="btn-primary">
            <Play className="w-4 h-4 fill-white" />
            Start Session
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-5 border-zinc-800/60 flex items-center gap-4">
          <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20 text-indigo-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{history.length}</div>
            <div className="text-xs text-zinc-500">Total Interviews Conducted</div>
          </div>
        </div>

        <div className="glass-card p-5 border-zinc-800/60 flex items-center gap-4">
          <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20 text-cyan-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{getHighestScore() > 0 ? `${getHighestScore()}%` : 'N/A'}</div>
            <div className="text-xs text-zinc-500">Highest Score Achieved</div>
          </div>
        </div>

        <div className="glass-card p-5 border-zinc-800/60 flex items-center gap-4">
          <div className="bg-violet-500/10 p-3 rounded-lg border border-violet-500/20 text-violet-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">{getLatestScore() > 0 ? `${getLatestScore()}%` : 'N/A'}</div>
            <div className="text-xs text-zinc-500">Latest Session Score</div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Trend chart */}
        <div className="glass-card p-6 border-zinc-800/60 flex flex-col gap-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Performance Progression <Star className="w-4 h-4 text-zinc-500" />
          </h3>
          
          <div className="h-72 w-full">
            {trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" />
                  <XAxis dataKey="attempt" stroke="#71717a" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#71717a" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold', color: 'white' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="overall" name="Overall" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="technical" name="Technical" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="communication" name="Communication" stroke="#06b6d4" strokeWidth={2} />
                  <Line type="monotone" dataKey="behavioral" name="Behavioral" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-zinc-800 rounded-xl bg-zinc-900/10">
                <p className="text-zinc-500 text-sm">No historical trend data available. Complete an interview to see trends.</p>
              </div>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="glass-card p-6 border-zinc-800/60 flex flex-col gap-4">
          <h3 className="text-lg font-bold">Session History</h3>
          <div className="flex flex-col gap-3 max-h-[288px] overflow-y-auto pr-1">
            {history.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between p-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 rounded-xl transition-all"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      Attempt #{interview.id}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getDifficultyColor(interview.difficulty)}`}>
                      {interview.difficulty}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    {new Date(interview.date).toLocaleDateString()} at {new Date(interview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {interview.status === 'COMPLETED' ? `${interview.overall_score}%` : 'In Progress'}
                    </div>
                    <div className="text-[10px] text-zinc-500">Score</div>
                  </div>
                  <button
                    onClick={() => {
                      if (interview.status === 'COMPLETED') {
                        onViewReport(interview.id)
                      } else {
                        // Resume the interview
                        onStartInterview(interview.difficulty) // Fallback behavior, start new
                      }
                    }}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 hover:text-white px-2.5 py-1.5 rounded-md font-semibold text-zinc-300 transition-colors"
                  >
                    {interview.status === 'COMPLETED' ? 'View' : 'Resume'}
                  </button>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No session attempts yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
