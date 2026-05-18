/**
 * Local Scoring Engine — Zero API, 100% Browser-Side
 * Implements TF-IDF + Cosine Similarity for real job-resume matching.
 * Used as a fallback when Puter AI is offline/out of credits.
 */

// Common English stop words to ignore in TF-IDF
const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with',
  'by','from','is','was','are','were','be','been','being','have','has',
  'had','do','does','did','will','would','could','should','may','might',
  'shall','can','need','dare','ought','used','this','that','these','those',
  'i','you','he','she','it','we','they','who','which','what','where','when',
  'how','all','any','both','each','few','more','most','other','some','such',
  'no','not','only','same','so','than','too','very','just','as','up','out',
  'about','into','through','during','before','after','above','below','between',
  'our','your','their','its','my','his','her','we','they','year','years',
  'experience','work','working','job','role','position','company','team',
  'looking','strong','good','great','excellent','required','preferred',
  'ability','skills','knowledge','understanding','familiarity','proficiency'
]);

/**
 * Tokenize and clean text into meaningful terms
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\+\#\.]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Compute TF (term frequency) map for a token array
 */
function computeTF(tokens) {
  const tf = {};
  tokens.forEach(t => { tf[t] = (tf[t] || 0) + 1; });
  const total = tokens.length || 1;
  Object.keys(tf).forEach(k => { tf[k] = tf[k] / total; });
  return tf;
}

/**
 * Compute IDF (inverse document frequency) across a corpus of token arrays
 */
function computeIDF(corpus) {
  const idf = {};
  const N = corpus.length;
  corpus.forEach(tokens => {
    const unique = new Set(tokens);
    unique.forEach(t => { idf[t] = (idf[t] || 0) + 1; });
  });
  Object.keys(idf).forEach(k => { idf[k] = Math.log(N / idf[k]) + 1; });
  return idf;
}

/**
 * Compute TF-IDF vector for a document given IDF map
 */
function tfidfVector(tokens, idf) {
  const tf = computeTF(tokens);
  const vec = {};
  Object.keys(tf).forEach(t => {
    vec[t] = tf[t] * (idf[t] || 1);
  });
  return vec;
}

/**
 * Cosine similarity between two sparse vectors (objects)
 */
function cosineSimilarity(vecA, vecB) {
  const keysA = Object.keys(vecA);
  if (keysA.length === 0) return 0;

  let dot = 0;
  keysA.forEach(k => {
    if (vecB[k]) dot += vecA[k] * vecB[k];
  });

  const magA = Math.sqrt(keysA.reduce((s, k) => s + vecA[k] ** 2, 0));
  const magB = Math.sqrt(Object.values(vecB).reduce((s, v) => s + v ** 2, 0));

  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

/**
 * Extracts domain-aware keyword hints from resume for smarter matching
 */
function extractSmartKeyword(parsedResume) {
  const domain = (parsedResume?.primary_domain || '').toLowerCase();
  const skills = (parsedResume?.skills || []).slice(0, 5).map(s => s.toLowerCase());
  const exp = parsedResume?.years_experience ?? 0;
  const isFresher = parsedResume?.is_fresher || exp < 1;
  const subjects = (parsedResume?.subjects || parsedResume?.courses || []).map(s => s.toLowerCase());
  const jobTitles = (parsedResume?.job_titles || []).map(s => s.toLowerCase());

  // Heuristic domain maps
  const DOMAIN_MAP = {
    'teaching':     isFresher ? 'assistant professor' : exp < 5 ? 'lecturer' : 'professor',
    'academia':     isFresher ? 'assistant professor' : 'associate professor',
    'computer science': isFresher ? 'computer science lecturer' : 'cs faculty',
    'software':     isFresher ? 'junior software developer' : exp < 5 ? 'software engineer' : 'senior software engineer',
    'data science': isFresher ? 'data analyst' : exp < 4 ? 'data scientist' : 'senior data scientist',
    'machine learning': 'machine learning engineer',
    'web':          isFresher ? 'web developer' : 'full stack developer',
    'frontend':     'frontend developer react',
    'backend':      'backend developer nodejs',
    'hr':           isFresher ? 'hr executive' : exp < 4 ? 'hr generalist' : 'hr manager',
    'human resources': isFresher ? 'hr executive' : 'hr manager',
    'marketing':    isFresher ? 'digital marketing executive' : 'marketing manager',
    'finance':      isFresher ? 'financial analyst' : 'finance manager',
    'sales':        isFresher ? 'sales executive' : 'sales manager',
    'operations':   isFresher ? 'operations executive' : 'operations manager',
    'devops':       'devops engineer aws',
    'cloud':        'cloud engineer aws azure',
    'cybersecurity':'security analyst',
    'research':     isFresher ? 'research assistant' : 'research scientist',
    'product':      isFresher ? 'associate product manager' : 'product manager',
    'design':       isFresher ? 'ui ux designer' : 'senior ux designer',
    'content':      'content writer',
    'accounting':   isFresher ? 'accountant' : 'senior accountant',
  };

  // Check domain against map
  for (const [key, kw] of Object.entries(DOMAIN_MAP)) {
    if (domain.includes(key)) {
      // For teaching + CS subjects, be very specific
      if ((key === 'teaching' || key === 'academia') && 
          (subjects.some(s => ['computer', 'software', 'data', 'programming', 'algorithm', 'python', 'java', 'cs'].some(cs => s.includes(cs))) ||
           skills.some(s => ['python', 'java', 'c++', 'data', 'algorithm', 'programming', 'software'].some(ts => s.includes(ts))))) {
        return isFresher ? 'computer science lecturer' : exp < 5 ? 'assistant professor computer science' : 'associate professor computer science';
      }
      return kw;
    }
  }

  // Fallback to top skill if domain is unclear
  if (skills.length > 0) return skills[0] + (isFresher ? ' fresher' : ' professional');
  return domain || 'software developer';
}

/**
 * Compute a market demand label based on keyword frequency
 */
function getMarketDemand(title) {
  const highDemand = ['data', 'ai', 'ml', 'machine learning', 'python', 'react', 'cloud', 'aws', 'devops', 'java', 'fullstack', 'product manager', 'cybersecurity', 'professor', 'lecturer'];
  const lowDemand = ['flash', 'cobol', 'vb6', 'pascal', 'fortran'];
  const t = (title || '').toLowerCase();
  if (highDemand.some(k => t.includes(k))) return 'High';
  if (lowDemand.some(k => t.includes(k))) return 'Low';
  return 'Medium';
}

/**
 * Main local ranking function: scores and ranks jobs against resume
 * using TF-IDF cosine similarity. No API required.
 * @param {Array} jobs - scraped job objects
 * @param {Object} parsedResume - parsed resume context
 * @param {string} location - preferred location
 * @returns {Array} ranked jobs with scores
 */
export function rankJobsLocally(jobs, parsedResume, location = 'India') {
  if (!jobs || jobs.length === 0) return [];

  const exp = parsedResume?.years_experience ?? 0;
  const domain = parsedResume?.primary_domain || '';
  const isFresher = parsedResume?.is_fresher || exp < 1;
  const expLabel = isFresher ? 'Fresher/Entry-Level' : exp < 3 ? 'Junior' : exp < 7 ? 'Mid-Level' : 'Senior';

  // Build resume document: skills + domain + subjects + job titles
  const resumeTokens = tokenize([
    domain,
    (parsedResume?.skills || []).join(' '),
    (parsedResume?.subjects || parsedResume?.courses || []).join(' '),
    (parsedResume?.job_titles || []).join(' '),
    parsedResume?.summary || '',
  ].join(' '));

  // Build job documents
  const jobTexts = jobs.map(j => [
    j.title || '',
    j.company || '',
    j.description || '',
    (j.skills || []).join(' '),
    j.category || ''
  ].join(' '));

  const jobTokenArrays = jobTexts.map(t => tokenize(t));

  // Build IDF across all documents (resume + jobs)
  const corpus = [resumeTokens, ...jobTokenArrays];
  const idf = computeIDF(corpus);

  // Build TF-IDF vectors
  const resumeVec = tfidfVector(resumeTokens, idf);
  const jobVecs = jobTokenArrays.map(tokens => tfidfVector(tokens, idf));

  // Score each job
  const scored = jobs.map((job, i) => {
    let cosineScore = cosineSimilarity(resumeVec, jobVecs[i]);
    
    // Normalize to 0-80 base range
    let baseScore = Math.round(cosineScore * 100 * 2.5);
    baseScore = Math.min(80, Math.max(20, baseScore));

    // Experience level match bonus/penalty
    const title = (job.title || '').toLowerCase();
    const isSeniorRole = ['senior', 'lead', 'head', 'director', 'vp', 'principal', 'manager', 'architect', 'chief'].some(k => title.includes(k));
    const isEntryRole = ['junior', 'fresher', 'trainee', 'intern', 'assistant', 'associate', 'entry'].some(k => title.includes(k));
    
    if (isFresher && isSeniorRole) baseScore -= 20;
    if (isFresher && isEntryRole) baseScore += 12;
    if (!isFresher && exp >= 5 && isEntryRole) baseScore -= 10;
    if (!isFresher && exp >= 5 && isSeniorRole) baseScore += 8;

    // Location bonus
    const jobLoc = (job.location || '').toLowerCase();
    const prefLoc = location.toLowerCase();
    if (jobLoc.includes(prefLoc) || prefLoc.includes(jobLoc.split(',')[0])) baseScore += 15;
    
    // Domain match bonus
    if (title.includes(domain.toLowerCase().split(' ')[0])) baseScore += 5;

    // Hard cap and uniqueness jitter (ensures no two are the same)
    baseScore = Math.min(97, Math.max(25, baseScore));
    const jitter = i * 0.3; // tiny offset per job index so no duplicates
    const finalScore = Math.min(97, Math.round(baseScore + jitter));

    // Find overlapping skills
    const resumeSkillSet = new Set(resumeTokens);
    const jobSkillTokens = tokenize((job.skills || []).join(' ') + ' ' + (job.description || ''));
    const overlap = jobSkillTokens.filter(t => resumeSkillSet.has(t) && !STOP_WORDS.has(t));
    const uniqueOverlap = [...new Set(overlap)].slice(0, 4);

    // Find skill gaps (job tokens not in resume)
    const gapTokens = [...new Set(jobSkillTokens)]
      .filter(t => !resumeSkillSet.has(t) && t.length > 3 && !STOP_WORDS.has(t))
      .slice(0, 3);

    const transitionTime = finalScore >= 75 ? 'Ready Now' : finalScore >= 55 ? '2-3 months prep' : '4-6 months prep';

    return {
      ...job,
      hybrid_score: finalScore,
      domain_affinity: Math.min(99, Math.round(finalScore * 0.95 + (i % 5))),
      keywords: uniqueOverlap.length > 0 ? uniqueOverlap : (parsedResume?.skills || []).slice(0, 3),
      match_reason: `${expLabel} ${domain} profile with ${exp}yr exp matches this ${job.title} role via ${Math.round(cosineScore * 100)}% skill vector overlap.`,
      tip: uniqueOverlap.length > 0
        ? `Highlight your "${uniqueOverlap[0]}" expertise specifically in your application for this role.`
        : `Tailor your resume to mention keywords from this ${job.title} listing.`,
      skill_gap: gapTokens.length > 0 ? gapTokens : ['Domain-specific certifications'],
      transition_time: transitionTime,
      market_demand: getMarketDemand(job.title),
      description_summary: job.description
        ? job.description.substring(0, 100) + '...'
        : `${job.title} role at ${job.company} in ${job.location || location}.`,
      salary: job.salary || (
        exp < 2 ? '₹4-8 LPA' : 
        exp < 5 ? '₹8-15 LPA' : 
        exp < 8 ? '₹15-25 LPA' : 
        exp < 12 ? '₹25-45 LPA' : 
        exp < 16 ? '₹45-70 LPA' : 
        '₹70-120+ LPA'
      ),
      type: job.type || 'Onsite/Hybrid',
      category: job.category || domain,
      isLive: true,
      scoringMethod: 'local-cosine'
    };
  });

  // Sort by score descending
  return scored.sort((a, b) => b.hybrid_score - a.hybrid_score);
}

export { extractSmartKeyword };
