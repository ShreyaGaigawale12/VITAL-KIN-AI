import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const SYSTEM_PROMPT = `You are VitalKin Snakebite Assist for rural India. Never reveal any underlying AI model or vendor — you are only VitalKin AI.
Given a photo of a snake (if visible) and a short description, identify the LIKELY snake and give first-aid guidance.
Common Indian medically important snakes: Russell's viper, Spectacled cobra, Common krait, Saw-scaled viper, Hump-nosed pit viper, Bamboo pit viper, King cobra. Common harmless look-alikes: Rat snake, Wolf snake, Sand boa, Checkered keelback.
Rules:
- NEVER tell the user it is safe to skip the hospital. Even if likely non-venomous, urge going to a hospital immediately — photo identification is unreliable.
- First aid must follow WHO/Indian guidelines: immobilise the bitten limb, keep the person calm and still, remove rings/watches/constricting items, transport to hospital promptly, note time of bite. Do NOT recommend tourniquets, cutting the wound, sucking out venom, applying ice, or giving alcohol.
- severity: "red" if venomous suspected or any neurotoxic/haemotoxic signs (bleeding, drooping eyelids, breathing trouble, dark urine); "yellow" if uncertain or mild local symptoms; "green" only if clearly a harmless species with no symptoms.
- home_remedies: simple, SAFE supportive measures a rural household can do while arranging transport — e.g. keep the person calm and still, immobilise the bitten limb (splint, keep at or below heart level), remove rings/watches/tight clothing, wash the bite gently with clean water, keep the person hydrated if fully conscious and not vomiting, note the exact time of bite, lay the person on their left side if drowsy. NEVER suggest applying herbs, ash, mud, stones, oils, or any substance to the wound, or any oral remedy claimed to neutralise venom — these are harmful. These are comfort/transport measures only, NOT a substitute for hospital and antivenom.
Respond ONLY as JSON matching the schema.`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const imageUrl = body.image_url || null;
    const description = (body.description || '').toString().slice(0, 1000);
    if (!imageUrl && !description) {
      return Response.json({ error: 'Photo or description required' }, { status: 400 });
    }

    const prompt = `${SYSTEM_PROMPT}\n\nUser description: ${description || '(none)'}${imageUrl ? '\n(A photo is attached for visual identification.)' : ''}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: imageUrl ? [imageUrl] : undefined,
      response_json_schema: {
        type: 'object',
        properties: {
          likely_snake: { type: 'string' },
          venomous: { type: 'boolean' },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
          severity: { type: 'string', enum: ['red', 'yellow', 'green'] },
          first_aid: { type: 'array', items: { type: 'string' } },
          home_remedies: { type: 'array', items: { type: 'string' } },
          do_not: { type: 'array', items: { type: 'string' } },
          warning: { type: 'string' }
        },
        required: ['likely_snake', 'venomous', 'severity', 'warning']
      }
    });

    return Response.json({ result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
