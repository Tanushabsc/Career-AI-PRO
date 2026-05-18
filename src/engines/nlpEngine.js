/**
 * ═══════════════════════════════════════════════════════════════
 *  NLP Engine — Core Natural Language Processing
 *  100% client-side, zero API keys
 * ═══════════════════════════════════════════════════════════════
 */

// ── Stop words ──
const STOP = new Set([
  "the","and","or","in","on","at","to","for","of","with","by","a","an",
  "is","are","was","were","be","been","have","has","had","do","does","did",
  "will","would","could","should","may","might","can","this","that","these",
  "those","i","you","he","she","it","we","they","my","your","his","its",
  "our","their","not","from","as","into","about","over","also","more",
  "some","such","most","very","than","then","when","where","who","what",
  "which","how","all","any","each","both","between","during","after","before",
  "through","while","if","only","up","out","no","so","but","just",
  "new","use","used","using","work","works","working","role",
  "strong","good","excellent","skills","experience","years","team","company",
  "able","etc","per","via","well","like","based","make","made","many"
]);

// ── Tokenize text ──
export function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\+#\.\/\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w));
}

// ── Domain skill taxonomy ──
export const DOMAIN_SKILLS = {
  "Software Engineering": {
    skills: ["javascript","python","java","react","node","git","api","sql","docker","aws","typescript","spring","rest","microservices","algorithms","c++","mongodb","postgresql","redis","graphql","webpack","vue","angular","express","django","flask","ruby","golang","rust","kotlin","swift"],
    weight: 1.0
  },
  "Data Science / AI": {
    skills: ["python","machine learning","deep learning","neural","nlp","tensorflow","pytorch","sklearn","data science","pandas","numpy","statistics","data analysis","regression","analytics","jupyter","keras","xgboost","random forest","computer vision","reinforcement learning","bert","gpt","transformers","feature engineering"],
    weight: 1.0
  },
  "Web Development": {
    skills: ["html","css","javascript","react","angular","vue","node","express","tailwind","bootstrap","sass","webpack","vite","next.js","gatsby","php","wordpress","responsive","frontend","backend","full-stack","ajax","dom","json"],
    weight: 0.9
  },
  "DevOps / Cloud": {
    skills: ["docker","kubernetes","aws","azure","gcp","jenkins","terraform","ci/cd","linux","ansible","devops","pipeline","cloud","helm","prometheus","grafana","nginx","kafka","serverless","lambda","cloudformation","ecs","eks"],
    weight: 1.0
  },
  "Cybersecurity": {
    skills: ["security","penetration","firewall","soc","siem","vulnerability","threat","ethical hacking","cissp","ceh","nmap","wireshark","burpsuite","owasp","encryption","forensics","incident response","malware","ids","ips"],
    weight: 1.0
  },
  "Mobile Development": {
    skills: ["android","ios","react native","flutter","swift","kotlin","xcode","android studio","mobile","app development","firebase","expo","swiftui","jetpack compose","dart"],
    weight: 0.9
  },
  "UI/UX Design": {
    skills: ["figma","sketch","adobe xd","ux","ui","prototype","wireframe","user research","typography","design system","invision","zeplin","usability","accessibility","interaction design","visual design"],
    weight: 0.8
  },
  "Project Management": {
    skills: ["project manager","agile","scrum","pmp","jira","stakeholder","roadmap","delivery","leadership","planning","risk","waterfall","sdlc","kanban","confluence","trello","safe","sprint"],
    weight: 0.8
  },
  "Digital Marketing": {
    skills: ["seo","sem","google analytics","social media","content marketing","email marketing","ppc","facebook ads","google ads","hubspot","mailchimp","conversion","a/b testing","copywriting","brand strategy"],
    weight: 0.7
  },
  "Blockchain": {
    skills: ["blockchain","solidity","ethereum","smart contract","web3","defi","nft","cryptocurrency","hyperledger","consensus","dapp","metamask","truffle","hardhat"],
    weight: 0.9
  },
  "Teaching / Academia": {
    skills: ["teaching","curriculum","lecture","research","students","pedagogy","syllabus","academic","university","assessment","faculty","mentoring","classroom","professor","training"],
    weight: 0.8
  },
  "Data Engineering": {
    skills: ["etl","data pipeline","spark","hadoop","airflow","kafka","data warehouse","snowflake","databricks","dbt","redshift","bigquery","data lake","sql","python","scala"],
    weight: 1.0
  },
  "Human Resources": {
    skills: ["recruitment","onboarding","hris","employee relations","talent acquisition","payroll","compliance","performance management","benefits","workday","bamboo","shrm","phr","interviewing","compensation"],
    weight: 0.8
  },
  "Sales / Business Development": {
    skills: ["sales","b2b","crm","salesforce","lead generation","cold calling","negotiation","account management","closing","pipeline","outbound","inbound","hubspot","forecasting","prospecting"],
    weight: 0.9
  },
  "Arts / Creative Design": {
    skills: ["adobe illustrator","photoshop","indesign","graphic design","typography","color theory","composition","branding","illustration","video editing","premiere pro","after effects","layout","print design","creative direction"],
    weight: 0.8
  }
};

// ── Fresher detection — robust multi-signal approach ──
export function isFresher(text) {
  const lower = text.toLowerCase();

  // Strong fresher signals
  const fresherSignals = [
    "fresher","fresh graduate","recent graduate","final year","final semester",
    "currently pursuing","pursuing b.tech","pursuing btech","currently studying",
    "no experience","seeking entry","entry level","0 years","zero years",
    "looking for first job","internship seeker","campus placement",
    "b.tech student","mca student","bca student","engineering student",
    "undergraduate","final year project","mini project",
  ];
  const hasFresherSignal = fresherSignals.some(s => lower.includes(s));

  // Education-only year patterns (graduation years — NOT work experience)
  const hasGPA = /\b(cgpa|sgpa|gpa|grade|percentage)\b/i.test(text);
  const hasBatch = /\b(batch|passout|class)\s*(of\s*)?20\d{2}/i.test(text);

  // Strong work experience signals (separate each check properly)
  const hasEmploymentKeyword = lower.includes("employed") || lower.includes("worked at") || lower.includes("working at");
  const hasExperienceYears = lower.includes("experience") && /\d+\s*\+?\s*years?\s*(of\s*)?(experience|exp|work|career)/i.test(text);

  // Work date ranges: look for "2015 - 2020" or "2018 - present" patterns
  // BUT ignore education section dates by checking if the surrounding context is work-related
  const workDateRanges = findWorkDateRanges(text);
  const hasRealWorkHistory = hasEmploymentKeyword || hasExperienceYears || workDateRanges.length >= 2;

  // A person is a fresher if they have fresher signals and NO real work history
  // OR if they only have education markers (GPA, batch year) with no work dates
  if (hasFresherSignal && !hasRealWorkHistory) return true;
  if ((hasGPA || hasBatch) && !hasRealWorkHistory && !hasExperienceYears) return true;

  return false;
}

// ── Helper: Find work-related date ranges (not education dates) ──
function findWorkDateRanges(text) {
  const ranges = [];
  const lines = text.split('\n');
  let inEducationSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    // Detect section headers
    if (/^\s*(education|academic|qualification|degree|university|college|school)/i.test(lower)) {
      inEducationSection = true;
      continue;
    }
    if (/^\s*(experience|work|employment|career|professional|project|role|position)/i.test(lower)) {
      inEducationSection = false;
      continue;
    }

    // Skip education section
    if (inEducationSection) continue;

    // Match date ranges like "2015 - 2020" or "2018 - present"
    const datePattern = /\b(19\d\d|20\d\d)\s*[-–to]+\s*(19\d\d|20\d\d|present|till\s*date|current|date)/gi;
    let match;
    while ((match = datePattern.exec(line)) !== null) {
      const startYear = parseInt(match[1]);
      let endYear;
      if (/present|till|current|date/i.test(match[2])) {
        endYear = new Date().getFullYear();
      } else {
        endYear = parseInt(match[2]);
      }
      if (startYear >= 1970 && startYear <= endYear && endYear <= new Date().getFullYear() + 1) {
        ranges.push({ start: startYear, end: endYear });
      }
    }
  }
  return ranges;
}

// ── Experience extraction ──
export function extractYears(text) {
  const lower = text.toLowerCase();
  if (isFresher(text)) return 0;

  const explicitPatterns = [
    /(\d+)\s*\+\s*years?\s*(of\s*)?(career|experience|exp|work)/i,
    /(\d+)\s*years?\s*(of\s*)?(career|experience|exp|work)/i,
    /career\s+spanning\s+(\d+)/i,
    /over\s+(\d+)\s*years?/i,
    /more\s+than\s+(\d+)\s*years?/i,
    /(\d+)\s*years?\s+in\s+(it|industry|field|sector)/i,
  ];
  for (const pat of explicitPatterns) {
    const m = text.match(pat);
    if (m) {
      const n = parseInt(m[1] || m[0].match(/\d+/)[0]);
      if (n >= 1 && n <= 50) return n;
    }
  }

  const workYears = [];
  const yearRangePattern = /\b(19\d\d|20\d\d)\s*[-–to]+\s*(19\d\d|20\d\d|present|till\s*date|current|date)/gi;
  let match;
  while ((match = yearRangePattern.exec(text)) !== null) {
    const startYear = parseInt(match[1]);
    let endYear;
    if (/present|till|current|date/i.test(match[2])) {
      endYear = new Date().getFullYear();
    } else {
      endYear = parseInt(match[2]);
    }
    if (startYear >= 1970 && startYear <= endYear && endYear <= new Date().getFullYear() + 1) {
      workYears.push(startYear, endYear);
    }
  }
  if (workYears.length >= 2) {
    const span = Math.max(...workYears) - Math.min(...workYears);
    if (span >= 1 && span <= 50) return span;
  }

  return 0;
}

// ── Profile type — richer differentiation ──
export function detectProfileType(text, years) {
  const fresher = isFresher(text);
  if (fresher || years === 0) {
    // Distinguish between student and recent graduate
    const lower = text.toLowerCase();
    if (lower.includes("currently pursuing") || lower.includes("currently studying") || lower.includes("final year") || lower.includes("final semester")) {
      return "Student (Currently Studying)";
    }
    if (lower.includes("internship") && !lower.includes("employed")) {
      return "Fresher with Internship Experience";
    }
    return "Fresher / Recent Graduate";
  }
  if (years <= 2)  return "Junior Professional (0–2 yrs)";
  if (years <= 5)  return "Mid-level Professional (3–5 yrs)";
  if (years <= 10) return "Senior Professional (6–10 yrs)";
  if (years <= 20) return "Expert / Senior Leader (10–20 yrs)";
  return `Veteran Expert (${years}+ yrs)`;
}

// ── Domain detection ──
export function detectDomains(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [domain, { skills, weight }] of Object.entries(DOMAIN_SKILLS)) {
    const matched = skills.filter(s => lower.includes(s)).length;
    scores[domain] = matched * weight;
  }
  return Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d]) => d);
}

// ── Name extraction ──
export function extractName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    if (line.length < 50 && line.length > 3 &&
      /^[A-Z][a-zA-Z.]+((\s+[A-Z]\.?)?(\s+[A-Z][a-zA-Z]+))+$/.test(line) &&
      !/mobile|email|phone|address|\d{5}/i.test(line)) {
      return line;
    }
  }
  return "Candidate";
}

// ── Education extraction ──
export function extractEducation(text) {
  const lower = text.toLowerCase();
  const found = [];
  const checks = [
    [/ph\.?d/i, "PhD"], [/doctorate/i, "PhD"],
    [/m\.?phil/i, "M.Phil"],
    [/m\.?tech/i, "M.Tech"], [/m\.?e\.?\b/i, "M.Tech"],
    [/\bmba\b/i, "MBA"], [/\bmca\b/i, "MCA"],
    [/m\.?sc/i, "M.Sc"], [/\bmaster/i, "Masters"],
    [/\bbca\b/i, "BCA"],
    [/b\.?tech/i, "B.Tech"], [/b\.?e\.?\b/i, "B.Tech"],
    [/b\.?sc/i, "B.Sc"], [/\bbachelor/i, "Bachelors"], 
    [/\bdiploma\b/i, "Diploma"], [/\bpgdca\b/i, "PGDCA"],
  ];
  const added = new Set();
  for (const [regex, label] of checks) {
    if (regex.test(text) && !added.has(label)) {
      found.push(label);
      added.add(label);
    }
  }
  return found.length > 0 ? found.slice(0, 3) : ["Not specified"];
}

// ── Skills extraction ──
export function extractSkills(text) {
  const lower = text.toLowerCase();
  const allSkills = [...new Set(Object.values(DOMAIN_SKILLS).flatMap(d => d.skills))];
  return allSkills.filter(s => lower.includes(s));
}

// ── Certifications ──
export function extractCertifications(text) {
  const lower = text.toLowerCase();
  const certs = [
    ["aws certified", "AWS Certified"], ["azure certified", "Azure Certified"],
    ["google cloud", "GCP Certified"], ["pmp", "PMP"],
    ["scrum master", "Scrum Master"], ["csm", "CSM"],
    ["cissp", "CISSP"], ["ceh", "CEH"], ["dassm", "DASSM"],
    ["itil", "ITIL"], ["safe agilist", "SAFe Agilist"],
    ["google analytics", "Google Analytics"],
    ["tableau", "Tableau"], ["power bi", "Power BI"],
    ["nptel", "NPTEL"], ["udemy", "Udemy Certificate"],
    ["coursera", "Coursera Certificate"], ["hackerrank", "HackerRank"],
    ["leetcode", "LeetCode"], ["aws solutions architect", "AWS SA"],
    ["tensorflow developer", "TF Developer"], ["kubernetes", "CKA/CKAD"],
  ];
  return certs.filter(([k]) => lower.includes(k)).map(([, v]) => v);
}

// ── Current role ──
export function extractCurrentRole(text) {
  const rolePatterns = [
    /senior software engineer/i, /software engineer/i, /full.?stack developer/i,
    /frontend developer/i, /backend developer/i, /data scientist/i,
    /data analyst/i, /machine learning engineer/i, /devops engineer/i,
    /product manager/i, /project manager/i, /ui.?ux designer/i,
    /professor/i, /consultant/i, /architect/i, /team lead/i,
    /tech lead/i, /engineering manager/i, /cto/i, /director/i,
  ];
  for (const pat of rolePatterns) {
    if (pat.test(text)) return text.match(pat)[0];
  }
  return null;
}

// ── Contact info extraction ──
export function extractContact(text) {
  const email = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phone = text.match(/[\+]?[\d\s\-\(\)]{10,}/);
  const linkedin = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const github = text.match(/github\.com\/[\w-]+/i);
  return {
    email: email ? email[0] : null,
    phone: phone ? phone[0].trim() : null,
    linkedin: linkedin ? linkedin[0] : null,
    github: github ? github[0] : null,
  };
}

// ── Project extraction ──
export function extractProjects(text) {
  const lower = text.toLowerCase();
  const projectSection = lower.split(/projects?/i).slice(1).join(' ').slice(0, 2000);
  const lines = projectSection.split('\n').filter(l => l.trim().length > 20);
  return lines.slice(0, 6).map(l => l.trim().slice(0, 120));
}

// ── Action verbs analysis ──
export function analyzeActionVerbs(text) {
  const strong = ["led","developed","implemented","designed","architected","optimized","delivered","managed","created","built","launched","automated","reduced","increased","improved","streamlined","mentored","orchestrated","spearheaded","pioneered"];
  const weak = ["responsible for","worked on","helped","assisted","involved in","participated","tasked with","did","was part of"];
  const lower = text.toLowerCase();
  return {
    strong: strong.filter(v => lower.includes(v)),
    weak: weak.filter(v => lower.includes(v)),
    score: Math.min(100, strong.filter(v => lower.includes(v)).length * 12),
  };
}

// ── Quantification analysis ──
export function analyzeQuantification(text) {
  const metrics = text.match(/\d+[%+x×]|\$[\d,]+|\d+\s*(users?|clients?|projects?|team|members?|increase|decrease|reduction|improvement|growth)/gi) || [];
  return {
    count: metrics.length,
    examples: metrics.slice(0, 5),
    score: Math.min(100, metrics.length * 15),
  };
}

// ── Main resume parser ──
export function parseResume(resumeText) {
  const years = extractYears(resumeText);
  const name = extractName(resumeText);
  const education = extractEducation(resumeText);
  const skills = extractSkills(resumeText);
  const certifications = extractCertifications(resumeText);
  const domains = detectDomains(resumeText);
  const profileType = detectProfileType(resumeText, years);
  const currentRole = extractCurrentRole(resumeText);
  const contact = extractContact(resumeText);
  const projects = extractProjects(resumeText);
  const actionVerbs = analyzeActionVerbs(resumeText);
  const quantification = analyzeQuantification(resumeText);
  const fresher = isFresher(resumeText);

  return {
    name,
    years_experience: years,
    profile_type: profileType,
    is_fresher: fresher,
    skills,
    certifications,
    domains,
    primary_domain: domains[0] || "General IT",
    education,
    current_role: currentRole,
    contact,
    projects,
    action_verbs: actionVerbs,
    quantification,
    word_count: resumeText.split(/\s+/).length,
    line_count: resumeText.split('\n').length,
  };
}
