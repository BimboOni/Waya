'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconArrowLeft, IconArrowUp, IconCheck, IconArrowsMaximize, IconX, IconCopy, IconThumbUp, IconThumbDown } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useWayaStore } from '@/store/useWayaStore';
import { SUBJECT_CONTAINER_COLORS, SUBJECT_TEXT_COLORS } from '@/lib/constants';
import { getLocalDateString } from '@/lib/utils';
import { playXPChime } from '@/lib/sounds';
import { Button } from '@/components/ui/Button';

type Stage = 'streaming' | 'answering' | 'complete';

export interface ResumeSessionData {
  sessionId: string;
  topic: string;
  explanation: string;
  synthQuestion: string;
  subject: string;
  keepExploringTopic?: string;
}

interface SessionViewProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  userInterests: string[];
  resumeSession?: ResumeSessionData | null;
  userSubject?: string;
  onSessionComplete?: () => void;
}

function cleanMarkdown(text: string): string {
  return text
    .replace(/---/g, '—')
    .replace(/--/g, '–')
    .trim();
}

function stripChallengeHeader(text: string): string {
  return text.replace(/###\s*Synthesis Challenge\s*\n?/gi, '').trim();
}

const SUBJECT_LABELS: Record<string, string> = {
  Mathematics: 'MATHEMATICS',
  ScienceTech: 'SCIENCE & TECH',
  HistoryCulture: 'HISTORY & CULTURE',
  CreativeArts: 'CREATIVE ARTS',
};

export function SessionView({ isOpen, onClose, topic, userInterests, resumeSession, userSubject, onSessionComplete }: SessionViewProps) {
  const { syncGamification, triggerLevelUp, addSpatialNode, addSpatialEdge } = useWayaStore();

  const [stage, setStage] = useState<Stage>('streaming');
  const [explanation, setExplanation] = useState('');
  const [synthQuestion, setSynthQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [xpEarned, setXpEarned] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showXpFloat, setShowXpFloat] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const [draftSaved, setDraftSaved] = useState(false);
  const [keepExploringMessages, setKeepExploringMessages] = useState<string[]>([]);
  const [keepExploringResponse, setKeepExploringResponse] = useState('');
  const [keepExploringDone, setKeepExploringDone] = useState(false);
  const [tooltipFeedback, setTooltipFeedback] = useState<Record<string, string>>({});
  const [clickedActions, setClickedActions] = useState<Record<string, boolean>>({});
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [chipSubmitted, setChipSubmitted] = useState<Record<string, boolean>>({});
  const [feedbackContext, setFeedbackContext] = useState<string | null>(null);

  const showTooltipFeedback = useCallback((key: string, label: string) => {
    setTooltipFeedback((prev) => ({ ...prev, [key]: label }));
    setTimeout(() => setTooltipFeedback((prev) => ({ ...prev, [key]: '' })), 2000);
  }, []);

  const logAIFeedback = useCallback(async (feedbackKey: string, feedbackTag: string) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedbackKey, feedbackTag }),
      });
    } catch {}
  }, []);

  const handleActionClick = useCallback((key: string) => {
    setClickedActions((prev) => {
      const isActive = prev[key];
      const prefix = key.startsWith('good-') ? 'bad-' : 'good-';
      const sectionKey = key.replace(/^(good|bad)-/, '');
      const oppositeKey = `${prefix}${sectionKey}`;
      if (isActive) {
        setSelectedChip(null);
        return { ...prev, [key]: false };
      }
      return { ...prev, [key]: true, [oppositeKey]: false };
    });
    if (key.startsWith('good-')) {
      showTooltipFeedback(key, 'Thank you for your feedback!');
      logAIFeedback(key, 'thumbs_up');
    }
  }, [showTooltipFeedback, logAIFeedback]);

  const handleChipClick = useCallback((sectionKey: string, chipLabel: string) => {
    setSelectedChip(chipLabel);
    setFeedbackContext(`[System Note: The user flagged your previous response as "${chipLabel}". Adjust your teaching style accordingly for this next answer.]`);
    setChipSubmitted((prev) => ({ ...prev, [sectionKey]: true }));
    setClickedActions((prev) => ({ ...prev, [sectionKey]: false }));
    logAIFeedback(sectionKey, chipLabel);
    setTimeout(() => setChipSubmitted((prev) => ({ ...prev, [sectionKey]: false })), 2000);
  }, [logAIFeedback]);

  const FEEDBACK_CHIPS = ['Too long', 'Confusing', 'Not what I asked'];

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  // Scroll to keep exploring message after it renders
  useEffect(() => {
    if (keepExploringMessages.length > 0) {
      setTimeout(() => {
        const el = document.getElementById('ke-msg-0');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }, [keepExploringMessages.length]);

  useEffect(() => {
    if (!isOpen || !topic) return;

    // Resume mode: hydrate from saved session data without streaming
    if (resumeSession) {
      setClickedActions({});
      setChipSubmitted({});
      setSelectedChip(null);
      setFeedbackContext(null);
      setExplanation(resumeSession.explanation);
      setSynthQuestion(resumeSession.synthQuestion);
      setSubject(resumeSession.subject);
      setSessionId(resumeSession.sessionId);
      setAnswer('');
      setFeedback('');
      setXpEarned(0);
      setDraftSaved(true);
      setKeepExploringDone(false);
      setKeepExploringResponse('');
      setKeepExploringMessages([]);
      setStage('answering');

      // If keepExploringTopic is set, add it as a new user message and start streaming
      if (resumeSession.keepExploringTopic) {
        const keTopic = resumeSession.keepExploringTopic;
        setKeepExploringMessages([keTopic]);
        setStage('streaming');

        const keController = new AbortController();
        abortRef.current = keController;

        setTimeout(() => {
          const ctx = feedbackContext;
          setFeedbackContext(null);
          (async () => {
            let fullText = '';
            try {
              const res = await fetch('/api/synthesis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: keTopic, subject: resumeSession.subject, feedbackContext: ctx }),
                signal: keController.signal,
              });
              if (!res.ok || !res.body) {
                console.error('[session] keep exploring fetch failed:', res.status, res.statusText);
                setKeepExploringDone(true); setStage('answering'); return;
              }
              const reader = res.body.getReader();
              const decoder = new TextDecoder();
              let buffer = '';
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                  if (!line.startsWith('data: ')) continue;
                  const raw = line.slice(6).trim();
                  if (raw === '[DONE]') continue;
                  try {
                    const parsed = JSON.parse(raw);
                    if (parsed.delta) {
                      fullText += parsed.delta;
                      setKeepExploringResponse(fullText);
                    }
                  } catch { /* ignore */ }
                }
                scrollToBottom();
              }
              setKeepExploringDone(true);
              setStage('answering');

              // Persist keep exploring exchange to session record
              if (resumeSession?.sessionId) {
                try {
                  await fetch('/api/session/draft', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      sessionId: resumeSession.sessionId,
                      topic: resumeSession.topic,
                      subject: resumeSession.subject,
                      aiResponse: `${resumeSession.explanation}\n\n[KEEP_EXPLORING]\nUser: ${keTopic}\nWaya: ${fullText}`,
                    }),
                  });
                } catch (e) {
                  console.error('[session] persist keep-exploring failed:', e);
                }
                onSessionComplete?.();
              }
            } catch (err) {
              if ((err as Error).name !== 'AbortError') {
                console.error('[session] keep exploring stream error:', err);
                setKeepExploringDone(true);
                setStage('answering');
              }
            }
          })();
        }, 100);
      }

      return;
    }

    setStage('streaming');
    setExplanation('');
    setSynthQuestion('');
    setSubject('');
    setSessionId('');
    setAnswer('');
    setFeedback('');
    setXpEarned(0);
    setDraftSaved(false);

    const controller = new AbortController();
    abortRef.current = controller;

    let fullText = '';

    (async () => {
      try {
        const res = await fetch('/api/synthesis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, subject: userSubject }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          setExplanation("I'm having trouble connecting right now. Let me try again — type your topic below and I'll give it another shot.");
          setStage('answering');
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') continue;
            try {
              const parsed = JSON.parse(raw);
              if (parsed.delta) {
                fullText += parsed.delta;
                const parts = fullText.split(/\[synthesis_question\]/i);
                setExplanation(stripChallengeHeader(parts[0]));
                if (parts[1]) setSynthQuestion(parts[1].trim());
              }
              if (parsed.sessionId) setSessionId(parsed.sessionId);
              if (parsed.subject) setSubject(parsed.subject);
            } catch { /* ignore parse errors */ }
          }
          scrollToBottom();
        }

        setStage('answering');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('[session] stream error:', err);
          setExplanation("I'm having trouble connecting right now. Let me try again — type your topic below and I'll give it another shot.");
          setStage('answering');
        }
      }
    })();

    return () => { controller.abort(); };
  }, [isOpen, topic, resumeSession, scrollToBottom, onSessionComplete, userSubject, feedbackContext]);

  // Save draft session when streaming completes
  useEffect(() => {
    if (stage === 'answering' && sessionId && subject && explanation && !draftSaved) {
      setDraftSaved(true);
      fetch('/api/session/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, topic, subject, aiResponse: synthQuestion ? `${explanation}\n[SYNTHESIS_QUESTION]\n${synthQuestion}` : explanation }),
      }).catch(() => {});
    }
  }, [stage, sessionId, subject, explanation, synthQuestion, topic, draftSaved]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/validate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userAnswer: answer.trim(),
          localDate: getLocalDateString(),
          topic,
          explanation,
          synthQuestion,
        }),
      });
      const data = await res.json();
      const isCorrect = data.valid === true;

      if (isCorrect) {
        setFeedback(data.feedback ?? 'Great effort!');
        setXpEarned(data.xpAwarded ?? 10);
        setStage('complete');
        onSessionComplete?.();

        if (data.newXP !== undefined) {
          syncGamification(data.newXP, data.newLevel ?? 1, data.newStreak ?? 0);
          if (data.didLevelUp) triggerLevelUp(data.newLevel);
        }
        if (data.newNode) addSpatialNode(data.newNode);
        if (data.newEdge) addSpatialEdge(data.newEdge);

        setShowXpFloat(true);
        playXPChime().catch(() => {});
        setTimeout(() => setShowXpFloat(false), 1200);
      } else {
        setFeedback(data.feedback ?? 'Not quite — give it another shot!');
      }
      setAnswer('');
      if (textareaRef.current) {
        textareaRef.current.style.removeProperty('height');
        setIsCompact(true);
      }
    } catch (err) {
      console.error('[session] validate error:', err);
      setFeedback('Something went wrong. Try again.');
      setAnswer('');
      if (textareaRef.current) {
        textareaRef.current.style.removeProperty('height');
        setIsCompact(true);
      }
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    abortRef.current?.abort();
    setAnswer('');
    setIsExpanded(false);
    if (textareaRef.current) textareaRef.current.style.removeProperty('height');
    setIsCompact(true);
    onClose();
  };

  const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    const scrollH = el.scrollHeight;
    if (scrollH <= 40) {
      el.style.removeProperty('height');
      setIsCompact(true);
    } else {
      el.style.height = Math.min(scrollH, 200) + 'px';
      setIsCompact(false);
    }
  }, []);

  useEffect(() => {
    if (!answer) {
      setIsCompact(true);
      if (textareaRef.current) textareaRef.current.style.removeProperty('height');
      return;
    }
    if (textareaRef.current) autoResize(textareaRef.current);
  }, [answer, autoResize]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAnswer();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          className="fixed inset-0 z-50 bg-bg-primary flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-bg-card border-b border-border-default h-14 flex items-center justify-between px-4 sm:px-6 shrink-0">
            <button onClick={handleClose} className="flex items-center gap-1.5 text-body-md text-text-muted hover:text-text-primary transition-colors">
              <IconArrowLeft size={16} /> Back
            </button>
            {subject && (
              <span
                className="px-3 py-1 rounded-full text-label-sm font-bold uppercase tracking-wider"
                style={{ backgroundColor: SUBJECT_CONTAINER_COLORS[subject], color: SUBJECT_TEXT_COLORS[subject] }}
              >
                {SUBJECT_LABELS[subject] ?? subject}
              </span>
            )}
            <div className="relative w-20 text-right">
              <AnimatePresence>
                {showXpFloat && (
                  <motion.span
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -30 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute right-0 top-0 text-label-lg font-bold"
                    style={{ color: 'var(--color-success)' }}
                  >
                    +{xpEarned} XP
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* User's original topic — right-aligned */}
              <div className="flex justify-end">
                <div>
                  <div className="w-fit max-w-[92%] ml-auto bg-slate-100 dark:bg-[#2A2A2A] rounded-2xl rounded-br-md p-4">
                    <p className="text-body-lg text-text-primary max-w-prose">{topic}</p>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-2 text-text-muted">
                    <div className="relative group">
                      <button
                        onClick={() => { navigator.clipboard.writeText(topic); showTooltipFeedback('copy-topic', 'Copied!'); }}
                        className="p-1.5 rounded-full hover:text-text-primary hover:bg-bg-secondary transition-colors"
                        aria-label="Copy topic"
                      >
                        <IconCopy size={18} />
                      </button>
                      <span className="absolute bottom-full right-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                        {tooltipFeedback['copy-topic'] || 'Copy text'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimalist thinking state — subtle animated dots */}
              {stage === 'streaming' && !explanation && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 px-1 py-5">
                    <div className="flex items-center gap-1">
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-text-muted"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
                      />
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-text-muted"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                      />
                      <motion.span
                        className="w-1.5 h-1.5 rounded-full bg-text-muted"
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                      />
                    </div>
                    <span className="text-body-md text-text-muted font-body">Thinking</span>
                  </div>
                </div>
              )}

              {/* Waya explanation — left-aligned, clean text */}
              {explanation && (
                <div className="flex justify-start">
                  <div className="max-w-[90%]">
                    <div className="text-body-lg text-text-primary font-body leading-relaxed whitespace-pre-wrap">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold text-text-primary mt-6 mb-2">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-bold text-text-primary mt-6 mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-semibold text-text-primary mt-6 mb-2">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-3">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-3">{children}</ol>,
                        li: ({ children }) => <li className="text-body-lg text-text-primary py-1.5">{children}</li>,
                        p: ({ children }) => <p className="text-body-lg text-text-primary mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-brand-primary/30 pl-4 italic text-text-secondary my-2">{children}</blockquote>,
                        code: ({ children }) => <code className="bg-bg-secondary px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>,
                      }}>{cleanMarkdown(explanation)}</ReactMarkdown>
                    </div>
                    {stage !== 'streaming' && (
                      <div className="flex flex-row items-center gap-3 w-full flex-wrap text-text-muted mt-5">
                        <div className="relative group">
                          <button
                            onClick={() => { navigator.clipboard.writeText(explanation); showTooltipFeedback('copy-exp', 'Copied!'); }}
                            className="p-1.5 rounded-full hover:text-text-primary hover:bg-bg-secondary transition-colors"
                            aria-label="Copy text"
                          >
                            <IconCopy size={18} />
                          </button>
                          <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                            {tooltipFeedback['copy-exp'] || 'Copy text'}
                          </span>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() => handleActionClick('good-exp')}
                            className={`p-1.5 rounded-full transition-colors ${clickedActions['good-exp'] ? 'bg-brand-primary/10 text-brand-primary' : 'hover:text-text-primary hover:bg-bg-secondary'}`}
                            aria-label="Good response"
                          >
                            <IconThumbUp size={18} />
                          </button>
                          <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                            {tooltipFeedback['good-exp'] || 'Good response'}
                          </span>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() => handleActionClick('bad-exp')}
                            className={`p-1.5 rounded-full transition-colors ${clickedActions['bad-exp'] ? 'text-red-500 hover:text-red-600' : 'hover:text-text-primary hover:bg-bg-secondary'}`}
                            aria-label="Bad response"
                          >
                            <IconThumbDown size={18} />
                          </button>
                          <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                            {tooltipFeedback['bad-exp'] || 'Bad response'}
                          </span>
                        </div>
                        {clickedActions['bad-exp'] && !chipSubmitted['bad-exp'] && FEEDBACK_CHIPS.map((chip) => (
                          <button key={chip} onClick={() => handleChipClick('bad-exp', chip)}
                            className="text-xs px-3 py-1 rounded-full border border-slate-200 hover:border-slate-400 text-slate-600 cursor-pointer transition-colors">
                            {chip}
                          </button>
                        ))}
                        {chipSubmitted['bad-exp'] && (
                          <span className="text-xs text-green-600">✓ Thanks for the feedback</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Synthesis Challenge — at the bottom of the flow */}
              {synthQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-none w-full">
                    <p className="text-label-sm font-bold text-brand-primary uppercase tracking-wider mb-2">Synthesis Challenge</p>
                    <p className="text-body-lg text-text-primary font-body leading-relaxed">
                      {synthQuestion}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Complete stage */}
              {stage === 'complete' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* User's answer — right-aligned */}
                  <div className="flex justify-end">
                    <div>
                      <div className="w-fit max-w-[92%] ml-auto bg-slate-100 dark:bg-[#2A2A2A] rounded-2xl rounded-br-md p-4">
                        <p className="text-body-lg text-text-primary max-w-prose">{answer}</p>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-2 text-text-muted">
                        <div className="relative group">
                          <button onClick={() => { navigator.clipboard.writeText(answer); showTooltipFeedback('copy-answer', 'Copied!'); }}
                            className="p-1.5 rounded-full hover:text-text-primary hover:bg-bg-secondary transition-colors" aria-label="Copy text">
                            <IconCopy size={18} />
                          </button>
                          <span className="absolute bottom-full right-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                            {tooltipFeedback['copy-answer'] || 'Copy text'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Waya feedback — left-aligned, clean text */}
                  <div className="flex justify-start">
                    <div className="max-w-[90%]">
                      <div className="text-body-lg text-text-primary font-body leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                          h1: ({ children }) => <h1 className="text-xl font-bold text-text-primary mt-6 mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-bold text-text-primary mt-6 mb-2">{children}</h2>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-3">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-3">{children}</ol>,
                        li: ({ children }) => <li className="text-body-md text-text-primary py-1.5">{children}</li>,
                          p: ({ children }) => <p className="text-body-md text-text-primary mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-text-primary">{children}</strong>,
                        }}>{cleanMarkdown(feedback)}</ReactMarkdown>
                      </div>
                      <div className="flex flex-row items-center gap-3 w-full flex-wrap text-text-muted mt-5">
                        <div className="relative group">
                          <button
                            onClick={() => { navigator.clipboard.writeText(feedback); showTooltipFeedback('copy-fb', 'Copied!'); }}
                            className="p-1.5 rounded-full hover:text-text-primary hover:bg-bg-secondary transition-colors"
                            aria-label="Copy text"
                          >
                            <IconCopy size={18} />
                          </button>
                          <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                            {tooltipFeedback['copy-fb'] || 'Copy text'}
                          </span>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() => handleActionClick('good-fb')}
                            className={`p-1.5 rounded-full transition-colors ${clickedActions['good-fb'] ? 'bg-brand-primary/10 text-brand-primary' : 'hover:text-text-primary hover:bg-bg-secondary'}`}
                            aria-label="Good response"
                          >
                            <IconThumbUp size={18} />
                          </button>
                          <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                            {tooltipFeedback['good-fb'] || 'Good response'}
                          </span>
                        </div>
                        <div className="relative group">
                          <button
                            onClick={() => handleActionClick('bad-fb')}
                            className={`p-1.5 rounded-full transition-colors ${clickedActions['bad-fb'] ? 'text-red-500 hover:text-red-600' : 'hover:text-text-primary hover:bg-bg-secondary'}`}
                            aria-label="Bad response"
                          >
                            <IconThumbDown size={18} />
                          </button>
                          <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                            {tooltipFeedback['bad-fb'] || 'Bad response'}
                          </span>
                        </div>
                        {clickedActions['bad-fb'] && !chipSubmitted['bad-fb'] && FEEDBACK_CHIPS.map((chip) => (
                          <button key={chip} onClick={() => handleChipClick('bad-fb', chip)}
                            className="text-xs px-3 py-1 rounded-full border border-slate-200 hover:border-slate-400 text-slate-600 cursor-pointer transition-colors">
                            {chip}
                          </button>
                        ))}
                        {chipSubmitted['bad-fb'] && (
                          <span className="text-xs text-green-600">✓ Thanks for the feedback</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Session complete card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
                    className="bg-bg-card border border-border-default rounded-xl p-8 text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                      <IconCheck size={24} style={{ color: 'var(--color-success)' }} />
                    </div>
                    <p className="text-headline-sm text-text-primary font-heading mb-1">Session Complete</p>
                    <p className="text-body-md text-text-muted mb-4">You earned <span className="font-bold" style={{ color: 'var(--color-success)' }}>+{xpEarned} XP</span></p>
                    <Button onClick={handleClose} size="lg" className="px-10">
                      Back To Study
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Answer input — always sticky at bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 border-t border-border-default bg-bg-primary px-4 sm:px-6 py-4"
          >
            <div className="max-w-3xl mx-auto">
              {feedback && (
                <div className="mb-3 px-4 py-3 rounded-2xl border-l-4" style={{ backgroundColor: 'var(--color-ask-card-bg)', borderColor: 'var(--color-warning)' }}>
                  <p className="text-body-md text-text-primary">{feedback}</p>
                </div>
              )}
              {stage === 'complete' ? null : stage === 'streaming' ? (
                <div className="w-full bg-bg-card border-2 border-border-default rounded-full px-5 h-[60px] flex items-center opacity-50">
                  <span className="text-body-md text-text-muted font-body">Waya is crafting your lesson...</span>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSubmitAnswer(); }}
                  className={`w-full bg-bg-card border-2 border-border-default transition-all ${isCompact ? 'flex flex-row items-center h-[60px] rounded-full px-4' : 'flex flex-col rounded-2xl'}`}
                >
                  <textarea
                    ref={textareaRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer..."
                    rows={1}
                    className={`bg-transparent text-text-primary font-body text-body-lg placeholder:text-text-muted resize-none border-none outline-none ${isCompact ? 'flex-1 py-0' : 'w-full px-4 pt-3 pb-1 min-h-0 max-h-[200px] overflow-y-auto'}`}
                  />
                  {!isCompact && (
                  <div className="flex justify-between items-center w-full px-3 pb-3">
                    {answer.length > 0 && (
                      <div className="relative group">
                        <button
                          onClick={() => setIsExpanded(true)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                          aria-label="Expand"
                        >
                          <IconArrowsMaximize size={20} />
                        </button>
                        <span className="absolute bottom-full left-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                          Expand
                        </span>
                      </div>
                    )}
                    <div className="relative group ml-auto">
                      <button
                        type="submit"
                        onClick={handleSubmitAnswer}
                        disabled={!answer.trim() || isSubmitting}
                        className="bg-brand-primary text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                        aria-label="Submit answer"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} />
                        ) : (
                          <IconArrowUp size={18} />
                        )}
                      </button>
                      <span className="absolute bottom-full right-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                        Submit
                      </span>
                    </div>
                  </div>
                  )}
                  {isCompact && (
                  <div className="relative group shrink-0">
                    <button
                      type="submit"
                      onClick={handleSubmitAnswer}
                      disabled={!answer.trim() || isSubmitting}
                      className="bg-brand-primary text-white p-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Submit answer"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} />
                      ) : (
                        <IconArrowUp size={18} />
                      )}
                    </button>
                    <span className="absolute bottom-full right-0 mb-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-bottom scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                      Submit
                    </span>
                  </div>
                  )}
                </form>
              )}
            </div>
          </motion.div>

          {/* Full-screen expanded modal */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                className="fixed inset-0 z-50 bg-bg-primary flex flex-col"
              >
                <div className="flex items-center justify-end px-6 sm:px-10 pt-6 sm:pt-8 pb-4">
                  <div className="relative group">
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors"
                      aria-label="Close"
                    >
                      <IconX size={20} />
                    </button>
                    <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-md text-label-sm font-body font-medium whitespace-nowrap bg-bg-card border border-border-default text-text-secondary transition-all duration-200 origin-top scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 delay-0 group-hover:delay-[6000ms] pointer-events-none shadow-sm">
                      Close
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col px-6 sm:px-10 pb-6 sm:pb-10 max-w-4xl mx-auto w-full">
                  <h2 className="text-headline-md text-text-primary font-heading mb-8">Type your answer</h2>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onInput={(e) => autoResize(e.currentTarget)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer here..."
                    className="w-full flex-1 min-h-[240px] bg-bg-card border-2 border-border-default rounded-2xl p-6 text-body-lg text-text-primary font-body placeholder:text-text-muted resize-none outline-none focus:outline-none focus:border-slate-200 dark:focus:border-slate-800 transition-colors"
                    autoFocus
                  />
                  <div className="flex justify-center mt-6">
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={!answer.trim() || isSubmitting}
                      size="lg"
                      className="px-12"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 rounded-full border-2 border-brand-on-primary/30 border-t-brand-on-primary animate-spin" style={{ animationDuration: '0.65s' }} />
                      ) : (
                        'Submit Answer'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
