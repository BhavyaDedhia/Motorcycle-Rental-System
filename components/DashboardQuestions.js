import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DashboardQuestions = ({ myMotorcycles }) => {
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [answerText, setAnswerText] = useState({});
  const [submittingAnswer, setSubmittingAnswer] = useState({});

  // Effect for fetching questions for motorcycles owned by the user
  useEffect(() => {
    if (!myMotorcycles?.length) return;

    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        // Get all questions for each motorcycle
        const questionPromises = myMotorcycles.map(motorcycle => 
          axios.get(`/api/questions?motorcycleId=${motorcycle._id}`)
        );
        
        const responses = await Promise.all(questionPromises);
        
        // Combine all questions into a single array
        const allQuestions = responses.reduce((acc, response) => {
          return [...acc, ...(Array.isArray(response.data.questions) ? response.data.questions : [])];
        }, []);
        
        setQuestions(allQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to load questions');
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [myMotorcycles]);

  // Handle answer submission
  const handleAnswerSubmit = async (questionId) => {
    if (!answerText[questionId]?.trim()) {
      toast.error('Please enter an answer');
      return;
    }
    
    setSubmittingAnswer(prev => ({ ...prev, [questionId]: true }));
    
    try {
      await axios.patch(`/api/questions/${questionId}`, {
        answer: { text: answerText[questionId] }
      });
      
      // Update questions list
      setQuestions(questions.map(q => 
        (q.id || q._id) === questionId 
          ? { ...q, answer: answerText[questionId], isAnswered: true, updatedAt: new Date().toISOString() } 
          : q
      ));
      
      // Clear the answer text for this question
      setAnswerText(prev => ({ ...prev, [questionId]: '' }));
      
      toast.success('Answer submitted successfully!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    } finally {
      setSubmittingAnswer(prev => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Questions about Your Motorcycles</h2>
        
        {loadingQuestions ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-600"></div>
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-8">
            {questions.map((question) => {
  const questionId = question.id || question._id;
              // Find the motorcycle this question is about
              const motorcycle = myMotorcycles.find(m => m._id === question.motorcycle);
              
              return (
                <div key={question._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-2">
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      {motorcycle?.brand} {motorcycle?.model}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-700"><span className="font-medium">Question:</span> {question.text}</p>
                  </div>
                  
                  {question.isAnswered ? (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700"><span className="font-medium">Your Answer:</span> {question.answer}</p>
                      <p className="text-xs text-gray-500 mt-1">Answered on {new Date(question.updatedAt).toLocaleDateString()}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-2">
                        <label htmlFor={`answer-${question._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                          Your Answer
                        </label>
                        <textarea
                          id={`answer-${question._id}`}
                          rows="3"
                          value={answerText[questionId] || ''}
                          onChange={(e) => setAnswerText(prev => ({ ...prev, [questionId]: e.target.value }))}
                          placeholder="Type your answer here..."
                          className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                        />
                      </div>
                      <button
                        onClick={() => handleAnswerSubmit(questionId)}
                        disabled={submittingAnswer[questionId] || !answerText[questionId]?.trim()}
                        className={`px-4 py-2 font-medium rounded-md ${
                          submittingAnswer[questionId] || !answerText[questionId]?.trim() 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        } text-white transition duration-300`}
                      >
                        {submittingAnswer[questionId] ? 'Submitting...' : 'Submit Answer'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No questions about your motorcycles yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardQuestions; 