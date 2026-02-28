// src/components/ExamPortal/Portal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { io } from "socket.io-client";

const ExamPortal = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [examStatus, setExamStatus] = useState('not-started');
  const [score, setScore] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [warningOverlay, setWarningOverlay] = useState(false);
  
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

  // Sample questions
  const questions = [
    {
      id: "Q1",
      difficulty: "Medium",
      story: "You're a software developer on a team tasked with creating a new e-commerce website. The initial design calls for a simple, static site using HTML, CSS, and basic JavaScript. However, the client now wants a dynamic, interactive shopping cart that updates in real-time without requiring page reloads. The cart needs to persist data even if the user closes the browser, and should integrate with a backend payment gateway. Your team has decided to use React for the front-end and a Python-based RESTful API for the backend. The database is a PostgreSQL instance.",
      question: "Based on this change in requirements, what are the initial steps you would take to implement the dynamic shopping cart functionality using React and a Python/PostgreSQL backend, focusing specifically on the front-end integration?",
      options: [
        { text: "Start by designing the database schema for the shopping cart data in PostgreSQL, then write the Python API endpoints.", correct: false },
        { text: "Immediately begin coding the React components for the shopping cart, focusing on the user interface and basic interactions. Then, gradually integrate with the backend API.", correct: false },
        { text: "Plan the API endpoints required for the shopping cart in Python, define the data structures, and then build the React components to interact with those endpoints, ensuring proper data handling and state management.", correct: true },
        { text: "Use a pre-built e-commerce solution, minimizing development time.", correct: false }
      ]
    },
    {
      id: "Q2",
      difficulty: "Hard",
      story: "Same story as Q1. You've successfully implemented the basic shopping cart functionality. Now, the client wants to add features for user authentication and authorization. They also want to implement a system for tracking user browsing history for personalized recommendations. The system should be secure and compliant with relevant data privacy regulations.",
      question: "How would you design and implement user authentication and authorization, considering security best practices and data privacy regulations? Outline the key architectural considerations and technologies you'd choose.",
      options: [
        { text: "Use basic session-based authentication and store user data directly in the database without encryption.", correct: false },
        { text: "Implement OAuth 2.0 for authentication and use JWT (JSON Web Tokens) for authorization, storing sensitive data securely using encryption and adhering to relevant data privacy regulations.", correct: true },
        { text: "Store passwords in plain text in the database for ease of access.", correct: false },
        { text: "Ignore data privacy regulations and use user data however is convenient.", correct: false }
      ]
    },
    {
      id: "Q3",
      difficulty: "Medium",
      story: "Same story as Q1 and Q2. The website is now live. However, the team is receiving reports of slow response times, especially during peak hours. The client wants to improve the website's performance and scalability.",
      question: "What steps would you take to diagnose and resolve the performance issues, ensuring the website can handle increased traffic and maintain responsiveness?",
      options: [
        { text: "Ignore the performance issues and hope they go away.", correct: false },
        { text: "Add more servers without optimizing the code.", correct: false },
        { text: "Use performance monitoring tools to identify bottlenecks, optimize database queries, implement caching strategies, and potentially explore load balancing and scaling solutions.", correct: true },
        { text: "Rewrite the entire website from scratch.", correct: false }
      ]
    }
  ];

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
            console.log("Focus status updated:", data.focus_status);
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
        setError(`Webcam error: ${err.message}`);
        setFocusStatus("Error: Cannot access webcam");
      }
    };

    if (examStatus === 'in-progress') {
      initializeWebcam();
      setWarningCount(0); // Reset warning count when exam starts
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
    const FOCUS_LOSS_THRESHOLD = 5000; // 5 seconds
    let focusLossTimeout;

    const handleFocusLoss = () => {
      const newWarningCount = warningCount + 1;
      setWarningCount(newWarningCount);
      
      if (newWarningCount >= 3) {
        // Only submit if the exam is still in progress
        if (examStatus === 'in-progress') {
          handleSubmit();
          setWarningCount(0);
        }
      }
    };

    // Clear any existing timer when focus status changes
    if (focusLossTimerRef.current) {
      clearTimeout(focusLossTimerRef.current);
      focusLossTimerRef.current = null;
    }

    if (examStatus === 'in-progress') {
      if (focusStatus !== "Candidate is Focusing!") {
        // Debounce the focus loss handling
        focusLossTimeout = setTimeout(handleFocusLoss, FOCUS_LOSS_THRESHOLD);
      }
    }

    return () => {
      if (focusLossTimerRef.current) {
        clearTimeout(focusLossTimerRef.current);
      }
      if (focusLossTimeout) {
        clearTimeout(focusLossTimeout);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [focusStatus, examStatus, warningCount]);

  const handleSubmit = () => {
    let correctAnswers = questions.reduce((count, question, index) => 
      selectedAnswers[index] === question.options.findIndex(option => option.correct) ? count + 1 : count,
      0
    );
    setScore((correctAnswers / questions.length) * 100);
    
    // Clear any existing warning overlay
    const existingOverlay = document.getElementById('warning-overlay');
    if (existingOverlay) {
      document.body.removeChild(existingOverlay);
    }
    // Clear any pending timeout
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    
    setExamStatus('completed');
    console.log("Exam submitted. Score:", (correctAnswers / questions.length) * 100);
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-950 overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-gray-950 to-black opacity-90" />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-green-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float" />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float-delay" />
      </div>

      <div className="relative container mx-auto p-4">
        <div className="flex justify-between items-center p-4 mb-6 rounded-lg bg-white/5 backdrop-blur-xl shadow-lg text-white">
          <h1 className="text-2xl font-bold">Online Examination</h1>
          <div className="flex items-center gap-4">
            {examStatus === 'in-progress' && (
              <>
                <div className={`px-4 py-2 rounded-full ${
                  focusStatus === "Candidate is Focusing!" 
                    ? 'bg-emerald-900/50 text-emerald-200' 
                    : 'bg-red-900/50 text-red-200'
                }`}>
                  {focusStatus}
                </div>
                <div className="px-4 py-2 rounded-full bg-gray-900/50">
                  Warnings: {warningCount}/3
                </div>
              </>
            )}
            <span className="font-mono text-xl">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {examStatus === 'in-progress' && (
            <div className="lg:col-span-1">
              <div className="rounded-lg shadow-lg p-4 bg-white/5 backdrop-blur-xl">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ position: 'absolute', opacity: 0 }}
                  />
                  {error ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500">
                      {error}
                    </div>
                  ) : imageSrc ? (
                    <img 
                      src={imageSrc} 
                      alt="Processed Video Feed" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      Loading webcam feed...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className={`lg:col-span-${examStatus === 'in-progress' ? '2' : '3'}`}>
            <div className="rounded-lg shadow-lg p-6 bg-white/5 backdrop-blur-xl text-white">
              {examStatus === 'not-started' && (
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-4">PYTHON skill assessment</h2>
                  <p className=" mb-4">You have 10 minutes to complete this exam. Webcam monitoring and nearby device monitoring will be enabled.</p>
                  <button
                    onClick={() => {
                      console.log("Exam started");
                      setExamStatus('in-progress');
                    }}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300"
                  >
                    Start Exam
                  </button>
                </div>
              )}

              {examStatus === 'in-progress' && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Question {currentQuestion + 1} of {questions.length}
                    </h3>
                    <div className="mb-4" style={{ userSelect: 'none' }} onContextMenu={(e) => e.preventDefault()}>
                      <strong>Story:</strong> {questions[currentQuestion].story}
                    </div>
                    <p className="mb-4" style={{ userSelect: 'none' }} onContextMenu={(e) => e.preventDefault()}>{questions[currentQuestion].question}</p>
                    <div className="space-y-3" style={{ userSelect: 'none' }} onContextMenu={(e) => e.preventDefault()}>
                      {questions[currentQuestion].options.map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-center p-3 rounded-lg cursor-pointer ${
                            selectedAnswers[currentQuestion] === index 
                              ? 'bg-emerald-900/50' 
                              : 'bg-white/5'
                          } hover:bg-white/10 transition-colors duration-200`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion}`}
                            checked={selectedAnswers[currentQuestion] === index}
                            onChange={() => setSelectedAnswers({
                              ...selectedAnswers,
                              [currentQuestion]: index
                            })}
                            className="mr-3"
                          />
                          {option.text}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                      disabled={currentQuestion === 0}
                      className={`px-4 py-2 rounded-lg ${
                        currentQuestion === 0 
                          ? 'bg-gray-700 cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-700'
                      } text-white transition-colors duration-200`}
                    >
                      Previous
                    </button>
                    {currentQuestion === questions.length - 1 ? (
                      <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                      >
                        Submit
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </>
              )}

              {examStatus === 'completed' && (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Exam Completed!</h2>
                  <p className="text-xl mb-4">Your Score: {score.toFixed(1)}%</p>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Exam Summary</h3>
                    <div className="space-y-2 text-left">
                      <p>Total Questions: {questions.length}</p>
                      <p>Correct Answers: {Math.round((score / 100) * questions.length)}</p>
                      <p>Time Taken: {formatTime(600 - timeLeft)}</p>
                      <p>Focus Warnings Received: {warningCount}</p>
                    </div>
                  </div>
                  <div className="space-x-4">
                    <button
                      onClick={() => {
                        setExamStatus('not-started');
                        setTimeLeft(600);
                        setCurrentQuestion(0);
                        setSelectedAnswers({});
                        setScore(0);
                        setWarningCount(0);
                      }}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200"
                    >
                      Restart Exam
                    </button>
                    <button
                      onClick={() => {
                        // Download results as JSON
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
                        a.download = 'exam-results.json';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      Download Results
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