/**
 * Ollama service for intelligent field analysis and matching
 */

export interface OllamaResponse {
  fields: Array<{
    fieldIndex: number;
    intent: string;
    suggestedValue: string;
    confidence: number;
    reasoning: string;
  }>;
}

export interface EmbeddingResponse {
  embedding: number[];
}

const OLLAMA_BASE_URL = 'http://localhost:11434';

/**
 * Check if Ollama is available
 */
export async function checkOllamaConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (err) {
    console.warn('Ollama not available:', err);
    return false;
  }
}

/**
 * Analyze unfilled fields using Ollama LLM
 */
export async function analyzeFieldsWithOllama(
  prompt: string,
  model: string = 'llama3.2'
): Promise<OllamaResponse | null> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: 'json'
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Parse the JSON response from Ollama
    try {
      const parsed = JSON.parse(data.response);
      return parsed;
    } catch (e) {
      console.error('Failed to parse Ollama JSON response:', data.response);
      return null;
    }
  } catch (err) {
    console.error('Error calling Ollama:', err);
    return null;
  }
}

/**
 * Get embeddings for text using Ollama
 */
export async function getEmbedding(
  text: string,
  model: string = 'nomic-embed-text'
): Promise<number[] | null> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: text
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama embeddings API error: ${response.statusText}`);
    }

    const data: EmbeddingResponse = await response.json();
    return data.embedding;
  } catch (err) {
    console.error('Error getting embedding:', err);
    return null;
  }
}

/**
 * Get embeddings for multiple texts
 */
export async function getBatchEmbeddings(
  texts: string[],
  model: string = 'nomic-embed-text'
): Promise<Map<string, number[]>> {
  const embeddings = new Map<string, number[]>();

  for (const text of texts) {
    const embedding = await getEmbedding(text, model);
    if (embedding) {
      embeddings.set(text, embedding);
    }
  }

  return embeddings;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Find best matching option using embeddings
 */
export async function findBestMatchWithEmbeddings(
  targetText: string,
  options: string[],
  threshold: number = 0.7
): Promise<{ option: string; similarity: number } | null> {
  // Get embedding for target
  const targetEmbedding = await getEmbedding(targetText);
  if (!targetEmbedding) return null;

  // Get embeddings for all options
  const optionEmbeddings = await Promise.all(
    options.map(async opt => ({
      option: opt,
      embedding: await getEmbedding(opt)
    }))
  );

  // Calculate similarities
  const similarities = optionEmbeddings
    .filter(item => item.embedding !== null)
    .map(item => ({
      option: item.option,
      similarity: cosineSimilarity(targetEmbedding, item.embedding!)
    }))
    .sort((a, b) => b.similarity - a.similarity);

  // Return best match if above threshold
  if (similarities.length > 0 && similarities[0].similarity >= threshold) {
    return similarities[0];
  }

  return null;
}

/**
 * Smart match for dropdown/select fields
 */
export async function smartMatchDropdown(
  fieldLabel: string,
  fieldOptions: string[],
  profileValue: string,
  context?: string
): Promise<string | null> {
  // Try exact match first
  const exactMatch = fieldOptions.find(
    opt => opt.toLowerCase() === profileValue.toLowerCase()
  );
  if (exactMatch) return exactMatch;

  // Try partial match
  const partialMatch = fieldOptions.find(
    opt => opt.toLowerCase().includes(profileValue.toLowerCase()) ||
           profileValue.toLowerCase().includes(opt.toLowerCase())
  );
  if (partialMatch) return partialMatch;

  // Use embeddings for semantic matching
  const contextText = context 
    ? `${fieldLabel}: ${context}. User's value: ${profileValue}`
    : `${fieldLabel}. User's value: ${profileValue}`;

  const match = await findBestMatchWithEmbeddings(contextText, fieldOptions, 0.6);
  return match?.option || null;
}

/**
 * Use Ollama to infer appropriate value for a field
 */
export async function inferFieldValue(
  fieldLabel: string,
  fieldType: string,
  fieldContext: string,
  profileData: any,
  options?: string[]
): Promise<string | null> {
  const prompt = `You are a job application assistant. Based on the candidate's profile, suggest the best value for this form field.

FIELD INFORMATION:
- Label: "${fieldLabel}"
- Type: ${fieldType}
- Context: "${fieldContext}"
${options ? `- Available options: ${options.join(', ')}` : ''}

CANDIDATE PROFILE:
${JSON.stringify(profileData, null, 2)}

Task: What is the most appropriate value for this field? ${options ? 'Choose from the available options.' : ''}

Respond with ONLY the value, nothing else. If you cannot determine a good value, respond with "UNKNOWN".`;

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        prompt,
        stream: false
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    const value = data.response.trim();
    
    if (value === 'UNKNOWN' || !value) return null;

    // If options provided, match to closest option
    if (options && options.length > 0) {
      return await smartMatchDropdown(fieldLabel, options, value, fieldContext);
    }

    return value;
  } catch (err) {
    console.error('Error inferring field value:', err);
    return null;
  }
}
