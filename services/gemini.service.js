import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { extractPDFText } from './pdf.service.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze user's resume and projects using Gemini AI
 */
export const analyzeResume = async (userProfile) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Extract resume text if URL is provided
    let resumeText = '';
    console.log(userProfile);
    if (userProfile.resume) {
      try {
        console.log('Extracting PDF from:', userProfile.resume);
        resumeText = await extractPDFText(userProfile.resume);
        console.log('Extracted resume text length:', resumeText.length);
      } catch (pdfError) {
        console.error('Error extracting PDF text:', pdfError);
        resumeText = 'Could not extract resume text';
      }
    }

    const prompt = buildResumePrompt(userProfile, resumeText);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const analysis = parseGeminiResponse(text);

    return {
      success: true,
      analysis
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Analyze skill gap between user profile and job requirements
 */
export const analyzeSkillGap = async (userProfile, job, resumeAnalysis) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = buildGapAnalysisPrompt(userProfile, job, resumeAnalysis);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const analysis = parseGeminiResponse(text);

    return {
      success: true,
      analysis
    };
  } catch (error) {
    console.error('Error analyzing skill gap:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Build resume analysis prompt
 */
const buildResumePrompt = (userProfile, resumeText = '') => {
  const { skills = [], experienceLevel = 'Beginner', portfolio = '', githubProfile = '' } = userProfile;

  return `You are an expert technical recruiter and career coach. Analyze the following resume/profile comprehensively.

**Resume Content:**
${resumeText || 'No resume text provided'}

**User's Self-Reported Skills:**
${skills.join(', ') || 'None specified'}

**Experience Level:** ${experienceLevel}
**Portfolio:** ${portfolio || 'Not provided'}
**GitHub:** ${githubProfile || 'Not provided'}

**Task:**
Provide a detailed analysis in valid JSON format with this EXACT structure:

{
  "skillsReview": {
    "strong": [
      {"skill": "string", "evidence": "string"}
    ],
    "weak": [
      {"skill": "string", "reason": "string"}
    ],
    "toImprove": [
      {"skill": "string", "current": "string", "target": "string"}
    ]
  },
  "projectsReview": [
    {
      "projectName": "string",
      "description": "string",
      "strong": ["string"],
      "weak": ["string"],
      "toImprove": ["string"],
      "skillsDemonstrated": ["string"]
    }
  ],
  "overallAssessment": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "careerLevel": "string",
    "recommendations": ["string"]
  }
}

Analyze the resume content carefully. Extract all projects, work experience, and skills demonstrated. Be specific and provide evidence from the resume.

IMPORTANT: Return ONLY valid JSON, no additional text.`;
};

/**
 * Build gap analysis prompt
 */
const buildGapAnalysisPrompt = (userProfile, job, resumeAnalysis) => {
  const { skills = [], experienceLevel = 'Beginner' } = userProfile;
  const { title, description, requirements = [], experienceLevel: jobExpLevel, company } = job;

  // Extract strong skills from resume analysis
  const strongSkills = resumeAnalysis?.skillsReview?.strong?.map(s => s.skill) || [];
  const weakSkills = resumeAnalysis?.skillsReview?.weak?.map(s => s.skill) || [];

  return `You are an expert technical recruiter specializing in skill gap analysis. Compare a candidate's profile against a job description to identify gaps and provide actionable recommendations.

**Context:**
- This is for a user trying to determine if they're ready for a role
- Be honest but constructive
- Provide specific, actionable guidance

**Job Posting:**
Title: ${title}
Company: ${company || 'Not specified'}
Experience Level: ${jobExpLevel || 'Not specified'}

Description:
${description}

Requirements:
${Array.isArray(requirements) ? requirements.join(', ') : requirements}

**Candidate Profile:**
Experience Level: ${experienceLevel}
Skills: ${skills.join(', ')}

Resume Analysis - Strong Skills: ${strongSkills.join(', ') || 'Not analyzed'}
Resume Analysis - Weak Skills: ${weakSkills.join(', ') || 'Not analyzed'}

**Task:**
Provide a comprehensive gap analysis in valid JSON format with this EXACT structure:

{
  "matchPercentage": 0-100,
  "matchSummary": "string (2-3 sentences)",
  "strengths": [
    {
      "skill": "string",
      "evidence": "string",
      "relevance": "string"
    }
  ],
  "criticalGaps": [
    {
      "requirement": "string",
      "priority": "Critical|High|Medium",
      "impact": "string",
      "difficulty": "Easy|Medium|Hard"
    }
  ],
  "proficiencyGaps": [
    {
      "skill": "string",
      "userLevel": "string",
      "requiredLevel": "string",
      "evidence": "string"
    }
  ],
  "recommendedActions": [
    {
      "action": "string",
      "skill": "string",
      "estimatedTime": "string",
      "priority": 1-5,
      "resources": ["string"]
    }
  ],
  "timelineAssessment": {
    "estimatedTimeToReady": "string",
    "confidence": "High|Medium|Low",
    "assumptions": "string"
  }
}

Be realistic about matchPercentage. Identify concrete gaps and provide specific resources.

IMPORTANT: Return ONLY valid JSON, no additional text.`;
};

/**
 * Parse Gemini response (extract JSON)
 */
const parseGeminiResponse = (text) => {
  try {
    // Remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```\n?/g, '');
    }

    return JSON.parse(cleaned.trim());
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    console.error('Raw text:', text);
    throw new Error('Failed to parse AI response as JSON');
  }
};
