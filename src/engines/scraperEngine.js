import { puterService } from '../services/puterService';

/**
 * Advanced Web Scraping Engine
 * Uses multiple fallback proxies to bypass CORS and extract raw text from any URL.
 */
export async function scrapeUrlText(url) {
  // Strategy 1: Jina AI Reader (Best for LLMs, extracts clean markdown)
  try {
    const res = await fetch(`https://r.jina.ai/${url}`);
    if (res.ok) {
      const text = await res.text();
      if (text && text.length > 50) return text;
    }
  } catch (e) {
    console.warn("Jina AI scrape failed, trying fallback 1");
  }

  // Strategy 2: AllOrigins CORS Proxy
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (data.contents) {
      // Strip HTML
      const doc = new DOMParser().parseFromString(data.contents, 'text/html');
      return doc.body.textContent || "";
    }
  } catch (e) {
    console.warn("AllOrigins scrape failed, trying fallback 2");
  }

  throw new Error("Unable to extract content from this URL due to aggressive anti-scraping protections.");
}

/**
 * Analyzes a given professional profile URL (LinkedIn, Portfolio, GitHub)
 * Extracts text and feeds it to the neural engine.
 */
export async function analyzeProfessionalProfile(url, parsedResume) {
  let scrapedContent = "";
  let isSimulated = false;

  try {
    scrapedContent = await scrapeUrlText(url);
    // If we only get a Captcha or Authwall, treat it as failed
    if (scrapedContent.toLowerCase().includes("security check") || scrapedContent.toLowerCase().includes("please wait")) {
      throw new Error("Authwall detected");
    }
  } catch (e) {
    // LinkedIn blocks scraping aggressively. If blocked, we fall back to AI knowledge
    // combined with the user's resume data to simulate the likely profile gaps.
    console.warn("Scraping blocked. Falling back to AI projection.");
    isSimulated = true;
  }

  const prompt = `
    You are an expert Executive Career Coach and Personal Branding Specialist.
    ${isSimulated ? 
      `The user provided a profile URL (${url}) but it is behind an anti-scraping authwall. Based strictly on their provided resume data, project what their digital profile likely looks like and where the typical gaps are for their level.` 
      : `Analyze the following scraped text from the user's professional profile URL (${url}):\n\n${scrapedContent.substring(0, 5000)}`}
    
    User's Known Resume Context:
    Domain: ${parsedResume?.primary_domain || 'Technology'}
    Experience: ${parsedResume?.years_experience || 0} years
    Skills: ${(parsedResume?.skills || []).slice(0, 10).join(", ")}

    Generate a strict JSON object with this exact structure:
    {
      "score": <number between 40 and 99>,
      "searchability": <number between 40 and 99>,
      "engagement": <number between 40 and 99>,
      "positioning": <number between 40 and 99>,
      "optimization": [
        { "label": "Headline Strength", "val": "High/Moderate/Low", "color": "var(--green) or var(--amber) or var(--red)" },
        { "label": "Skill Validation", "val": "High/Moderate/Low", "color": "var(--green) or var(--amber) or var(--red)" },
        { "label": "Content Velocity", "val": "High/Moderate/Low", "color": "var(--green) or var(--amber) or var(--red)" }
      ],
      "insights": [
        "A specific, highly actionable insight about their profile based on the text/resume.",
        "Another strategic critique.",
        "A positive reinforcement."
      ],
      "headlineIdeas": [
        "AI Generated Headline 1",
        "AI Generated Headline 2",
        "AI Generated Headline 3"
      ]
    }
    
    Do NOT include markdown block markers like \`\`\`json. Return raw JSON.
  `;

  if (!window.puter?.ai?.chat) {
    throw new Error("Puter AI is offline.");
  }

  const response = await window.puter.ai.chat(prompt);
  let text = typeof response === 'object' ? response.message?.content || response.text || response.content || JSON.stringify(response) : response;
  
  const cleanJsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const data = JSON.parse(cleanJsonStr);
  
  data.isSimulated = isSimulated;
  return data;
}
