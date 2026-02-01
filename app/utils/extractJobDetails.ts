/**
 * Extract job details from job description using regex patterns
 * No LLM calls - code-first approach for cost efficiency
 */

export interface ExtractedJobDetails {
  companyName: string | null;
  jobTitle: string | null;
}

export function extractJobDetails(description: string): ExtractedJobDetails {
  if (!description || description.trim().length === 0) {
    return { companyName: null, jobTitle: null };
  }

  let companyName = null;
  let jobTitle = null;

  // Extract company name using common patterns
  const companyPatterns = [
    // "at Google is hiring" or "@ Google seeks"
    /(?:at|@)\s+([A-Z][A-Za-z0-9\s&.,'-]{2,40})(?:\s+is|\s+seeks|\s+hiring|\s+invites|,|\.|$)/i,
    // "Google is hiring" or "Google seeks"
    /^([A-Z][A-Za-z0-9\s&.,'-]{2,40})\s+(?:is|seeks|hiring|invites|looking)/im,
    // "Company: Google"
    /Company:\s*([A-Za-z0-9\s&.,'-]{2,40})/i,
    // "Employer: Google"
    /Employer:\s*([A-Za-z0-9\s&.,'-]{2,40})/i,
    // "Organization: Google"
    /Organization:\s*([A-Za-z0-9\s&.,'-]{2,40})/i,
    // "Join Google" or "Join our team at Google"
    /Join\s+(?:our\s+team\s+at\s+)?([A-Z][A-Za-z0-9\s&.,'-]{2,40})(?:\s+as|\s+to|!|\.)/i,
  ];

  for (const pattern of companyPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      companyName = match[1].trim();
      // Clean up trailing punctuation
      companyName = companyName.replace(/[,.\s]+$/, '');
      // Validate length (company names shouldn't be too short or too long)
      if (companyName.length >= 2 && companyName.length <= 50) {
        break;
      } else {
        companyName = null;
      }
    }
  }

  // Extract job title using common patterns
  const titlePatterns = [
    // "Position: Software Engineer"
    /(?:Position|Role|Title|Job):\s*([A-Za-z\s/-]{3,60})/i,
    // "hiring a Software Engineer" or "seeking an SWE"
    /(?:hiring|seeking|looking for)\s+(?:a|an)?\s*([A-Z][A-Za-z\s/-]{2,60})(?:\s+at|\s+to|\s+with|\s+in|,|\.|$)/i,
    // "Software Engineer Position"
    /^([A-Z][A-Za-z\s/-]{2,60})\s+(?:Position|Role|Opening)/im,
    // "We're hiring: Software Engineer"
    /hiring:\s*([A-Za-z\s/-]{3,60})/i,
    // "Join us as Software Engineer"
    /Join\s+us\s+as\s+(?:a|an)?\s*([A-Za-z\s/-]{3,60})/i,
    // "Apply for Software Engineer"
    /Apply\s+for\s+(?:the|a|an)?\s*([A-Za-z\s/-]{3,60})/i,
  ];

  for (const pattern of titlePatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      jobTitle = match[1].trim();
      // Clean up trailing punctuation and common words
      jobTitle = jobTitle.replace(/[,.\s]+$/, '');
      jobTitle = jobTitle.replace(/\s+(at|to|with|in)$/i, '');
      // Validate length
      if (jobTitle.length >= 3 && jobTitle.length <= 60) {
        break;
      } else {
        jobTitle = null;
      }
    }
  }

  return { companyName, jobTitle };
}
