'use client';

import { useState, useEffect } from 'react';
import { fetchAPI } from '@/lib/api-client';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [filterInterview, setFilterInterview] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchAPI('/api/interviews');
        setInterviews(data);
        loadLogs();
      } catch(e) {
        console.error(e);
      }
    }
    init();
  }, []);

  const loadLogs = async (interviewId = filterInterview, agentName = filterAgent) => {
    try {
      const qs = new URLSearchParams();
      if (interviewId) qs.set('interviewId', interviewId);
      if (agentName) qs.set('agentName', agentName);
      const data = await fetchAPI(`/api/audit?${qs.toString()}`);
      setLogs(data);
    } catch(e) {
      console.error(e);
    }
  };

  const handleFilterChange = (type, value) => {
    if (type === 'interview') {
      setFilterInterview(value);
      loadLogs(value, filterAgent);
    } else {
      setFilterAgent(value);
      loadLogs(filterInterview, value);
    }
  };

  const agents = ['question_generator', 'response_evaluator', 'adaptive_followup', 'feedback_synthesizer', 'review'];
  const agentColors = { 'question_generator': 'badge-blue', 'response_evaluator': 'badge-purple', 'adaptive_followup': 'badge-amber', 'feedback_synthesizer': 'badge-emerald', 'review': 'badge-rose' };
  const agentIcons = { 'question_generator': '📝', 'response_evaluator': '📊', 'adaptive_followup': '🔄', 'feedback_synthesizer': '📋', 'review': '👤' };

  return (
    <div className="animate-in">
      <div className="page-header"><h2>Audit Trail</h2></div>
      
      <div className="glass-card no-hover" style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Interview</label>
            <select className="form-select" value={filterInterview} onChange={e => handleFilterChange('interview', e.target.value)}>
              <option value="">All Interviews</option>
              {interviews.map(i => <option key={i.id} value={i.id}>{i.id} — {i.candidateName}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Filter by Agent</label>
            <select className="form-select" value={filterAgent} onChange={e => handleFilterChange('agent', e.target.value)}>
              <option value="">All Agents</option>
              {agents.map(a => <option key={a} value={a}>{agentIcons[a]} {a.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card no-hover" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Timestamp</th><th>Interview</th><th>Agent</th><th>Operation</th><th>Tokens</th><th>Cost</th><th>Latency</th><th></th></tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)} style={{ cursor: 'pointer' }}>
                <td><span className="text-xs">{new Date(log.createdAt).toLocaleTimeString()}</span></td>
                <td><span className="text-xs" style={{ fontFamily: 'monospace' }}>{log.interviewId?.slice(0, 16)}</span></td>
                <td><span className={`badge ${agentColors[log.agentName] || 'badge-blue'}`}>{agentIcons[log.agentName] || '🤖'} {log.agentName?.replace(/_/g, ' ')}</span></td>
                <td><span className="text-sm">{log.operation}</span></td>
                <td><span style={{ color: 'var(--accent-blue)', fontWeight: 600, fontSize: 13 }}>{log.inputTokens || 0}</span> / <span style={{ color: 'var(--accent-purple)', fontWeight: 600, fontSize: 13 }}>{log.outputTokens || 0}</span></td>
                <td><span style={{ fontWeight: 600, fontSize: 13, color: 'var(--accent-emerald)' }}>${(log.costUsd || 0).toFixed(6)}</span></td>
                <td><span className="text-sm">{log.latencyMs || 0}ms</span></td>
                <td><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{expandedLog === log.id ? '▼' : '▶'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
