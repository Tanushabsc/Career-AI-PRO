/**
 * Embedding Engine — TF-IDF + Cosine Similarity + Domain-Aware Scoring
 * 
 * Fixed: Domain coverage (e.g. 80% in Teaching) now properly reflects
 * in job match scores. Previous version underweighted domain affinity
 * and skill overlap, causing a major disconnect between Skill Gap and
 * Job Match pages.
 */
import { tokenize, DOMAIN_SKILLS } from './nlpEngine';

const SYNONYMS = {
  "javascript": ["js","ecmascript","es6"],
  "python": ["py","python3"],
  "machine learning": ["ml","ai","deep learning"],
  "react": ["reactjs","react.js","jsx"],
  "node": ["nodejs","node.js","express"],
  "docker": ["containerization","containers"],
  "kubernetes": ["k8s","container orchestration"],
  "aws": ["amazon web services","ec2","s3"],
  "api": ["rest api","restful","graphql"],
  "database": ["sql","nosql","mongodb","postgresql"],
  "devops": ["ci/cd","continuous integration"],
  "chatbot": ["conversational ai","virtual assistant"],
  "nlp": ["natural language processing","text analysis"],
  "cloud": ["cloud computing","saas","paas"],
  "testing": ["qa","quality assurance","unit test"],
  // Teaching / Academia synonyms
  "teaching": ["instruction","educator","taught","teach"],
  "professor": ["lecturer","faculty member","instructor"],
  "curriculum": ["course design","syllabus design","program design"],
  "students": ["learners","scholars","pupils"],
  "mentoring": ["mentorship","guidance","coaching","mentor"],
  "research": ["researcher","publication","published","papers"],
  "academic": ["academia","academics","scholarly"],
  "university": ["college","institute","institution"],
  "pedagogy": ["pedagogical","teaching methodology","andragogy"],
  "training": ["trainer","trained","workshops","bootcamp"],
};

function expandWithSynonyms(tokens) {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const [key, syns] of Object.entries(SYNONYMS)) {
      if (token === key || syns.includes(token)) {
        expanded.add(key);
        syns.forEach(s => expanded.add(s));
      }
    }
  }
  return [...expanded];
}

function cosineSim(vecA, vecB) {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0, nA = 0, nB = 0;
  for (const k of allKeys) {
    const a = vecA[k] || 0, b = vecB[k] || 0;
    dot += a * b; nA += a * a; nB += b * b;
  }
  return (nA === 0 || nB === 0) ? 0 : dot / (Math.sqrt(nA) * Math.sqrt(nB));
}

function buildTFIDF(docs) {
  const N = docs.length;
  const df = {};
  const tokenSets = docs.map(doc => {
    const s = new Set(expandWithSynonyms(tokenize(doc)));
    for (const t of s) df[t] = (df[t] || 0) + 1;
    return s;
  });
  return docs.map((doc, i) => {
    const allT = expandWithSynonyms(tokenize(doc));
    const tf = {};
    for (const t of allT) tf[t] = (tf[t] || 0) + 1;
    const vec = {};
    for (const t of tokenSets[i]) {
      vec[t] = (tf[t] / Math.max(allT.length, 1)) * Math.log(N / (df[t] || 1));
    }
    return vec;
  });
}

export function semanticMatch(resumeText, jobs) {
  const docs = [resumeText, ...jobs.map(j => `${j.title} ${j.desc} ${j.keywords.join(' ')} ${j.category}`)];
  const vecs = buildTFIDF(docs);
  return jobs.map((job, i) => ({
    ...job,
    semantic_score: Math.round(cosineSim(vecs[0], vecs[i + 1]) * 100),
  })).sort((a, b) => b.semantic_score - a.semantic_score);
}

/**
 * Calculate domain affinity — how well the user's skills match the job's domain.
 * This directly uses the DOMAIN_SKILLS taxonomy so that an 80% match in Teaching
 * translates to a high domain affinity score for Teaching jobs.
 */
function calcDomainAffinity(parsedResume, job) {
  const userSkills = new Set((parsedResume.skills || []).map(s => s.toLowerCase()));
  const userDomains = parsedResume.domains || [];

  // Find which domain(s) this job belongs to
  const jobCategory = (job.category || '').toLowerCase();

  // Check all domains against the job category
  let bestAffinity = 0;
  for (const [domainName, domainData] of Object.entries(DOMAIN_SKILLS)) {
    const domainLower = domainName.toLowerCase();
    // Does this domain match the job's category?
    const categoryMatch = jobCategory.includes(domainLower.split('/')[0].trim()) ||
                          domainLower.includes(jobCategory.split('/')[0].trim()) ||
                          jobCategory.includes(domainLower.split(' ')[0]) ||
                          domainLower.includes(jobCategory.split(' ')[0]);

    if (categoryMatch) {
      const matched = domainData.skills.filter(s => userSkills.has(s)).length;
      const coverage = matched / Math.max(domainData.skills.length, 1);
      bestAffinity = Math.max(bestAffinity, coverage);
    }
  }

  // Also boost if the user's primary domain matches the job category
  const primaryDomain = (parsedResume.primary_domain || '').toLowerCase();
  if (jobCategory.includes(primaryDomain.split('/')[0].trim()) ||
      primaryDomain.includes(jobCategory.split('/')[0].trim())) {
    bestAffinity = Math.max(bestAffinity, 0.5); // At minimum 50% if primary domain matches
  }

  // Also check if user domains list contains the job category
  for (const ud of userDomains) {
    const udLower = ud.toLowerCase();
    if (jobCategory.includes(udLower.split('/')[0].trim()) ||
        udLower.includes(jobCategory.split('/')[0].trim())) {
      bestAffinity = Math.max(bestAffinity, 0.4);
    }
  }

  return bestAffinity;
}

/**
 * Separate core skill keywords from auxiliary/contextual keywords.
 * Core skills are more important for matching.
 */
function classifyKeywords(keywords) {
  const auxiliaryTerms = new Set([
    "fresher","junior","intern","trainee","entry level","graduate","senior",
    "leadership","industry","international","remote","hybrid","onsite",
    "company","team","client","management","delivery","planning","reporting",
    "documentation","communication","strategy","governance","portfolio",
  ]);

  const core = [];
  const auxiliary = [];
  for (const kw of keywords) {
    if (auxiliaryTerms.has(kw.toLowerCase())) {
      auxiliary.push(kw);
    } else {
      core.push(kw);
    }
  }
  return { core, auxiliary };
}

export function hybridJobMatch(resumeText, parsedResume, jobs, pivotGoal = '') {
  const lower = resumeText.toLowerCase();
  const resumeSkills = new Set((parsedResume.skills || []).map(s => s.toLowerCase()));
  const semResults = semanticMatch(resumeText + ' ' + pivotGoal, jobs);

  return semResults.map(job => {
    // 1. Semantic TF-IDF score (boost it — raw cosine is naturally low for doc-vs-short-text)
    const boostedSemantic = Math.min(100, job.semantic_score * 1.8);

    // 2. Keyword matching — separate core vs auxiliary
    const { core, auxiliary } = classifyKeywords(job.keywords);
    const coreMatched = core.filter(k => lower.includes(k.toLowerCase()));
    const auxMatched = auxiliary.filter(k => lower.includes(k.toLowerCase()));
    const allMatched = [...coreMatched, ...auxMatched];

    // Core keywords matter more than auxiliary
    const coreScore = (coreMatched.length / Math.max(core.length, 1)) * 100;
    const auxScore = (auxMatched.length / Math.max(auxiliary.length, 1)) * 100;
    const kwScore = coreScore * 0.8 + auxScore * 0.2;

    // 3. Domain-aware skill overlap
    const jobSkills = new Set(core.map(k => k.toLowerCase()));
    const overlap = [...resumeSkills].filter(s => jobSkills.has(s));
    const skillScore = (overlap.length / Math.max(jobSkills.size, 1)) * 100;

    // 4. Domain affinity — THE KEY FIX
    // If user has 80% coverage in Teaching and job is Teaching, this should be ~80
    const domainAffinity = calcDomainAffinity(parsedResume, job) * 100;

    // 5. Experience level alignment bonus
    let expBonus = 0;
    const years = parsedResume.years_experience || 0;
    const isFresher = parsedResume.is_fresher || false;
    const jobDesc = (job.desc || '').toLowerCase();
    const jobKwStr = job.keywords.join(' ').toLowerCase();

    if (isFresher && (jobKwStr.includes('fresher') || jobKwStr.includes('junior') || jobKwStr.includes('entry level'))) {
      expBonus = 15;  // Fresher applying for fresher jobs
    } else if (!isFresher && years >= 10 && (jobKwStr.includes('senior') || jobKwStr.includes('professor') || jobKwStr.includes('director') || jobKwStr.includes('head'))) {
      expBonus = 12;  // Senior applying for senior jobs
    } else if (!isFresher && years >= 5 && !jobKwStr.includes('fresher')) {
      expBonus = 5;   // Experienced applying for non-fresher jobs
    }

    // HYBRID FORMULA — Rebalanced to respect domain expertise
    // Old: semantic*0.50 + keyword*0.30 + skill*0.20  (domain coverage ignored!)
    // New: domain*0.30 + semantic*0.25 + keyword*0.20 + skill*0.15 + exp*0.10
    const hybrid = Math.round(
      domainAffinity * 0.30 +
      boostedSemantic * 0.25 +
      kwScore * 0.20 +
      skillScore * 0.15 +
      expBonus
    );

    // Skill gap — only show meaningful gaps (core skills user doesn't have)
    const gap = core
      .filter(k => !lower.includes(k.toLowerCase()) && k.length > 3)
      .slice(0, 8);

    // Match reason — more context-aware
    let reason;
    if (domainAffinity >= 60 && coreMatched.length >= 3) {
      reason = `Strong match: experience with ${coreMatched.slice(0,3).join(", ")} maps to this ${job.title} role.`;
    } else if (domainAffinity >= 40 && coreMatched.length >= 1) {
      reason = `Good domain fit: your ${parsedResume.primary_domain} expertise with ${coreMatched.slice(0,2).join(" and ")} aligns well.`;
    } else if (coreMatched.length >= 3) {
      reason = `Skill match: experience with ${coreMatched.slice(0,3).join(", ")} maps to this ${job.title} role.`;
    } else if (coreMatched.length > 0) {
      reason = `Your background in ${coreMatched.join(" and ")} is relevant to this position.`;
    } else {
      reason = `Your ${parsedResume.primary_domain} background could transfer to this role.`;
    }

    const tip = gap.length > 0
      ? `Add ${gap.slice(0,2).join(" and ")} — even a short project or cert will help.`
      : "Quantify achievements with specific metrics to stand out.";

    return {
      ...job,
      hybrid_score: Math.min(100, Math.max(5, hybrid)),
      keyword_score: Math.round(kwScore),
      domain_affinity: Math.round(domainAffinity),
      skill_gap: gap,
      keyword_matched: allMatched,
      match_reason: reason,
      tip,
    };
  }).sort((a, b) => b.hybrid_score - a.hybrid_score);
}

export function textSimilarity(a, b) {
  const v = buildTFIDF([a, b]);
  return cosineSim(v[0], v[1]);
}
