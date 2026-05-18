/**
 * Interview Preparation Engine
 */

const QUESTION_BANK = {
  "Software Engineering": {
    technical: [
      "Explain the difference between REST and GraphQL APIs.",
      "What is the event loop in JavaScript and how does it work?",
      "Describe SOLID principles with examples.",
      "How do you handle state management in a React application?",
      "Explain the difference between SQL and NoSQL databases.",
      "What is Docker and why is containerization important?",
      "Describe the CI/CD pipeline you would set up for a web application.",
      "How do you ensure code quality in a team?",
    ],
    behavioral: [
      "Tell me about a time you had to debug a complex production issue.",
      "Describe a project where you had to learn a new technology quickly.",
      "How do you handle disagreements in code reviews?",
      "Tell me about your most challenging project and how you overcame obstacles.",
    ],
    system_design: [
      "Design a URL shortener like bit.ly.",
      "How would you design a real-time chat application?",
      "Design an API rate limiter.",
      "How would you design a notification system at scale?",
    ],
  },
  "Data Science / AI": {
    technical: [
      "Explain the bias-variance tradeoff.",
      "What is cross-validation and why is it important?",
      "Describe the difference between supervised and unsupervised learning.",
      "How do you handle imbalanced datasets?",
      "Explain gradient descent and its variants.",
      "What are transformers and how do they work?",
      "How do you evaluate an NLP model's performance?",
      "Describe feature engineering techniques you've used.",
    ],
    behavioral: [
      "Describe a project where your model didn't perform as expected.",
      "How do you communicate technical findings to non-technical stakeholders?",
      "Tell me about a time you had to work with messy data.",
    ],
    system_design: [
      "Design a recommendation system for an e-commerce platform.",
      "How would you build a real-time fraud detection system?",
      "Design an ML pipeline for sentiment analysis at scale.",
    ],
  },
  "DevOps / Cloud": {
    technical: [
      "Explain Infrastructure as Code and its benefits.",
      "What is Kubernetes and how does it orchestrate containers?",
      "Describe the difference between horizontal and vertical scaling.",
      "How do you implement zero-downtime deployments?",
      "What is a service mesh and when would you use one?",
      "Explain the 12-factor app methodology.",
    ],
    behavioral: [
      "Describe a production outage you handled and the post-mortem process.",
      "How do you balance speed of deployment with stability?",
    ],
    system_design: [
      "Design a multi-region deployment strategy.",
      "How would you set up monitoring and alerting for a microservices architecture?",
    ],
  },
  "General": {
    hr: [
      "Tell me about yourself.",
      "Why are you interested in this role?",
      "Where do you see yourself in 5 years?",
      "What is your greatest strength and weakness?",
      "Why should we hire you?",
      "Tell me about a time you showed leadership.",
      "How do you handle pressure and tight deadlines?",
      "What motivates you at work?",
      "Describe your ideal work environment.",
      "Do you have any questions for us?",
    ],
    project_viva: [
      "Explain the architecture of your project.",
      "Why did you choose this tech stack?",
      "What were the biggest challenges you faced?",
      "How does your project differ from existing solutions?",
      "What would you improve if you had more time?",
      "How did you test your application?",
      "Explain the NLP/AI components in your project.",
      "How is data stored and managed in your system?",
    ],
    confidence: [
      "Practice answering in front of a mirror or record yourself.",
      "Use the STAR method: Situation, Task, Action, Result.",
      "Prepare 2-3 stories that demonstrate different skills.",
      "Research the company and role thoroughly before the interview.",
      "Prepare thoughtful questions to ask the interviewer.",
      "Do a mock interview with a friend or use AI practice tools.",
      "Keep answers concise — aim for 1-2 minutes per question.",
      "It's okay to take a moment to think before answering.",
    ],
  },
};

export function generateInterviewQuestions(parsedResume) {
  const domain = parsedResume.primary_domain || "Software Engineering";
  let domainKey = Object.keys(QUESTION_BANK).find(k =>
    domain.includes(k.split('/')[0].trim()) || k.includes(domain.split('/')[0].trim())
  );
  if (!domainKey || domainKey === "General") domainKey = "Software Engineering";

  const domainQs = QUESTION_BANK[domainKey] || QUESTION_BANK["Software Engineering"];
  const generalQs = QUESTION_BANK["General"];

  // Personalized questions based on resume
  const personalQs = [];
  if (parsedResume.skills?.length > 0) {
    const skill = parsedResume.skills[0];
    personalQs.push(`Explain how you've used ${skill} in a real project.`);
  }
  if (parsedResume.current_role) {
    personalQs.push(`What has been your biggest achievement as a ${parsedResume.current_role}?`);
  }
  if (parsedResume.certifications?.length > 0) {
    personalQs.push(`How has your ${parsedResume.certifications[0]} certification helped you professionally?`);
  }

  return {
    domain: domainKey,
    technical: domainQs.technical || [],
    behavioral: domainQs.behavioral || [],
    systemDesign: domainQs.system_design || [],
    hr: generalQs.hr,
    projectViva: generalQs.project_viva,
    personalized: personalQs,
    confidenceTips: generalQs.confidence,
    totalQuestions: (domainQs.technical?.length || 0) + (domainQs.behavioral?.length || 0) + generalQs.hr.length + generalQs.project_viva.length + personalQs.length,
  };
}
