'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api-client';

export default function CostsPage() {
  const [costs, setCosts] = useState(null);
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const c = await fetchAPI('/api/costs');
        setCosts(c);
        const i = await fetchAPI('/api/interviews');
        setInterviews(i.filter(int => int.costRecord && int.costRecord.totalApiCalls > 0));
      } catch(e) {
        console.error(e);
      }
    }
    load();
  }, []);

  if (!costs) return <div className="animate-in"><div className="page-header"><h2>Loading...</h2></div></div>;

  return (
    <div className="animate-in">
      <div className="page-header"><h2>Cost Tracking</h2></div>

      <div className="stats-grid">
        <div className="stat-card blue"><div className="stat-header"><span className="stat-label">Total Cost</span><span className="stat-icon">💰</span></div><div className="stat-value">${costs.totalCostUsd?.toFixed(4)}</div></div>
        <div className="stat-card purple"><div className="stat-header"><span className="stat-label">Avg Cost / Interview</span><span className="stat-icon">📊</span></div><div className="stat-value">${costs.avgCostPerInterview?.toFixed(4)}</div></div>
        <div className="stat-card emerald"><div className="stat-header"><span className="stat-label">Total Tokens</span><span className="stat-icon">🔤</span></div><div className="stat-value">{costs.totalTokens?.toLocaleString() || 0}</div></div>
      </div>

      <div className="glass-card no-hover" style={{ marginTop: 'var(--space-lg)', padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Interview ID</th><th>Candidate</th><th>Input Tokens</th><th>Output Tokens</th><th>API Calls</th><th>Total Cost</th></tr>
          </thead>
          <tbody>
            {interviews.map(i => (
              <tr key={i.id}>
                <td><code style={{ fontSize: 12 }}>{i.id}</code></td>
                <td style={{ fontWeight: 600 }}>{i.candidateName}</td>
                <td><span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{i.costRecord.totalInputTokens.toLocaleString()}</span></td>
                <td><span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{i.costRecord.totalOutputTokens.toLocaleString()}</span></td>
                <td>{i.costRecord.totalApiCalls}</td>
                <td><span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>${i.costRecord.totalCostUsd.toFixed(4)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
