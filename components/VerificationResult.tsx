
import React from 'react';
import { VerificationResultData, ExtractedData, DatabaseRecord } from '../types';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface VerificationResultProps {
  result: VerificationResultData;
}

const DataComparisonCard: React.FC<{ title: string; data: ExtractedData | DatabaseRecord | undefined }> = ({ title, data }) => {
  if (!data) return null;
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex-1">
      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">{title}</h4>
      <div className="space-y-2 text-sm">
        <p><strong className="font-medium text-gray-600 dark:text-gray-300">AWB:</strong> {data.awb}</p>
        <p><strong className="font-medium text-gray-600 dark:text-gray-300">Sender:</strong> {data.sender}</p>
        <p><strong className="font-medium text-gray-600 dark:text-gray-300">Receiver:</strong> {data.receiver}</p>
        <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-600">
          <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Product:</p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 pl-2">
            <li>Name: {data.product.name}</li>
            <li>SKU: {data.product.sku}</li>
            <li>Qty: {data.product.quantity}</li>
            <li>Weight: {data.product.weight} kg</li>
            <li>Price: ${data.product.price}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export const VerificationResult: React.FC<VerificationResultProps> = ({ result }) => {
  const isApproved = result.decision === 'Approved';
  const cardColor = isApproved ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-red-50 dark:bg-red-900/20 border-red-500';
  const textColor = isApproved ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200';
  const Icon = isApproved ? CheckCircleIcon : XCircleIcon;

  return (
    <div className={`p-6 rounded-lg shadow-md border-l-4 ${cardColor} animate-fade-in`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">3. Verification Result</h2>
      <div className="flex items-center gap-3 mb-4">
        <Icon className={`w-8 h-8 ${textColor}`} />
        <div>
          <p className={`text-lg font-bold ${textColor}`}>{result.decision}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{result.reason}</p>
        </div>
      </div>

      {(result.extractedData || result.dbData) && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Data Overview</h3>
          <div className="flex flex-col md:flex-row gap-4">
            <DataComparisonCard title="Extracted from Video" data={result.extractedData} />
            <DataComparisonCard title="Database Record" data={result.dbData} />
          </div>
        </div>
      )}
    </div>
  );
};

// Add fade-in animation to tailwind config or a style tag if not present
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);
