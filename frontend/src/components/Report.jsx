import React, { useState, useEffect } from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { CheckCircle2, AlertTriangle, Lightbulb, ArrowLeft, Loader2, Brain, MessageSquare, Award, ThumbsUp, ChevronDown, ChevronUp } from 'lucide-react'

function Report({ interviewId, apiKey, onBack }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedAnswer, setExpandedAnswer] = useState(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/interview/${interviewId}/report`, {
          headers: {
            'X-Gemini-API-Key': apiKey
          }
        })

        if (response.ok) {
          const data = await response.json()
          setReport(data)
        } else {
          setError('Failed to fetch the performance report.')
        }
      } catch (err) {
        setError('Connection error fetching report details.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [interviewId, apiKey])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-zinc-400 text-sm">Analyzing overall performance & generating report...</p>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="max-w-md mx-auto glass-card p-8 text-center border-zinc-800/80">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Error Generating Report</h3>
        <p className="text-zinc-400 text-sm mb-6">{error || 'Something went wrong.'}</p>
        <button onClick={onBack} className="btn-primary w-full justify-center">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
    )
  }

  // Format data for Recharts Radar Chart
  const radarData = [
    { subject: 'Technical Skills', value: report.technical_score, fullMark: 100 },
    { subject: 'Communication', value: report.communication_score, fullMark: 100 },
    { subject: 'Confidence', value: report.confidence_score, fullMark: 100 },
    { subject: 'Behavioral', value: report.behavioral_score, fullMark: 100 }
  ]

  const toggleExpandAnswer = (id) => {
    if (expandedAnswer === id) {
      setExpandedAnswer(null)
    } else {
      setExpandedAnswer(id)
    }
  }

  return (
    <div className="max-w-5xl w-full mx-auto flex flex-col gap-6 text-left pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold">Interview Performance Report</h2>
          <p className="text-xs text-zinc-500">Attempted on {new Date(report.date).toLocaleDateString()} at {new Date(report.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-900/50 px-5 py-3 border border-zinc-800 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Overall Score</span>
            <span className="text-3xl font-extrabold text-white">{report.overall_score}%</span>
          </div>
          <div className="h-10 w-px bg-zinc-800"></div>
          <div className="text-left">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">PASSED</span>
            <span className="text-[10px] text-zinc-500 block">Rating: Strong Candidate</span>
          </div>
        </div>
      </div>

      {/* Grid: Charts and Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart Card */}
        <div className="glass-card p-6 border-zinc-800/60 flex flex-col gap-4">
          <h3 className="text-md font-bold flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" /> Metric Breakdown
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={11} fontWeight={500} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#3f3f46" tick={false} />
                <Radar name="Performance" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Lists (Strengths & Weaknesses) */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-5 border-zinc-800/60 flex-1">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" /> Core Strengths
            </h3>
            <ul className="flex flex-col gap-2.5 pl-0 m-0 list-none">
              {report.strengths.map((str, idx) => (
                <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>{str}</span>
                </li>
              ))}
              {report.strengths.length === 0 && <li className="text-zinc-500 text-sm">No specific strengths generated.</li>}
            </ul>
          </div>

          <div className="glass-card p-5 border-zinc-800/60 flex-1">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4" /> Growth Areas & Roadmap
            </h3>
            <ul className="flex flex-col gap-2.5 pl-0 m-0 list-none">
              {report.weaknesses.map((weak, idx) => (
                <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2 bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-lg">
                  <span className="text-amber-500 mt-0.5">✗</span>
                  <span>{weak}</span>
                </li>
              ))}
              {report.weaknesses.length === 0 && <li className="text-zinc-500 text-sm">No specific weaknesses generated.</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Suggested Topics Card */}
      <div className="glass-card p-5 border-zinc-800/60">
        <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-3">
          📚 Recommended Study Roadmap
        </h3>
        <div className="flex flex-wrap gap-2">
          {report.recommended_topics.map((topic, idx) => (
            <span key={idx} className="text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {topic}
            </span>
          ))}
          {report.recommended_topics.length === 0 && <p className="text-zinc-500 text-xs">No specific topics suggested.</p>}
        </div>
      </div>

      {/* Question breakdown list */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold flex items-center gap-2 pt-2">
          <MessageSquare className="w-5 h-5 text-zinc-400" /> Detail Question Transcript
        </h3>

        <div className="flex flex-col gap-4">
          {report.answer_evaluations.map((evalItem, idx) => (
            <div 
              key={evalItem.id} 
              className="border border-zinc-800 bg-zinc-900/10 rounded-xl overflow-hidden transition-colors"
            >
              {/* Header Box */}
              <div 
                onClick={() => toggleExpandAnswer(evalItem.id)}
                className="flex items-center justify-between p-4 bg-zinc-900/30 hover:bg-zinc-900/60 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-zinc-950 px-2 py-1 rounded text-zinc-400 border border-zinc-800">
                    Q{idx + 1}
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white truncate max-w-[400px] md:max-w-[550px]">{evalItem.question}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-indigo-500/5 text-indigo-400 font-semibold px-2 py-0.5 rounded border border-indigo-500/10">
                        {evalItem.question_type}
                      </span>
                      {evalItem.target_skill && (
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                          Skill: {evalItem.target_skill}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        evalItem.difficulty_level === 'EASY' ? 'text-emerald-400 border-emerald-500/10' :
                        evalItem.difficulty_level === 'MEDIUM' ? 'text-amber-400 border-amber-500/10' :
                        'text-rose-400 border-rose-500/10'
                      }`}>
                        {evalItem.difficulty_level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-zinc-500 font-medium block uppercase tracking-wider">Score</span>
                    <span className="text-sm font-extrabold text-white">{evalItem.technical_score}%</span>
                  </div>
                  {expandedAnswer === evalItem.id ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                </div>
              </div>

              {/* Expansion Details */}
              {expandedAnswer === evalItem.id && (
                <div className="p-5 border-t border-zinc-800/80 bg-zinc-950/20 text-left flex flex-col gap-4">
                  {/* Q & A */}
                  <div className="flex flex-col gap-2">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Question</span>
                      <p className="text-sm text-zinc-300 mt-1">{evalItem.question}</p>
                    </div>
                    <div className="border-t border-zinc-900 pt-2 mt-1">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Your Answer</span>
                      <p className="text-sm text-zinc-300 italic mt-1 bg-zinc-900/30 p-3 rounded-lg border border-zinc-800/50">
                        {evalItem.answer || "(No response captured)"}
                      </p>
                    </div>
                  </div>

                  {/* Metrics sub-grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-zinc-900 pt-4">
                    {/* Technical Eval */}
                    <div className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-indigo-400" /> Content Eval
                          </span>
                          <span className="text-xs font-extrabold text-white bg-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-400 border border-indigo-500/20">
                            {evalItem.technical_score}%
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-normal">{evalItem.feedback}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-800/40 text-[10px] text-zinc-500">
                        <span>Clarity: {evalItem.clarity}%</span>
                        <span>Confidence: {evalItem.confidence}%</span>
                      </div>
                    </div>

                    {/* Communication Eval */}
                    <div className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Comm Metrics
                          </span>
                          <span className="text-xs font-extrabold text-white bg-cyan-500/10 px-1.5 py-0.5 rounded text-cyan-400 border border-cyan-500/20">
                            {Math.round((evalItem.grammar_score + evalItem.vocabulary_score + evalItem.fluency_score) / 3.0)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-normal">{evalItem.communication_feedback}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-800/40 text-[10px] text-zinc-500">
                        <span>Grammar: {evalItem.grammar_score}%</span>
                        <span>Vocab: {evalItem.vocabulary_score}%</span>
                        <span>Fluency: {evalItem.fluency_score}%</span>
                      </div>
                    </div>

                    {/* Behavioral STAR Eval */}
                    <div className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> Behavioral
                          </span>
                          <span className="text-xs font-extrabold text-white bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-500/20">
                            {evalItem.behavioral_star_score}%
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-normal">{evalItem.behavioral_star_feedback}</p>
                      </div>
                      
                      <div className="text-[10px] text-zinc-500 mt-3 pt-2 border-t border-zinc-800/40">
                        {evalItem.question_type === 'BEHAVIORAL' ? (
                          <span className="text-emerald-400/80 font-medium">STAR Framework Evaluated</span>
                        ) : (
                          <span className="text-zinc-500">N/A (Intro/Tech Type)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Report
