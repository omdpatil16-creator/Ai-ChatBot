import { Message } from '../models/message';

export class AIService {
  /**
   * Send message history to Express /api/chat server endpoint
   */
  static async sendMessage(
    messages: Message[],
    provider: 'gemini' | 'mock' | 'openai' | 'claude' = 'gemini',
    model: string = 'gemini-3.6-flash',
    systemInstruction?: string
  ): Promise<{ reply: string; providerUsed: string }> {
    try {
      const formattedMessages = messages.map((m) => {
        let contentPayload: any = m.content;

        if (m.attachments && m.attachments.length > 0) {
          const parts: any[] = [{ type: 'text', text: m.content || '' }];
          m.attachments.forEach((att) => {
            if (att.type.startsWith('image/')) {
              parts.push({
                type: 'image_url',
                image_url: { url: att.dataUrl },
              });
            } else {
              parts.push({
                type: 'text',
                text: `\n\n[Attached File: ${att.name} (${att.type})]\nData URL preview available.`,
              });
            }
          });
          contentPayload = parts;
        }

        return {
          role: m.role === 'user' ? 'user' : 'assistant',
          content: contentPayload,
        };
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: formattedMessages,
          provider,
          model,
          systemInstruction,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      return {
        reply: data.reply,
        providerUsed: data.providerUsed || provider,
      };
    } catch (err: any) {
      console.warn('Backend call error, using local resilient fallback:', err);
      return {
        reply: `I encountered an issue connecting to the network service (${err.message}). Here is a simulated response:\n\nThank you for your message! You can switch providers in **Settings > AI Models** or ensure your connection is active.`,
        providerUsed: 'Local Fallback',
      };
    }
  }

  /**
   * Speech to Text using Web Speech Recognition API
   */
  static startSpeechRecognition(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): { stop: () => void } | null {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError('Speech Recognition is not supported in this browser.');
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        onResult(text, !!finalTranscript);
      };

      recognition.onerror = (event: any) => {
        onError(event.error);
      };

      recognition.onend = () => {
        onEnd();
      };

      recognition.start();

      return {
        stop: () => {
          try {
            recognition.stop();
          } catch (e) {
            console.error(e);
          }
        },
      };
    } catch (e) {
      onError('Failed to start microphone recording.');
      return null;
    }
  }

  /**
   * Text to Speech readout using Web Speech Synthesis API
   */
  static speakText(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel ongoing speech
    window.speechSynthesis.cancel();

    // Clean text of markdown code blocks or asterisks for natural reading
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/[`*#_~]/g, '')
      .slice(0, 500);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  static stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
