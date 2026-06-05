'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAPI } from '@/lib/api-client';

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAPI('/api/interviews');
        setInterviews(data);
      } catch(e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const filtered = statusFilter ? interviews.filter(i => i.status === statusFilter) : interviews;
  const statusColors = { 'DRAFT': 'badge-purple', 'READY': 'badge-blue', 'IN_PROGRESS': 'badge-amber', 'COMPLETED': 'badge-emerald', 'REVIEWED': 'badge-blue' };
  const statusIcons = { 'DRAFT': '📝', 'READY': '⏳', 'IN_PROGRESS': '🔄', 'COMPLETED': '✅', 'REVIEWED': '👤' };

  return (
    <div className="animate-in">
      <div className="flex justify-between items-center mb-lg">
        <div className="page-header" style={{ marginBottom: 0 }}><h2>All Interviews</h2></div>
        <Link href="/setup" className="btn btn-primary">➕ New Interview</Link>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
        {['', 'DRAFT', 'READY', 'IN_PROGRESS', 'COMPLETED', 'REVIEWED'].map(s => (
          <button key={s} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setStatusFilter(s)} style={{ fontSize: 13 }}>
            {s ? `${statusIcons[s]} ${s.replace('_', ' ')}` : '📋 All'}
          </button>
        ))}
      </div>

      <div className="glass-card no-hover" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Candidate</th><th>Role</th><th>Status</th><th>Progress</th><th>Cost</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td style={{ fontWeight: 600 }}>👤 {i.candidateName}</td>
                <td>{i.role}</td>
                <td><span className={`badge ${statusColors[i.status]}`}>{statusIcons[i.status]} {i.status.replace('_', ' ')}</span></td>
                <td>{i.progress}%</td>
                <td><span style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>${i.costRecord?.totalCostUsd?.toFixed(4) || '0.0000'}</span></td>
                <td><Link href={`/${i.status === 'COMPLETED' || i.status === 'REVIEWED' ? 'review' : 'interview'}/${i.id}`} className="btn btn-ghost" style={{ fontSize: 12 }}>View →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
