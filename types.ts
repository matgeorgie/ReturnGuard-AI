
export interface ProductDetails {
  name: string;
  sku: string;
  quantity: number;
  weight: number;
  price: number;
}

export interface ExtractedData {
  awb: string;
  sender: string;
  receiver: string;
  product: ProductDetails;
}

export interface GeminiAnalysisResult {
  boxLeftFrame: boolean;
  labelReadable: boolean;
  extractedData?: ExtractedData;
}

export interface DatabaseRecord {
  awb: string;
  sender: string;
  receiver: string;
  product: ProductDetails;
}

export interface DBValidationResult {
  valid: boolean;
  reason: string;
  dbRecord?: DatabaseRecord;
}

export interface AnalysisStep {
  text: string;
  status: 'pending' | 'running' | 'success' | 'error';
  details?: string;
}

export interface VerificationResultData {
  decision: 'Approved' | 'Rejected';
  reason: string;
  extractedData?: ExtractedData;
  dbData?: DatabaseRecord;
}
