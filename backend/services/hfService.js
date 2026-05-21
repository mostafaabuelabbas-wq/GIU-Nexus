const { HfInference } = require('@huggingface/inference');
const https = require('https');

const hf = new HfInference(process.env.HF_TOKEN);

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

module.exports = {
  // SDK passthroughs — used by other controllers (profile skill extraction, embeddings)
  featureExtraction: (...args) => hf.featureExtraction(...args),
  tokenClassification: (...args) => hf.tokenClassification(...args),
  zeroShotClassification: (...args) => hf.zeroShotClassification(...args),

  // Custom raw-HTTPS classifier — mockable in tests
  classifyJobZeroShot,
};
