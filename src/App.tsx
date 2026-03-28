import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'motion/react';
import { MapPin, Phone, MessageSquare, Instagram, Music, Paintbrush, Hammer, Sparkles, Headphones, X, Send, ChevronRight, Menu, Factory, ArrowRight, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

// --- Types & Data ---

type Service = {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  features: string[];
  icon: React.ElementType;
  image: string;
};

const SERVICES: Service[] = [
  {
    id: 'wall-painting',
    title: 'Wall & Construction Painting',
    description: 'Premium finishes for residential and commercial spaces. Expert color consultation and flawless execution.',
    longDescription: 'Transform your spaces with our master-class painting services. We don\'t just apply paint; we engineer finishes that protect and elevate your property. From meticulous surface preparation to the final flawless coat, our experts use premium, weather-resistant materials to ensure lasting beauty. Whether it\'s a luxury residential interior or a large-scale commercial exterior, we guarantee a 100X improvement in aesthetic appeal and durability, minimizing disruption to your daily life.',
    features: ['Residential & Commercial Painting', 'Expert Color Consultation', 'Surface Preparation & Repair', 'Eco-Friendly Paint Options', 'Flawless, Long-Lasting Finishes'],
    icon: Paintbrush,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'paint-production',
    title: 'Paint Production',
    description: 'High-quality, durable, and eco-friendly paints manufactured to the highest industry standards.',
    longDescription: 'Experience the pinnacle of color technology with Haikhandoit\'s proprietary paint formulations. We manufacture high-performance, eco-friendly paints designed specifically for the African climate. Our products offer superior coverage, exceptional fade resistance, and a stunning array of custom colors. By controlling the production process, we ensure uncompromising quality and provide our clients with cost-effective, premium solutions that outlast standard market alternatives.',
    features: ['In-House Paint Manufacturing', 'Eco-Friendly & Low VOC Formulations', 'Superior Coverage & Durability', 'Custom Color Matching', 'Wholesale & Retail Supply'],
    icon: Factory,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'skilled-labour',
    title: 'Skilled Labour Hiring',
    description: 'Reliable, vetted, and highly trained professionals for your construction and maintenance needs.',
    longDescription: 'Eliminate the guesswork from your hiring process with our elite skilled labour network. We rigorously vet and supply top-tier professionals—from master carpenters and electricians to specialized construction crews. Our 100X efficiency mandate means you get reliable, highly trained experts who arrive on time, adhere to strict safety standards, and deliver exceptional craftsmanship, keeping your projects on schedule and within budget.',
    features: ['Thoroughly Vetted Professionals', 'Wide Range of Construction Trades', 'Flexible Hiring Options (Short/Long Term)', 'On-Site Supervision Available', 'Commitment to Safety Standards'],
    icon: Hammer,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'cleaning-agency',
    title: 'Cleaning Agency',
    description: 'Immaculate cleaning services for homes, offices, and post-construction sites. We leave no speck of dust.',
    longDescription: 'Step into immaculate perfection with our bespoke cleaning services. We go beyond surface-level tidying, employing advanced deep-cleaning techniques and hospital-grade, eco-friendly products. Whether it\'s a post-construction site requiring heavy-duty clearing or a corporate office needing daily pristine maintenance, our discreet and highly trained staff ensure a spotless, hygienic environment that reflects the premium standards of your business or home.',
    features: ['Residential & Commercial Cleaning', 'Post-Construction Deep Cleaning', 'Eco-Friendly Cleaning Products', 'Flexible Scheduling', 'Highly Trained Cleaning Staff'],
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'musical-instruments',
    title: 'Musical Instruments & Gadgets',
    description: 'Top-tier instruments and audio gadgets for professionals and enthusiasts alike.',
    longDescription: 'Elevate your sound with our curated collection of world-class musical instruments and pro-audio gear. We source directly from top global manufacturers to bring you everything from concert-grade acoustic instruments to cutting-edge digital workstations. Our expert consultants don\'t just sell equipment; they provide tailored acoustic solutions, ensuring you invest in the perfect gear to capture your unique sonic signature with crystal-clear fidelity.',
    features: ['Wide Selection of Instruments', 'Professional Audio Gadgets & Gear', 'Expert Advice & Recommendations', 'Quality Assurance Guarantee', 'Accessories & Maintenance Supplies'],
    icon: Music,
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'music-production',
    title: 'Music Production',
    description: 'State-of-the-art studio facilities and expert engineering to bring your sonic vision to life.',
    longDescription: 'Unleash your creative genius in our acoustically perfected, state-of-the-art production studios. We offer a comprehensive suite of services including recording, mixing, mastering, and beat composition. Guided by industry-veteran sound engineers using flagship analog and digital gear, we meticulously craft your tracks to achieve a polished, radio-ready sound. Your vision, amplified to its absolute highest potential.',
    features: ['State-of-the-Art Recording Studio', 'Professional Mixing & Mastering', 'Experienced Sound Engineers', 'Vocal Tracking & Editing', 'Beat Production & Composition'],
    icon: Headphones,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800',
  },
];

// --- Hooks ---

const useAIConsultant = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string, links?: { title: string, uri: string }[] }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (serviceName: string, text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key not found");
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User is asking about our ${serviceName} service. User message: ${text}`,
        config: {
          tools: [{ googleMaps: {} }],
          systemInstruction: `You are the premium AI Consultant for Haikhandoit Ventures. 
          We offer: Wall & Construction Painting, Paint Production, Skilled Labour Hiring, Cleaning Agency, Musical Instruments & Gadgets, and Music Production.
          Location: 13 Ardulai crescent, alagbole akute, ogun state, nigeria.
          Contact: WhatsApp 07011236342, Call 08160004019.
          Be professional, persuasive, and concise. Your goal is to provide excellent customer service and encourage them to book an appointment or call us.
          Do not use markdown headers, keep it conversational.`
        }
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const mapsLinks: { title: string, uri: string }[] = [];
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.maps?.uri) {
            mapsLinks.push({ 
              title: chunk.maps.title || 'View on Google Maps', 
              uri: chunk.maps.uri 
            });
          }
        });
      }

      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.text || 'I apologize, I am currently unable to respond. Please contact us directly.',
        links: mapsLinks.length > 0 ? mapsLinks : undefined
      }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'I apologize, I encountered an error. Please call us at 08160004019 or WhatsApp 07011236342.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading, setMessages };
};

// --- Components ---

const Logo = () => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#FDE047] to-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,#fff,transparent)]" />
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black/20 rounded-full blur-sm group-hover:scale-150 transition-transform duration-500" />
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7 text-black relative z-10 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300"
      >
        <path 
          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="currentColor"
          fillOpacity="0.1"
        />
        <path 
          d="M18 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" 
          fill="currentColor" 
        />
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="text-xl font-serif font-bold tracking-widest leading-none bg-clip-text text-transparent bg-gradient-to-r from-white to-[#D4AF37]">
        HAIKHANDOIT
      </span>
      <span className="text-[0.6rem] uppercase tracking-[0.3em] text-[#D4AF37]/80 font-medium mt-1">
        Ventures
      </span>
    </div>
  </div>
);

const Magnetic = ({ children, className }: { children: React.ReactElement, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
  };

  const reset = () => {
    if (window.innerWidth < 768) return;
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;
  return (
    <motion.div
      className={className}
      style={{ position: "relative", zIndex: 10 }}
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

const TextReveal = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
  const words = text.split(" ");
  return (
    <div className={`flex flex-wrap justify-center ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40, rotateX: -90, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: delay + i * 0.1, type: "spring", bounce: 0.4 }}
          className="mr-3 preserve-3d inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

const Marquee = () => {
  const items = [
    "WALL PAINTING", "•", "PAINT PRODUCTION", "•", "SKILLED LABOUR", "•", 
    "CLEANING AGENCY", "•", "MUSICAL INSTRUMENTS", "•", "MUSIC PRODUCTION", "•"
  ];
  return (
    <div className="w-full bg-brand-gold py-4 overflow-hidden flex items-center border-y border-brand-gold-light/20 relative z-20">
      <div className="marquee-container">
        <div className="marquee-content text-black font-display font-bold text-xl tracking-widest">
          {items.map((item, i) => <span key={i}>{item}</span>)}
          {items.map((item, i) => <span key={`dup-${i}`}>{item}</span>)}
        </div>
        <div className="marquee-content text-black font-display font-bold text-xl tracking-widest" aria-hidden="true">
          {items.map((item, i) => <span key={i}>{item}</span>)}
          {items.map((item, i) => <span key={`dup-${i}`}>{item}</span>)}
        </div>
      </div>
    </div>
  );
};

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-brand-gold rounded-full shadow-[0_0_10px_#d4af37]"
          initial={{
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            opacity: Math.random() * 0.5 + 0.1,
            scale: Math.random() * 2,
          }}
          animate={{
            y: [`${Math.random() * 100}vh`, `-10vh`],
            x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 10,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}
    </div>
  );
};

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const cursorX2 = useMotionValue(-100);
  const cursorY2 = useMotionValue(-100);
  const cursorXSpring2 = useSpring(cursorX2, { damping: 40, stiffness: 400 });
  const cursorYSpring2 = useSpring(cursorY2, { damping: 40, stiffness: 400 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 10);
      cursorY.set(e.clientY - 10);
      cursorX2.set(e.clientX - 4);
      cursorY2.set(e.clientY - 4);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY, cursorX2, cursorY2]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-5 h-5 bg-brand-gold/30 rounded-full pointer-events-none z-[9999] mix-blend-screen hidden md:block backdrop-blur-sm"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          boxShadow: '0 0 20px #d4af37, 0 0 40px #d4af37'
        }}
      />
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[10000] hidden md:block"
        style={{
          x: cursorXSpring2,
          y: cursorYSpring2,
        }}
      />
    </>
  );
};

const FloatingObject = ({ children, delay, xOffset, yOffset }: any) => {
  return (
    <motion.div
      className="absolute text-brand-gold opacity-20 pointer-events-none z-0"
      initial={{ x: xOffset, y: yOffset, rotateX: 0, rotateY: 0, rotateZ: 0 }}
      animate={{
        y: [yOffset - 30, yOffset + 30, yOffset - 30],
        rotateX: [0, 180, 360],
        rotateY: [0, 180, 360],
        rotateZ: [0, 90, 180],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear",
        delay: delay
      }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  );
};

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["20deg", "-20deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-20deg", "20deg"]);
  
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["100%", "0%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["100%", "0%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`perspective-1000 ${className} relative group`}
    >
      <motion.div 
        className="absolute inset-0 z-50 pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
        style={{
          background: useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, transparent 60%)`
        }}
      />
      <div className="preserve-3d w-full h-full relative">
        {children}
      </div>
    </motion.div>
  );
};

const AIConsultantModal = ({ service, onClose }: { service: Service, onClose: () => void }) => {
  const { messages, sendMessage, isLoading, setMessages } = useAIConsultant();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: 'ai', text: `Hello! I'm the Haikhandoit AI Consultant for ${service.title}. How can I assist you today?` }]);
  }, [service, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(service.title, input);
    setInput('');
  };

  const handleClear = () => {
    setMessages([{ role: 'ai', text: `Hello! I'm the Haikhandoit AI Consultant for ${service.title}. How can I assist you today?` }]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm perspective-1000"
    >
      <motion.div
        initial={{ scale: 0.8, rotateX: 20, y: 50 }}
        animate={{ scale: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.8, rotateX: -20, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-lg preserve-3d"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="bg-brand-gray w-full rounded-2xl overflow-hidden border border-brand-gold/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col h-[600px] max-h-[90vh] preserve-3d"
        >
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
              <service.icon size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Consultant</h3>
              <p className="text-xs text-brand-gold">{service.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleClear} 
              className="text-gray-400 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-white/5"
              title="Clear Conversation"
            >
              <Trash2 size={18} />
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ transform: 'translateZ(10px)' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 shadow-lg ${msg.role === 'user' ? 'bg-brand-gold text-black' : 'bg-white/10 text-white'}`}>
                {msg.role === 'ai' ? (
                  <div className="flex flex-col gap-2">
                    <div className="markdown-body text-sm">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                    {msg.links && msg.links.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-2">
                        <p className="text-xs text-brand-gold font-semibold uppercase tracking-wider">Location Info:</p>
                        {msg.links.map((link, i) => (
                          <a 
                            key={i} 
                            href={link.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1.5 text-blue-300 hover:text-blue-200 transition-colors bg-blue-500/10 px-2 py-1.5 rounded-md"
                          >
                            <MapPin size={12} />
                            <span className="truncate">{link.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white rounded-2xl p-3 flex gap-3 items-center shadow-lg">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">AI is typing</span>
                <div className="flex gap-1">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/50 flex gap-2" style={{ transform: 'translateZ(20px)' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this service..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:border-brand-gold transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-brand-gold text-black flex items-center justify-center disabled:opacity-50 hover:bg-brand-gold-light transition-colors shadow-[0_0_15px_rgba(212,175,55,0.4)]"
          >
            <Send size={18} />
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  </motion.div>
);
};

// --- Main App ---

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const phoneRegex = /^\+?[\d\s-]{10,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }

    if (!formData.message.trim()) newErrors.message = 'Message is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      
      // Construct mailto link
      const subject = encodeURIComponent(`New Contact Form Submission from ${formData.name}`);
      const body = encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\n\nMessage:\n${formData.message}`);
      
      window.location.href = `mailto:haikhandoitventures@gmail.com?subject=${subject}&body=${body}`;

      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setIsSuccess(false), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full bg-brand-surface border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors`}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full bg-brand-surface border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors`}
            placeholder="john@example.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`w-full bg-brand-surface border ${errors.phone ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors`}
          placeholder="+234 816 000 4019"
        />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className={`w-full bg-brand-surface border ${errors.message ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors resize-none`}
          placeholder="How can we help you?"
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 bg-brand-gold text-black font-bold rounded-xl hover:bg-brand-gold-light transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-70"
      >
        {isSubmitting ? (
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Send size={18} />
            Send Message
          </>
        )}
      </motion.button>

      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-center text-sm"
        >
          Thank you! Your message has been sent successfully. We will get back to you soon.
        </motion.div>
      )}
    </form>
  );
};

const ServiceDetailsModal = ({ service, onClose, onConsultAI }: { service: Service, onClose: () => void, onConsultAI: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md perspective-1000"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, rotateX: 10, y: 30 }}
        animate={{ scale: 1, rotateX: 0, y: 0 }}
        exit={{ scale: 0.9, rotateX: -10, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-3xl bg-brand-surface rounded-[2rem] overflow-hidden border border-brand-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 md:h-80 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-brand-surface/50 to-transparent z-10" />
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 z-20 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-6 left-8 z-20 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-gold flex items-center justify-center text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <service.icon size={28} />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white drop-shadow-lg">{service.title}</h2>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            {service.longDescription}
          </p>
          
          <h3 className="text-xl font-bold text-brand-gold mb-4 font-serif">Key Features & Benefits</h3>
          <ul className="space-y-3 mb-8">
            {service.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3 text-gray-400">
                <div className="w-6 h-6 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0 mt-0.5">
                  <Sparkles size={12} />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 border-t border-white/5 bg-brand-dark/50 flex flex-col sm:flex-row gap-4 justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onConsultAI();
            }}
            className="px-8 py-3 rounded-xl bg-brand-gold text-black font-bold hover:bg-brand-gold-light transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <MessageSquare size={18} />
            Consult AI About This
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ParallaxImage = ({ src, alt }: { src: string, alt: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
      <motion.div style={{ y, height: "130%", top: "-15%" }} className="absolute inset-0 w-full">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </div>
  );
};

export default function App() {
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [detailService, setDetailService] = useState<Service | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      clipPath: "circle(0% at 100% 0%)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      opacity: 1,
      clipPath: "circle(150% at 100% 0%)",
      transition: {
        type: "spring",
        stiffness: 20,
        restDelta: 2
      }
    }
  };

  const itemVariants = {
    closed: { opacity: 0, y: 20 },
    open: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1 + 0.2,
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1]
      }
    })
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-gold selection:text-black relative">
      <CustomCursor />
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-gold origin-left z-[60] shadow-[0_0_10px_#d4af37]"
        style={{ scaleX }}
      />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-panel border-b border-white/10 py-0' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative z-[60]"
          >
            <Logo />
          </motion.div>

          {/* Desktop Nav */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-10"
          >
            <button onClick={() => scrollToSection('home')} className="text-sm font-medium hover:text-brand-gold transition-colors relative group uppercase tracking-widest">
              Home
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full shadow-[0_0_10px_#d4af37]"></span>
            </button>
            <button onClick={() => scrollToSection('about')} className="text-sm font-medium hover:text-brand-gold transition-colors relative group uppercase tracking-widest">
              About
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full shadow-[0_0_10px_#d4af37]"></span>
            </button>
            <button onClick={() => scrollToSection('services')} className="text-sm font-medium hover:text-brand-gold transition-colors relative group uppercase tracking-widest">
              Services
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full shadow-[0_0_10px_#d4af37]"></span>
            </button>
            <button onClick={() => scrollToSection('contact')} className="text-sm font-medium hover:text-brand-gold transition-colors relative group uppercase tracking-widest">
              Contact
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full shadow-[0_0_10px_#d4af37]"></span>
            </button>
            <button onClick={() => scrollToSection('location')} className="text-sm font-medium hover:text-brand-gold transition-colors relative group uppercase tracking-widest">
              Location
              <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full shadow-[0_0_10px_#d4af37]"></span>
            </button>
            <Magnetic>
              <motion.a 
                whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(212, 175, 55, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                href="tel:08160004019" 
                className="px-6 py-3 bg-brand-gold text-black font-bold rounded-full hover:bg-brand-gold-light transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              >
                <Phone size={16} />
                Call Now
              </motion.a>
            </Magnetic>
          </motion.div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-white relative z-[60] w-12 h-12 flex flex-col items-center justify-center cursor-pointer touch-manipulation group" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="Toggle Menu"
          >
            <motion.span 
              animate={isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
              className="w-8 h-[2px] bg-brand-gold block mb-2 transition-colors group-hover:bg-white"
            />
            <motion.span 
              animate={isMenuOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
              className="w-8 h-[2px] bg-brand-gold block mb-2 transition-colors group-hover:bg-white"
            />
            <motion.span 
              animate={isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
              className="w-8 h-[2px] bg-brand-gold block transition-colors group-hover:bg-white"
            />
          </button>
        </div>

        {/* Full Screen Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="md:hidden fixed inset-0 bg-brand-dark/95 backdrop-blur-xl z-[50] flex flex-col justify-center items-center"
            >
              <div className="absolute inset-0 bg-mesh opacity-20 pointer-events-none"></div>
              <div className="flex flex-col items-center gap-8 w-full px-6 relative z-10">
                {['Home', 'About', 'Services', 'Contact', 'Location'].map((item, i) => (
                  <motion.button 
                    key={item}
                    custom={i}
                    variants={itemVariants}
                    onClick={() => scrollToSection(item.toLowerCase())} 
                    className="text-4xl font-serif font-bold text-white hover:text-brand-gold transition-colors cursor-pointer touch-manipulation relative group"
                  >
                    {item}
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-brand-gold transition-all duration-300 group-hover:w-full"></span>
                  </motion.button>
                ))}
                <motion.a 
                  custom={5}
                  variants={itemVariants}
                  href="tel:08160004019" 
                  className="mt-8 px-8 py-4 bg-brand-gold text-black font-bold rounded-full text-center shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer touch-manipulation flex items-center gap-3 text-xl"
                >
                  <Phone size={24} />
                  Call: 08160004019
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 perspective-1000">
        <div className="bg-mesh"></div>
        <ParticleBackground />
        
        {/* Floating 3D Background Elements */}
        <FloatingObject delay={0} xOffset="-30vw" yOffset="-20vh"><Paintbrush size={120} /></FloatingObject>
        <FloatingObject delay={2} xOffset="35vw" yOffset="25vh"><Music size={100} /></FloatingObject>
        <FloatingObject delay={4} xOffset="-25vw" yOffset="30vh"><Hammer size={80} /></FloatingObject>
        <FloatingObject delay={1} xOffset="25vw" yOffset="-25vh"><Sparkles size={140} /></FloatingObject>

        <motion.div style={{ y, opacity, scale }} className="absolute inset-0 z-0 h-[120%] -top-[10%]">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
            alt="Premium Interior"
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/95 via-brand-dark/80 to-brand-dark"></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center preserve-3d w-full mt-10">
          <motion.div
            initial={{ opacity: 0, translateZ: -100 }}
            animate={{ opacity: 1, translateZ: 0 }}
            transition={{ duration: 1.5, type: "spring", bounce: 0.3 }}
            className="preserve-3d flex flex-col items-center"
          >
            <div className="text-[12vw] md:text-[8vw] lg:text-[100px] font-serif font-bold leading-[0.85] mb-8 text-3d flex flex-col items-center tracking-tighter">
              <TextReveal text="EXCELLENCE IN" />
              <TextReveal text="EVERY DETAIL." className="text-gradient-gold italic pr-4" delay={0.3} />
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
            >
              100X Efficiency. Premium Quality. From construction painting to music production, we deliver unparalleled results.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full relative z-20"
            >
              <Magnetic className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToSection('services')}
                  className="w-full sm:w-auto px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.2)] text-lg cursor-pointer touch-manipulation"
                >
                  Explore Ventures
                  <ArrowRight size={20} />
                </motion.button>
              </Magnetic>
              <Magnetic className="w-full sm:w-auto">
                <motion.a
                  whileHover={{ scale: 1.05, boxShadow: "0px 15px 40px rgba(229, 193, 88, 0.6)" }}
                  whileTap={{ scale: 0.95 }}
                  href="https://wa.me/2347011236342"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-10 py-5 bg-transparent text-brand-gold font-bold rounded-full hover:bg-brand-gold/10 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(229,193,88,0.1)] text-lg border border-brand-gold cursor-pointer touch-manipulation"
                >
                  <MessageSquare size={20} />
                  Book Appointment
                </motion.a>
              </Magnetic>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Marquee />

      {/* About Us Section */}
      <section id="about" className="py-32 relative z-10 bg-brand-surface overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="text-[30vw] font-serif font-bold text-outline absolute -top-20 -left-10 opacity-20 whitespace-nowrap">EST. 2024</div>
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
              className="lg:col-span-5"
            >
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">
                Redefining <br/><span className="text-gradient-gold italic">Craftsmanship</span>
              </h2>
              <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                Founded with a vision to redefine excellence, Haikhandoit Ventures has grown into a multi-faceted enterprise dedicated to delivering premium quality across various industries. 
              </p>
              <p className="text-gray-400 mb-10 text-lg leading-relaxed">
                From flawless construction finishes to state-of-the-art music production, our commitment to 100X efficiency remains unwavering. We value integrity, craftsmanship, and the relentless pursuit of perfection.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-brand-dark rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-brand-gold/5 transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500"></div>
                  <h4 className="text-4xl font-serif font-bold text-brand-gold mb-2 relative z-10">10+</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-[0.2em] relative z-10">Years Experience</p>
                </div>
                <div className="p-6 bg-brand-dark rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-brand-gold/5 transform scale-y-0 origin-bottom group-hover:scale-y-100 transition-transform duration-500"></div>
                  <h4 className="text-4xl font-serif font-bold text-brand-gold mb-2 relative z-10">500+</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-[0.2em] relative z-10">Projects Done</p>
                </div>
              </div>
            </motion.div>
            
            <div className="lg:col-span-7 relative">
              <TiltCard>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="relative rounded-[2rem] overflow-hidden border border-brand-gold/20 shadow-[0_0_50px_rgba(229,193,88,0.15)] aspect-[4/5] lg:aspect-auto lg:h-[700px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent z-10 opacity-80" />
                  <img 
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200" 
                    alt="Haikhandoit Team at Work" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-10 left-10 z-20">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-brand-gold flex items-center justify-center text-black">
                        <Hammer size={30} />
                      </div>
                      <div>
                        <p className="text-white font-serif text-2xl font-bold">Expert Builders</p>
                        <p className="text-brand-gold text-sm tracking-widest uppercase">At Your Service</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 relative z-10 bg-brand-dark overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-gold/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 perspective-1000 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, type: "spring" }}
              className="max-w-2xl"
            >
              <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-none">
                Our <br/><span className="text-gradient-gold italic">Ventures</span>
              </h2>
              <p className="text-gray-400 text-lg">Discover our diverse range of premium services, each backed by our commitment to 100X efficiency and uncompromising quality.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="hidden md:block"
            >
              <div className="w-24 h-[1px] bg-brand-gold mb-4"></div>
              <p className="text-brand-gold uppercase tracking-[0.3em] text-sm font-bold">Explore All</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                className="h-full group cursor-pointer"
                onClick={() => setActiveService(service)}
              >
                <div className="h-full bg-brand-surface rounded-[2rem] p-2 border border-white/5 hover:border-brand-gold/30 transition-all duration-500 flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="h-64 rounded-[1.5rem] overflow-hidden relative mb-6">
                    <div className="absolute inset-0 bg-brand-dark/40 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <ParallaxImage src={service.image} alt={service.title} />
                    <div className="absolute top-4 right-4 z-20 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 group-hover:bg-brand-gold group-hover:text-black group-hover:border-brand-gold transition-all duration-500">
                      <service.icon size={20} />
                    </div>
                  </div>
                  
                  <div className="px-6 pb-8 flex-1 flex flex-col relative z-20">
                    <h3 className="text-2xl font-bold mb-3 font-serif group-hover:text-brand-gold transition-colors">{service.title}</h3>
                    <p className="text-gray-400 text-sm mb-8 flex-1 leading-relaxed">{service.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto gap-4">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDetailService(service); }}
                        className="flex-1 py-3 rounded-xl border border-white/10 hover:border-brand-gold/50 text-white hover:text-brand-gold transition-all text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setActiveService(service); }}
                        className="w-12 h-12 rounded-xl bg-brand-gold/10 text-brand-gold hover:bg-brand-gold hover:text-black transition-all flex items-center justify-center shrink-0"
                        title="Consult AI"
                      >
                        <MessageSquare size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 relative z-10 bg-brand-dark overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-brand-gold/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">
                Get in <br/><span className="text-gradient-gold italic">Touch</span>
              </h2>
              <p className="text-gray-400 mb-12 text-lg leading-relaxed">
                Ready to start your next project? Have questions about our services? Send us a message and our team will get back to you promptly.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
              className="bg-brand-surface p-8 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent rounded-[2rem] pointer-events-none"></div>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-32 relative z-10 bg-brand-surface overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <ParticleBackground />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <h2 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">
                Visit Our <br/><span className="text-gradient-gold italic">Headquarters</span>
              </h2>
              <p className="text-gray-400 mb-12 text-lg leading-relaxed">
                Experience our premium services firsthand. Our doors are open for consultations, product viewing, and business inquiries.
              </p>
              
              <div className="space-y-4 mb-12">
                <div className="flex items-start gap-6 p-6 rounded-3xl bg-brand-dark border border-white/5 hover:border-brand-gold/20 transition-colors group">
                  <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2 text-white font-serif">Address</h4>
                    <p className="text-gray-400 leading-relaxed">13 Ardulai crescent, alagbole akute,<br/>Ogun state, Nigeria</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-6 p-6 rounded-3xl bg-brand-dark border border-white/5 hover:border-brand-gold/20 transition-colors group">
                  <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0 group-hover:scale-110 transition-transform duration-500">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl mb-2 text-white font-serif">Contact</h4>
                    <p className="text-gray-400 leading-relaxed">Call: <a href="tel:08160004019" className="hover:text-brand-gold transition-colors">08160004019</a><br/>WhatsApp: <a href="https://wa.me/2347011236342" target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">07011236342</a></p>
                  </div>
                </div>
              </div>

              <Magnetic className="inline-block w-full sm:w-auto">
                <motion.a
                  whileHover={{ scale: 1.05, boxShadow: "0px 15px 30px rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  href="https://www.google.com/maps/dir/?api=1&destination=13+Ardulai+crescent,+alagbole+akute,+ogun+state,+nigeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full sm:w-auto justify-center px-10 py-5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all items-center gap-3 shadow-xl text-lg cursor-pointer touch-manipulation"
                >
                  <MapPin size={20} />
                  Get Directions
                </motion.a>
              </Magnetic>
            </motion.div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-brand-gold/20 to-transparent blur-2xl opacity-50 rounded-full"></div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring" }}
                className="h-[600px] rounded-[2rem] overflow-hidden border border-brand-gold/20 shadow-[0_0_50px_rgba(229,193,88,0.1)] relative z-10"
              >
                <div className="absolute inset-0 bg-brand-dark/20 pointer-events-none z-10 mix-blend-overlay"></div>
                {/* Google Maps Embed using q parameter for specific address */}
                <iframe
                  src="https://maps.google.com/maps?q=13%20Ardulai%20crescent,%20alagbole%20akute,%20ogun%20state,%20nigeria&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale contrast-125 opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-1000"
                ></iframe>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-black py-12 border-t border-white/5 relative z-20"
      >
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Haikhandoit Ventures. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <motion.a whileHover={{ scale: 1.2, rotate: 10 }} href="https://instagram.com/haikhandoitventures2024" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-black transition-colors shadow-lg">
              <Instagram size={18} />
            </motion.a>
            <motion.a whileHover={{ scale: 1.2, rotate: -10 }} href="https://tiktok.com/@haikhandoit_ventures2024" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-black transition-colors shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </motion.a>
          </div>
        </div>
      </motion.footer>

      {/* AI Modal */}
      <AnimatePresence>
        {activeService && (
          <AIConsultantModal service={activeService} onClose={() => setActiveService(null)} />
        )}
      </AnimatePresence>

      {/* Service Details Modal */}
      <AnimatePresence>
        {detailService && (
          <ServiceDetailsModal 
            service={detailService} 
            onClose={() => setDetailService(null)} 
            onConsultAI={() => setActiveService(detailService)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

