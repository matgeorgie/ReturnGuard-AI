
import { DatabaseRecord, ExtractedData, DBValidationResult } from '../types';

// This is a MOCK database. In a real application, this would be a call
// to a backend service that queries a real database (e.g., SQL, Firebase).
const mockDatabase: Map<string, DatabaseRecord> = new Map([
  ['AWB-20250701-0001', {
    awb: 'AWB-20250701-0001',
    sender: 'TechStore Inc.\n123 Silicon Ave, San Francisco, CA 94107\nPhone: +1 415-123-4567',
    receiver: 'John Doe\n456 Elm Street, Austin, TX 73301\nPhone: +1 737-987-6543',
    product: {
      name: 'Wireless Bluetooth Mouse',
      sku: 'WM-BT-2025',
      quantity: 1,
      weight: 0.25,
      price: 24.99
    }
  }],
  ['7S888B888888888888', {
    awb: '7S888B888888888888',
    sender: 'GadgetGalaxy\n456 Circuit Board, Techville, TX 75001\nPhone: +1 214-555-0199',
    receiver: 'Jane Smith\n789 Maple Drive, Seattle, WA 98101\nPhone: +1 206-555-0142',
    product: {
      name: 'Mechanical Keyboard RGB',
      sku: 'MK-RGB-104',
      quantity: 1,
      weight: 1.2,
      price: 89.95
    }
  }]
]);

// Helper to normalize strings for comparison
const normalize = (str: string) => str.replace(/\s+/g, ' ').toLowerCase().trim();

export const validateClaim = (extractedData: ExtractedData): DBValidationResult => {
  const dbRecord = mockDatabase.get(extractedData.awb);

  if (!dbRecord) {
    return {
      valid: false,
      reason: `AWB not found in database.`,
      dbRecord: undefined,
    };
  }
  
  const issues: string[] = [];

  // Compare product details
  const p1 = extractedData.product;
  const p2 = dbRecord.product;
  if (normalize(p1.name) !== normalize(p2.name)) issues.push('Product name');
  if (normalize(p1.sku) !== normalize(p2.sku)) issues.push('Product SKU');
  if (p1.quantity !== p2.quantity) issues.push('Quantity');

  if (issues.length > 0) {
    return {
      valid: false,
      reason: `Mismatch in product details: ${issues.join(', ')}.`,
      dbRecord: dbRecord,
    };
  }

  // Compare sender/receiver (less strict comparison)
  if (!normalize(extractedData.receiver).includes(normalize(dbRecord.receiver.split('\n')[0]))) {
      // just check name
      return {
        valid: false,
        reason: 'Mismatch in receiver details.',
        dbRecord: dbRecord
      }
  }

  return {
    valid: true,
    reason: 'Claim validated successfully.',
    dbRecord: dbRecord,
  };
};
