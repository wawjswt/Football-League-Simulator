import { GoogleGenAI } from "@google/genai";
import { Team, Match } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateRoundRecap = async (
  round: number,
  matches: Match[],
  teams: Team[]
): Promise<{ headline: string; body: string }> => {
  const ai = getAI();
  if (!ai) return { headline: "Round Completed", body: "Check the scores for details." };

  // Prepare data for the prompt
  const matchSummaries = matches.map(m => {
    const home = teams.find(t => t.id === m.homeTeamId)?.name || "Unknown";
    const away = teams.find(t => t.id === m.awayTeamId)?.name || "Unknown";
    return `${home} ${m.homeScore} - ${m.awayScore} ${away}`;
  }).join("\n");

  const prompt = `
    You are a sports journalist for a football league.
    Write a short, exciting news report summarizing Round ${round}.
    Here are the results:
    ${matchSummaries}

    Focus on the biggest upset or highest scoring game.
    Keep it under 100 words.
    Return JSON format: { "headline": "string", "body": "string" }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      headline: `Round ${round} Concluded`,
      body: "The latest round of matches has finished. See the table for updated standings."
    };
  }
};

export const generateMatchCommentary = async (
  match: Match,
  homeTeam: Team,
  awayTeam: Team
): Promise<string> => {
  const ai = getAI();
  if (!ai) return "Match analysis unavailable.";

  const prompt = `
    Write a 2-sentence post-match commentary for:
    ${homeTeam.name} vs ${awayTeam.name}
    Final Score: ${match.homeScore} - ${match.awayScore}
    Home Strength: ${homeTeam.attack} ATK / ${homeTeam.defense} DEF
    Away Strength: ${awayTeam.attack} ATK / ${awayTeam.defense} DEF

    Make it sound like a TV pundit.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "No commentary generated.";
  } catch (error) {
    console.error(error);
    return "Commentary unavailable due to technical difficulties.";
  }
};

export const generateTeamLore = async (teamName: string): Promise<string> => {
   const ai = getAI();
  if (!ai) return "A football club with a rich history.";

  const prompt = `Write a one-sentence engaging description for a fictional football team named "${teamName}".`;
  
  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "";
  } catch (e) {
    return "A local fan favorite.";
  }
}