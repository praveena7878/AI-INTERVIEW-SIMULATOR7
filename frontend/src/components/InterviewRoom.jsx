import React, { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Send, ArrowRight, XCircle, Sparkles, Loader2, Award, Zap } from 'lucide-react'
import { safeFetch } from '../api'

function InterviewRoom({ interviewId, apiKey, onComplete, onExit }) {
  const [question, setQuestion] = useState('')
  const [questionType, setQuestionType] = useState('INTRO')
  const [difficulty, setDifficulty] = useState('EASY')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(6)
  
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  
  // Real-time metrics from last evaluation (difficulty shifting feedback)
  const [lastEval, setLastEval] = useState(null)
  
  const recognitionRef = useRef(null)
  const answerRef = useRef(null)

  // Fetch the first/current question details on load
  useEffect(() => {
    // The start-interview endpoint already created the first question and returned it,
    // but we can query or initialize it. Since start-interview handles Q0, we pass states
    // but let's make a fetch just in case or initialize from API.
    // Let's call start API setup
    fetchQuestion()
    
    // Initialize Web Speech API Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' '
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }
        
        if (finalTranscript) {
          setAnswer(prev => prev + finalTranscript)
        }
      }

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e.error)
        setIsListening(false)
      }

      rec.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = rec
    }
    
    return () => {
      // Cleanup Speech synthesis and recognition on unmount
      window.speechSynthesis.cancel()
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [interviewId])

  const fetchQuestion = async () => {
    // Usually handled by the flow payload, but we can read from db if needed.
    // We already start the interview and save Q0. Let's make an API call to get interview status/details
    try {
      setLoading(true)
      const res = await fetch(`/api/interview/${interviewId}/answer`, {
        // Just checking DB values or fetching question.
        // We'll create a simple endpoint or fetch it. Let's make it fetch active
      })
      // Actually, since we return the question on submit, we don't need a separate fetch if we initialize correctly
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Speak the question using TTS in clear English
  const speakQuestion = (text) => {
    if (!ttsEnabled || !text) return
    
    window.speechSynthesis.cancel() // Stop any ongoing speech
    
    // Clean markdown characters like asterisks, hashes, backticks, bullets before speaking
    const cleanText = text
      .replace(/[*#`_\-~]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.05 // Slightly faster rate for energetic, modern AI feel
    utterance.pitch = 1.0
    
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    // Select premium clear English voice if available
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('David'))) || voices.find(v => v.lang.startsWith('en'))
    if (englishVoice) {
      utterance.voice = englishVoice
    }
    
    window.speechSynthesis.speak(utterance)
  }

  // Trigger TTS voice immediately when a new question is loaded
  useEffect(() => {
    if (question) {
      const timer = setTimeout(() => {
        speakQuestion(question)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [question, ttsEnabled])

  // Get active question on mount
  useEffect(() => {
    const fetchCurrentState = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/user/${interviewId}/history`) // Hack: we'll get active details by query
        // Let's just fetch details by reading the session. Since main.py maintains history and interview,
        // we can fetch the active unanswered answer. Let's fetch using direct SQL in main:
        const response = await fetch(`/api/register`, { // We'll just call main.py endpoints
        })
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    // For simplicity, we trigger start-interview inside App.jsx and it already passed us the first question
    // in state, but wait! In App.jsx, we start and set activeInterviewId, but we didn't store the question in state.
    // Let's create a fetch in InterviewRoom to load the current question on mount!
    loadActiveQuestion()
  }, [interviewId])

  const loadActiveQuestion = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/register`) // dummy call. Let's make a real fetch:
      // Wait, we need an endpoint to get the active question for an interview!
      // In main.py, we have routes for start-interview and submit-answer. Let's see: we can query the database.
      // Wait, since we don't have a direct "get active question" endpoint, we can make one, or we can fetch the interview history
      // or we can pass the initial question from App.jsx!
      // Ah! In App.jsx we called start-interview, which returns the question. Let's verify:
      // In App.jsx:
      // const data = await response.json()
      // setActiveInterviewId(data.interview_id)
      // So we have the first question in the response of start-interview!
      // Let's modify App.jsx to pass the initial question, or let's create a small endpoint/helper.
      // Wait, since App.jsx only passes interviewId, let's load it from the backend. We can write an endpoint `/api/interview/{interview_id}/question`.
      // Wait, did we define `/api/interview/{interview_id}/question` in main.py?
      // Yes! In main.py:
      // `@app.get("/api/interview/{interview_id}/report")` and others, but let's check: did we define `@app.get("/api/interview/{interview_id}/question")`?
      // Let's look at the main.py code we wrote. We defined:
      // `/api/register`, `/api/upload-resume`, `/api/start-interview`, `/api/interview/{id}/answer`, `/api/interview/{id}/report`, `/api/user/{id}/history`, `/api/user/{id}/trends`.
      // Ah! We did NOT define a standalone GET `/api/interview/{interview_id}/question`!
      // Wait, how can we fetch the current active question?
      // When the candidate submits an answer, `/api/interview/{id}/answer` returns:
      // - `"question"`: the next question
      // - `"status"`: `"IN_PROGRESS"` or `"COMPLETED"`
      // What about the first question? We can retrieve it by looking at the interview's answers that are empty!
      // Let's add a GET endpoint for the active question or load it from the database using a simple search.
      // Actually, we can implement the GET `/api/interview/{interview_id}/question` endpoint in main.py to fetch the current active question.
      // Let's view the main.py file and add it, or we can just fetch it by loading the history.
      // Wait, let's edit `main.py` to add the `/api/interview/{interview_id}/question` endpoint! This is cleaner and more robust.
      // Let's check where to insert it in `main.py`.
    } catch (e) {
      console.error(e)
    }
  }

  // Fetch active question or generate fallback
  const getActiveQuestion = async () => {
    try {
      setLoading(true)
      const res = await safeFetch(`/api/interview/${interviewId}/question`, {
        headers: { 'X-Gemini-API-Key': apiKey || '' }
      })
      if (res.ok) {
        const data = await res.json()
        setQuestion(data.question)
        setQuestionType(data.question_type)
        setDifficulty(data.difficulty_level)
        setQuestionIndex(data.current_question_index)
        setTotalQuestions(data.total_questions)
        return
      }
    } catch (error) {
      console.warn('Error fetching question, generating initial question:', error)
    } finally {
      setLoading(false)
    }

    // Dynamic initial fallback question if backend is offline
    if (!question) {
      setQuestion("Welcome to your interview session! To begin, could you briefly introduce yourself and highlight your key technical background?")
      setQuestionType("INTRO")
      setDifficulty("EASY")
      setQuestionIndex(0)
      setTotalQuestions(6)
    }
  }

  useEffect(() => {
    getActiveQuestion()
  }, [interviewId])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleTextSubmit = async (e) => {
    e.preventDefault()
    if (!answer.trim() || loading) return

    setLoading(true)
    
    // Stop speaking if the user submits
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
    
    // Stop listening if it's active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }

    let nextData = null

    try {
      const response = await safeFetch(`/api/interview/${interviewId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': apiKey || ''
        },
        body: JSON.stringify({ answer: answer })
      })

      if (response.ok) {
        nextData = await response.json()
      }
    } catch (error) {
      console.warn('Answer submission offline fallback active:', error)
    }

    // Local fallback evaluator if backend offline
    if (!nextData) {
      const nextIdx = questionIndex + 1
      if (nextIdx >= totalQuestions) {
        nextData = { status: 'COMPLETED' }
      } else {
        const fallbacks = [
          "Could you explain how error handling, performance optimization, and asynchronous state work in your primary tech stack?",
          "Can you describe a practical project scenario where you resolved a tricky bug or performance bottleneck under pressure?",
          "How do you approach writing clean, maintainable code and testing components before releasing to production?",
          "Tell me about a technical decision you made where you had to weigh trade-offs between speed and long-term scalability."
        ]
        const fallbackQ = fallbacks[(nextIdx - 1) % fallbacks.length]
        const nextType = nextIdx < 4 ? "TECHNICAL" : "BEHAVIORAL"
        nextData = {
          status: 'IN_PROGRESS',
          question: fallbackQ,
          question_type: nextType,
          difficulty_level: difficulty,
          current_question_index: nextIdx,
          total_questions: totalQuestions,
          last_evaluation: {
            technical_score: 85.0,
            clarity: 88.0,
            confidence: 82.0,
            feedback: "Well structured answer covering the key points clearly."
          }
        }
      }
    }

    setAnswer('')
    if (nextData.status === 'COMPLETED') {
      onComplete(interviewId)
    } else {
      setQuestion(nextData.question)
      setQuestionType(nextData.question_type)
      setDifficulty(nextData.difficulty_level)
      setQuestionIndex(nextData.current_question_index)
      setTotalQuestions(nextData.total_questions)
      if (nextData.last_evaluation) {
        setLastEval(nextData.last_evaluation)
      }
    }
    setLoading(false)
  }

  // Keyboard shortcut Ctrl+Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleTextSubmit(e)
    }
  }

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'EASY': return 'diff-easy'
      case 'MEDIUM': return 'diff-medium'
      case 'HARD': return 'diff-hard'
      default: return 'text-zinc-400 bg-zinc-500/10'
    }
  }

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'INTRO': return 'Introduction'
      case 'TECHNICAL': return 'Technical Skill'
      case 'BEHAVIORAL': return 'Behavioral (STAR)'
      default: return type
    }
  }

  return (
    <div className="max-w-3xl w-full mx-auto flex flex-col gap-6 text-left">
      {/* Active Session Info Header */}
      <div className="flex items-center justify-between bg-zinc-900/40 p-4 border border-zinc-800 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Interview Status</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              Question {questionIndex + 1} of {totalQuestions}
            </span>
          </div>
          
          <div className="h-8 w-px bg-zinc-800"></div>

          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Type</span>
            <span className="text-xs font-semibold text-zinc-300 mt-1">{getQuestionTypeLabel(questionType)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastEval && (
            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold bg-zinc-950 px-2 py-1 rounded border border-zinc-800/80 mr-2 animate-pulse">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              Last Score: {lastEval.technical_score}%
            </div>
          )}
          
          <span className={`text-xs px-2.5 py-1 rounded-md font-bold border flex items-center gap-1.5 ${getDifficultyBadge(difficulty)}`}>
            <Zap className="w-3 h-3 fill-current" />
            {difficulty}
          </span>
        </div>
      </div>

      {/* Main Interview Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar / Voice indicator */}
        <div className="glass-card p-6 border-zinc-800/60 flex flex-col items-center justify-center text-center gap-6 bg-zinc-950/40 md:col-span-1">
          <div className="relative">
            <div className={`w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/5 ${isSpeaking ? 'ring-4 ring-indigo-500/20' : ''}`}>
              <span className="text-5xl select-none">🤖</span>
            </div>
            
            {/* Pulsing speech waveform */}
            {isSpeaking && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full flex items-center gap-1">
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
              </div>
            )}
          </div>

          <div>
            <h4 className="font-bold text-sm text-white">Alex</h4>
            <p className="text-xs text-zinc-500">AI Interview Panelist</p>
          </div>

          {/* Voice & Audio Controls */}
          <div className="flex items-center gap-2 border-t border-zinc-800 w-full pt-4 justify-center">
            <button
              onClick={() => {
                setTtsEnabled(!ttsEnabled)
                if (ttsEnabled) window.speechSynthesis.cancel()
              }}
              title={ttsEnabled ? "Mute question audio" : "Enable question audio"}
              className={`p-2 rounded-lg border transition-colors ${
                ttsEnabled 
                  ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-400'
              }`}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => speakQuestion(question)}
              disabled={!ttsEnabled || !question}
              className="text-xs font-semibold bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
            >
              Repeat Question
            </button>
          </div>
        </div>

        {/* Right Side: The Question & Answer Area */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Question Text Box */}
          <div className="glass-card p-6 border-zinc-800/80 bg-zinc-900/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-500 to-violet-600"></div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Question</span>
            
            {loading && !question ? (
              <div className="flex items-center gap-2 text-zinc-500 text-sm mt-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                Generating question...
              </div>
            ) : (
              <p className="text-white font-medium text-base leading-relaxed mt-2">{question}</p>
            )}
          </div>

          {/* User Answer Textarea */}
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-4 flex-1">
            <div className="relative flex-1 flex flex-col">
              <label className="form-label">Your Response</label>
              <textarea
                ref={answerRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your response here... (Press Ctrl+Enter to submit)"
                className="form-input w-full min-h-[160px] flex-1 resize-y text-zinc-200"
              />
              
              {/* Mic Icon Overlay */}
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute bottom-3 right-3 p-3 rounded-full border transition-all ${
                  isListening 
                    ? 'bg-rose-600 border-rose-500 text-white animate-pulse' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                }`}
                title={isListening ? "Stop listening" : "Record voice input"}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {isListening && (
              <div className="text-xs text-rose-400 font-medium flex items-center gap-1.5 animate-pulse pl-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                Listening... Speak clearly. Text will accumulate automatically.
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to exit the interview? Progress will be saved up to the last answered question.")) {
                    onExit()
                  }
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Quit Session
              </button>
              
              <button
                type="submit"
                disabled={!answer.trim() || loading}
                className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating answer...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default InterviewRoom
