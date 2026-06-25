
import React from 'react';
import { AnalysisStep } from '../types';
import { CheckCircleIcon, XCircleIcon, LoaderIcon } from './icons';

interface AnalysisStepsProps {
  steps: AnalysisStep[];
}

const StatusIcon: React.FC<{ status: AnalysisStep['status'] }> = ({ status }) => {
  switch (status) {
    case 'running':
      return <LoaderIcon className="w-5 h-5 text-blue-500 animate-spin" />;
    case 'success':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case 'error':
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    default:
      return <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />;
  }
};

export const AnalysisSteps: React.FC<AnalysisStepsProps> = ({ steps }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">2. Analysis Progress</h2>
      <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-2.5">
        {steps.map((step, index) => (
          <li key={index} className="mb-6 ml-6 last:mb-0">
            <span className="absolute flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full -left-3 ring-4 ring-white dark:ring-gray-800">
              <StatusIcon status={step.status} />
            </span>
            <h3 className="flex items-center mb-1 text-base font-semibold text-gray-900 dark:text-white">
              {step.text}
            </h3>
            {step.details && (
              <p className={`block text-sm font-normal leading-none ${step.status === 'error' ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {step.details}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
};
