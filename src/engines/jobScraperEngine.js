/**
 * Live Job Scraper Engine using Local Puppeteer Backend
 * Fallbacks to Remotive API if the local server is down
 */
import { rankJobsLocally, extractSmartKeyword as localExtractKeyword } from './localScoringEngine';

/**
 * Uses AI to derive the BEST possible Naukri search keyword from the user's full resume.
 * Works for all profiles: tech, non-tech, HR, teaching, CS academia, etc.
 */
export async function generateSmartSearchKeyword(parsedResume, manualTarget = '') {
  // First: always try the fast local heuristic (zero API cost)
  const localKeyword = localExtractKeyword(parsedResume);
  
  // If manual target given, blend it with local keyword
  if (manualTarget) {
    // Try AI to blend them, but always have local fallback
    if (!window.puter?.ai?.chat) return `${manualTarget.split(' ')[0]} ${localKeyword}`.trim().substring(0, 40);
  } else {
    // No manual target: local heuristic is good enough, skip AI call to save credits
    console.log(`[SmartKeyword] Local heuristic: "${localKeyword}"`);
    return localKeyword;
  }

  const domain = parsedResume?.primary_domain || '';
  const skills = (parsedResume?.skills || []).slice(0, 15).join(', ');
  const exp = parsedResume?.years_experience ?? 0;
  const sector = parsedResume?.sector || '';
  const subjects = (parsedResume?.subjects || parsedResume?.courses || []).join(', ');
  const isFresher = parsedResume?.is_fresher || exp < 1;
  const jobTitles = (parsedResume?.job_titles || []).join(', ');

  const prompt = `You are a job search expert. Based on this candidate profile, generate the SINGLE BEST Naukri.com job search keyword.

Profile:
- Domain/Field: ${domain}
- Sector: ${sector}
- Skills: ${skills}
- Academic Subjects (if any): ${subjects}
- Past Job Titles: ${jobTitles}
- Years of Experience: ${exp}
- Is Fresher: ${isFresher}
- User Specified Target: ${manualTarget}

Rules:
1. If this is an ACADEMIC/TEACHING profile with CS/IT subjects → use "computer science lecturer" or "assistant professor computer science"
2. If this is a TECH profile → use specific tech roles like "java developer", "react developer", "data scientist"
3. If this is an HR profile → use "hr generalist", "hr manager", "talent acquisition"
4. Respect experience level: fresher → "junior" or "assistant"; senior → "senior" or "lead"
5. The keyword MUST work on naukri.com (2-4 words max)
6. Blend the user's target field with their profile skills

Return ONLY the keyword string, nothing else.`;

  try {
    const response = await window.puter.ai.chat(prompt);
    let keyword = '';
    if (typeof response === 'string') keyword = response;
    else keyword = response?.message?.content || response?.text || response?.content || '';
    keyword = keyword.replace(/["'\n]/g, '').trim().split('\n')[0].trim();
    if (keyword && keyword.length > 2) {
      console.log(`[SmartKeyword] AI generated: "${keyword}"`);
      return keyword;
    }
  } catch (e) {
    console.warn('[SmartKeyword] AI failed, using local heuristic:', e.message);
  }
  return localKeyword;
}

async function fetchRemotiveFallback(keyword) {
  console.warn("Using Remotive fallback API...");
  try {
    const res = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keyword)}&limit=10`);
    const data = await res.json();
    return (data.jobs || []).slice(0, 5).map(job => ({
      id: job.id.toString(),
      title: job.title,
      company: job.company_name,
      type: job.job_type === 'full_time' ? 'Remote' : 'Contract/Remote',
      category: job.category,
      salary: job.salary || "Competitive",
      location: job.candidate_required_location || "Worldwide",
      link: job.url,
      description: job.description || "",
      postedAt: job.publication_date,
      platform: "Remotive"
    }));
  } catch (e) {
    throw new Error(`Fallback API also failed: ${e.message}`);
  }
}

export async function scrapeLiveLinkedInJobs(keyword, location = "Remote") {
  try {
    const response = await fetch('http://localhost:3001/api/scrape/linkedin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, location })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Local Scraper error: ${response.status}`);
    }

    const items = await response.json();
    if (!items || items.length === 0) throw new Error("No jobs found via Local Scraper.");

    return items.map(job => ({
      id: job.id || Math.random().toString(36).substr(2, 9),
      title: job.title,
      company: job.company,
      type: "Remote/Hybrid",
      category: job.category, 
      salary: "Competitive", 
      location: job.location,
      link: job.link,
      description: "",
      postedAt: "Recently",
      platform: job.platform
    }));
  } catch (error) {
    console.warn(`LinkedIn Local Scraper Failed (is the Node server running?): ${error.message}`);
    // Elegant fallback to Remotive if local server is down
    return await fetchRemotiveFallback(keyword);
  }
}

export async function scrapeLiveNaukriJobs(keyword, location = "India") {
  try {
    const response = await fetch('http://localhost:3001/api/scrape/naukri', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword, location })
    });

    if (!response.ok) {
       const errData = await response.json().catch(() => ({}));
       throw new Error(errData.error || `Local Scraper error: ${response.status}`);
    }

    const items = await response.json();
    if (!items || items.length === 0) throw new Error("No jobs found via Local Scraper.");

    return items.map(job => ({
      id: job.id || Math.random().toString(36).substr(2, 9),
      title: job.title || 'Role',
      company: job.company || 'Company',
      type: "Onsite/Hybrid",
      category: job.category || keyword, 
      salary: "Competitive", 
      location: job.location || 'India',
      link: job.link || '',
      description: job.description || '',   // ← FIXED: pass through real description
      skills: job.skills || [],             // ← FIXED: pass through real skills
      postedAt: "Recently",
      platform: job.platform || 'Naukri'
    }));
  } catch (error) {
    console.warn(`Naukri Local Scraper Failed: ${error.message}`);
    return await fetchRemotiveFallback(keyword);
  }
}

/**
 * Feeds the real scraped jobs into the AI to score them against the resume
 */
export async function analyzeRealJobsWithAI(realJobs, parsedResume, location = 'India', smartKeyword = '') {
  // If Puter AI is not available, use local cosine similarity engine
  if (!window.puter?.ai?.chat) {
    console.warn('[JobAnalysis] Puter AI unavailable, using local TF-IDF scoring engine');
    return rankJobsLocally(realJobs, parsedResume, location);
  }

  const resumeSkills = (parsedResume?.skills || []).slice(0, 20).join(', ');
  const exp = parsedResume?.years_experience ?? 0;
  const domain = parsedResume?.primary_domain || 'General';
  const isFresher = parsedResume?.is_fresher || exp < 1;
  const subjects = (parsedResume?.subjects || parsedResume?.courses || []).join(', ');
  const jobTitles = (parsedResume?.job_titles || []).join(', ');
  const expLabel = isFresher ? 'Fresher/Entry-Level' : exp < 3 ? 'Junior' : exp < 7 ? 'Mid-Level' : 'Senior';

  const prompt = `You are an expert recruiter. Rank these ${realJobs.length} LIVE job listings for the candidate below.

CANDIDATE PROFILE:
- Domain: ${domain}
- Experience: ${exp} years (${expLabel})
- Skills: ${resumeSkills}
- Academic Subjects: ${subjects || 'N/A'}
- Past Roles: ${jobTitles || 'N/A'}
- Target Location: ${location}
- AI-Derived Job Target: "${smartKeyword}"

LIVE JOBS TO RANK:
${realJobs.map((j, i) => `JOB ${i+1}: id=${j.id} | title="${j.title}" | company="${j.company}" | loc="${j.location || 'India'}" | requiredSkills=${JSON.stringify(j.skills || [])} | desc="${(j.description || '').substring(0, 180)}"`).join('\n')}

STRICT SCORING RULES — follow all of them:
1. Every job MUST get a UNIQUE hybrid_score. No two can be the same.
2. Score = skill_overlap(40%) + experience_level_match(30%) + location_match(20%) + domain_fit(10%)
3. Skill overlap: count how many of the candidate's skills appear in job skills/description. More overlap = higher score.
4. Experience mismatch penalty: if job requires Senior/Lead but candidate is ${expLabel}, deduct 15-25 pts.
5. Location bonus: +15 pts if job location contains "${location}".
6. For academics/teaching profiles: prioritize lecturer, faculty, professor, academic coordinator roles.
7. Rank 1 = highest scoring job (best match for THIS specific candidate).

Return ONLY a raw JSON array (no markdown, no explanation):
[{
  "id": "exact id from LIVE JOBS list",
  "title": "exact title from LIVE JOBS list",
  "company": "exact company from LIVE JOBS list",
  "type": "Onsite/Remote/Hybrid",
  "category": "${domain}",
  "salary": "realistic INR range e.g. ₹6-10 LPA",
  "keywords": ["top 3 overlapping skills between candidate and this job"],
  "hybrid_score": <UNIQUE integer 30-97>,
  "domain_affinity": <UNIQUE integer 40-99>,
  "match_reason": "1 specific sentence: WHY this job fits this ${expLabel} ${domain} candidate with ${exp}yr experience.",
  "tip": "1 concrete action to improve chances for THIS job.",
  "skill_gap": ["skills this job needs that the candidate lacks"],
  "transition_time": "Ready Now OR state months of prep needed",
  "market_demand": "High/Medium/Low",
  "description_summary": "1-sentence plain English summary of what this role does day-to-day."
}]`;

  const response = await window.puter.ai.chat(prompt);
  
  let text = "";
  if (typeof response === 'string') {
    text = response;
  } else if (response && typeof response === 'object') {
    const content = response.message?.content || response.text || response.content;
    text = typeof content === 'string' ? content : JSON.stringify(content || response);
  } else {
    text = String(response || "");
  }
  
  const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  let analyzedData = [];
  try {
    analyzedData = JSON.parse(cleanText);
  } catch (e) {
    console.error("AI JSON Parse Failed, using local TF-IDF scorer as fallback:", e.message);
    return rankJobsLocally(realJobs, parsedResume, location);
  }

  if (!Array.isArray(analyzedData)) analyzedData = [analyzedData];

  // Relaxed filter: as long as we have an ID to map it back, we show it
  const validData = analyzedData.filter(j => j.id);

  // FALLBACK: If AI returned nothing valid, use local cosine scorer
  if (validData.length === 0) {
    console.warn('AI returned no valid jobs, using local TF-IDF scorer.');
    return rankJobsLocally(realJobs, parsedResume, location);
  }

  return validData.map(aiJob => {
    const original = realJobs.find(r => r.id === aiJob.id);
    return {
      ...aiJob,
      title: (aiJob.title && aiJob.title !== "Actual Title" && aiJob.title !== "text") ? aiJob.title : (original?.title || "Role Match"),
      company: (aiJob.company && aiJob.company !== "Actual Company" && aiJob.company !== "text") ? aiJob.company : (original?.company || "Company"),
      link: original?.link || aiJob.link,
      platform: original?.platform || "Naukri",
      isLive: true
    };
  });
}
