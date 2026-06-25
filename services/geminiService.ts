
import { GoogleGenAI, Type } from "@google/genai";
import { GeminiAnalysisResult } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    boxLeftFrame: {
      type: Type.BOOLEAN,
      description: "True if the shipping box ever moves partially or completely out of the video frame. False otherwise.",
    },
    labelReadable: {
      type: Type.BOOLEAN,
      description: "True if the shipping label's text or QR code was successfully read. False if it's blurry, obscured, or unreadable.",
    },
    extractedData: {
      type: Type.OBJECT,
      nullable: true,
      description: "The data extracted from the shipping label. Null if not readable.",
      properties: {
        awb: { type: Type.STRING, description: "The Air Waybill (AWB) number." },
        sender: { type: Type.STRING, description: "Full sender details including name and address." },
        receiver: { type: Type.STRING, description: "Full receiver details including name and address." },
        product: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Product name." },
            sku: { type: Type.STRING, description: "Product SKU." },
            quantity: { type: Type.INTEGER, description: "Quantity of the product." },
            weight: { type: Type.NUMBER, description: "Weight of the product in kg." },
            price: { type: Type.NUMBER, description: "Price of the product." },
          },
        },
      },
    },
  },
  required: ["boxLeftFrame", "labelReadable"]
};

export const analyzeVideoForVerification = async (videoFile: File): Promise<GeminiAnalysisResult> => {
  const videoPart = await fileToGenerativePart(videoFile);
  const model = 'gemini-2.5-flash';

  const prompt = `
    You are an advanced AI system designed to verify product return claims by analyzing unboxing videos.
    Your task is to perform a multi-step analysis of the provided video and return a structured JSON object.

    Follow these instructions carefully:

    1.  **Box Tracking**: Watch the entire video. Determine if the main shipping box ever leaves the camera's view, even partially. Set 'boxLeftFrame' to true if it does, false otherwise. This is critical for detecting potential tampering.

    2.  **Label Analysis**: Locate the shipping label on the box.
        - **First, attempt OCR** to read the text on the label.
        - **If OCR fails** (due to blur, angle, etc.), **look for a QR code**. The QR code contains structured text. Decode it.
        - The QR code format is as follows:
          Sender: [Sender Info]
          Receiver: [Receiver Info]
          Product Details:
          Name: [Product Name]
          SKU: [Product SKU]
          Quantity: [Quantity]
          Weight: [Weight] kg
          Price: $[Price]
        - If you can successfully extract the information from either OCR or the QR code, populate the 'extractedData' object and set 'labelReadable' to true.
        - If you cannot read the label from either source, set 'labelReadable' to false and 'extractedData' to null.

    3.  **Output**: Provide your findings ONLY in the specified JSON format. Do not add any explanatory text outside of the JSON structure.
  `;

  try {
    const response = await ai.models.generateContent({
        model: model,
        contents: [{ parts: [ {text: prompt}, videoPart ] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonString = response.text.trim();
    const resultJson = JSON.parse(jsonString);

    return resultJson as GeminiAnalysisResult;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('400')) {
        throw new Error("Bad request to Gemini API. The video may be too large or in an unsupported format. Please use a short video clip (< 1 min).");
    }
    throw new Error("Failed to analyze video with Gemini API.");
  }
};
