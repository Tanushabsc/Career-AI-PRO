/**
 * ═══════════════════════════════════════════════════════════════
 *  ATS Scoring Engine — Multi-factor resume analysis
 * ═══════════════════════════════════════════════════════════════
 */

import { tokenize, DOMAIN_SKILLS } from './nlpEngine';

// ── Section detection ──
const REQUIRED_SECTIONS = [
  { name: "Contact Information", patterns: ["email", "phone", "linkedin", "github", "@", "contact"] },
  { name: "Professional Summary", patterns: ["summary", "objective", "about me", "profile", "overview"] },
  { name: "Skills", patterns: ["skills", "technical skills", "technologies", "competencies", "tools"] },
  { name: "Experience", patterns: ["experience", "employment", "work history", "professional experience"] },
  { name: "Education", patterns: ["education", "academic", "qualification", "degree", "university", "college"] },
  { name: "Projects", patterns: ["projects", "portfolio", "personal projects", "key projects"] },
  { name: "Certifications", patterns: ["certification", "certified", "certificate", "accreditation"] },
];

// ── Strong action verbs ──
const ACTION_VERBS = [
  "achieved","administered","analyzed","built","collaborated","created",
  "decreased","delivered","designed","developed","directed","engineered",
  "established","expanded","generated","implemented","improved","increased",
  "launched","led","managed","mentored","migrated","optimized","orchestrated",
  "pioneered","planned","reduced","refactored","resolved","scaled",
  "spearheaded","streamlined","supervised","transformed","upgraded"
];

// ── Weak phrases ──
const WEAK_PHRASES = [
  "responsible for","duties included","helped with","assisted in",
  "involved in","participated in","tasked with","worked on",
  "was part of","team player","hard worker","fast learner",
  "references available","salary negotiable"
];

/**
 * Calculate comprehensive ATS score
 */
export function calculateATSScore(resumeText, parsedResume, targetDomain = null) {
  const lower = resumeText.toLowerCase();
  const lines = resumeText.split('\n').filter(l => l.trim());
  const words = resumeText.split(/\s+/);

  // 1. Keyword Match Score (30%)
  const keywordScore = calculateKeywordScore(lower, parsedResume, targetDomain);

  // 2. Section Completeness (20%)
  const sectionScore = calculateSectionScore(lower);

  // 3. Formatting Score (15%)
  const formattingScore = calculateFormattingScore(resumeText, lines);

  // 4. Skill Depth (15%)
  const skillScore = calculateSkillDepthScore(parsedResume);

  // 5. Experience Relevance (10%)
  const experienceScore = calculateExperienceScore(parsedResume, lower);

  // 6. Readability & Impact (10%)
  const readabilityScore = calculateReadabilityScore(lower, words, lines);

  const total = Math.round(
    keywordScore.score * 0.30 +
    sectionScore.score * 0.20 +
    formattingScore.score * 0.15 +
    skillScore.score * 0.15 +
    experienceScore.score * 0.10 +
    readabilityScore.score * 0.10
  );

  // Derived startup-grade metrics
  const potential = Math.round((total * 0.4) + (skillScore.skillCount * 2) + (experienceScore.years * 2));
  const readiness = Math.round((total * 0.7) + (sectionScore.found.length * 5));

  return {
    total: Math.min(100, Math.max(0, total)),
    potential: Math.min(100, potential),
    readiness: Math.min(100, readiness),
    breakdown: {
      keywords: keywordScore,
      sections: sectionScore,
      formatting: formattingScore,
      skills: skillScore,
      experience: experienceScore,
      readability: readabilityScore,
    },
    grade: getGrade(total),
    suggestions: generateSuggestions(keywordScore, sectionScore, formattingScore, skillScore, experienceScore, readabilityScore),
  };
}

function calculateKeywordScore(lower, parsedResume, targetDomain) {
  const domain = targetDomain || parsedResume.primary_domain || "Software Engineering";
  const domainData = DOMAIN_SKILLS[domain];
  if (!domainData) return { score: 50, matched: [], missing: [], domain };

  const matched = domainData.skills.filter(s => lower.includes(s));
  const missing = domainData.skills.filter(s => !lower.includes(s));
  const ratio = matched.length / Math.max(domainData.skills.length, 1);

  return {
    score: Math.min(100, Math.round(ratio * 130)),
    matched,
    missing: missing.slice(0, 10),
    domain,
    total: domainData.skills.length,
    found: matched.length,
  };
}

function calculateSectionScore(lower) {
  const found = [];
  const missing = [];
  for (const section of REQUIRED_SECTIONS) {
    const hasSection = section.patterns.some(p => lower.includes(p));
    if (hasSection) found.push(section.name);
    else missing.push(section.name);
  }
  return {
    score: Math.round((found.length / REQUIRED_SECTIONS.length) * 100),
    found,
    missing,
    total: REQUIRED_SECTIONS.length,
  };
}

function calculateFormattingScore(text, lines) {
  let score = 60; // base
  const bulletCount = (text.match(/[•\-\*▸►]/g) || []).length;
  if (bulletCount >= 5) score += 15;
  else if (bulletCount >= 2) score += 8;

  const avgLineLen = lines.reduce((a, l) => a + l.length, 0) / Math.max(lines.length, 1);
  if (avgLineLen < 120) score += 10;

  if (lines.length >= 20 && lines.length <= 80) score += 10;

  const hasTable = /<table|<tr|<td|\t{3,}/i.test(text);
  if (hasTable) score -= 15;

  const hasImage = /<img|\.jpg|\.png|\.gif/i.test(text);
  if (hasImage) score -= 10;

  return {
    score: Math.min(100, Math.max(0, score)),
    bulletCount,
    avgLineLen: Math.round(avgLineLen),
    lineCount: lines.length,
    issues: [
      ...(bulletCount < 3 ? ["Add more bullet points for better readability"] : []),
      ...(avgLineLen > 120 ? ["Lines are too long — break into shorter bullets"] : []),
      ...(hasTable ? ["Avoid tables — ATS may not parse them correctly"] : []),
      ...(lines.length < 15 ? ["Resume appears too short — aim for 1-2 pages"] : []),
      ...(lines.length > 80 ? ["Resume may be too long — try to keep it concise"] : []),
    ],
  };
}

function calculateSkillDepthScore(parsedResume) {
  const skillCount = parsedResume.skills?.length || 0;
  const certCount = parsedResume.certifications?.length || 0;
  let score = Math.min(70, skillCount * 5) + Math.min(30, certCount * 10);
  return {
    score: Math.min(100, score),
    skillCount,
    certCount,
    level: skillCount > 12 ? "Expert" : skillCount > 6 ? "Proficient" : skillCount > 3 ? "Intermediate" : "Beginner",
  };
}

function calculateExperienceScore(parsedResume, lower) {
  const years = parsedResume.years_experience || 0;
  let score = 40;
  if (years > 0) score += Math.min(30, years * 5);
  if (parsedResume.current_role) score += 15;
  if (parsedResume.projects?.length > 0) score += 15;
  return {
    score: Math.min(100, score),
    years,
    hasRole: !!parsedResume.current_role,
    projectCount: parsedResume.projects?.length || 0,
  };
}

function calculateReadabilityScore(lower, words, lines) {
  let score = 50;

  // Action verbs
  const actionVerbCount = ACTION_VERBS.filter(v => lower.includes(v)).length;
  score += Math.min(25, actionVerbCount * 4);

  // Weak phrases
  const weakCount = WEAK_PHRASES.filter(p => lower.includes(p)).length;
  score -= weakCount * 8;

  // Quantification
  const numbers = lower.match(/\d+%|\d+x|\$[\d,]+|\d+\s*(users|customers|projects|clients)/g) || [];
  score += Math.min(20, numbers.length * 5);

  // Word count
  if (words.length >= 300 && words.length <= 900) score += 5;

  return {
    score: Math.min(100, Math.max(0, score)),
    actionVerbs: ACTION_VERBS.filter(v => lower.includes(v)),
    weakPhrases: WEAK_PHRASES.filter(p => lower.includes(p)),
    quantifications: numbers.length,
    wordCount: words.length,
  };
}

function getGrade(score) {
  if (score >= 90) return { letter: "A+", label: "Excellent", color: "#10b981" };
  if (score >= 80) return { letter: "A", label: "Very Good", color: "#10b981" };
  if (score >= 70) return { letter: "B+", label: "Good", color: "#22d3ee" };
  if (score >= 60) return { letter: "B", label: "Above Average", color: "#06b6d4" };
  if (score >= 50) return { letter: "C", label: "Average", color: "#f59e0b" };
  if (score >= 40) return { letter: "D", label: "Below Average", color: "#f97316" };
  return { letter: "F", label: "Needs Improvement", color: "#ef4444" };
}

function generateSuggestions(keywords, sections, formatting, skills, experience, readability) {
  const suggestions = [];

  if (keywords.score < 60) {
    suggestions.push({
      priority: "high",
      category: "Keywords",
      text: `Add domain-relevant keywords: ${keywords.missing.slice(0, 5).join(", ")}`,
      impact: "+15-25 ATS points",
    });
  }

  if (sections.missing.length > 0) {
    suggestions.push({
      priority: "high",
      category: "Sections",
      text: `Add missing sections: ${sections.missing.join(", ")}`,
      impact: "+10-20 ATS points",
    });
  }

  if (readability.weakPhrases.length > 0) {
    suggestions.push({
      priority: "medium",
      category: "Language",
      text: `Replace weak phrases like "${readability.weakPhrases[0]}" with strong action verbs`,
      impact: "+5-10 ATS points",
    });
  }

  if (readability.quantifications < 3) {
    suggestions.push({
      priority: "medium",
      category: "Impact",
      text: "Add more quantified achievements (%, $, numbers)",
      impact: "+5-15 ATS points",
    });
  }

  if (formatting.bulletCount < 5) {
    suggestions.push({
      priority: "low",
      category: "Formatting",
      text: "Use more bullet points for better scannability",
      impact: "+3-8 ATS points",
    });
  }

  if (skills.certCount === 0) {
    suggestions.push({
      priority: "medium",
      category: "Certifications",
      text: "Add relevant certifications to boost credibility",
      impact: "+5-10 ATS points",
    });
  }

  return suggestions;
}
