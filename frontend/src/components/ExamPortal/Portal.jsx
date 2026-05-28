// src/components/ExamPortal/Portal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";
import { AlertCircle, Camera, CheckCircle2, Clock, ShieldAlert, Terminal, Loader2 } from "lucide-react";
import apiClient from "../Auth/ApiClient";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../ui/card";
import { Button } from "../ui/button";

const ExamPortal = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [examStatus, setExamStatus] = useState('not-started');
  const [score, setScore] = useState(0);
  const [warningCount, setWarningCount] = useState(0);

  // Webcam states
  const [imageSrc, setImageSrc] = useState("");
  const [focusStatus, setFocusStatus] = useState("Checking...");
  const [error, setError] = useState(null);

  // Refs for webcam and timers
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const focusLossTimerRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  // Questions state
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize webcam
  useEffect(() => {
    let frameInterval;

    const initializeWebcam = async () => {
      try {
        console.log("Initializing webcam...");
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

        socketRef.current.on('connect', () => {
          console.log("Socket connected");
        });

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
          if (videoRef.current && videoRef.current.readyState === 4 && socketRef.current?.connected) {
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
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

    if (examStatus === 'in-progress') {
      initializeWebcam();
      setWarningCount(0);
    }

    return () => {
      clearInterval(frameInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [examStatus]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (examStatus === 'in-progress' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStatus]);

  // Track focus loss
  useEffect(() => {
    const FOCUS_LOSS_THRESHOLD = 5000;
    let focusLossTimeout;

    const handleFocusLoss = () => {
      const newWarningCount = warningCount + 1;
      setWarningCount(newWarningCount);

      if (newWarningCount >= 3) {
        if (examStatus === 'in-progress') {
          handleSubmit();
          setWarningCount(0);
        }
      }
    };

    if (focusLossTimerRef.current) {
      clearTimeout(focusLossTimerRef.current);
      focusLossTimerRef.current = null;
    }

    if (examStatus === 'in-progress') {
      if (focusStatus !== "Candidate is Focusing!") {
        focusLossTimeout = setTimeout(handleFocusLoss, FOCUS_LOSS_THRESHOLD);
      }
    }

    return () => {
      if (focusLossTimerRef.current) clearTimeout(focusLossTimerRef.current);
      if (focusLossTimeout) clearTimeout(focusLossTimeout);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [focusStatus, examStatus, warningCount]);

  const handleSubmit = () => {
    let correctAnswers = questions.reduce((count, question, index) =>
      selectedAnswers[index] === question.options.findIndex(option => option.correct || option.isCorrect) ? count + 1 : count,
      0
    );
    setScore((correctAnswers / questions.length) * 100);

    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }

    setExamStatus('completed');
  };

  return (
    <div className="pt-24 min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white pb-20 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 space-y-6">

        {/* Top Telemetry Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 shadow-sm gap-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-zinc-500" />
            <h1 className="text-xl font-bold tracking-tight">Active Assessment Node</h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
            {examStatus === 'in-progress' && (
              <>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-bold uppercase tracking-widest ${focusStatus === "Candidate is Focusing!"
                  ? 'bg-zinc-950 border-zinc-800 text-zinc-400'
                  : 'bg-red-950/30 border-red-900/50 text-red-500 animate-pulse'
                  }`}>
                  {focusStatus === "Candidate is Focusing!" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  {focusStatus === "Candidate is Focusing!" ? 'TRACKING LOCKED' : 'ALERT: FOCUS LOST'}
                </div>
                <div className={`px-3 py-1.5 rounded-md border text-xs font-bold uppercase tracking-widest ${warningCount > 0 ? 'bg-red-950/20 border-red-900/30 text-red-400' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                  Strikes: {warningCount}/3
                </div>
              </>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-900 text-sm font-bold font-mono border border-zinc-300 shadow-sm">
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Hardware Monitoring Viewport */}
          {examStatus === 'in-progress' && (
            <div className="lg:col-span-1">
              <Card className="bg-zinc-950 border-zinc-800 h-full">
                <CardHeader className="border-b border-zinc-800/80 pb-4">
                  <CardTitle className="text-sm uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Optical Array
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden relative border border-zinc-800">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover grayscale contrast-125"
                      style={{ position: 'absolute', opacity: 0 }}
                    />
                    {error ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-red-950/10 p-4 text-center">
                        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs uppercase tracking-widest font-bold">{error}</span>
                      </div>
                    ) : imageSrc ? (
                      <img
                        src={imageSrc}
                        alt="Processed Video Feed"
                        className="w-full h-full object-cover grayscale contrast-125 opacity-80 mix-blend-screen"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
                        <span className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin"></span>
                        <span className="text-xs uppercase tracking-widest font-bold">Initializing Optics...</span>
                      </div>
                    )}

                    {/* Viewport Overlay UI */}
                    <div className="absolute inset-0 pointer-events-none border-[4px] border-zinc-900/50 rounded-lg"></div>
                    <div className="absolute top-2 left-2 pointer-events-none">
                      <span className="bg-red-500 animate-pulse w-2 h-2 block rounded-full"></span>
                    </div>
                    <div className="absolute bottom-2 right-2 pointer-events-none">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">SYS.REC.ACTIVE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Assessment Main Box */}
          <div className={`lg:col-span-${examStatus === 'in-progress' ? '2' : '3'}`}>
            <Card className="bg-zinc-950 border-zinc-800 shadow-xl h-full">
              {examStatus === 'not-started' && (
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-12 min-h-[400px]">
                  <ShieldAlert className="w-12 h-12 text-zinc-700 mb-6" />
                  <h2 className="text-2xl font-bold mb-3 tracking-tight">Python Competency Protocol</h2>
                  <p className="text-zinc-400 mb-8 max-w-md text-sm leading-relaxed">
                    You have exactly 10 minutes to complete this assessment. Strict optical monitoring and device telemetry will be enforced. A 3-strike rule applies to optical deviations.
                  </p>
                  <Button
                    onClick={async () => {
                      try {
                        setLoadingQuestions(true);
                        const res = await apiClient.post('/public/questions', {
                          jd: "Software Engineer focusing on React and Spring Boot",
                          resume: "Experienced developer with solid background in building scalable web applications. Proficient in React, Node, and Spring Boot.",
                          certifiedSkills: ["React", "Java", "Spring Boot"]
                        });
                        // GlobalResponseHandler wraps the List<QuestionDTO> into res.data.data
                        const questionData = res.data?.data;
                        if (questionData && questionData.length > 0) {
                          setQuestions(questionData);
                        } else {
                          // Fallback if empty response
                          setQuestions([
                            {
                              id: "FALLBACK-1",
                              difficulty: "Medium",
                              story: "You need to build a secure web application.",
                              question: "What is the primary purpose of HTTPS?",
                              options: [
                                { text: "To encrypt data over the network", isCorrect: true },
                                { text: "To compress HTML responses", isCorrect: false },
                                { text: "To format web pages", isCorrect: false },
                                { text: "To enable executing local scripts", isCorrect: false }
                              ]
                            }
                          ]);
                        }
                      } catch (err) {
                        console.error("Failed to load assessment questions", err);
                        // Fallback on error so UI doesn't break
                        setQuestions([
                          {
                            id: "FALLBACK-1",
                            difficulty: "Medium",
                            story: "You need to build a secure web application.",
                            question: "What is the primary purpose of HTTPS?",
                            options: [
                              { text: "To encrypt data over the network", correct: true },
                              { text: "To compress HTML responses", correct: false },
                              { text: "To format web pages", correct: false },
                              { text: "To enable executing local scripts", correct: false }
                            ]
                          }
                        ]);
                      } finally {
                        setLoadingQuestions(false);
                        setExamStatus('in-progress');
                      }
                    }}
                    disabled={loadingQuestions}
                    className="bg-zinc-100 hover:bg-zinc-300 text-zinc-900 font-bold px-8 h-12 text-sm uppercase tracking-wider"
                  >
                    {loadingQuestions ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Gathering Intel...</span>
                    ) : 'Initiate Sequence'}
                  </Button>
                </CardContent>
              )}

              {examStatus === 'in-progress' && (
                <CardContent className="p-6 md:p-8 flex flex-col h-full">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/80">
                      <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                        Block {currentQuestion + 1} <span className="text-zinc-700 mx-1">/</span> {questions.length}
                      </h3>
                      <span className="text-[10px] uppercase font-bold text-zinc-600 bg-zinc-900 px-2 py-1 rounded">
                        Diff: {questions[currentQuestion].difficulty}
                      </span>
                    </div>

                    <div className="mb-6 space-y-4" style={{ userSelect: 'none' }} onContextMenu={(e) => e.preventDefault()}>
                      <div className="text-sm text-zinc-400 leading-relaxed bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 border-l-2 border-l-zinc-600">
                        {questions[currentQuestion].story}
                      </div>
                      <p className="text-zinc-200 font-medium text-lg leading-snug">
                        {questions[currentQuestion].question}
                      </p>
                    </div>

                    <div className="space-y-3" style={{ userSelect: 'none' }} onContextMenu={(e) => e.preventDefault()}>
                      {questions[currentQuestion].options.map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-start p-4 rounded-xl cursor-pointer border transition-colors duration-200 ${selectedAnswers[currentQuestion] === index
                            ? 'bg-zinc-900 border-zinc-600 shadow-sm'
                            : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900/50 hover:border-zinc-700'
                            }`}
                        >
                          <div className="mt-0.5 mr-4 flex-shrink-0">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedAnswers[currentQuestion] === index
                              ? 'border-zinc-300 bg-zinc-300'
                              : 'border-zinc-600'
                              }`}>
                              {selectedAnswers[currentQuestion] === index && <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                            </div>
                          </div>
                          <span className={`text-sm leading-relaxed ${selectedAnswers[currentQuestion] === index ? 'text-zinc-200' : 'text-zinc-400'}`}>
                            {option.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-8 pt-6 border-t border-zinc-800/80">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestion === 0}
                      className="border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    >
                      Step Back
                    </Button>

                    {currentQuestion === questions.length - 1 ? (
                      <Button
                        onClick={handleSubmit}
                        className="bg-zinc-100 hover:bg-zinc-300 text-zinc-900 font-bold"
                      >
                        Commit Assessment
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium border-zinc-700"
                      >
                        Step Forward
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}

              {examStatus === 'completed' && (
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
                  <CheckCircle2 className="w-16 h-16 text-zinc-600 mb-4" />
                  <h2 className="text-2xl font-bold mb-2 tracking-tight">Transmission Terminated</h2>

                  <div className="my-8">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Final Authorization Score</p>
                    <p className="text-6xl font-black text-zinc-100 font-mono tracking-tighter">{score.toFixed(1)}<span className="text-2xl text-zinc-600">%</span></p>
                  </div>

                  <div className="w-full max-w-sm mb-8 p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                      <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">Node Queries</span>
                      <span className="font-mono text-zinc-300">{questions.length}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                      <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">Valid Responses</span>
                      <span className="font-mono text-zinc-300">{Math.round((score / 100) * questions.length)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                      <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">Duration</span>
                      <span className="font-mono text-zinc-300">{formatTime(600 - timeLeft)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">Optical Deviations</span>
                      <span className={`font-mono ${warningCount > 0 ? 'text-red-400' : 'text-zinc-300'}`}>{warningCount}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setExamStatus('not-started');
                        setTimeLeft(600);
                        setCurrentQuestion(0);
                        setSelectedAnswers({});
                        setScore(0);
                        setWarningCount(0);
                      }}
                      className="flex-1 border-zinc-800 text-zinc-400 hover:bg-zinc-900"
                    >
                      Re-Initialize
                    </Button>
                    <Button
                      onClick={() => {
                        const results = {
                          score: score,
                          timeSpent: 600 - timeLeft,
                          warningCount: warningCount,
                          answers: selectedAnswers,
                          completedAt: new Date().toISOString()
                        };
                        const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'exam-telemetry.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="flex-1 bg-zinc-100 hover:bg-zinc-300 text-zinc-900 font-bold"
                    >
                      Export Logs
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPortal;