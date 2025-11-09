<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aRGKOsOAbq3i-t9znNjVM-PHg9sfpI5J

CodePaint  🎯 Primary Use Cases
1. 🧑‍🎓 Learning Aid for Beginners
    * Helps learners visualize how logic becomes code, easing the transition from flowcharts or pseudocode to syntax.
    * Enables side-by-side “logic vs. implementation” learning.
    * Encourages algorithmic thinking over syntax memorization.
2. 💼 Interview Tool
    * Interviewers can ask candidates to describe logic as a flowchart or pseudocode — Flow2Code instantly converts it into code for validation.
    * Great for evaluating problem-solving skills instead of language syntax.
3. 🧩 Productivity Tool for PMs & Designers
    * Upload a UI mockup or wireframe image → get auto-generated frontend code (HTML/CSS/React).
    * Bridges non-technical roles and developers for faster prototyping.

⚙️ Core Functionalities (MVP + Advanced)
1. 🧾 Pseudocode → Code Generator
Fully structured code in user’s chosen language (Python, C++, JavaScript, etc.)
Auto-comments explaining logic.
Use Case:
Ideal for students learning DSA or algorithmic thinking.

2. 🧭 Flowchart → Code Generator
Built-in drag-and-drop flowchart builder (Start, Process, Decision, Input/Output).
OR upload a hand-drawn or digital flowchart image (AI vision parsing).
Use Case:
Learning algorithm flow visually; debugging logic visually.

3. 🔁 Hybrid Mode (Flowchart + Pseudocode Combined)
Users can write pseudocode alongside the flowchart for extra clarity.

4. 🖼️ Image-to-Frontend Code Generator (UI Mode)
Input:
* Upload screenshot, hand-drawn sketch, or Figma-like wireframe.
Output:
* Auto-generated frontend code (HTML/CSS/React/Flutter).
* Auto-detects layout, buttons, text, and visual hierarchy.
Use Case:
For designers and product managers who want to turn ideas → prototype → production-ready UI quickly.

5. 🧠 AI Assistant (Explain + Modify)
Chat interface to:
* Explain generated code in simple terms (“What does this loop do?”)
* Modify code logic (“Make this function recursive”)

6. 🧩 Multi-Page Workflow
Users can open multiple “tabs” (like VSCode) within the tool.
Continue editing or linking multiple logic flows (Page 1 → Login Flow, Page 2 → Dashboard Logic).

7. 📤 Image Upload for All Inputs
Users can upload:
* Photos of hand-drawn pseudocode.
* Flowchart screenshots.
* UI design sketches.

8. GitHub Collaboration.
Makes it developer-friendly beyond the browser.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

   
