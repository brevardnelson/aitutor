import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mic, MicOff, X, Volume2, VolumeX, Bot, User,
  MessageCircle, Settings, Check, Play,
} from 'lucide-react';

const VOICE_KEY = 'caribbeanAI_tutor_voice';
const PREVIEW_TEXT = "Hi there! I'm your AI tutor. How can I help you today?";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface VoiceChatProps {
  topic?: string;
  subject?: string;
  gradeLevel?: string;
  targetExam?: string;
  onClose: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

const VoiceChat = ({ topic, subject = 'math', gradeLevel, targetExam, onClose }: VoiceChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState('Tap the mic to start talking');
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');

  const [showVoicePicker, setShowVoicePicker] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    return localStorage.getItem(VOICE_KEY) ?? '';
  });
  const [previewingVoice, setPreviewingVoice] = useState<string>('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const selectedVoiceRef = useRef(selectedVoiceName);

  useEffect(() => {
    selectedVoiceRef.current = selectedVoiceName;
  }, [selectedVoiceName]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setStatusText('Voice not supported in this browser');
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimText]);

  const loadVoices = useCallback(() => {
    if (!window.speechSynthesis) return;
    const all = window.speechSynthesis.getVoices();
    const english = all.filter(v => v.lang.startsWith('en'));
    if (english.length === 0) return;
    setAvailableVoices(english);
    const saved = localStorage.getItem(VOICE_KEY) ?? '';
    const match = english.find(v => v.name === saved);
    if (match) {
      setSelectedVoiceName(match.name);
    } else {
      const fallback = english[0].name;
      setSelectedVoiceName(fallback);
      localStorage.setItem(VOICE_KEY, fallback);
    }
  }, []);

  useEffect(() => {
    loadVoices();
    const synth = window.speechSynthesis;
    if (synth) {
      synth.addEventListener('voiceschanged', loadVoices);
    }
    return () => {
      if (synth) {
        synth.removeEventListener('voiceschanged', loadVoices);
      }
    };
  }, [loadVoices]);

  const resolveVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    const name = selectedVoiceRef.current;
    if (name) {
      const match = voices.find(v => v.name === name);
      if (match) return match;
    }
    return voices.find(v => v.lang.startsWith('en')) ?? null;
  }, []);

  const speak = useCallback((text: string, overrideVoiceName?: string) => {
    if (isMuted || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    if (overrideVoiceName) {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.name === overrideVoiceName);
      if (match) utterance.voice = match;
    } else {
      const voice = resolveVoice();
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setStatusText('AI Tutor is speaking...');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setPreviewingVoice('');
      setStatusText('Tap the mic to respond');
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setPreviewingVoice('');
      setStatusText('Tap the mic to respond');
    };

    window.speechSynthesis.speak(utterance);
  }, [isMuted, resolveVoice]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setPreviewingVoice('');
  }, []);

  const sendMessage = useCallback(async (userText: string) => {
    const newMessage: ChatMessage = { role: 'user', content: userText };
    const updatedMessages = [...messagesRef.current, newMessage];
    setMessages(updatedMessages);
    setIsThinking(true);
    setStatusText('Thinking...');

    try {
      const response = await fetch('/api/ai/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          messages: updatedMessages,
          topic,
          subject,
          gradeLevel,
          targetExam,
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const reply = data.reply || "I'm sorry, I couldn't process that. Please try again.";

      const assistantMessage: ChatMessage = { role: 'assistant', content: reply };
      setMessages(prev => [...prev, assistantMessage]);
      setIsThinking(false);
      speak(reply);
    } catch {
      setIsThinking(false);
      setStatusText('Connection error — tap mic to try again');
      const errMsg: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again.',
      };
      setMessages(prev => [...prev, errMsg]);
    }
  }, [topic, subject, gradeLevel, targetExam, speak]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    stopSpeaking();

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatusText('Listening...');
      setInterimText('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      setInterimText(interim);
      if (final.trim()) {
        setInterimText('');
        stopListening();
        sendMessage(final.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setStatusText('Could not hear you — tap mic to try again');
      }
      setIsListening(false);
      setInterimText('');
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [stopSpeaking, stopListening, sendMessage]);

  const handleMicClick = useCallback(() => {
    if (isThinking) return;
    if (isListening) {
      stopListening();
      setStatusText('Tap the mic to start talking');
    } else {
      startListening();
    }
  }, [isListening, isThinking, startListening, stopListening]);

  const handleMuteToggle = useCallback(() => {
    if (!isMuted) stopSpeaking();
    setIsMuted(prev => !prev);
  }, [isMuted, stopSpeaking]);

  const handleSelectVoice = useCallback((name: string) => {
    setSelectedVoiceName(name);
    localStorage.setItem(VOICE_KEY, name);
  }, []);

  const handlePreviewVoice = useCallback((name: string) => {
    stopSpeaking();
    setPreviewingVoice(name);
    speak(PREVIEW_TEXT, name);
  }, [speak, stopSpeaking]);

  const handleOpenVoicePicker = useCallback(() => {
    stopSpeaking();
    stopListening();
    setShowVoicePicker(true);
  }, [stopSpeaking, stopListening]);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = topic
        ? `Hi there! I'm your AI tutor. I see you're working on ${topic}. What would you like help with?`
        : `Hi there! I'm your AI tutor. What would you like to work on today?`;
      setMessages([{ role: 'assistant', content: greeting }]);
      setTimeout(() => speak(greeting), 500);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
      stopSpeaking();
    };
  }, [stopListening, stopSpeaking]);

  return (
    <Card
      className="flex flex-col shadow-2xl border-2 border-blue-200 bg-white overflow-hidden w-[min(360px,calc(100vw-2rem))] h-[min(520px,calc(100vh-7rem))]"
    >
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-sm leading-none">AI Tutor</p>
              {showVoicePicker
                ? <p className="text-xs text-blue-100 mt-0.5">Choose a voice</p>
                : topic && <p className="text-xs text-blue-100 mt-0.5 truncate max-w-[160px]">{topic}</p>
              }
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={showVoicePicker ? () => { stopSpeaking(); setShowVoicePicker(false); } : handleOpenVoicePicker}
              className={`h-7 w-7 text-white hover:bg-white/20 ${showVoicePicker ? 'bg-white/25' : ''}`}
              title="Change tutor voice"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleMuteToggle}
              className="h-7 w-7 text-white hover:bg-white/20"
              title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-7 w-7 text-white hover:bg-white/20"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 p-0 overflow-hidden">
        {showVoicePicker ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {availableVoices.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-500 px-6 text-center">
                  No voices found. Try opening this in Chrome or Safari.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {availableVoices.map(voice => {
                    const isSelected = voice.name === selectedVoiceName;
                    const isPreviewing = voice.name === previewingVoice;
                    return (
                      <li key={voice.name} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                        <div
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => handleSelectVoice(voice.name)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSelectVoice(voice.name); }}
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer focus:outline-none"
                        >
                          <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-white" />}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                              {voice.name}
                            </p>
                            <p className="text-xs text-gray-400">{voice.lang}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => isPreviewing ? stopSpeaking() : handlePreviewVoice(voice.name)}
                          className={`shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                            isPreviewing
                              ? 'border-purple-300 bg-purple-100 text-purple-700'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-500 hover:text-blue-600'
                          }`}
                          title={isPreviewing ? 'Stop preview' : 'Preview this voice'}
                        >
                          <Play className="h-3 w-3" />
                          {isPreviewing ? 'Stop' : 'Try'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="shrink-0 p-3 border-t bg-gray-50">
              <Button
                type="button"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                onClick={() => { stopSpeaking(); setShowVoicePicker(false); }}
              >
                Done — use {selectedVoiceName ? selectedVoiceName.split(' ')[0] : 'this voice'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="bg-blue-500 rounded-full p-1.5 h-7 w-7 shrink-0 flex items-center justify-center mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="bg-purple-500 rounded-full p-1.5 h-7 w-7 shrink-0 flex items-center justify-center mt-0.5">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {interimText && (
                <div className="flex gap-2 justify-end">
                  <div className="max-w-[78%] rounded-2xl rounded-tr-sm px-3 py-2 text-sm bg-blue-100 text-blue-600 italic border border-blue-200">
                    {interimText}...
                  </div>
                  <div className="bg-purple-500 rounded-full p-1.5 h-7 w-7 shrink-0 flex items-center justify-center mt-0.5">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
              )}

              {isThinking && (
                <div className="flex gap-2 justify-start">
                  <div className="bg-blue-500 rounded-full p-1.5 h-7 w-7 shrink-0 flex items-center justify-center mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 p-4 border-t bg-gray-50">
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-gray-500 text-center">{statusText}</p>
                <div className="flex items-center gap-3">
                  {isSpeaking && (
                    <Badge variant="secondary" className="text-xs animate-pulse bg-purple-100 text-purple-700">
                      <Volume2 className="h-3 w-3 mr-1" />Speaking
                    </Badge>
                  )}
                  <button
                    onClick={handleMicClick}
                    disabled={!isSupported || isThinking}
                    title={isListening ? 'Stop listening' : 'Start talking'}
                    className={`relative flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus:ring-4 ${
                      isListening
                        ? 'h-16 w-16 bg-red-500 hover:bg-red-600 focus:ring-red-300 shadow-lg shadow-red-200'
                        : isThinking
                        ? 'h-16 w-16 bg-gray-300 cursor-not-allowed'
                        : 'h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:ring-blue-300 shadow-lg shadow-blue-200 hover:scale-105'
                    }`}
                  >
                    {isListening && (
                      <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-60" />
                    )}
                    {isListening
                      ? <MicOff className="h-7 w-7 text-white relative z-10" />
                      : <Mic className="h-7 w-7 text-white relative z-10" />
                    }
                  </button>
                </div>
                {!isSupported && (
                  <p className="text-xs text-red-500 text-center">Voice not supported. Try Chrome or Safari.</p>
                )}
                {selectedVoiceName && !isListening && !isThinking && !isSpeaking && (
                  <p className="text-xs text-gray-400">Voice: {selectedVoiceName}</p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceChat;
