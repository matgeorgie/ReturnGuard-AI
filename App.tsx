
import React, { useState, useCallback, useEffect } from 'react';
import { VideoUpload } from './components/VideoUpload';
import { AnalysisSteps } from './components/AnalysisSteps';
import { VerificationResult } from './components/VerificationResult';
import { AnalysisStep, VerificationResultData } from './types';
import { analyzeVideoForVerification } from './services/geminiService';
import { validateClaim } from './services/databaseService';
import { GithubIcon, BotMessageSquareIcon } from './components/icons';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [steps, setSteps] = useState<AnalysisStep[]>([]);
  const [result, setResult] = useState<VerificationResultData | null>(null);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyError('API_KEY environment variable not set. Please configure it to use the application.');
    }
  }, []);

  const resetState = () => {
    setIsLoading(false);
    setSteps([]);
    setResult(null);
    setVideoFile(null);
    const videoInput = document.getElementById('video-upload') as HTMLInputElement;
    if(videoInput) videoInput.value = "";
  };
  
  const initialSteps: AnalysisStep[] = [
    { text: 'Analyze video for box tracking', status: 'pending' },
    { text: 'Extract shipping label data (OCR/QR)', status: 'pending' },
    { text: 'Validate against database', status: 'pending' },
  ];

  const handleVerification = useCallback(async () => {
    if (!videoFile) return;
    if (!process.env.API_KEY) {
      setApiKeyError('Cannot start verification: API_KEY is not configured.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setSteps(initialSteps.map(s => ({ ...s, status: 'running', details: undefined })));

    try {
      // Step 1 & 2: Gemini Video Analysis
      const updateStep = (index: number, status: 'success' | 'error', details?: string) => {
        setSteps(prev => prev.map((s, i) => i === index ? { ...s, status, details } : (i > index ? {...s, status: status === 'error' ? 'pending' : s.status} : s) ));
      };

      const analysisResult = await analyzeVideoForVerification(videoFile);
      
      if (analysisResult.boxLeftFrame) {
        updateStep(0, 'error', 'Box left the frame.');
        setResult({ decision: 'Rejected', reason: 'Box left frame — possible tampering' });
        setIsLoading(false);
        return;
      }
      updateStep(0, 'success', 'Box remained in frame throughout the video.');
      
      if (!analysisResult.labelReadable || !analysisResult.extractedData?.awb) {
        updateStep(1, 'error', 'Could not read shipping label from video.');
        setResult({ decision: 'Rejected', reason: 'Shipping label unreadable or AWB missing' });
        setIsLoading(false);
        return;
      }
      updateStep(1, 'success', `AWB ${analysisResult.extractedData.awb} extracted.`);

      // Step 3: Database Validation
      const dbValidation = validateClaim(analysisResult.extractedData);
      if (!dbValidation.valid) {
        updateStep(2, 'error', dbValidation.reason);
        setResult({
          decision: 'Rejected',
          reason: dbValidation.reason,
          extractedData: analysisResult.extractedData,
          dbData: dbValidation.dbRecord
        });
      } else {
        updateStep(2, 'success', 'All details match the database record.');
        setResult({
          decision: 'Approved',
          reason: 'Return claim verified successfully.',
          extractedData: analysisResult.extractedData,
          dbData: dbValidation.dbRecord
        });
      }

    } catch (error) {
      console.error('Verification failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setSteps(prev => prev.map(s => s.status === 'running' ? {...s, status: 'error', details: errorMessage } : s));
      setResult({ decision: 'Rejected', reason: `An unexpected error occurred during analysis. Check console for details.` });
    } finally {
      setIsLoading(false);
    }
  }, [videoFile]);

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200">
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BotMessageSquareIcon className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">AI Return Verification System</h1>
          </div>
          <a href="https://github.com/google/generative-ai-docs" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <GithubIcon className="w-7 h-7" />
          </a>
        </header>

        {apiKeyError && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Configuration Error</p>
            <p>{apiKeyError}</p>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <VideoUpload
              onVideoSelect={setVideoFile}
              videoFile={videoFile}
              disabled={isLoading}
            />
            <div className="flex items-center gap-4">
              <button
                onClick={handleVerification}
                disabled={!videoFile || isLoading || !!apiKeyError}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : 'Verify Return Claim'}
              </button>
              {(result || isLoading) && (
                 <button
                    onClick={resetState}
                    disabled={isLoading}
                    className="bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                    Reset
                </button>
              )}
            </div>
            
            {steps.length > 0 && <AnalysisSteps steps={steps} />}
          </div>
          
          <div className="mt-8 lg:mt-0">
             {result && <VerificationResult result={result} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
