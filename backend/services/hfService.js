const { InferenceClient } = require('@huggingface/inference');
const https = require('https');

const hf = new InferenceClient(process.env.HF_TOKEN);

const CANDIDATE_LABELS = ['Frontend', 'Backend', 'AI/ML', 'DevOps', 'Data Engineering', 'Other'];

/**
 * Calls HuggingFace zero-shot classification directly via the router endpoint,
 * bypassing the SDK's zeroShotClassification method which throws
 * ProviderOutputError on cold-start "model loading" responses.
 * Returns the top label as a string.
 */
function classifyJobZeroShot(description, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      inputs: description,
      parameters: { candidate_labels: CANDIDATE_LABELS },
    });
    const req = https.request({
      hostname: 'router.huggingface.co',
      path: '/hf-inference/models/facebook/bart-large-mnli',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'X-Wait-For-Model': 'true',
      },
      timeout: timeoutMs,
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed[0]?.label) {
            resolve(parsed[0].label);
          } else {
            reject(new Error(parsed?.error || 'Unexpected HF response shape'));
          }
        } catch {
          reject(new Error('Failed to parse HF response'));
        }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error(`HF request timed out after ${timeoutMs}ms`)); });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * Generates text via featherless-ai provider on the HF router (OpenAI-compatible chat endpoint).
 * Uses raw HTTPS — consistent with classifyJobZeroShot — and router.huggingface.co which is
 * confirmed reachable from this server.
 */
function generateText(prompt, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      model: 'HuggingFaceH4/zephyr-7b-beta',
      messages: [
        { role: 'system', content: 'You are a professional career assistant who writes personalised cover letters.' },
        { role: 'user',   content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.7,
    });
    const req = https.request({
      hostname: 'router.huggingface.co',
      path: '/featherless-ai/v1/chat/completions',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: timeoutMs,
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.choices?.[0]?.message?.content;
          if (text) resolve(text.trim());
          else reject(new Error(parsed?.error?.message || parsed?.error || 'Unexpected HF response shape'));
        } catch {
          reject(new Error('Failed to parse HF response'));
        }
      });
    });
    req.on('timeout', () => { req.destroy(); reject(new Error(`HF request timed out after ${timeoutMs}ms`)); });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = {
  // SDK passthroughs — used by other controllers (profile skill extraction, embeddings)
  featureExtraction: (...args) => hf.featureExtraction(...args),
  tokenClassification: (...args) => hf.tokenClassification(...args),
  zeroShotClassification: (...args) => hf.zeroShotClassification(...args),

  // Custom raw-HTTPS functions — mockable in tests
  classifyJobZeroShot,
  generateText,
};
