/**
 * GitHub Profile Analyzer Engine
 * Uses GitHub's public API (no token required for basic info)
 */

export async function analyzeGitHubProfile(username, targetSkills = [], targetDomain = '') {
  if (!username) throw new Error("GitHub username is required");
  const clean = username.replace(/.*github\.com\//, '').replace(/\//g, '').trim();

  try {
    const userRes = await fetch(`https://api.github.com/users/${clean}`);
    if (!userRes.ok) throw new Error(`GitHub user "${clean}" not found`);
    const user = await userRes.json();

    const reposRes = await fetch(`https://api.github.com/users/${clean}/repos?per_page=100&sort=updated`);
    const repos = await reposRes.json();
    if (!Array.isArray(repos)) throw new Error("Could not fetch repositories");

    const langCount = {};
    const topics = new Set();
    let totalStars = 0, totalForks = 0, hasReadme = 0;

    // Mapping repositories as evidence for skills
    const mappedRepos = repos.map(repo => {
      const signals = `${repo.name} ${repo.description} ${(repo.topics || []).join(' ')} ${repo.language}`.toLowerCase();
      const provenSkills = targetSkills.filter(skill => signals.includes(skill.toLowerCase()));
      const relevance = (provenSkills.length * 20) + (repo.stargazers_count > 0 ? 10 : 0);
      
      return {
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        updated: repo.updated_at,
        topics: repo.topics || [],
        provenSkills,
        relevance: Math.min(100, relevance)
      };
    }).sort((a, b) => b.relevance - a.relevance);

    for (const repo of repos) {
      if (repo.language) langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      if (repo.description) hasReadme++;
      if (repo.topics) repo.topics.forEach(t => topics.add(t));
    }

    const languages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({ lang, count, pct: Math.round((count / repos.length) * 100) }));

    const detectedDomains = detectDomainsFromGH(languages.map(l => l.lang), [...topics]);

    const repoScore = Math.min(100, repos.length * 3);
    const langDiversity = Math.min(100, languages.length * 15);
    const starScore = Math.min(100, totalStars * 5);
    const docScore = Math.min(100, Math.round((hasReadme / Math.max(repos.length, 1)) * 100));
    const activityScore = calculateActivityScore(repos);

    const overallScore = Math.round(
      repoScore * 0.20 + langDiversity * 0.20 + starScore * 0.15 +
      docScore * 0.20 + activityScore * 0.25
    );

    const suggestions = [];
    if (repos.length < 10) suggestions.push("Create more public repositories to showcase your work");
    if (languages.length < 3) suggestions.push("Diversify your tech stack — try new languages/frameworks");
    if (docScore < 50) suggestions.push("Add README files to all repositories with clear descriptions");
    if (totalStars < 5) suggestions.push("Contribute to popular open-source projects to gain visibility");

    return {
      username: clean,
      name: user.name || clean,
      avatar: user.avatar_url,
      bio: user.bio,
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      repos: mappedRepos.slice(0, 20),
      languages,
      topics: [...topics].slice(0, 20),
      detectedDomains,
      scores: {
        overall: Math.min(100, overallScore),
        repositories: repoScore,
        diversity: langDiversity,
        stars: starScore,
        documentation: docScore,
        activity: activityScore,
      },
      stats: { totalStars, totalForks, totalRepos: repos.length },
      suggestions,
    };
  } catch (err) {
    throw new Error(`GitHub analysis failed: ${err.message}`);
  }
}

function detectDomainsFromGH(langs, topics) {
  const domains = [];
  const allSignals = [...langs.map(l => l.toLowerCase()), ...topics.map(t => t.toLowerCase())];
  const s = allSignals.join(' ');

  if (s.includes("python") && (s.includes("machine") || s.includes("data") || s.includes("jupyter"))) domains.push("Data Science / AI");
  if (s.includes("javascript") || s.includes("typescript") || s.includes("html") || s.includes("react") || s.includes("vue")) domains.push("Web Development");
  if (s.includes("python") || s.includes("java") || s.includes("c++") || s.includes("go")) domains.push("Software Engineering");
  if (s.includes("swift") || s.includes("kotlin") || s.includes("dart") || s.includes("flutter")) domains.push("Mobile Development");
  if (s.includes("docker") || s.includes("terraform") || s.includes("kubernetes")) domains.push("DevOps / Cloud");
  if (s.includes("solidity") || s.includes("blockchain") || s.includes("web3")) domains.push("Blockchain");

  return domains.length > 0 ? domains : ["General Software"];
}

function calculateActivityScore(repos) {
  const now = Date.now();
  const threeMonths = 90 * 24 * 60 * 60 * 1000;
  const sixMonths = 180 * 24 * 60 * 60 * 1000;
  let recent = 0, semiRecent = 0;

  for (const repo of repos) {
    const updated = new Date(repo.updated_at).getTime();
    if (now - updated < threeMonths) recent++;
    else if (now - updated < sixMonths) semiRecent++;
  }

  return Math.min(100, recent * 10 + semiRecent * 5);
}
