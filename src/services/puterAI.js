/**
 * Puter.js AI Service — Free AI chat, no API key needed
 * Handles career transition queries, fresher/experienced differentiation
 */

let puterLoaded = false;

function ensurePuterLoaded() {
  return new Promise((resolve) => {
    if (window.puter) { puterLoaded = true; resolve(); return; }
    if (document.querySelector('script[src*="puter"]')) {
      const check = setInterval(() => {
        if (window.puter) { puterLoaded = true; clearInterval(check); resolve(); }
      }, 200);
      setTimeout(() => { clearInterval(check); resolve(); }, 5000);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/';
    script.onload = () => {
      const check = setInterval(() => {
        if (window.puter) { puterLoaded = true; clearInterval(check); resolve(); }
      }, 200);
      setTimeout(() => { clearInterval(check); resolve(); }, 5000);
    };
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

/**
 * Safely extract string content from any Puter AI response shape.
 * Puter can return: a string, { message: { content } }, { text },
 * an array of messages, or a deeply nested object.
 */
function extractResponseText(response) {
  if (typeof response === 'string') return response;
  if (!response) return null;

  // { message: { content: "..." } }
  if (response.message?.content && typeof response.message.content === 'string') {
    return response.message.content;
  }
  // { text: "..." }
  if (response.text && typeof response.text === 'string') {
    return response.text;
  }
  // { content: "..." }
  if (response.content && typeof response.content === 'string') {
    return response.content;
  }
  // Array of messages — e.g. [{ message: { content: "..." } }]
  if (Array.isArray(response)) {
    for (const item of response) {
      const extracted = extractResponseText(item);
      if (extracted) return extracted;
    }
  }
  // { choices: [{ message: { content } }] } — OpenAI-compatible shape
  if (response.choices && Array.isArray(response.choices)) {
    for (const choice of response.choices) {
      const extracted = extractResponseText(choice);
      if (extracted) return extracted;
    }
  }

  // Last resort: try JSON.stringify to surface something readable
  try {
    const json = JSON.stringify(response);
    if (json && json !== '{}' && json !== '[]') {
      // Try to extract any "content" field deep inside
      const contentMatch = json.match(/"content"\s*:\s*"([^"]+)"/);
      if (contentMatch) return contentMatch[1].replace(/\\n/g, '\n');
    }
  } catch (_) { /* ignore */ }

  return null;
}

export async function chatWithAI(userMessage, context = {}) {
  await ensurePuterLoaded();

  const systemPrompt = buildSystemPrompt(context);

  if (window.puter?.ai?.chat) {
    try {
      const response = await window.puter.ai.chat(systemPrompt + "\n\nUser: " + userMessage);
      const text = extractResponseText(response);
      if (text) return text;
      // If extraction failed, fall back to smart local response
      console.warn("Puter AI: Could not extract text from response:", response);
      return getFallbackResponse(userMessage, context);
    } catch (err) {
      console.warn("Puter AI error:", err);
      return getFallbackResponse(userMessage, context);
    }
  }

  return getFallbackResponse(userMessage, context);
}

function buildSystemPrompt(context) {
  const parts = ["You are CareerAI, an expert career mentor and resume advisor. Give concise, actionable advice."];

  // Profile-aware context
  if (context.isFresher) {
    parts.push("The user is a FRESHER / STUDENT with no professional experience. Focus on internships, entry-level roles, projects, skill-building, and campus placement strategies.");
  } else if (context.years !== undefined && context.years > 0) {
    parts.push(`The user has ${context.years} years of professional experience. Tailor advice to their seniority level.`);
  }

  if (context.profileType) parts.push(`Profile Type: ${context.profileType}`);
  if (context.skills?.length) parts.push(`User skills: ${context.skills.slice(0, 10).join(", ")}`);
  if (context.domain) parts.push(`Current Domain: ${context.domain}`);
  if (context.atsScore !== undefined) parts.push(`ATS Score: ${context.atsScore}/100`);

  // Career transition context
  if (context.transitionGoal) {
    parts.push(`The user wants to TRANSITION their career to: ${context.transitionGoal}. Provide specific, actionable transition advice including skills to learn, certifications, bridge roles, and timeline.`);
  }

  parts.push("Keep responses under 200 words. Be specific and practical. Use bullet points. Format with **bold** for emphasis.");
  return parts.join("\n");
}

function getFallbackResponse(message, context) {
  const lower = message.toLowerCase();
  const skills = context.skills || [];
  const domain = context.domain || "tech";
  const isFresher = context.isFresher || false;
  const years = context.years || 0;
  const profileType = context.profileType || "professional";

  // ── Career Transition / Pivot queries ──
  if (lower.includes("transition") || lower.includes("switch") || lower.includes("pivot") ||
      lower.includes("move to") || lower.includes("change career") || lower.includes("want to enter") ||
      lower.includes("shift to") || lower.includes("switch to")) {

    // Detect target domain from the message
    const transitionTarget = detectTransitionTarget(lower);

    if (transitionTarget) {
      return getTransitionAdvice(transitionTarget, domain, years, isFresher, skills);
    }

    return `Great question about career transitions! 🔄\n\nBased on your **${profileType}** profile in **${domain}**, here are viable transition paths:\n\n` +
      getTransitionOptions(domain, isFresher, years) +
      `\n\n💡 **Tip**: Tell me specifically which field you want to transition into, and I'll give you a detailed roadmap!\n\nExamples: "I want to switch to Data Science", "How do I enter academia?", "I want to move to product management"`;
  }

  // ── Fresher-specific responses ──
  if (isFresher) {
    if (lower.includes("skill") || lower.includes("learn")) {
      return `As a **fresher in ${domain}**, here are the most impactful skills to build:\n\n` +
        `• **Core fundamentals**: Master one programming language deeply (Python or JavaScript)\n` +
        `• **Build projects**: Create 3-4 portfolio projects that solve real problems\n` +
        `• **Version control**: Git and GitHub are essential — start contributing\n` +
        `• **DSA practice**: LeetCode/HackerRank daily for placement prep\n` +
        `• **Soft skills**: Communication, teamwork, and presentation skills\n\n` +
        `🎯 **Quick win**: Deploy a project on Vercel/Netlify and add it to your resume. Recruiters love seeing live demos!`;
    }
    if (lower.includes("resume") || lower.includes("improve")) {
      return `**Fresher Resume Tips** — stand out without experience:\n\n` +
        `• **Lead with projects**: Your projects ARE your experience — describe them like work\n` +
        `• **Use action verbs**: "Built a React dashboard that…" not "Made a project"\n` +
        `• **Add metrics**: "Achieved 95% test coverage" or "Handled 1000+ API requests"\n` +
        `• **Include skills section**: List relevant technical skills prominently\n` +
        `• **Highlight education**: CGPA, relevant coursework, academic achievements\n` +
        `• **Certifications**: Even free ones (Coursera, freeCodeCamp) add credibility\n` +
        `• **Format**: Keep it to 1 page, clean and ATS-friendly`;
    }
    if (lower.includes("interview")) {
      return `**Fresher Interview Prep** — campus & off-campus:\n\n` +
        `• **Aptitude round**: Practice quant, logical reasoning, and verbal daily\n` +
        `• **Coding round**: Focus on arrays, strings, sorting, searching, and basic DP\n` +
        `• **Projects deep-dive**: Be ready to explain every project in detail\n` +
        `• **HR questions**: Prepare "Tell me about yourself", "Why this company?"\n` +
        `• **STAR method**: Even internship/academic experiences count!\n` +
        `• **Mock interviews**: Practice with peers or use Pramp/InterviewBit\n\n` +
        `💡 Most freshers fail on **communication**, not technical skills. Practice explaining your projects out loud!`;
    }
    if (lower.includes("job") || lower.includes("placement") || lower.includes("intern")) {
      return `**Job hunting strategy for freshers**:\n\n` +
        `• **Campus placements**: Prepare 3 months before — aptitude + coding + HR\n` +
        `• **Off-campus**: Apply on LinkedIn, Naukri, AngelList (startups love freshers!)\n` +
        `• **Internships**: Even 2-3 month internships dramatically boost your resume\n` +
        `• **Hackathons**: Win or participate — it's a huge differentiator\n` +
        `• **Open source**: Even small PRs show initiative and collaboration skills\n` +
        `• **Networking**: Connect with alumni, attend tech meetups, join Discord servers\n\n` +
        `🎯 **Pro tip**: Apply to 10-15 jobs/day with tailored resumes. Volume matters for freshers!`;
    }
  }

  // ── Experienced professional responses ──
  if (lower.includes("skill") || lower.includes("learn")) {
    const seniorAdvice = years > 10
      ? `• **Leadership skills**: People management, strategic thinking, stakeholder communication\n` +
        `• **Architecture**: System design, cloud-native patterns, microservices\n`
      : `• **Strengthen existing**: ${skills.slice(0, 3).join(", ") || "your core technical skills"}\n`;

    return `Based on your **${years} years** in **${domain}**, here are key skills to focus on:\n\n` +
      seniorAdvice +
      `• **Cloud skills**: AWS/Azure certifications are highly valued\n` +
      `• **AI/ML literacy**: Even a foundational understanding sets you apart\n` +
      `• **Soft skills**: Communication, leadership, and problem-solving\n\n` +
      `Start with one skill at a time and build projects to demonstrate proficiency.`;
  }
  if (lower.includes("resume") || lower.includes("improve")) {
    return `Here's how to improve your resume as a **${profileType}**:\n\n` +
      `• **Use action verbs**: Led, Built, Designed, Optimized, Delivered\n` +
      `• **Quantify everything**: "Improved performance by 40%" beats "improved performance"\n` +
      `• **Tailor per job**: Match keywords from the job description\n` +
      `• **Add projects**: Real projects > theoretical knowledge\n` +
      (years > 5 ? `• **Leadership impact**: Mention team sizes, budgets, and business outcomes\n` : '') +
      `• **Keep it clean**: ${years > 10 ? '2-3 pages' : '1-2 pages'}, consistent formatting, no typos`;
  }
  if (lower.includes("interview")) {
    return `Interview preparation tips for **${profileType}**:\n\n` +
      `• **STAR Method**: Situation → Task → Action → Result for behavioral questions\n` +
      (years > 5
        ? `• **Leadership stories**: Prepare 4-5 stories about leading teams, resolving conflicts, driving results\n` +
          `• **System design**: Be ready for architecture and high-level design discussions\n`
        : `• **Practice coding**: LeetCode/HackerRank for technical roles\n`) +
      `• **Research the company**: Know their products, culture, and recent news\n` +
      `• **Prepare questions**: "What does success look like in this role?"\n` +
      `• **Mock interviews**: Practice with friends or use online tools`;
  }
  if (lower.includes("project") || lower.includes("portfolio")) {
    return `Portfolio project ideas for **${domain}** (${profileType}):\n\n` +
      `• **Full-stack app**: Build something you'd actually use daily\n` +
      `• **Open source**: Contribute to popular repos in your domain\n` +
      `• **AI integration**: Add AI/ML features to showcase modern skills\n` +
      `• **End-to-end**: Include CI/CD, testing, and deployment\n` +
      `• **Document well**: README, architecture diagrams, and demo videos`;
  }
  if (lower.includes("salary") || lower.includes("negotiate") || lower.includes("compensation")) {
    return `**Salary negotiation tips** for a ${years > 0 ? `${years}-year` : ''} **${domain}** professional:\n\n` +
      `• **Research market rates**: Use Glassdoor, Levels.fyi, and AmbitionBox for benchmarks\n` +
      `• **Know your value**: List your unique achievements and impact metrics\n` +
      `• **Never share first**: Let the employer propose the number\n` +
      `• **Negotiate total comp**: Consider equity, bonuses, benefits, and growth\n` +
      `• **Have alternatives**: Multiple offers give you leverage\n` +
      `• **Be confident**: ${years > 10 ? 'Your decades of experience command premium compensation' : 'Skills and demonstrable impact matter more than years'}`;
  }

  return `Great question! Here's my advice for your **${domain}** career (${profileType}):\n\n` +
    `• Focus on building real-world projects that solve actual problems\n` +
    `• Stay current with industry trends and emerging technologies\n` +
    `• Network actively — attend meetups, join online communities\n` +
    `• Build a strong online presence (GitHub, LinkedIn, blog)\n` +
    `• Consider mentoring others — it solidifies your own knowledge\n\n` +
    `Would you like specific advice on **skills**, **resume**, **interviews**, **career transitions**, or **salary**?`;
}

// ── Detect career transition target from message ──
function detectTransitionTarget(lower) {
  const targets = [
    { keywords: ["data science", "data scientist", "ml", "machine learning", "ai", "artificial intelligence", "deep learning"], domain: "Data Science / AI" },
    { keywords: ["academia", "academic", "teaching", "professor", "faculty", "lecturer", "university", "college"], domain: "Teaching / Academia" },
    { keywords: ["devops", "cloud", "aws", "azure", "infrastructure", "sre", "site reliability"], domain: "DevOps / Cloud" },
    { keywords: ["product manager", "product management", "pm"], domain: "Product Management" },
    { keywords: ["cybersecurity", "security", "infosec", "ethical hacking", "penetration testing"], domain: "Cybersecurity" },
    { keywords: ["frontend", "web development", "web dev", "full stack", "fullstack", "backend"], domain: "Web Development" },
    { keywords: ["mobile", "android", "ios", "flutter", "react native", "app development"], domain: "Mobile Development" },
    { keywords: ["blockchain", "web3", "crypto", "solidity", "smart contract"], domain: "Blockchain" },
    { keywords: ["ui", "ux", "design", "figma", "user experience"], domain: "UI/UX Design" },
    { keywords: ["training", "trainer", "l&d", "corporate training", "edtech", "bootcamp"], domain: "IT Training / L&D" },
    { keywords: ["consulting", "consultant", "advisory"], domain: "IT Consulting" },
    { keywords: ["research", "researcher", "phd", "r&d"], domain: "Research" },
    { keywords: ["project manager", "program manager", "scrum master", "agile coach"], domain: "Project Management" },
    { keywords: ["data engineer", "data engineering", "etl", "data pipeline"], domain: "Data Engineering" },
    { keywords: ["marketing", "digital marketing", "seo", "content", "growth"], domain: "Digital Marketing" },
  ];

  for (const t of targets) {
    if (t.keywords.some(k => lower.includes(k))) return t.domain;
  }
  return null;
}

// ── Generate transition options based on current domain ──
function getTransitionOptions(currentDomain, isFresher, years) {
  const transitions = {
    "Software Engineering": ["Data Science / AI", "DevOps / Cloud", "Product Management", "Teaching / Academia", "IT Consulting"],
    "Data Science / AI": ["ML Engineering", "Software Engineering", "Product Management", "Research", "IT Consulting"],
    "Web Development": ["Mobile Development", "UI/UX Design", "DevOps", "Product Management", "Teaching / Academia"],
    "DevOps / Cloud": ["Site Reliability Engineering", "Software Engineering", "Cybersecurity", "IT Consulting", "Teaching / Academia"],
    "Cybersecurity": ["DevOps / Cloud", "IT Consulting", "GRC & Compliance", "Teaching / Academia", "Research"],
    "Mobile Development": ["Web Development", "Product Management", "UI/UX Design", "DevOps", "Teaching / Academia"],
    "UI/UX Design": ["Product Management", "Frontend Development", "Design Engineering", "Teaching / Academia"],
    "Project Management": ["Product Management", "Agile Coaching", "IT Consulting", "Teaching / Academia", "Operations"],
    "Teaching / Academia": ["EdTech", "Corporate Training", "IT Consulting", "Curriculum Design", "Research"],
    "General IT": ["Software Engineering", "Data Science / AI", "DevOps / Cloud", "Product Management", "Cybersecurity"],
  };

  const options = transitions[currentDomain] || transitions["General IT"];
  let result = "";
  options.forEach((opt, i) => {
    result += `• **${opt}**${isFresher ? ' (Fresher-friendly!)' : years > 10 ? ' (Leverage your seniority)' : ''}\n`;
  });
  return result;
}

// ── Detailed transition advice for a specific target ──
function getTransitionAdvice(target, currentDomain, years, isFresher, currentSkills) {
  const advice = {
    "Data Science / AI": {
      skills: ["Python (NumPy, Pandas, Matplotlib)", "Statistics & Probability", "Machine Learning (Scikit-learn)", "SQL for data analysis", "TensorFlow or PyTorch"],
      certs: ["Google Data Analytics Certificate", "IBM Data Science Professional", "Andrew Ng's ML Course (Coursera)"],
      bridgeRoles: isFresher
        ? ["Data Analyst Intern", "Junior Data Analyst", "ML Research Intern"]
        : ["Analytics Engineer", "Data Analyst", "ML Engineer (with SWE background)"],
      timeline: isFresher ? "3-6 months" : "6-12 months",
      tip: isFresher
        ? "Start with Kaggle competitions and build 2-3 end-to-end data projects for your portfolio."
        : `Your ${currentDomain} experience is valuable! Companies need people who can bridge engineering and data.`,
    },
    "Teaching / Academia": {
      skills: ["Curriculum Design", "Pedagogy & Assessment", "Research Methodology", "Academic Writing", "Presentation & Public Speaking"],
      certs: ["UGC NET (for Indian academia)", "Faculty Development Programs", "Instructional Design Certificate"],
      bridgeRoles: years > 10
        ? ["Professor of Practice", "Adjunct Faculty", "Industry Expert / Visiting Faculty", "HOD", "Dean"]
        : isFresher
          ? ["Teaching Assistant", "Lab Instructor", "Workshop Facilitator"]
          : ["Guest Lecturer", "Corporate Trainer", "Technical Instructor"],
      timeline: isFresher ? "1-2 years (pursue M.Tech/MCA)" : "3-6 months",
      tip: years > 10
        ? `With ${years}+ years of industry experience, you're a prime candidate for 'Professor of Practice' roles. Many universities actively seek professionals like you!`
        : isFresher
          ? "Consider pursuing a Master's degree (M.Tech/MCA) — it opens doors to academic positions."
          : "Start with guest lectures or weekend workshops at local colleges. Build your teaching portfolio.",
    },
    "DevOps / Cloud": {
      skills: ["Linux & Shell Scripting", "Docker & Kubernetes", "AWS/Azure/GCP fundamentals", "CI/CD (Jenkins, GitHub Actions)", "Terraform / Infrastructure as Code"],
      certs: ["AWS Solutions Architect Associate", "CKA (Kubernetes)", "Terraform Associate"],
      bridgeRoles: isFresher
        ? ["Junior DevOps Engineer", "Cloud Support Associate", "SRE Intern"]
        : ["Cloud Engineer", "DevOps Engineer", "Platform Engineer"],
      timeline: isFresher ? "4-6 months" : "3-6 months",
      tip: isFresher
        ? "Set up a home lab: deploy apps with Docker, automate with GitHub Actions. Hands-on > certificates."
        : `Your ${currentDomain} background gives you an edge — you understand what developers need!`,
    },
    "Product Management": {
      skills: ["Product Strategy & Roadmapping", "User Research & Analytics", "SQL & Data Analysis", "Stakeholder Management", "A/B Testing"],
      certs: ["Google Project Management Certificate", "Product School's Product Manager Certificate"],
      bridgeRoles: isFresher
        ? ["Associate Product Manager", "Product Analyst", "Business Analyst Intern"]
        : ["Technical Product Manager", "Senior PM (with domain expertise)", "Group PM"],
      timeline: isFresher ? "6-12 months" : "3-6 months",
      tip: isFresher
        ? "Build side projects and write product teardowns on Medium. APM programs (Google, Meta) are great entry points."
        : `Your ${years} years in ${currentDomain} is your superpower — domain-expert PMs are highly valued!`,
    },
    "Cybersecurity": {
      skills: ["Networking fundamentals", "Linux security", "OWASP Top 10", "Penetration testing basics", "SIEM tools"],
      certs: ["CompTIA Security+", "CEH (Certified Ethical Hacker)", "OSCP (advanced)"],
      bridgeRoles: isFresher
        ? ["SOC Analyst", "Security Intern", "Junior Security Analyst"]
        : ["Security Engineer", "Application Security Lead", "Security Architect"],
      timeline: isFresher ? "6-9 months" : "6-12 months",
      tip: isFresher
        ? "Practice on TryHackMe and HackTheBox. CTF competitions are fantastic for learning and resume building!"
        : `Your ${currentDomain} experience helps you understand what needs protecting. That's invaluable!`,
    },
    "Web Development": {
      skills: ["HTML/CSS/JavaScript", "React or Vue.js", "Node.js or Python backend", "Database (SQL + MongoDB)", "REST APIs"],
      certs: ["Meta Frontend Developer (Coursera)", "freeCodeCamp Full Stack"],
      bridgeRoles: isFresher
        ? ["Frontend Developer Intern", "Junior Web Developer", "Full Stack Trainee"]
        : ["Full Stack Developer", "Frontend Lead", "Web Architect"],
      timeline: isFresher ? "3-6 months" : "2-4 months",
      tip: "Build and deploy 3 real projects. A live portfolio is worth 100x more than certificates.",
    },
    "IT Training / L&D": {
      skills: ["Instructional Design", "LMS Platforms", "Workshop Facilitation", "Content Creation", "Assessment Design"],
      certs: ["Train the Trainer (ATD)", "Instructional Design Certificate", "Domain-specific certifications"],
      bridgeRoles: years > 10
        ? ["Corporate Trainer", "L&D Manager", "EdTech Content Lead", "Training Director"]
        : isFresher
          ? ["Training Coordinator", "Junior Instructor", "Content Developer"]
          : ["Technical Trainer", "Workshop Facilitator", "Bootcamp Mentor"],
      timeline: "2-4 months",
      tip: years > 10
        ? `Your ${years}+ years of hands-on experience makes you extremely valuable as a trainer. Companies pay premium for real-world expertise!`
        : "Start by conducting free workshops or creating YouTube tutorials to build your training brand.",
    },
    "IT Consulting": {
      skills: ["Business Analysis", "Solution Architecture", "Client Communication", "Strategic Thinking", "Domain Expertise"],
      certs: ["TOGAF", "Business Analysis (CBAP)", "Domain-specific certs"],
      bridgeRoles: years > 10
        ? ["Principal Consultant", "Solution Architect", "Fractional CTO", "Advisory Partner"]
        : ["Business Analyst", "Junior Consultant", "Technology Advisor"],
      timeline: years > 10 ? "Immediate — your experience IS the product" : "6-12 months",
      tip: years > 10
        ? "Your career IS your consulting credential. Start with your professional network — former clients and colleagues are your first customers."
        : "Join a consulting firm first to learn the methodology, then consider going independent.",
    },
    "Research": {
      skills: ["Research Methodology", "Academic Writing", "Statistical Analysis", "Literature Review", "Python/R for research"],
      certs: ["Research Ethics Certificate", "Domain-specific research courses"],
      bridgeRoles: isFresher
        ? ["Research Intern", "Research Assistant", "Lab Assistant"]
        : ["Industry Research Fellow", "Visiting Researcher", "Applied Research Lead"],
      timeline: isFresher ? "Pursue M.Tech/MS/PhD" : "6-12 months",
      tip: isFresher
        ? "Pursue a Master's or PhD program. Publication record is essential — start by assisting professors."
        : "Industry researchers are increasingly valued. Start by publishing whitepapers or contributing to applied research at your company.",
    },
  };

  const info = advice[target];
  if (!info) {
    return `Transitioning from **${currentDomain}** to **${target}** is definitely possible! 🚀\n\n` +
      `Here's a general approach:\n\n` +
      `• **Research the field**: Understand what skills and qualifications are expected\n` +
      `• **Find bridge roles**: Look for positions that combine both your current and target domains\n` +
      `• **Get certified**: Industry certifications validate your new skills\n` +
      `• **Network**: Connect with professionals already in ${target}\n` +
      `• **Build projects**: Create portfolio pieces in the target domain\n\n` +
      `💡 Tell me more about what specifically interests you about ${target} and I'll give more targeted advice!`;
  }

  let response = `## 🔄 Transition: ${currentDomain} → ${target}\n\n`;

  response += `**📊 Timeline**: ~${info.timeline}\n\n`;

  response += `**🎯 Skills to build**:\n`;
  info.skills.forEach(s => { response += `• ${s}\n`; });

  response += `\n**🏅 Recommended Certifications**:\n`;
  info.certs.forEach(c => { response += `• ${c}\n`; });

  response += `\n**🌉 Bridge Roles** (start here):\n`;
  info.bridgeRoles.forEach(r => { response += `• ${r}\n`; });

  response += `\n**💡 Pro Tip**: ${info.tip}`;

  return response;
}

export function isPuterAvailable() {
  return !!window.puter?.ai?.chat;
}
