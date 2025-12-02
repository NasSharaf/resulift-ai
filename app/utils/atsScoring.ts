// utils/atsScoring.ts (Improved Version)
export interface ATSScore {
    totalScore: number;
    breakdown: {
        keywordMatch: number;
        skillsCoverage: number;
        titleAlignment: number;
        seniorityMatch: number;
        recency: number;
    };
    recommendations: string[];
}

interface TFIDF {
    [term: string]: number;
}

// Expandable skill dictionary (seed for robustness)
const KNOWN_SKILLS = [
"python", "javascript", "typescript", "react", "node", "c++", "c#", "java",
"aws", "azure", "gcp", "docker", "kubernetes", "terraform", "sql", "postgres",
"mongodb", "machine learning", "deep learning", "pytorch", "tensorflow",
"nlp", "computer vision", "embedded", "autosar", "can bus", "git", "linux"
];

export function calculateATSScore(
  resume: string | object, 
  jobDescription: string
): ATSScore {
  // Normalize input to text
  const resumeText = typeof resume === 'object' 
    ? JSON.stringify(resume) 
    : resume;

  // Handle edge cases
  if (!resumeText || !jobDescription) {
    return {
      totalScore: 50,
      breakdown: {
        keywordMatch: 0,
        skillsCoverage: 0,
        titleAlignment: 0,
        seniorityMatch: 0,
        recency: 0
      },
      recommendations: ["Insufficient information to calculate ATS score"]
    };
  }

  // Calculate individual components (all normalized to 0-100)
  const keywordMatch = calculateKeywordMatch(resumeText, jobDescription);
  const skillsCoverage = calculateSkillsCoverage(resumeText, jobDescription);
  const titleAlignment = calculateTitleAlignment(resumeText, jobDescription);
  const seniorityMatch = calculateSeniorityMatch(resumeText, jobDescription);
  const recency = calculateRecency(resumeText);

  // New weighted total score calculation
  const totalScore = Math.min(100, (
    keywordMatch * 0.35 +
    skillsCoverage * 0.30 +
    titleAlignment * 0.15 +
    seniorityMatch * 0.10 +
    recency * 0.10
  ));

  const recommendations = generateRecommendations(
    resumeText, 
    jobDescription, 
    { 
      keywordMatch, 
      skillsCoverage, 
      titleAlignment, 
      seniorityMatch, 
      recency 
    }
  );

  return {
    totalScore,
    breakdown: {
      keywordMatch,
      skillsCoverage,
      titleAlignment,
      seniorityMatch,
      recency
    },
    recommendations
  };
}

// Helper Functions
function calculateKeywordMatch(resumeText: string, jobDescription: string): number {
  // Compute TF-IDF for both resume and job description
  const tfidf = computeTFIDF([resumeText, jobDescription]);

  // Extract tokens from resume and job description
  const resumeTokens = resumeText.toLowerCase().split(/\s+/)
    .filter(token => token.length > 2 && !isCommonWord(token));
  const jobTokens = jobDescription.toLowerCase().split(/\s+/)
    .filter(token => token.length > 2 && !isCommonWord(token));

  // Compute weighted match
  const matches = jobTokens.map(jobToken => {
    // Find best match in resume tokens
    const bestMatch = resumeTokens.reduce((best, resumeToken) => {
      // Compute similarity and use TF-IDF weighted score
      const similarity = calculateStringSimilarity(jobToken, resumeToken);
      const jobTokenScore = tfidf[jobToken] || 0;
      const resumeTokenScore = tfidf[resumeToken] || 0;
      
      const weightedSimilarity = similarity * 
        Math.sqrt(jobTokenScore * resumeTokenScore);
      
      return weightedSimilarity > best.score 
        ? { token: resumeToken, score: weightedSimilarity }
        : best;
    }, { token: '', score: 0 });

    return {
      jobToken,
      match: bestMatch.token,
      score: bestMatch.score
    };
  });

  // Calculate overall match percentage
  const totalScore = matches.reduce((sum, match) => sum + match.score, 0);
  const normalizedScore = totalScore / jobTokens.length;

  // Convert to percentage, with a minimum of 0
  return Math.max(0, Math.min(100, normalizedScore * 300));
}

function calculateSkillsCoverage(resumeText: string, jobDescription: string): number {
    const resumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(jobDescription);

    if (jobSkills.length === 0) return 50;

    const matchedSkills = jobSkills.filter(js =>
        resumeSkills.some(rs => rs.includes(js) || js.includes(rs))
    );

    return Math.min(100, (matchedSkills.length / jobSkills.length) * 100);
}

function calculateTitleAlignment(resumeText: string, jobDescription: string): number {
  const resumeTitle = extractTitle(resumeText);
  const jobTitle = extractTitle(jobDescription);

  if (!resumeTitle || !jobTitle) return 50; // Neutral score if no title found

  // Simple string similarity (you could use more advanced algorithms)
  const similarity = calculateStringSimilarity(resumeTitle, jobTitle);
  return Math.min(100, similarity * 100);
}

function calculateSeniorityMatch(resumeText: string, jobDescription: string): number {
  const resumeSeniority = extractSeniority(resumeText);
  const jobSeniority = extractSeniority(jobDescription);

  if (resumeSeniority === jobSeniority) return 100;
  if (!resumeSeniority || !jobSeniority) return 50;

  // Simple mapping of seniority levels
  const seniorityLevels = ['entry', 'junior', 'mid', 'senior', 'executive'];
  const resumeIndex = seniorityLevels.indexOf(resumeSeniority);
  const jobIndex = seniorityLevels.indexOf(jobSeniority);

  return Math.max(0, 100 - Math.abs(resumeIndex - jobIndex) * 25);
}

function calculateRecency(resumeText: string): number {
    const currentYear = new Date().getFullYear();
    const years = resumeText.match(/\b(20\d{2})\b/g)?.map(y => parseInt(y)) || [];

    if (years.length === 0) return 0;

    const mostRecent = Math.max(...years);
    const diff = currentYear - mostRecent;

    if (diff <= 1) return 100;
    if (diff <= 2) return 75;
    if (diff <= 4) return 50;
    return 25;
}

function generateRecommendations(
  resumeText: string, 
  jobDescription: string, 
  scores: Record<string, number>
): string[] {
  const recommendations: string[] = [];

  if (scores.keywordMatch < 50) {
    recommendations.push("Consider adding more job description keywords");
  }

  if (scores.skillsCoverage < 60) {
    recommendations.push("Ensure all required skills are highlighted");
  }

  if (scores.titleAlignment < 40) {
    recommendations.push("Align your job title more closely with the job description");
  }

  return recommendations;
}

// Utility Functions (would need more sophisticated implementations)
function extractWords(text: string): string[] {
  return text.split(/\s+/)
    .filter(word => word.length > 2);
}

function extractSkills(text: string): string[] {
    const lower = text.toLowerCase();
    const detectedSkills = KNOWN_SKILLS.filter(skill => lower.includes(skill));


    // Fallback: attempt structured extraction from JSON Resume format
    try {
    const parsedObj = JSON.parse(text);
    if (parsedObj.skills && Array.isArray(parsedObj.skills)) {
    const structuredSkills = parsedObj.skills.flatMap((s: any) =>
    Array.isArray(s.keywords) ? s.keywords : [s.name]
    );
    return [...new Set([...detectedSkills, ...structuredSkills.map((s: string) => s.toLowerCase())])];
    }
    } catch {}


    return [...new Set(detectedSkills)];
}

function extractTitle(text: string): string | null {
  try {
    const parsedObj = JSON.parse(text);
    
    // Check for title in JSON Resume format
    if (parsedObj.basics && parsedObj.basics.label) {
      return parsedObj.basics.label;
    }
  } catch {
    // Fall back to existing text extraction
  }

  // Existing title extraction
  const titleMatch = text.match(/job title[:\s]*(.+)/i);
  return titleMatch ? titleMatch[1].trim() : null;
}

function extractSeniority(text: string): string | null {
  const seniorityTerms = {
    'entry': ['entry', 'junior', 'associate', 'intern'],
    'mid': ['mid', 'intermediate', 'mid-level'],
    'senior': ['senior', 'lead', 'principal'],
    'executive': ['executive', 'director', 'vp', 'chief']
  };

  const lowercaseText = text.toLowerCase();
  
  for (const [level, terms] of Object.entries(seniorityTerms)) {
    if (terms.some(term => lowercaseText.includes(term))) {
      return level;
    }
  }

  return null;
}

function extractRecentExperience(text: string): number {
  // Extract years of recent experience
  const currentYear = new Date().getFullYear();
  const yearMatches = text.match(/\b(20\d{2})\b/g) || [];
  
  const recentYears = yearMatches
    .map(y => parseInt(y))
    .filter(y => y > currentYear - 5);

  return recentYears.length;
}

function calculateStringSimilarity(s1: string, s2: string): number {
  // Simple Levenshtein-inspired similarity
  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);
  
  // Calculate edit distance
  const editDistance = levenshteinDistance(s1, s2);
  
  // Convert to similarity (0-1 scale)
  return 1 - (editDistance / maxLen);
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({length: m + 1}, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i-1] === s2[j-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else {
        dp[i][j] = Math.min(
          dp[i-1][j] + 1,
          dp[i][j-1] + 1,
          dp[i-1][j-1] + 1
        );
      }
    }
  }

  return dp[m][n];
}

function isCommonWord(word: string): boolean {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 
    'to', 'for', 'of', 'with', 'by', 'from'
  ]);
  return commonWords.has(word);
}

function computeTFIDF(documents: string[]): TFIDF {
  // Tokenize documents
  const tokenizedDocs = documents.map(doc => 
    doc.toLowerCase().split(/\s+/)
      .filter(token => token.length > 2 && !isCommonWord(token))
  );

  // Compute term frequencies
  const termFrequencies = tokenizedDocs.map(tokens => {
    const tf: {[key: string]: number} = {};
    tokens.forEach(token => {
      tf[token] = (tf[token] || 0) + 1;
    });
    return tf;
  });

  // Compute document frequencies
  const docFrequency: {[key: string]: number} = {};
  tokenizedDocs.forEach(tokens => {
    const uniqueTokens = new Set(tokens);
    uniqueTokens.forEach(token => {
      docFrequency[token] = (docFrequency[token] || 0) + 1;
    });
  });

  // Compute TF-IDF
  const tfidf: TFIDF = {};
  tokenizedDocs.forEach((tokens, docIndex) => {
    tokens.forEach(token => {
      const tf = termFrequencies[docIndex][token] / tokens.length;
      const idf = Math.log(documents.length / (docFrequency[token] || 1));
      const score = tf * idf;
      
      tfidf[token] = Math.max(tfidf[token] || 0, score);
    });
  });

  return tfidf;
}