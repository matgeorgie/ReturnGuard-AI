# ReturnGuard AI - Automated Video Return Verification

**ReturnGuard AI** is an intelligent verification system built with React and the Gemini API. It analyzes customer return videos to ensure packages are genuine, tracks the box continuously to prevent tampering, and extracts shipping label data (like AWBs) via OCR to validate against your database claims.

## ✨ Features
- 📦 **Box Tracking**: Uses AI to ensure the returned box remains in the video frame throughout the recording.
- 🔍 **Label Extraction**: Automatically reads shipping labels (OCR/QR) and extracts the Air Waybill (AWB) number.
- 🗄️ **Database Validation**: Cross-checks the extracted video data with database records to securely approve or reject the return claim.
- ⚡ **Real-time Feedback**: Get instant "Approved" or "Rejected" decisions with detailed step-by-step reasoning.
**Prerequisites:**  Node.js
  
## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **AI Integration**: Google Gemini API (`@google/genai`)
1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
## 🚀 Getting Started
### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Gemini API Key](https://aistudio.google.com/)
### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-return-verification.git
   cd ai-return-verification
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your API key:
   - Open the `.env.local` file in the root directory (or create one if it doesn't exist).
   - Add your Gemini API key:
     ```env
     API_KEY=your_api_key_here
     ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).
## 💡 Usage
1. Open the application in your browser.
2. Click **Upload Video** and select a customer return video.
3. Click **Verify Return Claim**. The application will analyze the video in three steps:
   - Analyze video to ensure the box never leaves the frame.
   - Extract shipping label data via the Gemini API.
   - Validate the extracted details against the database.
4. Review the final verification result (Approved or Rejected) and the corresponding explanation.
## 📄 License
This project is licensed under the MIT License.
