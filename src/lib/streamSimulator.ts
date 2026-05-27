// ESA Stream Simulator — simulates streaming LLM responses
// Used by ChatContext to create realistic typing effects

export interface StreamOptions {
  chunkDelay?: [number, number]; // min/max ms between chunks, default [40, 80]
  wordMode?: boolean;            // true = stream word by word, false = character by character
}

export interface StreamController {
  cancel: () => void;
}

/**
 * Simulates a streaming text response by calling onChunk at intervals.
 *
 * @param text - Full text to stream
 * @param onChunk - Called with each new word/char and the accumulated text so far
 * @param onComplete - Called when all text has been streamed
 * @param options - Timing and mode options
 * @returns Controller object with cancel() to stop the stream
 */
export function streamText(
  text: string,
  onChunk: (chunk: string, fullText: string) => void,
  onComplete: () => void,
  options?: StreamOptions,
): StreamController {
  const [minDelay, maxDelay] = options?.chunkDelay ?? [40, 80];
  const wordMode = options?.wordMode ?? true;

  const chunks = wordMode ? text.split(/(\s+)/) : text.split('');
  let index = 0;
  let accumulated = '';
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function next() {
    if (cancelled || index >= chunks.length) {
      if (!cancelled) onComplete();
      return;
    }

    const chunk = chunks[index];
    accumulated += chunk;
    index++;
    onChunk(chunk, accumulated);

    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    timeoutId = setTimeout(next, delay);
  }

  // Start with a small initial delay
  timeoutId = setTimeout(next, 100);

  return {
    cancel() {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    },
  };
}

/**
 * Simulates a multi-step orchestration trace with staggered timing.
 * Returns a cleanup function to cancel all timers.
 *
 * @param steps - Array of step callbacks to execute in sequence
 * @param delays - Delay in ms before each step
 * @param onAllComplete - Called when all steps have executed
 */
export function runOrchestrationSequence(
  steps: (() => void)[],
  delays: number[],
  onAllComplete: () => void,
): () => void {
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;

  let cumulativeDelay = 0;
  steps.forEach((step, i) => {
    cumulativeDelay += delays[i] ?? 500;
    const timer = setTimeout(() => {
      if (!cancelled) step();
      // Check if this is the last step
      if (!cancelled && i === steps.length - 1) {
        setTimeout(() => {
          if (!cancelled) onAllComplete();
        }, 300);
      }
    }, cumulativeDelay);
    timers.push(timer);
  });

  return () => {
    cancelled = true;
    timers.forEach(clearTimeout);
  };
}
