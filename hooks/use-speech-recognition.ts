import { useRef, useState } from "react";

type SpeechRecognitionErrorCode =
  | "not-allowed"
  | "no-speech"
  | "audio-capture"
  | string;

type SpeechRecognitionResultEvent = {
  results: { [index: number]: { [index: number]: { transcript: string } } };
};

type SpeechRecognitionErrorEvent = {
  error: SpeechRecognitionErrorCode;
};

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }
  const globalWindow = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return (
    globalWindow.SpeechRecognition ??
    globalWindow.webkitSpeechRecognition ??
    null
  );
}

function errorMessage(code: SpeechRecognitionErrorCode): string {
  if (code === "not-allowed") {
    return "Microphone access denied.";
  }
  if (code === "no-speech") {
    return "Didn't catch that — try again.";
  }
  return "Voice search failed. Try again.";
}

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const isSupported = getSpeechRecognitionConstructor() !== null;

  function start(
    onResult: (transcript: string) => void,
    onError: (message: string) => void,
  ) {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        onResult(transcript);
      }
    };
    recognition.onerror = (event) => {
      onError(errorMessage(event.error));
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return { isSupported, isListening, start, stop };
}
