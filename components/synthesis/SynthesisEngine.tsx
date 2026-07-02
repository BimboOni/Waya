'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { TopicInput } from './TopicInput';
import { ExplanationStream } from './ExplanationStream';
import { AnswerInput } from './AnswerInput';
import { Card } from '@/components/ui/Card';
import { useWayaStore } from '@/store/useWayaStore';
import { TOAST_MESSAGES, XP_MAX_PER_SESSION } from '@/lib/constants';
import { calculateLevel } from '@/lib/gamification';

type Stage = 'idle' | 'streaming' | 'answering' | 'complete';

export function SynthesisEngine() {
  const { xp, syncGamification, addSpatialNode, addSpatialEdge, setToastMessage, triggerLevelUp } =
    useWayaStore();

  const [stage, setStage] = useState<Stage>('idle');
  const [explanation, setExplanation] = useState('');
  const [synthesisQuestion, setSynthesisQuestion] = useState('');
  const [subject, setSubject] = useState('ScienceTech');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleTopicSubmit = async (topic: string) => {
    abortRef.current?.abort();

    setStage('streaming');
    setExplanation('');
    setSynthesisQuestion('');
    setFeedback(null);

    // Create a new AbortController with a 25-second timeout
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      console.log('[synthesis] Fetching /api/synthesis with topic:', topic);
      const response = await fetch('/api/synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        signal: controller.signal,
        body: JSON.stringify({ topic: topic.trim() }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('[synthesis] API error:', response.status, err);
        throw new Error(err.error ?? `API error ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let streamedText = '';
      let sessionId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.replace('data: ', '').trim();
          if (payload === '[DONE]') break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) {
              setToastMessage(TOAST_MESSAGES.AI_TIMEOUT);
              setStage('idle');
              return;
            }
            if (parsed.delta) {
              streamedText += parsed.delta;
              setExplanation(streamedText);
            }
            if (parsed.sessionId) {
              sessionId = parsed.sessionId;
            }
            if (parsed.subject) {
              setSubject(parsed.subject);
            }
          } catch {
            // skip malformed chunks
          }
        }
      }

      if (sessionId) {
        setCurrentSessionId(sessionId);
        const [expPart, qPart] = streamedText.split(/\[synthesis_question\]/i);
        setExplanation(expPart.replace('[EXPLANATION]\n', '').trim());
        setSynthesisQuestion(qPart?.trim() ?? '');
        setStage('answering');
      } else {
        setToastMessage(TOAST_MESSAGES.AI_TIMEOUT);
        setStage('idle');
      }
    } catch {
      setToastMessage(TOAST_MESSAGES.AI_TIMEOUT);
      setStage('idle');
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!currentSessionId) return;

    try {
      const response = await fetch('/api/validate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: currentSessionId,
          userAnswer: answer.trim(),
          localDate: new Date().toLocaleDateString('en-CA'),
          topic: '',  // send empty — the route extracts it from the explanation below
          explanation: explanation,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('[synthesis] Validation error:', response.status, 'body:', err);
        setToastMessage(`Validation failed (${response.status})`);
        throw new Error(err.error ?? 'Validation failed');
      }

      const result = await response.json();

      if (result.valid) {
        syncGamification(result.newXP, result.newLevel, result.newStreak);
        setToastMessage(TOAST_MESSAGES.XP_AWARDED(result.xpAwarded));
        setFeedback(result.feedback);
        setSubject(result.subject);

        if (result.newNode) addSpatialNode(result.newNode);
        if (result.newEdge) addSpatialEdge(result.newEdge);

        const prevLevel = calculateLevel(xp);
        if (result.newLevel > prevLevel) triggerLevelUp(result.newLevel);

        setStage('complete');
      } else {
        setFeedback(result.feedback);
        setToastMessage('Keep trying! ' + (result.feedback ?? ''));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI_TIMEOUT';
      console.error('[synthesis] Answer submit error:', msg);
      setToastMessage(msg !== 'AI_TIMEOUT' ? `Error: ${msg}` : TOAST_MESSAGES.AI_TIMEOUT);
    }
  };

  const handleReset = () => {
    abortRef.current?.abort();
    setStage('idle');
    setExplanation('');
    setSynthesisQuestion('');
    setCurrentSessionId(null);
    setFeedback(null);
  };

  return (
    <Card elevated className="p-5 sm:p-6 flex flex-col gap-6">
      <TopicInput onSubmit={handleTopicSubmit} isLoading={stage === 'streaming'} />

      <AnimatePresence mode="wait">
        {(stage === 'streaming' || stage === 'answering' || stage === 'complete') && (
          <motion.div
            key="explanation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <ExplanationStream
              explanation={explanation}
              synthesisQuestion={stage === 'complete' ? '' : synthesisQuestion}
              subject={subject}
              isStreaming={stage === 'streaming'}
            />
          </motion.div>
        )}

        {stage === 'answering' && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          >
            <AnswerInput onSubmit={handleAnswerSubmit} isLoading={false} />
          </motion.div>
        )}

        {stage === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-5 py-8 text-center"
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-success-container)' }}>
              <CheckCircle size={28} className="text-success" />
            </div>
            <div className="flex flex-col gap-1.5 max-w-sm">
              <h3 className="text-headline-md text-text-primary font-heading">Synthesis complete!</h3>
              {feedback && <p className="text-body-md text-text-secondary font-body">{feedback}</p>}
              <p className="text-body-md font-body" style={{ color: 'var(--color-xp)' }}>+{XP_MAX_PER_SESSION} XP earned</p>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-label-lg text-brand-primary font-body font-medium hover:text-brand-hover transition-colors duration-default ease-waya focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-sm"
            >
              Explore another topic →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
