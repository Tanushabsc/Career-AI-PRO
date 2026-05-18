/**
 * Resume Improvement Engine
 */

const WEAK_PATTERNS = [
  { pattern: /responsible for/gi, fix: "Led / Managed / Drove", reason: "Passive voice — use action verbs" },
  { pattern: /worked on/gi, fix: "Developed / Built / Engineered", reason: "Vague — specify what you did" },
  { pattern: /helped with/gi, fix: "Contributed to / Collaborated on", reason: "Minimizes your role" },
  { pattern: /assisted in/gi, fix: "Supported / Facilitated / Co-led", reason: "Sounds subordinate" },
  { pattern: /involved in/gi, fix: "Participated in / Contributed to", reason: "Unclear contribution" },
  { pattern: /team player/gi, fix: "Collaborated with cross-functional teams of X members", reason: "Cliché — show evidence" },
  { pattern: /hard worker/gi, fix: "Consistently delivered ahead of deadlines", reason: "Cliché — quantify effort" },
  { pattern: /fast learner/gi, fix: "Quickly ramped up on [technology] within [timeframe]", reason: "Show proof instead" },
  { pattern: /duties included/gi, fix: "Key achievements:", reason: "Focus on impact, not duties" },
  { pattern: /good communication/gi, fix: "Presented to stakeholders / Led team meetings", reason: "Demonstrate, don't claim" },
];

const BULLET_TEMPLATES = {
  development: [
    "Developed [feature/system] using [technology], resulting in [measurable outcome]",
    "Built and deployed [application] serving [X users], reducing [metric] by [X%]",
    "Architected [system] with [technology stack], improving [performance metric] by [X%]",
    "Implemented [feature] that increased [user engagement/revenue] by [X%]",
  ],
  leadership: [
    "Led a team of [X] engineers to deliver [project] [on time/ahead of schedule]",
    "Mentored [X] junior developers, resulting in [outcome]",
    "Drove adoption of [practice/tool] across [X] teams, improving [metric] by [X%]",
    "Coordinated with [X] stakeholders to define product roadmap for [initiative]",
  ],
  optimization: [
    "Optimized [system/process] performance by [X%] through [specific technique]",
    "Reduced [deployment time/costs/errors] by [X%] by implementing [solution]",
    "Automated [process] saving [X hours/week] of manual work",
    "Streamlined [workflow] resulting in [X%] faster [delivery/processing]",
  ],
  dataAI: [
    "Built ML pipeline achieving [X%] accuracy on [task], processing [X] records daily",
    "Developed NLP model for [use case] with [X%] precision/recall",
    "Analyzed [X] data points to derive insights that drove [business decision]",
    "Deployed [model] to production serving [X] predictions per [timeframe]",
  ],
};

export function analyzeResumeBullets(resumeText) {
  const issues = [];
  for (const wp of WEAK_PATTERNS) {
    const matches = resumeText.match(wp.pattern);
    if (matches) {
      issues.push({
        found: matches[0],
        suggestion: wp.fix,
        reason: wp.reason,
        severity: "medium",
      });
    }
  }
  return issues;
}

export function getImprovedBullets(parsedResume) {
  const domain = parsedResume.primary_domain || "Software Engineering";
  const templates = [];
  if (domain.includes("Data") || domain.includes("AI")) templates.push(...BULLET_TEMPLATES.dataAI);
  else templates.push(...BULLET_TEMPLATES.development);
  if (parsedResume.years_experience > 5) templates.push(...BULLET_TEMPLATES.leadership);
  templates.push(...BULLET_TEMPLATES.optimization);
  return templates;
}

export function generateSummary(parsedResume) {
  const { name, primary_domain, years_experience, skills, education } = parsedResume;
  const topSkills = (skills || []).slice(0, 5).join(", ");
  const edu = (education || [])[0] || "";
  if (years_experience === 0) {
    return `Motivated ${edu} graduate with strong foundation in ${primary_domain}. Skilled in ${topSkills}. Seeking opportunities to apply academic knowledge and grow professionally.`;
  }
  if (years_experience <= 3) {
    return `Results-driven ${primary_domain} professional with ${years_experience}+ years of experience. Proficient in ${topSkills}. Passionate about building impactful solutions.`;
  }
  return `Experienced ${primary_domain} professional with ${years_experience}+ years delivering high-impact solutions. Expert in ${topSkills}. Proven track record of leading teams and driving technical excellence.`;
}

export function scoreResumeQuality(resumeText, parsedResume) {
  let score = 50;
  const issues = analyzeResumeBullets(resumeText);
  score -= issues.length * 5;
  if (parsedResume.action_verbs?.score) score += parsedResume.action_verbs.score * 0.2;
  if (parsedResume.quantification?.count > 3) score += 15;
  else if (parsedResume.quantification?.count > 0) score += 8;
  if (parsedResume.skills?.length > 8) score += 10;
  if (parsedResume.certifications?.length > 0) score += 10;
  if (parsedResume.word_count > 300 && parsedResume.word_count < 900) score += 5;
  return Math.min(100, Math.max(0, Math.round(score)));
}
