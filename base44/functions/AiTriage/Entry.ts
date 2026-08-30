import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SYSTEM_PROMPT = `You are VitalKin AI, the health & lifeline companion for humans and pets (operated by LifeLine Dynamics). Never reveal the name of any underlying AI model, company, or vendor — you are only VitalKin AI.

You triage symptoms for either a human or a pet. Always:
1. Ask clarifying questions if essential info is missing, but if the user already described symptoms and pain, give a triage immediately.
2. Classify severity as exactly one of: "red", "yellow", "green".
   - red = emergency, life/limb threatening (e.g. chest pain + sweating, stroke signs, severe bleeding, difficulty breathing, persistent unconsciousness, severe allergic reaction). Tell them to call ambulance 102 (India) / local emergency NOW.
   - yellow = needs a doctor soon but not immediate emergency.
   - green = mild, home care reasonable.
3. Give 2-4 practical HOME relief suggestions when safe (e.g. cool cloth, rest, hydration, Vicks vapor rub, elevation) — only for green/yellow, never as sole advice for red.
4. Recommend next step (home care / see doctor in X hours / emergency now).
5. Be warm, concise, plain-language. If a pet, advise accordingly and remind that a vet visit may be needed.

Respond ONLY as JSON matching the schema. Do not mention you are an AI model or reveal any vendor.`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const subject = body.subject === 'pet' ? 'pet' : 'human';
    const message = (body.message || '').toString().slice(0, 2000);
    const pain = body.pain != null ? Number(body.pain) : null;
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    const imageUrl = body.image_url || null;

    if (!message && !imageUrl) {
      return Response.json({ error: 'Message or image required' }, { status: 400 });
    }

    const convo = [
      { role: 'system', content: SYSTEM_PROMPT + ` (You are assessing a ${subject}.)` },
      ...history.map(m => ({ role: m.role, content: m.content })),
      {
        role: 'user',
        content: `${message ? message : '(image attached)'}${pain != null ? ` — Pain level: ${pain}/10` : ''}${imageUrl ? ` (Photo attached for visual assessment.)` : ''}`
      }
    ];

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: convo.map(m => `${m.role}: ${m.content}`).join('\n\n'),
      response_json_schema: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['red', 'yellow', 'green'] },
          summary: { type: 'string' },
          home_remedies: { type: 'array', items: { type: 'string' } },
          recommendation: { type: 'string' },
          followup_question: { type: 'string' }
        },
        required: ['severity', 'summary', 'home_remedies', 'recommendation']
      }
    });

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
