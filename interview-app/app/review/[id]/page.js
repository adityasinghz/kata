'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api-client';

function ScoreBar({ label, score, maxScore = 10, color = 'var(--accent-blue)' }) {
  const pct = (score / maxScore) * 100;
  return (
    <div className="score-item">
      <div className="flex justify-between items-center">
        <span className="score-label">{label}</span>
        <span className={`confidence-badge ${score >= 7 ? 'confidence-high' : score >= 5 ? 'confidence-medium' : 'confidence-low'}`}>{score >= 7 ? 'High' : score >= 5 ? 'Medium' : 'Low'}</span>
      </div>
      <div className="score-value" style={{ color }}>{score.toFixed(1)}</div>
      <div className="score-bar"><div className="score-bar-fill" style={{ width: `${pct}%`, background: color }}></div></div>
    </div>
  );
}

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [interview, setInterview] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [finalDecision, setFinalDecision] = useState('');
  const [usefulnessRating, setUsefulnessRating] = useState(0);
  const [adjustedScores, setAdjustedScores] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAPI(`/api/interviews/${id}`);
        setInterview(data);
        if (data.review) setIsSubmitted(true);
        if (data.scores) {
          setAdjustedScores({
            technicalDepth: data.scores.technicalDepth,
            communication: data.scores.communication,
            problemSolving: data.scores.problemSolving,
            roleAlignment: data.scores.roleAlignment,
          });
        }
      } catch(e) {
        console.error(e);
      }
    }
    load();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!finalDecision) return;
    if ((reviewAction === 'ADJUST' || reviewAction === 'REJECT') && !reviewNotes.trim()) return;

    const review = {
      action: reviewAction,
      reviewerName: 'Hiring Manager',
      finalDecision,
      notes: reviewNotes,
      adjustments: reviewAction === 'ADJUST' ? adjustedScores : null,
      usefulnessRating,
    };

    try {
      const updated = await fetchAPI(`/api/interviews/${id}/review`, {
        method: 'POST',
        body: JSON.stringify(review)
      });
      setIsSubmitted(true);
      setInterview(updated);
    } catch(e) {
      alert("Error submitting review: " + e.message);
    }
  };

  if (!interview) return <div className="animate-in"><div className="page-header"><h2>Loading...</h2></div></div>;
  if (!interview.scores) return <div className="animate-in"><div className="page-header"><h2>Interview not yet scored</h2><p className="page-subtitle">This interview needs to be completed first.</p></div></div>;

  const scores = interview.scores;
  const recClass = { 'STRONG_HIRE': 'strong-hire', 'HIRE': 'hire', 'MAYBE': 'maybe', 'NO_HIRE': 'no-hire' }[scores.aiRecommendation];
  const recIcon = { 'STRONG_HIRE': '🌟', 'HIRE': '👍', 'MAYBE': '🤔', 'NO_HIRE': '👎' }[scores.aiRecommendation];

  return (
    <div className="animate-in" style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-lg">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Review & Score</h2>
          <p className="page-subtitle">{interview.role} — {interview.candidateName}</p>
        </div>
        {isSubmitted && interview.review && (
          <span className="badge badge-emerald" style={{ fontSize: 14, padding: '8px 16px' }}>
            ✅ Reviewed by {interview.review.reviewerName}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        <div>
          <div className="glass-card no-hover" style={{ marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>Overall AI Confidence</div>
            <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-0.04em', background: `linear-gradient(135deg, ${scores.overallConfidence >= 70 ? 'var(--accent-emerald), var(--accent-cyan)' : scores.overallConfidence >= 50 ? 'var(--accent-amber), var(--accent-rose)' : 'var(--accent-rose), #dc2626'})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {scores.overallConfidence}%
            </div>
            <div className={`recommendation ${recClass}`} style={{ marginTop: 'var(--space-md)' }}>
              {recIcon} {scores.aiRecommendation?.replace('_', ' ')}
            </div>
          </div>

          <div className="score-grid">
            <ScoreBar label="Technical Depth" score={reviewAction === 'ADJUST' ? adjustedScores.technicalDepth : scores.technicalDepth} color="var(--accent-blue)" />
            <ScoreBar label="Communication" score={reviewAction === 'ADJUST' ? adjustedScores.communication : scores.communication} color="var(--accent-purple)" />
            <ScoreBar label="Problem Solving" score={reviewAction === 'ADJUST' ? adjustedScores.problemSolving : scores.problemSolving} color="var(--accent-amber)" />
            <ScoreBar label="Role Alignment" score={reviewAction === 'ADJUST' ? adjustedScores.roleAlignment : scores.roleAlignment} color="var(--accent-emerald)" />
          </div>

          <div className="glass-card no-hover" style={{ marginTop: 'var(--space-lg)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 'var(--space-md)' }}>💰 AI Cost for this Interview</h4>
            <div style={{ display: 'flex', gap: 'var(--space-xl)' }}>
              <div><div className="text-xs text-muted">Total Tokens</div><div style={{ fontWeight: 700 }}>{((interview.costRecord?.totalInputTokens || 0) + (interview.costRecord?.totalOutputTokens || 0)).toLocaleString()}</div></div>
              <div><div className="text-xs text-muted">API Calls</div><div style={{ fontWeight: 700 }}>{interview.costRecord?.totalApiCalls || 0}</div></div>
              <div><div className="text-xs text-muted">Total Cost</div><div style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>${(interview.costRecord?.totalCostUsd || 0).toFixed(4)}</div></div>
            </div>
          </div>
        </div>

        <div>
          <div className="glass-card no-hover" style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 'var(--space-md)' }}>📝 AI Assessment Summary</h4>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>{scores.feedbackSummary?.overallImpression}</p>
            {scores.feedbackSummary?.strengths?.length > 0 && (
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: 'var(--space-sm)' }}>✅ Strengths</h5>
                {scores.feedbackSummary.strengths.map((s, i) => <div key={i} style={{ padding: '8px 12px', background: 'var(--accent-emerald-glow)', borderRadius: 'var(--radius-sm)', marginBottom: 4, fontSize: 13 }}><strong>{s.area}:</strong> {s.evidence}</div>)}
              </div>
            )}
            {scores.feedbackSummary?.concerns?.length > 0 && (
              <div style={{ marginBottom: 'var(--space-md)' }}>
                <h5 style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-amber)', marginBottom: 'var(--space-sm)' }}>⚠️ Concerns</h5>
                {scores.feedbackSummary.concerns.map((c, i) => <div key={i} style={{ padding: '8px 12px', background: 'var(--accent-amber-glow)', borderRadius: 'var(--radius-sm)', marginBottom: 4, fontSize: 13 }}><strong>{c.area}:</strong> {c.evidence}</div>)}
              </div>
            )}
          </div>

          {!isSubmitted ? (
            <div className="glass-card no-hover" style={{ border: '1px solid var(--accent-blue)', boxShadow: 'var(--shadow-glow-blue)' }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 'var(--space-lg)' }}>👤 Human Review</h4>
              <div className="form-group">
                <label className="form-label">Review Action</label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  {[{ action: 'APPROVE', label: '✅ Approve', class: 'btn-success' }, { action: 'ADJUST', label: '✏️ Adjust Scores', class: 'btn-amber' }, { action: 'REJECT', label: '❌ Override', class: 'btn-danger' }].map(a => (
                    <button key={a.action} className={`btn ${reviewAction === a.action ? a.class : 'btn-secondary'}`} onClick={() => setReviewAction(a.action)} style={{ flex: 1 }}>{a.label}</button>
                  ))}
                </div>
              </div>
              {reviewAction === 'ADJUST' && (
                <div className="form-group">
                  <label className="form-label">Adjust Dimension Scores</label>
                  {['technicalDepth', 'communication', 'problemSolving', 'roleAlignment'].map(dim => (
                    <div key={dim} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>
                      <span style={{ fontSize: 13, width: 130, color: 'var(--text-secondary)' }}>{dim.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <input type="range" min="0" max="10" step="0.5" value={adjustedScores[dim]} onChange={e => setAdjustedScores(prev => ({ ...prev, [dim]: parseFloat(e.target.value) }))} style={{ flex: 1 }} />
                      <span style={{ fontWeight: 700, width: 30, textAlign: 'right' }}>{adjustedScores[dim]}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Final Decision *</label>
                <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                  {['ADVANCE', 'HOLD', 'REJECT'].map(d => (
                    <button key={d} className={`btn ${finalDecision === d ? (d === 'ADVANCE' ? 'btn-success' : d === 'REJECT' ? 'btn-danger' : 'btn-amber') : 'btn-secondary'}`} onClick={() => setFinalDecision(d)} style={{ flex: 1 }}>{d === 'ADVANCE' ? '✅' : d === 'HOLD' ? '⏸️' : '❌'} {d}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Review Notes {(reviewAction === 'ADJUST' || reviewAction === 'REJECT') && <span style={{ color: 'var(--accent-rose)' }}>*</span>}</label>
                <textarea className="form-textarea" placeholder="Add your notes about this candidate..." value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={3} />
              </div>
              <button className="btn btn-primary btn-lg w-full" onClick={handleSubmitReview} disabled={!finalDecision || !reviewAction || ((reviewAction === 'ADJUST' || reviewAction === 'REJECT') && !reviewNotes.trim())}>Submit Review Decision</button>
            </div>
          ) : (
            <div className="glass-card no-hover" style={{ border: '1px solid var(--accent-emerald)' }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 'var(--space-md)' }}>✅ Review Complete</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                <div><span className="text-muted text-sm">Reviewer:</span> <strong>{interview.review?.reviewerName}</strong></div>
                <div><span className="text-muted text-sm">Decision:</span> <strong>{interview.review?.finalDecision}</strong></div>
              </div>
              <button className="btn btn-secondary mt-lg" onClick={() => router.push('/')}>← Back to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
