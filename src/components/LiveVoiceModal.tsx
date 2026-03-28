import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, X, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export const LiveVoiceModal = ({ onClose }: { onClose: () => void }) => {
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const sourceNodesRef = useRef<AudioBufferSourceNode[]>([]);

  useEffect(() => {
    let isMounted = true;
    
    const initLive = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key not found");
        
        const ai = new GoogleGenAI({ apiKey });
        
        const playAudioCtx = new AudioContext({ sampleRate: 24000 });
        playAudioCtxRef.current = playAudioCtx;
        nextPlayTimeRef.current = playAudioCtx.currentTime;

        const sessionPromise = ai.live.connect({
          model: "gemini-3.1-flash-live-preview",
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }
            },
            systemInstruction: "You are the premium AI Voice Consultant for Haikhandoit Ventures. Be conversational, concise, and professional. We offer Wall Painting, Paint Production, Skilled Labour, Cleaning, Musical Instruments, and Music Production. Keep responses brief and engaging."
          },
          callbacks: {
            onopen: async () => {
              if (!isMounted) return;
              setIsConnecting(false);
              setIsConnected(true);
              
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;
                const audioCtx = new AudioContext({ sampleRate: 16000 });
                audioCtxRef.current = audioCtx;
                const source = audioCtx.createMediaStreamSource(stream);
                const processor = audioCtx.createScriptProcessor(4096, 1, 1);
                processorRef.current = processor;
                
                source.connect(processor);
                processor.connect(audioCtx.destination);
                
                processor.onaudioprocess = (e) => {
                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcm16 = new Int16Array(inputData.length);
                  for (let i = 0; i < inputData.length; i++) {
                    let s = Math.max(-1, Math.min(1, inputData[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                  }
                  const buffer = new ArrayBuffer(pcm16.length * 2);
                  const view = new DataView(buffer);
                  pcm16.forEach((b, i) => view.setInt16(i * 2, b, true));
                  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                  
                  sessionPromise.then(session => {
                    session.sendRealtimeInput({
                      audio: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                    });
                  });
                };
              } catch (err) {
                console.error("Mic error:", err);
                setError("Microphone access denied or unavailable.");
              }
            },
            onmessage: (message: LiveServerMessage) => {
              if (!isMounted) return;
              
              if (message.serverContent?.interrupted) {
                sourceNodesRef.current.forEach(node => {
                  try { node.stop(); } catch(e) {}
                });
                sourceNodesRef.current = [];
                if (playAudioCtxRef.current) {
                  nextPlayTimeRef.current = playAudioCtxRef.current.currentTime;
                }
                setIsSpeaking(false);
              }
              
              const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (base64Audio && playAudioCtxRef.current) {
                setIsSpeaking(true);
                const binaryString = atob(base64Audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const pcm16 = new Int16Array(bytes.buffer);
                const audioBuffer = playAudioCtxRef.current.createBuffer(1, pcm16.length, 24000);
                const channelData = audioBuffer.getChannelData(0);
                for (let i = 0; i < pcm16.length; i++) {
                  channelData[i] = pcm16[i] / 32768.0;
                }
                
                const source = playAudioCtxRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(playAudioCtxRef.current.destination);
                
                let playTime = nextPlayTimeRef.current;
                if (playTime < playAudioCtxRef.current.currentTime) {
                  playTime = playAudioCtxRef.current.currentTime;
                }
                source.start(playTime);
                nextPlayTimeRef.current = playTime + audioBuffer.duration;
                sourceNodesRef.current.push(source);
                
                source.onended = () => {
                  sourceNodesRef.current = sourceNodesRef.current.filter(n => n !== source);
                  if (sourceNodesRef.current.length === 0) {
                    setIsSpeaking(false);
                  }
                };
              }
            },
            onerror: (err) => {
              console.error("Live API Error:", err);
              setError("Connection lost or error occurred.");
            },
            onclose: () => {
              setIsConnected(false);
            }
          }
        });
        
        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Init error:", err);
        setError("Failed to connect to AI Voice Assistant.");
      }
    };
    
    initLive();
    
    return () => {
      isMounted = false;
      if (processorRef.current) processorRef.current.disconnect();
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (playAudioCtxRef.current) playAudioCtxRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (sessionRef.current) sessionRef.current.close();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      style={{ perspective: 1000 }}
    >
      <motion.div
        initial={{ scale: 0.8, rotateX: 20, y: 50 }}
        animate={{ scale: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.8, rotateX: -20, y: 50 }}
        className="w-full max-w-md bg-brand-surface rounded-[2rem] border border-brand-gold/20 shadow-[0_0_50px_rgba(229,193,88,0.15)] p-8 relative overflow-hidden flex flex-col items-center text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 to-transparent pointer-events-none"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-serif font-bold text-white mb-2 relative z-10">Live Voice Assistant</h3>
        <p className="text-gray-400 text-sm mb-10 relative z-10">Speak naturally to explore our services.</p>

        <div className="relative w-32 h-32 mb-10 flex items-center justify-center z-10">
          {isConnecting ? (
            <Loader2 size={40} className="text-brand-gold animate-spin" />
          ) : error ? (
            <AlertCircle size={40} className="text-red-500" />
          ) : (
            <>
              {/* Pulse rings */}
              <motion.div 
                animate={{ 
                  scale: isSpeaking ? [1, 1.5, 1] : [1, 1.1, 1],
                  opacity: isSpeaking ? [0.5, 0, 0.5] : [0.2, 0, 0.2]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-brand-gold"
              />
              <motion.div 
                animate={{ 
                  scale: isSpeaking ? [1, 1.8, 1] : [1, 1.2, 1],
                  opacity: isSpeaking ? [0.3, 0, 0.3] : [0.1, 0, 0.1]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                className="absolute inset-0 rounded-full bg-brand-gold"
              />
              
              {/* Center Mic icon */}
              <div className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-colors duration-500 ${isSpeaking ? 'bg-brand-gold text-black' : 'bg-[#020202] border border-brand-gold/30 text-brand-gold'}`}>
                {isSpeaking ? <Volume2 size={32} /> : <Mic size={32} />}
              </div>
            </>
          )}
        </div>

        <div className="h-12 relative z-10">
          {isConnecting ? (
            <p className="text-brand-gold animate-pulse">Connecting to AI...</p>
          ) : error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : (
            <p className="text-white font-medium">
              {isSpeaking ? "AI is speaking..." : "Listening... Go ahead and speak."}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-8 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50 transition-all relative z-10"
        >
          End Conversation
        </button>
      </motion.div>
    </motion.div>
  );
};
