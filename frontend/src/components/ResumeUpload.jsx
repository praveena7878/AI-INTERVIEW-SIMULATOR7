import React, { useState } from 'react'
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

function ResumeUpload({ user, setUser, apiKey, onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [parsedData, setParsedData] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Please select a valid PDF file.')
        setFile(null)
        return
      }
      setError('')
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`/api/upload-resume/${user.id}`, {
        method: 'POST',
        headers: {
          'X-Gemini-API-Key': apiKey
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setParsedData(data)
        
        // Update user state with extracted skills
        const updatedUser = {
          ...user,
          skills: data.skills,
          resume_json: data
        }
        setUser(updatedUser)
        localStorage.setItem('user_profile', JSON.stringify(updatedUser))
      } else {
        const err = await response.json()
        setError(err.detail || 'Failed to extract resume. Make sure your Gemini API key is valid.')
      }
    } catch (err) {
      setError('Connection failed. Please check if backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl w-full mx-auto">
      {!parsedData ? (
        <div className="glass-card p-8 border-zinc-800/80">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Upload your Resume</h2>
            <p className="text-zinc-400 text-sm">
              We support PDF resumes. Upload your resume to extract skills and projects.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 rounded-xl p-8 transition-colors flex flex-col items-center justify-center cursor-pointer relative bg-zinc-900/10">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 text-zinc-500 mb-4" />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-white mb-1">{file.name}</p>
                  <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-300">Drag & drop your resume PDF here</p>
                  <p className="text-xs text-zinc-500 mt-1">or click to browse from files</p>
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-sm bg-rose-950/20 border border-rose-500/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Resume with Gemini AI...
                </>
              ) : (
                'Upload and Analyze'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-card p-8 border-zinc-800/80 flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <div>
              <h2 className="text-2xl font-bold">Resume Parsed Successfully</h2>
              <p className="text-zinc-400 text-xs">Verify your profile details extracted by Gemini.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Extracted Candidate Name</h3>
              <p className="text-lg font-bold text-white bg-zinc-900/50 p-3 border border-zinc-800 rounded-lg">{parsedData.name}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Skills Extracted ({parsedData.skills.length})</h3>
              <div className="flex flex-wrap gap-1.5 bg-zinc-900/50 p-3 border border-zinc-800 rounded-lg min-h-[50px]">
                {parsedData.skills.map((skill, i) => (
                  <span key={i} className="text-xs bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-medium px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-left flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Education</h3>
              <div className="flex flex-col gap-2">
                {parsedData.education.map((edu, i) => (
                  <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-lg text-sm">
                    <span className="font-semibold text-zinc-200">{edu.degree}</span> - <span className="text-zinc-400">{edu.institution}</span> ({edu.year})
                  </div>
                ))}
                {parsedData.education.length === 0 && <p className="text-zinc-500 text-xs">No education records found</p>}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Experience</h3>
              <div className="flex flex-col gap-2">
                {parsedData.experience.map((exp, i) => (
                  <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-lg text-sm">
                    <div className="font-semibold text-zinc-200">{exp.role} <span className="text-zinc-500">at</span> {exp.company}</div>
                    <div className="text-xs text-zinc-500 mb-1">{exp.duration}</div>
                    <div className="text-xs text-zinc-400">{exp.description}</div>
                  </div>
                ))}
                {parsedData.experience.length === 0 && <p className="text-zinc-500 text-xs">No experience records found</p>}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Projects</h3>
              <div className="flex flex-col gap-2">
                {parsedData.projects.map((proj, i) => (
                  <div key={i} className="bg-zinc-900/30 border border-zinc-800/50 p-3 rounded-lg text-sm">
                    <span className="font-semibold text-zinc-200">{proj.title}</span>
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1 mt-1 mb-1">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-zinc-400">{proj.description}</div>
                  </div>
                ))}
                {parsedData.projects.length === 0 && <p className="text-zinc-500 text-xs">No projects records found</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button onClick={() => setParsedData(null)} className="btn-secondary flex-1 justify-center">
              Re-upload PDF
            </button>
            <button onClick={onUploadSuccess} className="btn-primary flex-1 justify-center">
              Confirm & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeUpload
