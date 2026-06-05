'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api-client';

const ROLES = [
  'Senior Backend Engineer', 'Mid Backend Engineer', 'Junior Backend Engineer',
  'React Frontend Developer', 'Full Stack Developer',
  'DevOps Engineer', 'Data Engineer', 'QA Engineer',
  'Solutions Architect', 'Engineering Manager'
];

const LEVELS = ['JUNIOR', 'MID', 'SENIOR', 'LEAD'];

const SKILL_OPTIONS = [
  'Java', 'Spring Boot', 'Python', 'Node.js', 'Go',
  'React', 'TypeScript', 'Next.js', 'Angular', 'Vue.js',
  'Microservices', 'Kafka', 'RabbitMQ', 'REST API', 'GraphQL',
  'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform',
  'CI/CD', 'Jenkins', 'Git', 'Linux',
  'Machine Learning', 'Data Pipelines', 'SQL', 'NoSQL',
  'Testing', 'Selenium', 'Jest', 'Cypress'
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [interviewId, setInterviewId] = useState(null);
  const [tokenUsage, setTokenUsage] = useState(null);

  const [form, setForm] = useState({
    role: '',
    level: 'MID',
    skills: [],
    candidateName: '',
    jdText: '',
    resumeText: '',
  });

  const handleSkillToggle = (skill) => {
    setForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleGenerate = async () => {
    if (!form.role || form.skills.length === 0 || !form.candidateName) return;

    setIsGenerating(true);
    try {
      const data = await fetchAPI('/api/interviews', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      
      setInterviewId(data.interviewId);
      setGeneratedQuestions(data.questions);
      setTokenUsage(data.tokenUsage);
      setStep(2);
    } catch (e) {
      alert("Error generating questions: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await fetchAPI(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'READY' })
      });
      router.push(`/interview/${interviewId}`);
    } catch (e) {
      alert("Error saving: " + e.message);
    }
  };

  const handleRemoveQuestion = async (id) => {
    const updated = generatedQuestions.filter(q => q.id !== id);
    setGeneratedQuestions(updated);
    try {
      await fetchAPI(`/api/interviews/${interviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ questions: updated, questionCount: updated.length })
      });
    } catch (e) {
      alert("Failed to update questions");
    }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Setup New Interview</h2>
        <p className="page-subtitle">Configure role, skills, and candidate details — AI generates the questions</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
        {[{ num: 1, label: 'Configure' }, { num: 2, label: 'Review Questions' }, { num: 3, label: 'Start Interview' }].map(s => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, background: step >= s.num ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'var(--bg-card)', color: step >= s.num ? 'white' : 'var(--text-muted)', border: step >= s.num ? 'none' : '1px solid var(--border-subtle)' }}>
              {step > s.num ? '✓' : s.num}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: step >= s.num ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.label}</span>
            {s.num < 3 && <div style={{ width: 40, height: 2, background: step > s.num ? 'var(--accent-blue)' : 'var(--border-subtle)', marginLeft: 'var(--space-sm)' }} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="glass-card no-hover animate-in">
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 'var(--space-lg)' }}>📋 Interview Configuration</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Candidate Name *</label>
              <input className="form-input" placeholder="e.g., John Doe" value={form.candidateName} onChange={e => setForm(p => ({ ...p, candidateName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Job Role *</label>
              <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="">Select a role...</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Seniority Level</label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              {LEVELS.map(l => (
                <button key={l} className={form.level === l ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setForm(p => ({ ...p, level: l }))} style={{ flex: 1 }}>{l}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Required Skills * (select multiple)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
              {SKILL_OPTIONS.map(skill => (
                <button key={skill} className={`badge ${form.skills.includes(skill) ? 'badge-blue' : ''}`} onClick={() => handleSkillToggle(skill)} style={{ cursor: 'pointer', padding: '6px 14px', fontSize: 13, background: form.skills.includes(skill) ? 'var(--accent-blue-glow)' : 'var(--bg-input)', border: `1px solid ${form.skills.includes(skill) ? 'var(--accent-blue)' : 'var(--border-subtle)'}`, color: form.skills.includes(skill) ? 'var(--accent-blue)' : 'var(--text-secondary)', borderRadius: 'var(--radius-full)' }}>
                  {form.skills.includes(skill) ? '✓ ' : ''}{skill}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Job Description (optional)</label>
            <textarea className="form-textarea" placeholder="Paste the job description here..." value={form.jdText} onChange={e => setForm(p => ({ ...p, jdText: e.target.value }))} rows={4} />
          </div>
          <div className="form-group">
            <label className="form-label">Candidate Resume (optional)</label>
            <textarea className="form-textarea" placeholder="Paste the candidate's resume text here..." value={form.resumeText} onChange={e => setForm(p => ({ ...p, resumeText: e.target.value }))} rows={4} />
          </div>
          <button className="btn btn-primary btn-lg w-full" onClick={handleGenerate} disabled={!form.role || form.skills.length === 0 || !form.candidateName || isGenerating} style={{ marginTop: 'var(--space-md)' }}>
            {isGenerating ? <><span className="typing-indicator" style={{ padding: 0 }}><span></span><span></span><span></span></span>Generating Questions with AI...</> : '🤖 Generate Interview Questions'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in">
          {tokenUsage && (
            <div className="glass-card no-hover" style={{ marginBottom: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 'var(--space-xl)' }}>
                <div><span className="text-xs text-muted">Input Tokens</span><div style={{ fontWeight: 700 }}>{tokenUsage.inputTokens}</div></div>
                <div><span className="text-xs text-muted">Output Tokens</span><div style={{ fontWeight: 700 }}>{tokenUsage.outputTokens}</div></div>
                <div><span className="text-xs text-muted">Cost</span><div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>${((tokenUsage.inputTokens * 0.075 + tokenUsage.outputTokens * 0.30) / 1000000).toFixed(6)}</div></div>
              </div>
              <span className="badge badge-emerald">✨ AI Generated</span>
            </div>
          )}

          <div className="glass-card no-hover">
            <div className="flex justify-between items-center mb-lg">
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>📝 Review Question Bank ({generatedQuestions.length} questions)</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {generatedQuestions.map((q, idx) => {
                const catColor = { TECHNICAL: 'var(--accent-blue)', BEHAVIORAL: 'var(--accent-purple)', PROBLEM_SOLVING: 'var(--accent-amber)', SYSTEM_DESIGN: 'var(--accent-emerald)' }[q.category] || 'var(--accent-blue)';
                return (
                  <div key={q.id} className={`animate-in-delay-${Math.min(idx + 1, 4)}`} style={{ padding: 'var(--space-md) var(--space-lg)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${catColor}` }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-sm)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: catColor }}>{q.category?.replace('_', ' ')}</span>
                        <span className="badge" style={{ fontSize: 11, background: 'var(--bg-input)', color: 'var(--text-muted)' }}>{q.depthTarget}</span>
                      </div>
                      <button className="btn btn-ghost" onClick={() => handleRemoveQuestion(q.id)} style={{ fontSize: 12, color: 'var(--accent-rose)', padding: '4px 8px' }}>✕ Remove</button>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)' }}>{q.text}</p>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-xl)' }}>
              <button className="btn btn-secondary btn-lg" onClick={() => setStep(1)}>← Back to Config</button>
              <button className="btn btn-success btn-lg" style={{ flex: 1 }} onClick={handleConfirm}>✅ Confirm & Start Interview</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
