/**
 * Career Roadmap Generator Engine
 */

const CAREER_PATHS = {
  "Software Engineering": {
    levels: [
      { title: "Junior Developer", years: "0-2", skills: ["HTML/CSS","JavaScript","Git","Basic SQL"], icon: "🌱" },
      { title: "Mid-level Developer", years: "2-4", skills: ["React/Vue","Node.js","REST APIs","Testing","Docker"], icon: "🚀" },
      { title: "Senior Developer", years: "4-7", skills: ["System Design","CI/CD","Cloud (AWS/GCP)","Mentoring"], icon: "⭐" },
      { title: "Tech Lead / Architect", years: "7-12", skills: ["Architecture","Team Leadership","Microservices","Performance"], icon: "👑" },
      { title: "Engineering Manager / CTO", years: "12+", skills: ["Strategy","Org Design","Product Vision","Stakeholders"], icon: "🏆" },
    ],
    pivots: ["Data Science / AI","DevOps / Cloud","Product Management","Technical Consulting"],
    certs: ["AWS Solutions Architect","Google Cloud Professional","Kubernetes (CKA)"],
    projects: ["Build a full-stack SaaS app","Contribute to open source","Create a developer tool/library"],
    courses: [
      { name: "CS50: Introduction to Computer Science", platform: "edX", price: "Free", type: "Fundamental" },
      { name: "Full Stack Open", platform: "University of Helsinki", price: "Free", type: "Technical" },
      { name: "The Web Developer Bootcamp 2024", platform: "Udemy", price: "Paid", type: "Practical" }
    ]
  },
  "Data Science / AI": {
    levels: [
      { title: "Data Analyst", years: "0-2", skills: ["Python","SQL","Excel","Statistics","Visualization"], icon: "🌱" },
      { title: "Data Scientist", years: "2-4", skills: ["ML Algorithms","Pandas/NumPy","Scikit-learn","Feature Engineering"], icon: "🚀" },
      { title: "Senior Data Scientist", years: "4-7", skills: ["Deep Learning","NLP","Computer Vision","MLOps"], icon: "⭐" },
      { title: "ML Engineer / Lead", years: "7-12", skills: ["Production ML","System Design","Team Leadership","Research"], icon: "👑" },
      { title: "Head of AI / Chief Data Officer", years: "12+", skills: ["AI Strategy","Ethics","Business Impact","Innovation"], icon: "🏆" },
    ],
    pivots: ["ML Engineering","AI Product Management","Research Scientist","AI Consulting"],
    certs: ["TensorFlow Developer","AWS ML Specialty","Google ML Engineer"],
    projects: ["Build an end-to-end ML pipeline","Kaggle competitions","Publish a research paper"],
    courses: [
      { name: "Machine Learning Specialization", platform: "Coursera", price: "Paid (Free Audit)", type: "Core" },
      { name: "DeepLearning.AI TensorFlow Developer", platform: "Coursera", price: "Paid", type: "Advanced" },
      { name: "Practical Deep Learning for Coders", platform: "Fast.ai", price: "Free", type: "Applied" }
    ]
  },
  "Web Development": {
    levels: [
      { title: "Frontend Intern", years: "0-1", skills: ["HTML","CSS","JavaScript","Responsive Design"], icon: "🌱" },
      { title: "Frontend Developer", years: "1-3", skills: ["React/Vue/Angular","TypeScript","Build Tools","APIs"], icon: "🚀" },
      { title: "Full Stack Developer", years: "3-5", skills: ["Node.js","Databases","Authentication","Deployment"], icon: "⭐" },
      { title: "Senior Full Stack", years: "5-8", skills: ["Architecture","Performance","Security","Mentoring"], icon: "👑" },
      { title: "Principal Engineer", years: "8+", skills: ["System Design","Tech Strategy","Innovation"], icon: "🏆" },
    ],
    pivots: ["Mobile Development","DevOps","UI/UX Design","Technical Management"],
    certs: ["Meta Frontend Developer","AWS Developer Associate"],
    projects: ["Build a real-time collaborative app","Create a design system","Open-source component library"],
    courses: [
      { name: "React - The Complete Guide", platform: "Udemy", price: "Paid", type: "Framework" },
      { name: "Frontend Masters (Various Courses)", platform: "Frontend Masters", price: "Paid", type: "Professional" },
      { name: "FreeCodeCamp Responsive Web Design", platform: "FreeCodeCamp", price: "Free", type: "Fundamental" }
    ]
  },
  "DevOps / Cloud": {
    levels: [
      { title: "Junior DevOps Engineer", years: "0-2", skills: ["Linux","Git","Docker","Basic CI/CD"], icon: "🌱" },
      { title: "DevOps Engineer", years: "2-4", skills: ["Kubernetes","Terraform","AWS/Azure","Monitoring"], icon: "🚀" },
      { title: "Senior DevOps Engineer", years: "4-7", skills: ["IaC","Multi-cloud","Security","Cost Optimization"], icon: "⭐" },
      { title: "DevOps Architect", years: "7-12", skills: ["Platform Engineering","SRE","Strategy","Automation"], icon: "👑" },
      { title: "VP Infrastructure / CTO", years: "12+", skills: ["Enterprise Architecture","Governance","Innovation"], icon: "🏆" },
    ],
    pivots: ["Site Reliability Engineering","Cloud Architecture","Security Engineering","Platform Engineering"],
    certs: ["AWS Solutions Architect","CKA/CKAD","Terraform Associate","Azure Administrator"],
    projects: ["Build a CI/CD pipeline from scratch","Multi-cloud deployment","Infrastructure monitoring dashboard"],
    courses: [
      { name: "Docker & Kubernetes: The Practical Guide", platform: "Udemy", price: "Paid", type: "Containerization" },
      { name: "Cloud Engineering with AWS", platform: "Coursera", price: "Paid", type: "Cloud" },
      { name: "Architecting on AWS", platform: "AWS Training", price: "Free", type: "Platform" }
    ]
  },
  "Cybersecurity": {
    levels: [
      { title: "Security Analyst", years: "0-2", skills: ["Networking","Linux","OWASP","Basic Scripting"], icon: "🌱" },
      { title: "Penetration Tester", years: "2-4", skills: ["Ethical Hacking","Burp Suite","Nmap","Wireshark"], icon: "🚀" },
      { title: "Security Engineer", years: "4-7", skills: ["SIEM","Incident Response","Cloud Security","Automation"], icon: "⭐" },
      { title: "Security Architect", years: "7-12", skills: ["Zero Trust","Compliance","Risk Management","Strategy"], icon: "👑" },
      { title: "CISO", years: "12+", skills: ["Governance","Enterprise Risk","Board Communication","Policy"], icon: "🏆" },
    ],
    pivots: ["Cloud Security","Application Security","Security Consulting","GRC"],
    certs: ["CEH","CISSP","CompTIA Security+","OSCP"],
    projects: ["Build a vulnerability scanner","CTF competitions","Security audit of an open-source project"],
    courses: [
      { name: "Google Cybersecurity Certificate", platform: "Coursera", price: "Paid", type: "Entry-Level" },
      { name: "Cybersecurity Specialization", platform: "Coursera", price: "Paid", type: "Academic" },
      { name: "TryHackMe (Hands-on Labs)", platform: "TryHackMe", price: "Freemium", type: "Practical" }
    ]
  },
  "Mobile Development": {
    levels: [
      { title: "Junior Mobile Dev", years: "0-2", skills: ["Dart/Swift/Kotlin","UI Basics","API Integration"], icon: "🌱" },
      { title: "Mobile Developer", years: "2-4", skills: ["Flutter/React Native","State Management","Testing","CI/CD"], icon: "🚀" },
      { title: "Senior Mobile Dev", years: "4-7", skills: ["Architecture","Performance","Native Modules","Release Mgmt"], icon: "⭐" },
      { title: "Mobile Lead", years: "7-10", skills: ["Team Leadership","Cross-platform Strategy","Design Systems"], icon: "👑" },
      { title: "Head of Mobile", years: "10+", skills: ["Product Strategy","Platform Vision","Innovation"], icon: "🏆" },
    ],
    pivots: ["Web Development","Product Management","IoT Development"],
    certs: ["Google Associate Android Developer","Apple Developer Certification"],
    projects: ["Publish an app on Play Store / App Store","Build a cross-platform app","Offline-first mobile app"],
    courses: [
      { name: "Flutter & Dart - The Complete Guide", platform: "Udemy", price: "Paid", type: "Cross-Platform" },
      { name: "iOS & Swift - The Complete Bootcamp", platform: "Udemy", price: "Paid", type: "Native" },
      { name: "Android App Development Specialization", platform: "Coursera", price: "Paid", type: "Native" }
    ]
  },
  "UI/UX Design": {
    levels: [
      { title: "UI/UX Intern", years: "0-1", skills: ["Figma","Wireframing","User Research","Visual Design"], icon: "🌱" },
      { title: "UI/UX Designer", years: "1-3", skills: ["Prototyping","Design Systems","Usability Testing","Accessibility"], icon: "🚀" },
      { title: "Senior Designer", years: "3-6", skills: ["Interaction Design","Information Architecture","Leadership"], icon: "⭐" },
      { title: "Design Lead / Manager", years: "6-10", skills: ["Team Management","Strategy","Stakeholder Communication"], icon: "👑" },
      { title: "VP of Design / CDO", years: "10+", skills: ["Design Vision","Brand Strategy","Innovation"], icon: "🏆" },
    ],
    pivots: ["Product Management","Frontend Development","Design Engineering","UX Research"],
    certs: ["Google UX Design Certificate","Nielsen Norman UX Certification"],
    projects: ["Redesign a popular app","Create a comprehensive design system","UX case study portfolio"],
    courses: [
      { name: "Google UX Design Professional Certificate", platform: "Coursera", price: "Paid", type: "Certification" },
      { name: "UI/UX Design Specialization", platform: "Coursera", price: "Paid", type: "Academic" },
      { name: "Daily UI Challenge", platform: "DailyUI", price: "Free", type: "Practice" }
    ]
  },
  "Project Management": {
    levels: [
      { title: "Project Coordinator", years: "0-2", skills: ["Planning","Documentation","Communication","JIRA"], icon: "🌱" },
      { title: "Project Manager", years: "2-5", skills: ["Agile/Scrum","Risk Management","Budgeting","Stakeholders"], icon: "🚀" },
      { title: "Senior PM", years: "5-10", skills: ["Program Management","Strategic Planning","Vendor Management"], icon: "⭐" },
      { title: "Director of PMO", years: "10-15", skills: ["Portfolio Management","Governance","Transformation"], icon: "👑" },
      { title: "VP / Head of Delivery", years: "15+", skills: ["Executive Leadership","Business Strategy","P&L"], icon: "🏆" },
    ],
    pivots: ["Product Management","Agile Coaching","Consulting","Operations"],
    certs: ["PMP","CSM","SAFe Agilist","PRINCE2"],
    projects: ["Lead a cross-functional project","Implement Agile transformation","Set up a PMO"],
    courses: [
      { name: "Google Project Management Professional Certificate", platform: "Coursera", price: "Paid", type: "Fundamental" },
      { name: "Agile with Atlassian Jira", platform: "Coursera", price: "Free", type: "Tooling" },
      { name: "PMP Exam Prep Seminar", platform: "Udemy", price: "Paid", type: "Certification" }
    ]
  },
  "Human Resources": {
    levels: [
      { title: "HR Coordinator", years: "0-2", skills: ["Onboarding", "HRIS", "Communication", "Recruitment Basics"], icon: "🌱" },
      { title: "HR Generalist", years: "2-5", skills: ["Employee Relations", "Performance Management", "Benefits Admin", "Compliance"], icon: "🚀" },
      { title: "HR Business Partner", years: "5-8", skills: ["Strategic Planning", "Talent Management", "Conflict Resolution", "Data Analytics"], icon: "⭐" },
      { title: "Director of HR", years: "8-12", skills: ["Org Design", "Total Rewards", "Culture Strategy", "Leadership"], icon: "👑" },
      { title: "Chief Human Resources Officer (CHRO)", years: "12+", skills: ["Executive Leadership", "Board Relations", "M&A Integration"], icon: "🏆" },
    ],
    pivots: ["Talent Acquisition", "L&D", "Operations", "Consulting"],
    certs: ["SHRM-CP", "PHR", "CIPD"],
    projects: ["Revamp onboarding process", "Conduct salary benchmarking", "Design employee engagement survey"],
    courses: [
      { name: "Human Resource Management", platform: "Coursera", price: "Paid", type: "Core" },
      { name: "People Analytics", platform: "Wharton", price: "Paid", type: "Advanced" },
      { name: "Recruiting, Hiring, and Onboarding", platform: "edX", price: "Free", type: "Practical" }
    ]
  },
  "Digital Marketing": {
    levels: [
      { title: "Marketing Assistant", years: "0-2", skills: ["Social Media", "Content Creation", "Basic SEO", "Email Marketing"], icon: "🌱" },
      { title: "Digital Marketing Specialist", years: "2-5", skills: ["SEO/SEM", "Google Analytics", "Paid Ads (PPC)", "Campaign Management"], icon: "🚀" },
      { title: "Marketing Manager", years: "5-8", skills: ["Growth Strategy", "Budgeting", "Team Management", "Brand Strategy"], icon: "⭐" },
      { title: "Director of Marketing", years: "8-12", skills: ["Market Positioning", "Cross-channel Strategy", "Data-driven Marketing"], icon: "👑" },
      { title: "Chief Marketing Officer (CMO)", years: "12+", skills: ["Business Strategy", "P&L", "Global Brand Vision"], icon: "🏆" },
    ],
    pivots: ["Product Marketing", "Brand Management", "Growth Hacking", "Sales"],
    certs: ["Google Analytics Certification", "HubSpot Content Marketing", "Meta Blueprint"],
    projects: ["Launch an end-to-end ad campaign", "Optimize website SEO", "Create a 6-month content calendar"],
    courses: [
      { name: "Google Digital Marketing Certificate", platform: "Coursera", price: "Paid", type: "Fundamental" },
      { name: "SEO Specialization", platform: "UC Davis", price: "Paid", type: "Technical" },
      { name: "HubSpot Inbound Marketing", platform: "HubSpot", price: "Free", type: "Practical" }
    ]
  },
  "Sales / Business Development": {
    levels: [
      { title: "Sales Development Rep (SDR)", years: "0-2", skills: ["Cold Calling", "Lead Generation", "CRM (Salesforce)", "Email Outreach"], icon: "🌱" },
      { title: "Account Executive", years: "2-5", skills: ["Closing", "Negotiation", "Pipeline Management", "Client Presentations"], icon: "🚀" },
      { title: "Senior AE / Key Account Manager", years: "5-8", skills: ["Enterprise Sales", "Relationship Management", "Strategic Accounts"], icon: "⭐" },
      { title: "Sales Director", years: "8-12", skills: ["Sales Strategy", "Forecasting", "Team Building", "Quota Planning"], icon: "👑" },
      { title: "Chief Revenue Officer (CRO)", years: "12+", skills: ["GTM Strategy", "Revenue Operations", "Executive Leadership"], icon: "🏆" },
    ],
    pivots: ["Customer Success", "Marketing", "Partnerships", "Operations"],
    certs: ["HubSpot Sales Software", "Salesforce Certified Administrator", "Challenger Sales"],
    projects: ["Develop a new outbound sequence", "Analyze win/loss data", "Create a territory plan"],
    courses: [
      { name: "The Art of Sales", platform: "Coursera", price: "Paid", type: "Core" },
      { name: "Inbound Sales", platform: "HubSpot", price: "Free", type: "Practical" },
      { name: "B2B Sales Masterclass", platform: "Udemy", price: "Paid", type: "Advanced" }
    ]
  },
  "Arts / Creative Design": {
    levels: [
      { title: "Junior Designer / Artist", years: "0-2", skills: ["Adobe CC", "Typography", "Color Theory", "Composition"], icon: "🌱" },
      { title: "Graphic/Visual Designer", years: "2-5", skills: ["Brand Identity", "Illustration", "Layout Design", "Print/Digital"], icon: "🚀" },
      { title: "Senior Designer / Art Director", years: "5-8", skills: ["Creative Direction", "Mentoring", "Campaign Concepting"], icon: "⭐" },
      { title: "Creative Director", years: "8-12", skills: ["Studio Management", "Vision Strategy", "Client Relations"], icon: "👑" },
      { title: "Chief Creative Officer", years: "12+", skills: ["Global Creative Vision", "Executive Strategy", "Innovation"], icon: "🏆" },
    ],
    pivots: ["UI/UX Design", "Marketing", "Video Production", "Animation"],
    certs: ["Adobe Certified Professional", "CalArts Graphic Design Specialization"],
    projects: ["Rebrand a local business", "Create a comprehensive brand guideline", "Design a packaging series"],
    courses: [
      { name: "Graphic Design Specialization", platform: "CalArts", price: "Paid", type: "Core" },
      { name: "Fundamentals of Graphic Design", platform: "Coursera", price: "Free Audit", type: "Fundamental" },
      { name: "Adobe Illustrator CC - Essentials", platform: "Skillshare", price: "Paid", type: "Tooling" }
    ]
  }
};

export function generateRoadmap(parsedResume) {
  const domain = parsedResume.primary_domain || "General Professional";
  // Find closest matching career path
  let pathKey = Object.keys(CAREER_PATHS).find(k => domain.toLowerCase().includes(k.split('/')[0].trim().toLowerCase()) || k.toLowerCase().includes(domain.split('/')[0].trim().toLowerCase()));
  
  let path;
  if (pathKey) {
    path = CAREER_PATHS[pathKey];
  } else {
    // Dynamic Generic Fallback
    pathKey = domain;
    path = {
      levels: [
        { title: `Junior ${domain} Professional`, years: "0-2", skills: ["Core Fundamentals", "Tools & Software", "Communication", "Process Execution"], icon: "🌱" },
        { title: `${domain} Specialist`, years: "2-5", skills: ["Domain Expertise", "Problem Solving", "Project Execution", "Collaboration"], icon: "🚀" },
        { title: `Senior ${domain} Specialist`, years: "5-8", skills: ["Strategic Thinking", "Mentorship", "Advanced Analysis", "Process Optimization"], icon: "⭐" },
        { title: `${domain} Manager / Lead`, years: "8-12", skills: ["Team Leadership", "Budgeting", "Strategy Development", "Stakeholder Management"], icon: "👑" },
        { title: `VP / Head of ${domain}`, years: "12+", skills: ["Executive Strategy", "Vision Alignment", "Cross-functional Leadership"], icon: "🏆" },
      ],
      pivots: ["Management", "Operations", "Consulting", "Strategy"],
      certs: [`${domain} Foundation Certification`, "Leadership Training"],
      projects: [`Lead a ${domain} initiative`, "Optimize a core workflow", "Implement a new best practice"],
      courses: [
        { name: `Foundations of ${domain}`, platform: "Coursera", price: "Freemium", type: "Fundamental" },
        { name: `Advanced ${domain} Strategies`, platform: "edX", price: "Paid", type: "Professional" },
        { name: "Leadership & Management", platform: "Udemy", price: "Paid", type: "Leadership" }
      ]
    };
  }

  const years = parsedResume.years_experience || 0;
  const currentIdx = path.levels.findIndex(l => {
    const [, max] = l.years.replace('+', '-99').split('-').map(Number);
    return years <= (max || 99);
  });
  const idx = currentIdx >= 0 ? currentIdx : 0;

  return {
    domain: pathKey,
    currentLevel: path.levels[idx],
    currentIndex: idx,
    levels: path.levels.map((level, i) => ({
      ...level,
      status: i < idx ? "completed" : i === idx ? "current" : "upcoming",
    })),
    nextSteps: path.levels[idx + 1] ? path.levels[idx + 1].skills : ["You're at the top! Consider pivoting or mentoring."],
    pivotOptions: path.pivots,
    certifications: path.certs,
    projectIdeas: path.projects,
    courses: path.courses,
    timeToNext: path.levels[idx + 1] ? `${path.levels[idx + 1].years.split('-')[0] - years} years` : "N/A",
  };
}
