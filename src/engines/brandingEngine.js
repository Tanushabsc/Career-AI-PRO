/**
 * Professional Branding Generator Engine
 */

export function generateBranding(parsedResume) {
  const { name, primary_domain, years_experience, skills, education, current_role, is_fresher } = parsedResume;
  const topSkills = (skills || []).slice(0, 4);
  const edu = (education || [])[0] || "";
  const domain = primary_domain || "Technology";
  const skillStr = topSkills.join(" · ");

  // LinkedIn Headlines
  const headlines = [];
  if (is_fresher) {
    headlines.push(`${edu} Graduate | Aspiring ${domain} Professional | ${skillStr}`);
    headlines.push(`Passionate ${domain} Enthusiast | ${topSkills[0] || "Tech"} Developer | Open to Opportunities`);
    headlines.push(`${edu} | Building with ${topSkills.slice(0,2).join(" & ")} | Seeking Entry-Level Roles`);
  } else if (years_experience <= 5) {
    headlines.push(`${current_role || domain + " Professional"} | ${skillStr} | Building Impactful Solutions`);
    headlines.push(`${domain} Developer with ${years_experience}+ Years | ${topSkills.slice(0,3).join(" · ")}`);
  } else {
    headlines.push(`Senior ${domain} Leader | ${years_experience}+ Years | ${skillStr}`);
    headlines.push(`${current_role || domain + " Expert"} | Driving Innovation in ${domain} | ${topSkills[0]} Specialist`);
    headlines.push(`${years_experience}+ Years in ${domain} | Technical Leadership & Architecture | ${topSkills[0]}`);
  }

  // Professional Bio (short)
  const shortBio = is_fresher
    ? `${edu} graduate passionate about ${domain}. Skilled in ${topSkills.slice(0,3).join(", ")}. Eager to contribute to innovative projects and grow as a professional.`
    : `${domain} professional with ${years_experience}+ years of experience specializing in ${topSkills.slice(0,3).join(", ")}. Passionate about building scalable solutions and driving technical excellence.`;

  // Long Bio
  const longBio = is_fresher
    ? `I'm a recent ${edu} graduate with a strong foundation in ${domain}. Through coursework and personal projects, I've developed proficiency in ${topSkills.join(", ")}.\n\nI'm passionate about leveraging technology to solve real-world problems and am actively seeking opportunities where I can contribute, learn, and grow. I believe in continuous learning and am always exploring new technologies and methodologies.\n\nLet's connect if you're looking for an enthusiastic and dedicated team member!`
    : `With ${years_experience}+ years in ${domain}, I've had the privilege of working on diverse projects that have honed my expertise in ${topSkills.join(", ")}.\n\nAs a ${current_role || domain + " professional"}, I focus on delivering high-quality solutions that create measurable business impact. I'm passionate about clean architecture, team collaboration, and staying at the forefront of technology trends.\n\nAlways open to connecting with fellow professionals, discussing new opportunities, or exploring collaborative projects.`;

  // Portfolio Intro
  const portfolioIntro = is_fresher
    ? `Welcome to my portfolio! I'm ${name !== "Candidate" ? name : "a passionate developer"}, a ${edu} graduate exploring the world of ${domain}. Here you'll find projects that showcase my journey in ${topSkills.slice(0,3).join(", ")}.`
    : `Welcome! I'm ${name !== "Candidate" ? name : "a seasoned professional"} with ${years_experience}+ years of experience in ${domain}. This portfolio showcases my work across ${topSkills.slice(0,3).join(", ")} and my commitment to building impactful solutions.`;

  // Email Signature
  const emailSig = `${name !== "Candidate" ? name : "Professional"}\n${current_role || domain + " Professional"}${years_experience > 0 ? ` | ${years_experience}+ Years Experience` : ""}\n${skillStr}`;

  return {
    headlines,
    shortBio,
    longBio,
    portfolioIntro,
    emailSignature: emailSig,
    domain,
    generatedAt: new Date().toISOString(),
  };
}
