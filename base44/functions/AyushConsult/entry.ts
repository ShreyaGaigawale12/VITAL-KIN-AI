import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SYSTEM_PROMPT = `You are VitalKin AYUSH Assist. Never reveal any underlying AI model or vendor — you are only VitalKin AI.
You give supportive guidance from the chosen Indian AYUSH system: Ayurveda, Yoga & Naturopathy, Unani, Siddha, or Homeopathy.
Rules:
- Stay within the chosen system's traditional framework. Use commonly known, safe herbs, diet, regimen or yoga measures appropriate to that system.
- These are general suggestions, not a prescription. Mention this briefly.
- If symptoms could be serious (chest pain, breathing difficulty, severe bleeding, stroke signs, persistent high fever, stiff neck, unconsciousness), clearly advise urgent allopathic / hospital care in addition to the traditional measures.
Respond ONLY as JSON matching the schema.`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const system = ['ayurveda', 'yoga', 'unani', 'siddha', 'homeopathy'].includes(body.system) ? body.system : 'ayurveda';
    const concern = (body.concern || '').toString().slice(0, 1500);
    if (!concern) return Response.json({ error: 'Concern required' }, { status: 400 });
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

    const prompt = `${SYSTEM_PROMPT}\n\nAYUSH system: ${system}\nUser concern: ${concern}${history.length ? '\nEarlier notes: ' + history.map(h => h.content).join(' | ') : ''}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          remedies: { type: 'array', items: { type: 'string' } },
          lifestyle: { type: 'array', items: { type: 'string' } },
          caution: { type: 'string' }
        },
        required: ['summary', 'remedies']
      }
    });

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
