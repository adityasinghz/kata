'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api-client';

function StatCard({ label, value, icon, color, change }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      {change && <div className="stat-change">{change}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    'DRAFT': 'badge-purple',
    'READY': 'badge-blue',
    'IN_PROGRESS': 'badge-amber',
    'COMPLETED': 'badge-emerald',
    'REVIEWED': 'badge-blue',
  };
  const icons = {
    'DRAFT': '📝',
    'READY': '⏳',
    'IN_PROGRESS': '🔄',
    'COMPLETED': '✅',
    'REVIEWED': '👤',
  };
  return (
    <span className={`badge ${map[status] || 'badge-blue'}`}>
      {icons[status]} {status?.replace('_', ' ')}
    </span>
  );
}

function RecommendationBadge({ rec }) {
  const map = {
    'STRONG_HIRE': 'strong-hire',
    'HIRE': 'hire',
    'MAYBE': 'maybe',
    'NO_HIRE': 'no-hire',
  };
  const icons = {
    'STRONG_HIRE': '🌟',
    'HIRE': '👍',
    'MAYBE': '🤔',
    'NO_HIRE': '👎',
  };
  return (
    <span className={`recommendation ${map[rec]}`}>
      {icons[rec]} {rec?.replace('_', ' ')}
    </span>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [costs, setCosts] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const dashboard = await fetchAPI('/api/dashboard');
        setStats(dashboard.stats);
        setInterviews(dashboard.interviews);
        const costsData = await fetchAPI('/api/costs');
        setCosts(costsData);
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, []);

  if (!stats) return <div className="animate-in"><div className="page-header"><h2>Loading...</h2></div></div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p className="page-subtitle">AI-Assisted Interview Screening Overview</p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Interviews" value={stats.totalInterviews} icon="📋" color="blue" change={`${stats.completed} completed`} />
        <StatCard label="Pending Review" value={stats.pendingReview} icon="⏳" color="amber" change="Awaiting human review" />
        <StatCard label="Avg. Confidence" value={`${Math.round(stats.avgConfidence)}%`} icon="🎯" color="emerald" change="AI recommendation confidence" />
        <StatCard label="Total AI Cost" value={`$${stats.totalCost.toFixed(4)}`} icon="💰" color="purple" change={costs ? `${costs.totalTokens?.toLocaleString()} tokens used` : ''} />
      </div>

      <div className="glass-card no-hover" style={{ marginBottom: 'var(--space-xl)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>AI Recommendation Distribution</h3>
        <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap' }}>
          {Object.entries(stats.recommendations).map(([rec, count]) => (
            <div key={rec} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <RecommendationBadge rec={rec} />
              <span style={{ fontSize: '24px', fontWeight: 800 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center mb-lg">
        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Recent Interviews</h3>
        <Link href="/setup" className="btn btn-primary">➕ New Interview</Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {interviews.map((interview, idx) => (
          <Link
            key={interview.id}
            href={interview.status === 'COMPLETED' ? `/review/${interview.id}` : interview.status === 'REVIEWED' ? `/review/${interview.id}` : `/interview/${interview.id}`}
            className={`interview-card animate-in-delay-${Math.min(idx + 1, 4)}`}
          >
            <div className="card-header">
              <div>
                <div className="card-role">{interview.role}</div>
                <div className="card-candidate">👤 {interview.candidateName}</div>
              </div>
              <StatusBadge status={interview.status} />
            </div>
            <div className="card-meta">
              <span>🏷️ {interview.skills.slice(0, 3).join(', ')}{interview.skills.length > 3 ? ` +${interview.skills.length - 3}` : ''}</span>
              <span>📝 {interview.responseCount}/{interview.questionCount} questions</span>
              <span>📅 {new Date(interview.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="card-footer">
              <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                {interview.scores && (
                  <>
                    <RecommendationBadge rec={interview.scores.aiRecommendation} />
                    <span className={`confidence-badge confidence-${interview.scores.overallConfidence >= 70 ? 'high' : interview.scores.overallConfidence >= 50 ? 'medium' : 'low'}`}>
                      {interview.scores.overallConfidence}% confidence
                    </span>
                  </>
                )}
              </div>
              <div className="token-counter">
                <span className="token-dot"></span>
                <span>${interview.costRecord?.totalCostUsd?.toFixed(4) || '0.0000'}</span>
              </div>
            </div>
          </Link>
        ))}

        {interviews.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>No Interviews Yet</h3>
            <p>Create your first AI-assisted interview to get started.</p>
            <Link href="/setup" className="btn btn-primary btn-lg">➕ Create Interview</Link>
          </div>
        )}
      </div>
    </div>
  );
}
