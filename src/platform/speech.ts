/**
 * Phase 16 — setup speech adapter.
 *
 * This thin adapter is the only Phase 16 code that touches
 * `window.speechSynthesis`. It is used for one optional, user-initiated
 * setup instruction and does not request microphone access, add audio
 * files, auto-play on page load, loop, or queue a voice-coaching system.
 * Richer voice cues and audio strategy arrive in Phase 25.
 */

export type SetupSpeechInstructionResult =
  | { kind: 'spoken' }
  | { kind: 'unsupported' }
  | { kind: 'error'; message: string };

function speechSynthesisApi(): SpeechSynthesis | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return typeof window.speechSynthesis === 'undefined' ? null : window.speechSynthesis;
}

/** Whether this browser exposes the Web Speech synthesis API. */
export function isSetupSpeechSupported(): boolean {
  return speechSynthesisApi() !== null && typeof SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Speak a single setup instruction.
 *
 * Call this only from a user gesture (for example, a button click). It
 * no-ops safely when unsupported and catches browser errors.
 */
export function speakSetupInstruction(text: string): SetupSpeechInstructionResult {
  const synthesis = speechSynthesisApi();
  if (synthesis === null || typeof SpeechSynthesisUtterance === 'undefined') {
    return { kind: 'unsupported' };
  }

  const instruction = text.trim();
  if (instruction.length === 0) {
    return { kind: 'error', message: 'No setup instruction was provided.' };
  }

  try {
    synthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(instruction);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onerror = () => undefined;
    synthesis.speak(utterance);
    return { kind: 'spoken' };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { kind: 'error', message: error.message };
    }
    return { kind: 'error', message: 'Voice instruction could not play on this browser.' };
  }
}

/** Stop any in-flight Phase 16 setup instruction. Safe on unsupported browsers. */
export function cancelSetupInstructionSpeech(): void {
  try {
    speechSynthesisApi()?.cancel();
  } catch {
    // Speech is optional and should never block navigation or cleanup.
  }
}
