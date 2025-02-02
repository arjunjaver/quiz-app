import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import spinner from "./loader.gif";

export default function Quiz() {
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [correctOption, setCorrectOption] = useState(null); 

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/quiz');
        const data = await response.json();
        setQuizData(data);
      } catch (error) {
        console.error("Error fetching quiz data:", error);
      }
    };
    fetchQuizData();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (currentQuestionIndex < quizData.questions.length - 1) {
        nextQuestion();
      } else {
        setShowResult(true);
      }
    }
  }, [timeLeft, currentQuestionIndex, quizData]);

  if (!quizData)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600">
        <img src={spinner} alt="Loading..." className="w-20 h-20" />
      </div>
    );

  if (showResult) {
    const totalQuestions = quizData.questions.length;
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-black">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[500px] text-center">
          <div className="text-green-500 text-4xl mb-4">✔</div>
          <h1 className="text-2xl font-bold">Your quiz has been submitted!</h1>
          <h2 className="text-xl font-semibold mt-4">Score Card</h2>
          <div className="flex justify-around mt-4">
            <div className="text-center">
              <div className="bg-green-200 text-green-800 text-2xl font-bold p-4 rounded-full">{score}</div>
              <p className="mt-2">Correct Answers</p>
            </div>
            <div className="text-center">
              <div className="bg-gray-300 text-gray-800 text-2xl font-bold p-4 rounded-full">{totalQuestions}</div>
              <p className="mt-2">Total Questions</p>
            </div>
            <div className="text-center">
              <div className="bg-red-200 text-red-800 text-2xl font-bold p-4 rounded-full">{totalQuestions - score}</div>
              <p className="mt-2">Wrong Answers</p>
            </div>
          </div>
          <button className="mt-6 px-6 py-2 bg-red-400 text-white rounded-lg"><Link to="/">Go Back</Link></button>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];

  const handleOptionSelect = (option) => {
    if (selectedOption) return;

    setSelectedOption(option.description);
    setCorrectOption(currentQuestion.options.find(opt => opt.is_correct)); 
    setIsCorrect(option.is_correct);
    setMessage(option.is_correct ? 'Correct!' : 'Wrong Answer!');
    setShowMessage(true);

    if (option.is_correct) {
      setScore(prev => prev + 1);
    }

    setAnswers([...answers, { question: currentQuestion.description, answer: option.description, correct: option.is_correct }]);

    setTimeout(() => {
      setShowMessage(false);
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setCorrectOption(null); 
      setTimeLeft(30);
    } else {
      setShowResult(true);
    }
  };

  const progress = (timeLeft / 30) * 100;
  const progressColor = `rgb(${255 - progress * 2.55}, ${progress * 2.55}, 0)`;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <h1 className="text-3xl font-bold mb-4 text-white">{quizData.title}</h1>
      <div className="box bg-white p-6 rounded-lg shadow-lg w-[400px] h-[500px] text-black relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gray-300 overflow-hidden rounded">
          <div
            className="h-full transition-all duration-1000"
            style={{ width: `${progress}%`, backgroundColor: progressColor }}
          ></div>
        </div>
        <h2 className="text-xl font-semibold mb-4 mt-4">Question {currentQuestionIndex + 1}/{quizData.questions.length}</h2>
        <p className="mb-4">{currentQuestion.description}</p>
        <ul>
          {currentQuestion.options.map((option, index) => (
            <li
              key={index}
              className={`mb-2 px-4 py-2 rounded-lg cursor-pointer transition
                ${selectedOption === option.description 
                  ? (isCorrect 
                      ? 'border-green-500 bg-green-100' 
                      : 'border-red-500 bg-red-100') 
                  : 'border-gray-300 hover:bg-gray-200'} border-2
                ${correctOption && option.description === correctOption.description && !isCorrect ? 'border-green-500 bg-green-100' : ''}`} 
              onClick={() => handleOptionSelect(option)}
              style={{ pointerEvents: selectedOption ? 'none' : 'auto' }}
            >
              {option.description}
            </li>
          ))}
        </ul>
        {showMessage && (
          <div className={`mt-4 p-2 text-center text-white rounded-lg ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>{message}</div>
        )}
      </div>
    </div>
  );
}
