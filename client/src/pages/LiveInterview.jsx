import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';

// ── Voice Activity Detection (silence = 1.8s) ───────────────────
const SILENCE_MS   = 1800;   // stop listening after 1.8s silence
const NO_RESPONSE_MS = 60_000; // repeat question after 1 minute of no response
const INTRO_PROMPT =
  "Let's begin with a quick introduction. Please introduce yourself, your background, and your recent experience in about 60 to 90 seconds.";

// ── States ───────────────────────────────────────────────────────
const STATES = {
  LOADING:    'loading',     // AI generating first question
  AI_SPEAK:   'ai_speaking', // AI question is being read aloud (TTS)
  LISTENING:  'listening',   // mic ON, user speaking
  PROCESSING: 'processing',  // sending to AI
  FEEDBACK:   'feedback',    // brief AI reaction shown
  DONE:       'done',        // interview complete
};

const LiveInterview = () => {
  const { id } = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();

  const session       = location.state?.session;
  const firstQuestion = location.state?.firstQuestion;

  // ── state ──────────────────────────────────────────────────────
  const [uiState, setUiState]             = useState(STATES.LOADING);
  const [currentQuestion, setCurrentQ]   = useState('');
  const [currentQNum, setCurrentQNum]    = useState(0);
  const [userTranscript, setTranscript]  = useState('');
  const [interimText, setInterim]        = useState('');
  const [aiFeedback, setAiFeedback]      = useState('');
  const [conversationHistory, setHistory] = useState([]);
  const [micAllowed, setMicAllowed]      = useState(false);
  const [dots, setDots]                  = useState('');

  // ── refs ───────────────────────────────────────────────────────
  const recognitionRef  = useRef(null);
  const silenceTimer    = useRef(null);
  const noResponseTimer = useRef(null);
  const utteranceRef    = useRef(null);
  const transcriptRef   = useRef('');
  const currentQuestionRef = useRef('');
  const handleAnswerRef = useRef(null);
  const startListeningRef = useRef(null);
  const finishInterviewRef = useRef(null);

  const totalQ = session?.totalQuestions || 5;

  useEffect(() => {
    currentQuestionRef.current = currentQuestion;
  }, [currentQuestion]);

  // Animated dots for "AI is thinking"
  useEffect(() => {
    if (uiState !== STATES.PROCESSING && uiState !== STATES.LOADING) return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(t);
  }, [uiState]);

  // ── TTS: AI speaks the question ────────────────────────────────
  const speakText = useCallback((text, onDone) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate  = 0.92;
    utter.pitch = 1.0;
    // prefer a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes('Google UK English Female') ||
      v.name.includes('Samantha') ||
      v.name.includes('Karen') ||
      v.name.includes('Female')
    );
    if (preferred) utter.voice = preferred;
    utter.onend = () => onDone && onDone();
    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, []);

  const clearNoResponseTimeout = useCallback(() => {
    if (noResponseTimer.current) {
      clearTimeout(noResponseTimer.current);
      noResponseTimer.current = null;
    }
  }, []);

  const scheduleNoResponseTimeout = useCallback(() => {
    clearNoResponseTimeout();
    noResponseTimer.current = setTimeout(() => {
      if (transcriptRef.current.trim().length > 2) return;

      recognitionRef.current?.abort();

      const repeatText = `I did not hear your response. I will repeat the question. ${
        currentQuestionRef.current || 'Please introduce yourself.'
      }`;

      setUiState(STATES.AI_SPEAK);
      speakText(repeatText, () => {
        setUiState(STATES.LISTENING);
        startListeningRef.current?.();
      });
    }, NO_RESPONSE_MS);
  }, [clearNoResponseTimeout, speakText]);

  // ── STT: Start mic ─────────────────────────────────────────────
  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported. Use Chrome or Edge.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous      = true;
    rec.interimResults  = true;
    rec.lang            = 'en-IN';  // Indian English
    rec.maxAlternatives = 1;

    transcriptRef.current = '';
    setTranscript('');
    setInterim('');

    rec.onresult = (e) => {
      let interim = '';
      let final   = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t + ' ';
        else interim += t;
      }
      if (final) {
        transcriptRef.current += final;
        setTranscript(transcriptRef.current);
      }
      setInterim(interim);

      // Any speech activity resets the no-response timeout.
      scheduleNoResponseTimeout();

      // Reset silence timer every time user speaks
      clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        if (transcriptRef.current.trim().length > 3) {
          rec.stop();
        }
      }, SILENCE_MS);
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        toast.error(`Mic error: ${e.error}`);
      }
    };

    rec.onend = () => {
      clearTimeout(silenceTimer.current);
      clearNoResponseTimeout();
      const answer = transcriptRef.current.trim();
      if (answer.length > 2) {
        handleAnswerRef.current?.(answer);
      } else {
        // Nothing captured — show manual fallback
        setUiState(STATES.LISTENING);
      }
    };

    recognitionRef.current = rec;
    rec.start();
    setUiState(STATES.LISTENING);
    scheduleNoResponseTimeout();
  }, [clearNoResponseTimeout, scheduleNoResponseTimeout]);

  // ── Stop mic manually ─────────────────────────────────────────
  const stopListening = () => {
    clearTimeout(silenceTimer.current);
    clearNoResponseTimeout();
    recognitionRef.current?.stop();
  };

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  // ── Show first question once loaded ───────────────────────────
  useEffect(() => {
    if (!session || !firstQuestion) {
      navigate('/interview-setup');
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        setMicAllowed(true);
        setCurrentQ(INTRO_PROMPT);
        setHistory([{ role: 'assistant', content: INTRO_PROMPT }]);
        setUiState(STATES.AI_SPEAK);
        speakText(INTRO_PROMPT, () => {
          setUiState(STATES.LISTENING);
          startListening();
        });
      })
      .catch(() => {
        toast.error('Microphone access denied. Please allow mic in browser settings.');
        setMicAllowed(false);
        setCurrentQ(INTRO_PROMPT);
        setHistory([{ role: 'assistant', content: INTRO_PROMPT }]);
        setUiState(STATES.AI_SPEAK);
      });

    return () => {
      window.speechSynthesis.cancel();
      clearTimeout(silenceTimer.current);
      clearNoResponseTimeout();
      recognitionRef.current?.abort();
    };
  }, [clearNoResponseTimeout, navigate, session, firstQuestion, speakText, startListening]);

  // ── Handle user answer → send to AI ───────────────────────────
  const handleAnswer = useCallback(async (answer) => {
    if (!answer?.trim()) return;

    window.speechSynthesis.cancel();
    clearNoResponseTimeout();
    setUiState(STATES.PROCESSING);
    setTranscript(answer);
    setInterim('');

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: answer },
    ];
    setHistory(updatedHistory);

    try {
      const { data } = await interviewAPI.respond(id, {
        userAnswer: answer,
        conversationHistory: updatedHistory,
        questionNumber: currentQNum,
        totalQuestions: totalQ,
        level: session?.level || 'Junior',
      });

      if (!data.success) throw new Error(data.message);

      const newHistory = [
        ...updatedHistory,
        ...(data.nextQuestion ? [{ role: 'assistant', content: data.nextQuestion }] : []),
      ];
      setHistory(newHistory);
      setAiFeedback(data.feedback || '');
      setUiState(STATES.FEEDBACK);

      // Show brief feedback for 2s, then speak next question
      setTimeout(() => {
        if (data.isLast || !data.nextQuestion) {
          finishInterviewRef.current?.(newHistory);
        } else {
          const nextNum = currentQNum + 1;
          setCurrentQNum(nextNum);
          setCurrentQ(data.nextQuestion);
          setTranscript('');
          setInterim('');
          setUiState(STATES.AI_SPEAK);
          speakText(data.nextQuestion, () => {
            startListeningRef.current?.();
          });
        }
      }, 2000);
    } catch {
      toast.error('AI failed to respond. Please try again.');
      setUiState(STATES.LISTENING);
    }
  }, [clearNoResponseTimeout, conversationHistory, currentQNum, id, session, totalQ, speakText]);

  useEffect(() => {
    handleAnswerRef.current = handleAnswer;
  }, [handleAnswer]);

  // ── Finish — get full evaluation ──────────────────────────────
  const finishInterview = useCallback(async (history) => {
    setUiState(STATES.DONE);
    try {
      const { data } = await interviewAPI.finish(id, {
        conversationHistory: history || conversationHistory,
        level: session?.level || 'Junior',
      });
      if (!data.success) throw new Error(data.message);
      navigate(`/feedback/${data.sessionId}`, { state: { evaluation: data.evaluation } });
    } catch {
      toast.error('Could not save results. Redirecting to dashboard.');
      navigate('/dashboard');
    }
  }, [conversationHistory, id, navigate, session]);

  useEffect(() => {
    finishInterviewRef.current = finishInterview;
  }, [finishInterview]);

  // ── Manual text submit (fallback when mic fails) ──────────────
  const manualInputRef = useRef(null);
  const handleManualSubmit = () => {
    const val = manualInputRef.current?.value?.trim();
    if (!val) return toast.error('Please type your answer first');
    if (recognitionRef.current) recognitionRef.current.abort();
    handleAnswer(val);
    if (manualInputRef.current) manualInputRef.current.value = '';
  };

  // ── Progress ──────────────────────────────────────────────────
  const progress = Math.round((Math.max(0, currentQNum) / totalQ) * 100);

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-800">
        <div
          className="h-full bg-indigo-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Live Interview</p>
            <h1 className="text-base font-bold text-white capitalize">
              {session?.role || 'Interview'} · {session?.level || 'Junior'}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Question</span>
            <p className="text-lg font-bold text-indigo-400">
              {currentQNum === 0 ? 'Intro' : currentQNum}{' '}
              <span className="text-gray-600 text-sm font-normal">/ {totalQ}</span>
            </p>
          </div>
        </div>

        {/* AI Avatar + Status */}
        <div className="flex flex-col items-center gap-3 py-4">
          {/* Pulsing avatar */}
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
            uiState === STATES.AI_SPEAK   ? 'bg-indigo-600 animate-pulse' :
            uiState === STATES.LISTENING  ? 'bg-gray-800' :
            uiState === STATES.PROCESSING ? 'bg-indigo-900' :
            uiState === STATES.FEEDBACK   ? 'bg-emerald-800' :
                                            'bg-gray-800'
          }`}>
            <span className="text-3xl">
              {uiState === STATES.AI_SPEAK   ? '🔊' :
               uiState === STATES.LISTENING  ? '🎤' :
               uiState === STATES.PROCESSING ? '🧠' :
               uiState === STATES.FEEDBACK   ? '💬' :
               uiState === STATES.DONE       ? '✅' : '⏳'}
            </span>
            {(uiState === STATES.AI_SPEAK || uiState === STATES.PROCESSING) && (
              <span className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-30" />
            )}
          </div>

          <p className={`text-sm font-medium ${
            uiState === STATES.AI_SPEAK   ? 'text-indigo-300' :
            uiState === STATES.LISTENING  ? 'text-green-400' :
            uiState === STATES.PROCESSING ? 'text-yellow-400' :
            uiState === STATES.FEEDBACK   ? 'text-emerald-400' :
                                            'text-gray-400'
          }`}>
            {uiState === STATES.LOADING    ? `Preparing your interview${dots}` :
             uiState === STATES.AI_SPEAK   ? 'AI Interviewer is speaking...' :
             uiState === STATES.LISTENING  ? '🎤 Listening — speak your answer' :
             uiState === STATES.PROCESSING ? `AI is thinking${dots}` :
             uiState === STATES.FEEDBACK   ? 'AI is responding...' :
             uiState === STATES.DONE       ? 'Generating your results...' : ''}
          </p>
        </div>

        {/* Current Question Card */}
        {currentQuestion && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider mb-2">
              {currentQNum === 0 ? 'Introduction' : `Question ${currentQNum}`}
            </p>
            <p className="text-white text-base leading-relaxed">{currentQuestion}</p>
          </div>
        )}

        {/* AI Quick Feedback */}
        {uiState === STATES.FEEDBACK && aiFeedback && (
          <div className="bg-emerald-950 border border-emerald-800 rounded-xl p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">💬</span>
            <p className="text-emerald-300 text-sm leading-relaxed">{aiFeedback}</p>
          </div>
        )}

        {/* User Transcript (live) */}
        {(uiState === STATES.LISTENING || uiState === STATES.PROCESSING) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 min-h-[80px]">
            <p className="text-xs text-gray-500 mb-2">Your answer:</p>
            <p className="text-gray-200 text-sm leading-relaxed">
              {userTranscript}
              <span className="text-gray-500 italic">{interimText}</span>
              {!userTranscript && !interimText && uiState === STATES.LISTENING && (
                <span className="text-gray-600 italic">Start speaking...</span>
              )}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-3">
          {/* Stop listening manually */}
          {uiState === STATES.LISTENING && (
            <button
              onClick={stopListening}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
              Done Speaking — Submit Answer
            </button>
          )}

          {/* Manual text input fallback */}
          {uiState === STATES.LISTENING && !micAllowed && (
            <div className="flex gap-2">
              <input
                ref={manualInputRef}
                type="text"
                placeholder="Type your answer here..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
              />
              <button
                onClick={handleManualSubmit}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all"
              >
                Send
              </button>
            </div>
          )}

          {/* End interview early */}
          {(uiState === STATES.LISTENING || uiState === STATES.AI_SPEAK) && currentQNum > 1 && (
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                recognitionRef.current?.abort();
                finishInterview(conversationHistory);
              }}
              className="w-full py-2 text-sm text-gray-600 hover:text-red-400 transition-colors"
            >
              End interview early
            </button>
          )}
        </div>

        {/* Conversation log (collapsed) */}
        {conversationHistory.length > 2 && (
          <details className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <summary className="text-xs text-gray-500 cursor-pointer select-none">
              📋 View conversation so far ({conversationHistory.length} messages)
            </summary>
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
              {conversationHistory.map((m, i) => (
                <div
                  key={i}
                  className={`text-xs rounded-lg px-3 py-2 ${
                    m.role === 'assistant'
                      ? 'bg-indigo-950 text-indigo-300'
                      : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  <span className="font-bold text-gray-500 mr-1">
                    {m.role === 'assistant' ? 'AI:' : 'You:'}
                  </span>
                  {m.content}
                </div>
              ))}
            </div>
          </details>
        )}

      </div>
    </div>
  );
};

export default LiveInterview;