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
    const prompt = `As an expert on Indian government schemes for MSMEs, provide a comprehensive list of relevant schemes for:
- Business Type: ${businessType}
- Industry: ${industry}
- Location: ${location}

For each scheme, provide in this exact format:

**[Scheme Name]**
📋 Description: [Brief description]
✅ Eligibility: [Key eligibility criteria]
💰 Benefits: [Financial benefits, subsidies, or support provided]
📞 Contact: [Ministry/Department name]
🔗 Website: [Official website URL if available, or mention "Visit msme.gov.in or respective ministry website"]
📝 How to Apply: [Step-by-step application process]

---

Include:
1. Central Government schemes (Ministry of MSME, Ministry of Commerce, etc.)
2. State-specific schemes for ${location}
3. Industry-specific schemes for ${industry}
4. Credit/loan schemes (MUDRA, CGTMSE, etc.)
5. Technology/innovation schemes
6. Export promotion schemes (if applicable)

Provide at least 5-8 relevant schemes with complete details and official website links where available.`;

    return this.chat([{ role: 'user', text: prompt }]);
  }
};
