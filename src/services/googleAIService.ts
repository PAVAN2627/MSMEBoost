const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface AIMessage {
  role: 'user' | 'model';
  text: string;
}

export const googleAIService = {
  async chat(messages: AIMessage[]) {
    try {
      const contents = messages.map(msg => ({
        parts: [{ text: msg.text }],
        role: msg.role === 'user' ? 'user' : 'model'
      }));

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      
      return { text, error: null };
    } catch (error: any) {
      return { text: null, error: error.message };
    }
  },

  async getSchemes(businessType: string, industry: string, location: string) {
    const prompt = `As an expert on Indian government schemes for MSMEs, provide a detailed list of relevant schemes for:
- Business Type: ${businessType}
- Industry: ${industry}
- Location: ${location}

For each scheme, provide:
1. Scheme name
2. Brief description
3. Eligibility criteria
4. Benefits
5. How to apply

Focus on currently active schemes from Ministry of MSME, state governments, and relevant ministries.`;

    return this.chat([{ role: 'user', text: prompt }]);
  }
};
