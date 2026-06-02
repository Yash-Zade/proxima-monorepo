import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { AlertCircle, Camera, CheckCircle2, Clock, ShieldAlert, Terminal, Loader2, ChevronRight, ChevronLeft, Flag } from "lucide-react";
import apiClient from "../lib/apiClient";

const ExamPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { nonCertifiedSkills = [], resume = "", certifiedSkills = [] } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [examStatus, setExamStatus] = useState('not-started');
  const [score, setScore] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

  const [imageSrc, setImageSrc] = useState("");
  const [focusStatus, setFocusStatus] = useState("Checking...");
  const [error, setError] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const focusLossTimerRef = useRef(null);
  const examStatusRef = useRef(examStatus);        // FIX: track status in ref to avoid stale closures
  const warningCountRef = useRef(warningCount);    // FIX: track warnings in ref
  const questionsRef = useRef([]);                 // FIX: track questions in ref
  const selectedAnswersRef = useRef({});           // FIX: track answers in ref
  const timeLeftRef = useRef(600);                 // FIX: track timeLeft in ref
  const scoreRef = useRef(0);                      // FIX: track score in ref

  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Keep refs in sync with state
  useEffect(() => { examStatusRef.current = examStatus; }, [examStatus]);
  useEffect(() => { warningCountRef.current = warningCount; }, [warningCount]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { selectedAnswersRef.current = selectedAnswers; }, [selectedAnswers]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // FIX: handleSubmit uses refs so it never has stale closure issues
  const handleSubmit = useCallback(() => {
    if (examStatusRef.current !== 'in-progress') return; // FIX: prevent double-submit

    const qs = questionsRef.current;
    const answers = selectedAnswersRef.current;

    const correctAnswers = qs.reduce((count, question, index) => {
      const correctIdx = question.options.findIndex(option => option.correct || option.isCorrect);
      return answers[index] === correctIdx ? count + 1 : count;
    }, 0);

    const finalScore = qs.length > 0 ? (correctAnswers / qs.length) * 100 : 0;
    scoreRef.current = finalScore;
    setScore(finalScore);
    setExamStatus('completed');
  }, []); // FIX: no deps needed since all state accessed via refs

  // Webcam init
  useEffect(() => {
    if (examStatus !== 'in-progress') return;

    let frameInterval;
    setWarningCount(0);
    warningCountRef.current = 0;

    const initializeWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } }
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await new Promise((resolve) => {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play();
              resolve();
            };
          });
        }

        socketRef.current = io("https://web-production-28b98.up.railway.app/", {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5
        });

        socketRef.current.on('connect', () => console.log("Socket connected"));

        socketRef.current.on('video_feed', (data) => {
          if (data.image) {
            setImageSrc(`data:image/jpeg;base64,${data.image}`);
            setFocusStatus(data.focus_status);
          }
        });

        const context = canvasRef.current.getContext('2d');
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;

        const sendFrame = () => {
          if (videoRef.current?.readyState === 4 && socketRef.current?.connected) {
            context.drawImage(videoRef.current, 0, 0, 640, 480);
            const frame = canvasRef.current.toDataURL('image/jpeg', 0.7).split(',')[1];
            socketRef.current.emit('video_frame', { frame });
          }
        };

        frameInterval = setInterval(sendFrame, 100);
      } catch (err) {
        console.error("Error in initialization:", err);
        setError(`Camera interface error: ${err.message}`);
        setFocusStatus("Hardware Error");
      }
    };

    initializeWebcam();

    return () => {
      clearInterval(frameInterval);
      streamRef.current?.getTracks().forEach(track => track.stop());
      socketRef.current?.disconnect();
    };
  }, [examStatus]);

  // FIX: Timer — uses ref for handleSubmit, no stale closure
  useEffect(() => {
    if (examStatus !== 'in-progress') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          clearInterval(timer);
          handleSubmit(); // FIX: safe now since handleSubmit uses refs
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStatus, handleSubmit]);

  // FIX: Focus loss — use ref for warningCount, single stable timer, no re-registration on every count change
  useEffect(() => {
    if (examStatus !== 'in-progress') return;

    if (focusStatus === "Candidate is Focusing!") {
      // FIX: clear any pending focus-loss timer when focus is restored
      if (focusLossTimerRef.current) {
        clearTimeout(focusLossTimerRef.current);
        focusLossTimerRef.current = null;
      }
      return;
    }

    // FIX: only set timer if one isn't already running
    if (focusLossTimerRef.current) return;

    focusLossTimerRef.current = setTimeout(() => {
      focusLossTimerRef.current = null;
      if (examStatusRef.current !== 'in-progress') return;

      const newCount = warningCountRef.current + 1;
      warningCountRef.current = newCount;
      setWarningCount(newCount);

      if (newCount >= 3) {
        handleSubmit();
      }
    }, 5000);

    return () => {
      if (focusLossTimerRef.current) {
        clearTimeout(focusLossTimerRef.current);
        focusLossTimerRef.current = null;
      }
    };
  }, [focusStatus, examStatus, handleSubmit]);

  const handleFinishCertification = async () => {
    if (scoreRef.current >= 60 && nonCertifiedSkills.length > 0) {
      setIsSubmittingResult(true);
      try {
        await apiClient.post('/applicants/certified-skills', nonCertifiedSkills);
        navigate('/skills', { state: { message: "Skills Certified Successfully!" } });
      } catch (err) {
        console.error("Failed to certify skills after exam", err);
        navigate('/skills', { state: { message: "Failed to certify skills due to server error." } });
      } finally {
        setIsSubmittingResult(false);
      }
    } else {
      navigate('/skills');
    }
  };

  // FIX: answer selection extracted to handler so label click works correctly
  const handleSelectAnswer = (questionIndex, optionIndex) => {
    setSelectedAnswers(prev => {
      const updated = { ...prev, [questionIndex]: optionIndex };
      selectedAnswersRef.current = updated;
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#241E1A] font-sans selection:bg-[#F4ECE1] selection:text-[#241E1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">

        {/* Top Telemetry Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-2xl bg-white border border-[#EAE2D5] shadow-sm gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#F4ECE1] rounded-bl-full opacity-30 -z-0" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#F4ECE1] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-[#241E1A]" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider uppercase text-[#241E1A]">Skill Certification Assessment</h1>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">Proctored Session</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto relative z-10">
            {examStatus === 'in-progress' && (
              <>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-colors ${focusStatus === "Candidate is Focusing!"
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                }`}>
                  {focusStatus === "Candidate is Focusing!" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  {focusStatus === "Candidate is Focusing!" ? 'TRACKING LOCKED' : 'ALERT: FOCUS LOST'}
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest ${warningCount > 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-[#FAF6F0] border-[#EAE2D5] text-stone-500'}`}>
                  Strikes: {warningCount}/3
                </div>
              </>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#241E1A] text-[#FDFBF7] text-sm font-bold font-mono border border-[#382F29] shadow-sm">
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* FIX: static Tailwind classes instead of dynamic string interpolation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {examStatus === 'in-progress' && (
            <div className="lg:col-span-1">
              <div className="bg-white border border-[#EAE2D5] rounded-2xl shadow-sm h-full flex flex-col">
                <div className="border-b border-[#EAE2D5] p-4 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-stone-500" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Optical Array</h3>
                </div>
                <div className="p-4 flex-1">
                  <div className="aspect-video bg-[#FAF6F0] rounded-xl overflow-hidden relative border border-[#EAE2D5] shadow-inner">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ position: 'absolute', opacity: 0 }} />
                    {error ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-red-600 bg-red-50 p-4 text-center">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">{error}</span>
                      </div>
                    ) : imageSrc ? (
                      <img src={imageSrc} alt="Processed Video Feed" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-[#241E1A]" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Initializing Optics...</span>
                      </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none border-[3px] border-[#241E1A]/10 rounded-xl" />
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <span className="bg-red-500 animate-pulse w-2 h-2 block rounded-full" />
                    </div>
                    <div className="absolute bottom-2 right-2 pointer-events-none">
                      <span className="text-[8px] font-mono font-bold text-stone-500 uppercase tracking-widest bg-white/80 px-1.5 py-0.5 rounded">SYS.REC.ACTIVE</span>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
                    <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider text-center">Test Subject Guidelines</p>
                    <ul className="text-xs text-stone-600 space-y-2">
                      <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" /> Maintain eye contact with the screen.</li>
                      <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" /> Avoid moving outside the camera frame.</li>
                      <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-stone-300 mt-1.5 shrink-0" /> 3 strikes of lost focus will auto-terminate the exam.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FIX: static col-span classes based on status */}
          <div className={examStatus === 'in-progress' ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-white border border-[#EAE2D5] shadow-sm rounded-2xl h-full flex flex-col">

              {examStatus === 'not-started' && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 min-h-[500px]">
                  <div className="w-16 h-16 rounded-2xl bg-[#F4ECE1] flex items-center justify-center mb-6">
                    <ShieldAlert className="w-8 h-8 text-[#241E1A]" />
                  </div>
                  <h2 className="text-2xl font-black mb-3 tracking-tight text-[#241E1A]">Certification Protocol</h2>
                  <p className="text-stone-500 mb-2 max-w-md text-sm leading-relaxed">
                    You are about to be assessed on your uncertified skills: <span className="font-semibold text-[#241E1A]">{nonCertifiedSkills.join(', ') || 'No skills selected'}</span>.
                  </p>
                  <p className="text-stone-400 mb-8 max-w-md text-[11px] leading-relaxed bg-[#FAF6F0] p-4 rounded-xl border border-[#EAE2D5]">
                    You have exactly 10 minutes. Strict optical monitoring is enforced. A 3-strike rule applies to optical deviations.
                  </p>
                  <button
                    onClick={async () => {
                      if (nonCertifiedSkills.length === 0) { navigate('/skills'); return; }
                      try {
                        setLoadingQuestions(true);
                        const jd = "Software Engineer role requiring expertise in: " + nonCertifiedSkills.join(', ');
                        const res = await apiClient.post('/public/questions', {
                          jd,
                          resume: resume || "Software Engineer",
                          certifiedSkills: certifiedSkills || []
                        });
                        const questionData = res.data?.data || res.data;
                        if (questionData && Array.isArray(questionData) && questionData.length > 0) {
                          setQuestions(questionData);
                          questionsRef.current = questionData;
                        } else {
                          const fallback = [{
                            id: "FALLBACK-1", difficulty: "Medium",
                            story: "You are tasked with reviewing best practices for your uncertified skills.",
                            question: "Which of the following describes a key professional competency?",
                            options: [
                              { text: "Writing clean, maintainable, and documented code", isCorrect: true },
                              { text: "Ignoring best practices for speed", isCorrect: false },
                              { text: "Bypassing security reviews", isCorrect: false },
                              { text: "Hardcoding secrets into source files", isCorrect: false }
                            ]
                          }];
                          setQuestions(fallback);
                          questionsRef.current = fallback;
                        }
                      } catch (err) {
                        console.error("Failed to load assessment questions", err);
                        const fallback = [{
                          id: "FALLBACK-1", difficulty: "Medium",
                          story: "Connection to the question generator failed.",
                          question: "How do you handle a system failure?",
                          options: [
                            { text: "Implement fallback mechanisms and gracefully degrade", isCorrect: true },
                            { text: "Crash the entire application immediately", isCorrect: false },
                            { text: "Ignore the error logs", isCorrect: false },
                            { text: "Blame the database", isCorrect: false }
                          ]
                        }];
                        setQuestions(fallback);
                        questionsRef.current = fallback;
                      } finally {
                        setLoadingQuestions(false);
                        setExamStatus('in-progress');
                      }
                    }}
                    disabled={loadingQuestions || nonCertifiedSkills.length === 0}
                    className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] font-bold px-8 h-12 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-md flex items-center justify-center min-w-[200px]"
                  >
                    {loadingQuestions ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Gathering Intel...</span>
                    ) : 'Initiate Sequence'}
                  </button>
                  {nonCertifiedSkills.length === 0 && (
                    <button onClick={() => navigate('/skills')} className="mt-4 text-xs font-bold text-stone-500 hover:text-[#241E1A] underline transition-colors">
                      Return to Skills Manager
                    </button>
                  )}
                </div>
              )}

              {examStatus === 'in-progress' && questions.length > 0 && (
                <div className="p-6 md:p-8 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EAE2D5]">
                      <h3 className="text-[10px] font-bold tracking-widest uppercase text-stone-500 flex items-center gap-2">
                        <Flag className="w-3.5 h-3.5 text-[#241E1A]" />
                        Node {currentQuestion + 1} <span className="text-stone-300 mx-1">/</span> {questions.length}
                      </h3>
                      <span className="text-[9px] uppercase font-bold text-[#241E1A] bg-[#F4ECE1] border border-[#EAE2D5] px-2.5 py-1 rounded-md">
                        {questions[currentQuestion].difficulty}
                      </span>
                    </div>

                    <div className="mb-8 space-y-5" style={{ userSelect: 'none' }} onContextMenu={e => e.preventDefault()}>
                      {questions[currentQuestion].story && (
                        <div className="text-sm text-stone-600 leading-relaxed bg-[#FAF6F0] p-5 rounded-xl border border-[#EAE2D5] border-l-4 border-l-[#241E1A]">
                          {questions[currentQuestion].story}
                        </div>
                      )}
                      <p className="text-[#241E1A] font-bold text-lg leading-snug">
                        {questions[currentQuestion].question}
                      </p>
                    </div>

                    {/* FIX: onClick on the outer div, not label, so full row is clickable */}
                    <div className="space-y-3" style={{ userSelect: 'none' }} onContextMenu={e => e.preventDefault()}>
                      {questions[currentQuestion].options.map((option, index) => (
                        <div
                          key={index}
                          onClick={() => handleSelectAnswer(currentQuestion, index)}
                          className={`flex items-start p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${
                            selectedAnswers[currentQuestion] === index
                              ? 'bg-white border-[#241E1A] shadow-sm'
                              : 'bg-white border-[#EAE2D5] hover:bg-[#FAF6F0] hover:border-stone-300'
                          }`}
                        >
                          <div className="mt-0.5 mr-4 flex-shrink-0">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                              selectedAnswers[currentQuestion] === index
                                ? 'border-[#241E1A] bg-[#241E1A]'
                                : 'border-stone-300 bg-white'
                            }`}>
                              {selectedAnswers[currentQuestion] === index && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <span className={`text-sm leading-relaxed font-medium ${selectedAnswers[currentQuestion] === index ? 'text-[#241E1A]' : 'text-stone-600'}`}>
                            {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8 pt-6 border-t border-[#EAE2D5]">
                    <button
                      type="button"
                      onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestion === 0}
                      className="bg-white hover:bg-[#FAF6F0] border border-[#EAE2D5] text-[#241E1A] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all disabled:opacity-30 flex items-center gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    {currentQuestion === questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
                      >
                        Commit Assessment <CheckCircle2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                        className="bg-[#241E1A] hover:bg-[#382F29] text-[#FDFBF7] text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {examStatus === 'completed' && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[500px]">
                  <div className="w-16 h-16 rounded-2xl bg-[#F4ECE1] flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-[#241E1A]" />
                  </div>
                  <h2 className="text-2xl font-black mb-2 tracking-tight text-[#241E1A]">Transmission Terminated</h2>

                  <div className="my-8 relative">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-2">Final Authorization Score</p>
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-[#F4ECE1] rounded-3xl transform -rotate-3 scale-105" />
                      <p className="relative text-6xl font-black text-[#241E1A] font-mono tracking-tighter bg-white border-2 border-[#241E1A] px-6 py-4 rounded-3xl shadow-[4px_4px_0_0_#241E1A]">
                        {score.toFixed(0)}<span className="text-3xl text-stone-500">%</span>
                      </p>
                    </div>
                  </div>

                  <div className="w-full max-w-sm mb-8 p-6 bg-white border border-[#EAE2D5] rounded-2xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-center pb-3 border-b border-[#EAE2D5]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Node Queries</span>
                      <span className="font-mono font-bold text-[#241E1A]">{questions.length}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-[#EAE2D5]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Valid Responses</span>
                      <span className="font-mono font-bold text-[#241E1A]">{Math.round((score / 100) * questions.length)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-[#EAE2D5]">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Duration</span>
                      <span className="font-mono font-bold text-[#241E1A]">{formatTime(600 - timeLeft)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Optical Deviations</span>
                      <span className={`font-mono font-bold ${warningCount > 0 ? 'text-red-600' : 'text-[#241E1A]'}`}>{warningCount}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <button
                      onClick={() => {
                        const results = {
                          score, timeSpent: 600 - timeLeft,
                          warningCount, answers: selectedAnswers,
                          completedAt: new Date().toISOString()
                        };
                        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'exam-telemetry.json';
                        document.body.appendChild(a); a.click();
                        document.body.removeChild(a); URL.revokeObjectURL(url);
                      }}
                      className="flex-1 bg-white hover:bg-[#FAF6F0] border border-[#EAE2D5] hover:border-[#241E1A] text-[#241E1A] text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-sm"
                    >
                      Export Logs
                    </button>
                    <button
                      onClick={handleFinishCertification}
                      disabled={isSubmittingResult}
                      className="flex-1 bg-[#241E1A] hover:bg-[#382F29] disabled:opacity-50 text-[#FDFBF7] text-xs font-bold uppercase tracking-wider py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      {isSubmittingResult ? 'Processing...' : (score >= 60 ? 'Apply Certification' : 'Return to Profile')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPortal;