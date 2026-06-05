'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchAPI } from '@/lib/api-client';

export default function InterviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const chatEndRef = useRef(null);

  const [interview, setInterview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const [coverage, setCoverage] = useState({ TECHNICAL: 0, BEHAVIORAL: 0, PROBLEM_SOLVING: 0, SYSTEM_DESIGN: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [responseStartTime, setResponseStartTime] = useState(Date.now());

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAPI(`/api/interviews/${id}`);
        setInterview(data);

        if (data.status === 'COMPLETED' || data.status === 'REVIEWED') {
          setIsComplete(true);
          return;
        }

        if (data.status === 'READY' || data.status === 'DRAFT') {
          await fetchAPI(`/api/interviews/${id}/start`, { method: 'POST' });
        }

        if (data.questions && data.questions.length > 0) {
          const firstQ = data.questions[0];
          setCurrentQuestion(firstQ);
          setMessages([{
            type: 'ai',
            text: `Welcome to your interview for **${data.role}**! I'll be asking you a series of questions to understand your skills and experience. Let's begin.\n\n${firstQ.text}`,
            category: firstQ.category,
            timestamp: new Date()
          }]);
          setQuestionsAsked(1);
          setResponseStartTime(Date.now());
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!inputText.trim() || isThinking || isComplete) return;

    const responseText = inputText.trim();
    const responseTimeSec = Math.round((Date.now() - responseStartTime) / 1000);
    setInputText('');

    setMessages(prev => [...prev, {
      type: 'candidate',
      text: responseText,
      timestamp: new Date()
    }]);

    setIsThinking(true);

    try {
      const res = await fetchAPI(`/api/interviews/${id}/respond`, {
        method: 'POST',
        body: JSON.stringify({
          question: currentQuestion,
          responseText,
          coverage,
          questionsAsked,
          responseTimeSec
        })
      });

      const { result, newCoverage, newQuestionsAsked, feedbackResult } = res;
      
      setCoverage(newCoverage);
      setQuestionsAsked(newQuestionsAsked);

      if (result.action === 'CONCLUDE' || newQuestionsAsked > interview.questions.length) {
        setMessages(prev => [...prev, {
          type: 'ai',
          text: result.transitionText || 'Thank you for your responses! The interview is now complete. Let me generate your assessment...',
          category: 'CONCLUSION',
          isConclusion: true,
          timestamp: new Date()
        }]);

        setIsComplete(true);

        setMessages(prev => [...prev, {
          type: 'ai',
          text: `✅ **Interview Complete!**\n\nYour responses have been evaluated. The AI has generated a comprehensive assessment with scoring across Technical Depth, Communication, Problem Solving, and Role Alignment.\n\n**AI Recommendation:** ${feedbackResult?.scores?.aiRecommendation?.replace('_', ' ') || 'DONE'}\n**Confidence:** ${feedbackResult?.scores?.overallConfidence || 0}%\n\nClick below to view the detailed review and scores.`,
          category: 'RESULT',
          isResult: true,
          timestamp: new Date()
        }]);
      } else {
        let nextQ;
        if (result.action === 'NEW_TOPIC') {
          nextQ = interview.questions.find((q, idx) => idx >= newQuestionsAsked - 1 && q.isActive) || interview.questions[Math.min(newQuestionsAsked - 1, interview.questions.length - 1)];
        } else {
          nextQ = {
            ...interview.questions[Math.min(newQuestionsAsked - 1, interview.questions.length - 1)],
            text: result.nextQuestionText || interview.questions[Math.min(newQuestionsAsked - 1, interview.questions.length - 1)]?.text
          };
        }

        setCurrentQuestion(nextQ);
        setResponseStartTime(Date.now());

        const depthEmoji = result.depthScore >= 4 ? '🌟' : result.depthScore >= 3 ? '👍' : '📝';
        const depthLabel = result.depthScore >= 4 ? 'Excellent depth' : result.depthScore >= 3 ? 'Good response' : 'Let\'s explore further';

        setMessages(prev => [...prev, {
          type: 'ai',
          text: `${depthEmoji} *${depthLabel} (depth: ${result.depthScore}/5)*\n\n${result.transitionText || ''}\n\n${nextQ?.text || 'Moving on to the next question...'}`,
          category: nextQ?.category || 'ADAPTIVE',
          depthScore: result.depthScore,
          action: result.action,
          timestamp: new Date()
        }]);
      }
    } catch (e) {
      alert("Failed to process response: " + e.message);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!interview) {
    return <div className="animate-in"><div className="page-header"><h2>Loading...</h2></div></div>;
  }

  const progress = Math.round(((questionsAsked - 1) / Math.max(1, interview.questions.length)) * 100);

  return (
    <div className="animate-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Live Interview</h2>
          <p className="page-subtitle">{interview.role} — {interview.candidateName}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
          <span className="badge badge-blue">Q {Math.min(questionsAsked, interview.questions.length)}/{interview.questions.length}</span>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: 4 }}>
          <span className="text-xs text-muted">Interview Progress</span>
          <span className="text-xs" style={{ fontWeight: 600 }}>{Math.min(progress, 100)}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
          {Object.entries(coverage).map(([cat, pct]) => (
            <div key={cat} style={{ flex: 1 }}>
              <div className="text-xs text-muted" style={{ marginBottom: 2 }}>{cat.replace('_', ' ')}</div>
              <div className="progress-bar-container" style={{ height: 4 }}>
                <div className="progress-bar-fill" style={{
                  width: `${pct}%`,
                  background: {
                    TECHNICAL: 'var(--accent-blue)', BEHAVIORAL: 'var(--accent-purple)',
                    PROBLEM_SOLVING: 'var(--accent-amber)', SYSTEM_DESIGN: 'var(--accent-emerald)'
                  }[cat]
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card no-hover" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="chat-container" style={{ minHeight: 400, maxHeight: '55vh' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.type}`}>
              <div className="bubble-label">
                {msg.type === 'ai' ? '🤖 AI Interviewer' : '👤 Candidate'}
                {msg.category && msg.type === 'ai' && !msg.isConclusion && !msg.isResult && (
                  <span style={{ marginLeft: 8, opacity: 0.7, fontSize: 10 }}>[{msg.category.replace('_', ' ')}]</span>
                )}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {msg.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>)}
              </div>
              {msg.depthScore && (
                <div style={{ marginTop: 8, display: 'flex', gap: 'var(--space-sm)' }}>
                  {[1,2,3,4,5].map(d => <div key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: d <= msg.depthScore ? 'var(--accent-blue)' : 'var(--border-subtle)' }}/>)}
                </div>
              )}
            </div>
          ))}
          {isThinking && <div className="chat-bubble ai"><div className="bubble-label">🤖 AI Interviewer</div><div className="typing-indicator"><span></span><span></span><span></span></div></div>}
          <div ref={chatEndRef} />
        </div>

        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          {isComplete ? (
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => router.push(`/review/${id}`)}>📊 View Review & Scores</button>
              <button className="btn btn-secondary btn-lg" onClick={() => router.push('/')}>🏠 Dashboard</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <textarea className="form-textarea" placeholder="Type your response... (Enter to send, Shift+Enter for new line)" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={handleKeyPress} disabled={isThinking} rows={2} style={{ resize: 'none', minHeight: 52 }} />
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!inputText.trim() || isThinking} style={{ alignSelf: 'flex-end', height: 52 }}>Send ➤</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
