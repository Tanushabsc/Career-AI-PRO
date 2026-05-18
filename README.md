# CareerAI Pro 🚀

A comprehensive, frontend-only AI Career Intelligence Platform built to help professionals transition careers, optimize their resumes, and prepare for interviews using lightweight, local NLP and Puter.js for cloud persistence.

<img width="3780" height="1835" alt="Screenshot 2026-05-08 011849" src="https://github.com/user-attachments/assets/7bc9004d-9127-46ca-af6d-72523fde4990" />

<img width="3630" height="1710" alt="Screenshot 2026-05-08 011913" src="https://github.com/user-attachments/assets/4da10c58-d6f6-43cd-a615-15390d18521d" />


## 🌟 Features

*   **Dashboard:** A centralized hub to view your overall career transition progress, ATS scores, and saved insights.
*   **ATS Score Analysis:** Analyzes your resume against target roles to give you an actionable ATS compatibility score.
*   **Skill Gap Identification:** Highlights missing skills required for your target domain.
*   **Job Match Analysis:** Matches your profile with real-world job roles using semantic NLP matching.
*   **Career Roadmap:** Generates dynamic, domain-aware career transition roadmaps with time estimates and actionable milestones.
*   **Resume Improve:** Provides intelligent, line-by-line suggestions to enhance your resume's impact.
*   **AI Mentor:** A conversational AI assistant to answer your career-related questions and provide guidance.
*   **Interview Prep:** Interactive interview preparation with role-specific questions and feedback.
*   **GitHub Analyzer:** Analyzes your open-source contributions and repository quality.
*   **LinkedIn Pro:** Optimizes your LinkedIn profile for maximum visibility to recruiters.
*   **Personal Branding:** Helps you build a compelling professional brand and narrative.

## Screenshots

### Dashboard
<img width="3780" height="1835" alt="Screenshot 2026-05-08 011849" src="https://github.com/user-attachments/assets/324049a8-8544-4d37-8ca6-2e7789d02fe2" />


### ATS Analysis & Skill Gap
<img width="2242" height="1780" alt="Screenshot 2026-05-08 012000" src="https://github.com/user-attachments/assets/019d7787-0b39-4963-9b12-8b1c5769fff2" />

### ATS Score Weight Distribution

The CareerAI Pro ATS engine calculates a comprehensive score out of 100 based on a multi-factor analysis. The weights are distributed to prioritize semantic matching and structural completeness, closely mimicking real-world parsing systems.

The formula distributes the weights across 6 distinct categories:

1. **Keyword Match Score (30%)**
   - Calculates the ratio of target domain keywords found in the resume versus missing keywords. Prioritizes context and industry-specific terminology.
   
2. **Section Completeness (20%)**
   - Checks for the presence of standard resume sections (e.g., Contact Information, Professional Summary, Skills, Experience, Education, Projects). 

3. **Formatting Score (15%)**
   - Evaluates the scannability of the document. Rewards appropriate use of bullet points and ideal line lengths. Penalizes hard-to-parse structures like HTML tables or embedded images.

4. **Skill Depth (15%)**
   - A quantitative measure of technical proficiency. Awards points based on the absolute volume of extracted skills and certifications.

5. **Experience Relevance (10%)**
   - Looks at the depth of professional background, adding points for total years of experience, current job roles, and documented project work.

6. **Readability & Impact (10%)**
   - Analyzes the stylistic quality of the text. Rewards the use of strong action verbs (e.g., "orchestrated", "spearheaded") and quantifiable metrics (%, $, numbers). Penalizes weak or passive phrases (e.g., "responsible for", "assisted in").

**Algorithmic Calculation Code:**
```javascript
const totalScore = Math.round(
  (keywordScore * 0.30) +
  (sectionScore * 0.20) +
  (formattingScore * 0.15) +
  (skillScore * 0.15) +
  (experienceScore * 0.10) +
  (readabilityScore * 0.10)
);



### AI Mentor & Interview Prep
<img width="3015" height="1807" alt="Screenshot 2026-05-08 041700" src="https://github.com/user-attachments/assets/8e250dfa-2299-44f6-8d43-5316854b664c" />

### Job results by local web scraping from naukri
<img width="3040" height="1752" alt="Screenshot 2026-05-08 054256" src="https://github.com/user-attachments/assets/d9e264aa-8187-4640-80ae-685aba323e92" />

## System Architecture

CareerAI Pro is built with a **100% Client-Side Architecture**, ensuring low complexity, high performance, and zero reliance on paid external backends or APIs. 

*   **Frontend Framework:** React.js
*   **UI/UX:** Custom CSS with modern glassmorphism, fluid animations (Framer Motion), and responsive design.
*   **Data Persistence & Auth:** [Puter.js](https://puter.com/) is used as a lightweight, drop-in backend-as-a-service for user authentication and cloud-synced storage of career profiles and resumes.
*   **Core Logic Engines:** All NLP (Natural Language Processing), scoring, and matching algorithms are implemented in vanilla JavaScript and run entirely in the browser (e.g., `nlpEngine.js`, `atsEngine.js`, `jobScraperEngine.js`).
*   **Data Visualization:** Recharts for dynamic scoring and progress graphs.
*   **Icons:** Lucide React.

```mermaid
graph TD
    A[React User Interface] -->|Auth & Sync| B(Puter.js Cloud)
    A -->|Text Processing| C{Local NLP Engines}
    C --> D[ATS Scoring]
    C --> E[Skill Extraction]
    C --> F[Semantic Matching]
    A -->|State Management| G[React Context API]
```

## How the App Works

1.  **Authentication:** Users sign in using the Puter.js integration, which securely manages sessions without requiring a dedicated backend server.
2.  **Data Ingestion:** Users input their current resume (text format) and target job role/domain.
3.  **Local Processing:** 
    *   The `nlpEngine.js` tokenizes and normalizes the input text.
    *   Specific engines (like `atsEngine.js` and `skillEngine.js`) run keyword extraction, frequency analysis, and semantic similarity checks against a localized dataset or predefined domain models.
4.  **Insights Generation:** The app computes scores, generates roadmaps, and builds interview questions based entirely on the processed local data.
5.  **Persistence:** Whenever a user updates their profile or generates new insights, the state is automatically synced to their Puter.js cloud storage via `puterService.js`, ensuring their data is available across sessions.

## 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Mohnish-140605/CareerAIPRO.git
    cd CareerAIPRO
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm start
    ```
    The app will be available at `http://localhost:3000`.

## License
MIT License
