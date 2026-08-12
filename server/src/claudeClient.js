// Client IA : par défaut, un modèle Ollama local (gratuit, aucune clé API).
// Si ANTHROPIC_API_KEY est renseignée dans server/.env, on repasse sur l'API
// Claude (meilleure qualité) sans rien changer au reste du code.
const USE_ANTHROPIC = !!process.env.ANTHROPIC_API_KEY;

const MODEL = USE_ANTHROPIC ? 'claude-haiku-4-5-20251001' : (process.env.OLLAMA_MODEL || 'qwen2.5:3b');
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

let anthropicClient = null;
function getAnthropicClient() {
  if (!anthropicClient) {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  return JSON.parse(candidate);
}

async function callOnceAnthropic(system, prompt, maxTokens) {
  const res = await getAnthropicClient().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = res.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
  return extractJson(text);
}

async function callOnceOllama(system, prompt, maxTokens) {
  let res;
  try {
    res = await fetch(OLLAMA_HOST + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        format: 'json',
        stream: false,
        options: { num_predict: maxTokens }
      })
    });
  } catch (err) {
    throw new Error('Impossible de joindre Ollama sur ' + OLLAMA_HOST + ' — vérifiez qu\'il tourne (`ollama serve`) et que le modèle "' + MODEL + '" est bien téléchargé (`ollama pull ' + MODEL + '`).');
  }
  if (!res.ok) {
    throw new Error('Ollama a répondu avec une erreur ' + res.status + ' — le modèle "' + MODEL + '" est-il installé ? (`ollama pull ' + MODEL + '`)');
  }
  const data = await res.json();
  const text = (data.message && data.message.content) || '';
  return extractJson(text);
}

async function callOnce(system, prompt, maxTokens) {
  return USE_ANTHROPIC ? callOnceAnthropic(system, prompt, maxTokens) : callOnceOllama(system, prompt, maxTokens);
}

/**
 * Demande une réponse JSON stricte à Claude. Retente une fois avec une
 * instruction plus stricte si le premier parsing échoue (le modèle a parfois
 * tendance à ajouter du texte autour du JSON malgré la consigne).
 */
async function askForJson({ system, prompt, maxTokens = 1024 }) {
  try {
    return await callOnce(system, prompt, maxTokens);
  } catch (err) {
    if (err instanceof SyntaxError) {
      const strictSystem =
        system +
        '\n\nIMPORTANT : réponds UNIQUEMENT avec un objet JSON valide, sans texte avant ni après, sans balises markdown.';
      return await callOnce(strictSystem, prompt, maxTokens);
    }
    throw err;
  }
}

module.exports = { askForJson, MODEL, USE_ANTHROPIC };
