/**
 * Skill Gap Analysis Engine
 */
import { DOMAIN_SKILLS } from './nlpEngine';

export function analyzeSkillGap(parsedResume, targetDomain = null) {
  const domain = targetDomain || parsedResume.primary_domain || "Software Engineering";
  const userSkills = new Set((parsedResume.skills || []).map(s => s.toLowerCase()));
  const domainData = DOMAIN_SKILLS[domain];
  if (!domainData) return { matched: [], missing: [], recommended: [], score: 0 };

  const matched = domainData.skills.filter(s => userSkills.has(s));
  const missing = domainData.skills.filter(s => !userSkills.has(s));

  // Cross-domain skills the user has
  const allDomainSkills = new Set(domainData.skills);
  const bonusSkills = [...userSkills].filter(s => !allDomainSkills.has(s));

  // Recommended learning order (prioritize high-impact missing skills)
  const highPriority = missing.slice(0, 5);
  const medPriority = missing.slice(5, 10);

  const score = Math.round((matched.length / Math.max(domainData.skills.length, 1)) * 100);

  // Strength per domain
  const domainStrengths = Object.entries(DOMAIN_SKILLS).map(([name, data]) => {
    const m = data.skills.filter(s => userSkills.has(s)).length;
    return { domain: name, matched: m, total: data.skills.length, percentage: Math.round((m / Math.max(data.skills.length, 1)) * 100) };
  }).filter(d => d.matched > 0).sort((a, b) => b.percentage - a.percentage);

  return {
    domain,
    matched,
    missing,
    bonusSkills: bonusSkills.slice(0, 10),
    highPriority,
    medPriority,
    score,
    domainStrengths,
    totalSkills: userSkills.size,
    suggestions: generateSkillSuggestions(matched, missing, parsedResume),
  };
}

function generateSkillSuggestions(matched, missing, parsed) {
  const suggestions = [];
  if (missing.length > 5) {
    suggestions.push({ type: "course", text: `Take an online course covering ${missing.slice(0,3).join(", ")}`, priority: "high" });
  }
  if (parsed.is_fresher) {
    suggestions.push({ type: "project", text: `Build 2-3 portfolio projects using ${missing.slice(0,2).join(" and ")}`, priority: "high" });
    suggestions.push({ type: "internship", text: "Apply for internships to gain practical experience", priority: "high" });
  }
  if (matched.length < 5) {
    suggestions.push({ type: "certification", text: `Get certified in your primary domain to validate skills`, priority: "medium" });
  }
  if (missing.some(s => ["docker","aws","cloud","kubernetes"].includes(s))) {
    suggestions.push({ type: "cloud", text: "Learn cloud/DevOps basics — increasingly required across all roles", priority: "medium" });
  }
  if (missing.some(s => ["git","api","sql"].includes(s))) {
    suggestions.push({ type: "fundamentals", text: "Strengthen fundamentals: Git, SQL, and API design are universal requirements", priority: "high" });
  }
  return suggestions;
}

// Radar chart data for skill visualization
export function getSkillRadarData(parsedResume) {
  const userSkills = new Set((parsedResume.skills || []).map(s => s.toLowerCase()));
  
  // Dynamically select the top 6 domains relevant to the user
  const domainScores = Object.entries(DOMAIN_SKILLS).map(([cat, data]) => {
    const matchedCount = data.skills.filter(s => userSkills.has(s)).length;
    return { 
      category: cat, 
      score: Math.round((matchedCount / Math.max(data.skills.length, 1)) * 100),
      matchedCount 
    };
  });
  
  // Sort by matched count to get the most relevant domains, then take top 6
  domainScores.sort((a, b) => b.matchedCount - a.matchedCount);
  const topCategories = domainScores.slice(0, 6);
  
  // If the user has a primary domain that isn't in the top 6 (rare), swap it in
  const primary = parsedResume.primary_domain;
  if (primary && !topCategories.some(c => c.category === primary) && DOMAIN_SKILLS[primary]) {
    const data = DOMAIN_SKILLS[primary];
    const m = data.skills.filter(s => userSkills.has(s)).length;
    topCategories[5] = { category: primary, score: Math.round((m / Math.max(data.skills.length, 1)) * 100) };
  }

  return topCategories.map(cat => ({
    category: cat.category.split('/')[0].trim(),
    value: cat.score
  }));
}
