import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'motion/react';
import { MapPin, Phone, MessageSquare, Instagram, Music, Paintbrush, Hammer, Sparkles, Headphones, X, Send, ChevronRight, Menu, Factory, ArrowRight } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

// --- Types & Data ---

type Service = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
};

const SERVICES: Service[] = [
  {
    id: 'wall-painting',
    title: 'Wall & Construction Painting',
    description: 'Premium finishes for residential and commercial spaces. Expert color consultation and flawless execution.',
    icon: Paintbrush,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'paint-production',
    title: 'Paint Production',
    description: 'High-quality, durable, and eco-friendly paints manufactured to the highest industry standards.',
    icon: Factory,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'skilled-labour',
    title: 'Skilled Labour Hiring',
    description: 'Reliable, vetted, and highly trained professionals for your construction and maintenance needs.',
    icon: Hammer,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'cleaning-agency',
    title: 'Cleaning Agency',
    description: 'Immaculate cleaning services for homes, offices, and post-construction sites. We leave no speck of dust.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'musical-instruments',
    title: 'Musical Instruments & Gadgets',
    description: 'Top-tier instruments and audio gadgets for professionals and enthusiasts alike.',
    icon: Music,
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'music-production',
    title: 'Music Production',
    description: 'State-of-the-art studio facilities and expert engineering to bring your sonic vision to life.',
    icon: Headphones,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=800',
  },
];

// --- Hooks ---

const useAIConsultant = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
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
          systemInstruction: `You are the premium AI Consultant for Haikhandoit Ventures. 
          We offer: Wall & Construction Painting, Paint Production, Skilled Labour Hiring, Cleaning Agency, Musical Instruments & Gadgets, and Music Production.
          Location: 13 Ardulai crescent, alagbole akute, ogun state, nigeria.
          Contact: WhatsApp 07011236342, Call 08160004019.
          Be professional, persuasive, and concise. Your goal is to provide excellent customer service and encourage them to book an appointment or call us.
          Do not use markdown headers, keep it conversational.`
        }
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'I apologize, I am currently unable to respond. Please contact us directly.' }]);
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
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ transform: 'translateZ(10px)' }}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 shadow-lg ${msg.role === 'user' ? 'bg-brand-gold text-black' : 'bg-white/10 text-white'}`}>
                {msg.role === 'ai' ? (
                  <div className="markdown-body text-sm">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white rounded-2xl p-3 flex gap-2 items-center shadow-lg">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-brand-gold rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-brand-gold rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-brand-gold rounded-full" />
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

export default function App() {
  const [activeService, setActiveService] = useState<Service | null>(null);
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-gold selection:text-black relative">
      <CustomCursor />
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-gold origin-left z-[60] shadow-[0_0_10px_#d4af37]"
        style={{ scaleX }}
      />

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-panel border-b border-white/10 py-0' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
            className="md:hidden text-white relative z-[100] p-4 -mr-4 flex items-center justify-center cursor-pointer touch-manipulation" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden glass-panel border-t border-white/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-2">
                <button onClick={() => scrollToSection('home')} className="text-left text-lg font-medium py-3 w-full cursor-pointer touch-manipulation">Home</button>
                <button onClick={() => scrollToSection('about')} className="text-left text-lg font-medium py-3 w-full cursor-pointer touch-manipulation">About</button>
                <button onClick={() => scrollToSection('services')} className="text-left text-lg font-medium py-3 w-full cursor-pointer touch-manipulation">Services</button>
                <button onClick={() => scrollToSection('location')} className="text-left text-lg font-medium py-3 w-full cursor-pointer touch-manipulation">Location</button>
                <a href="tel:08160004019" className="px-5 py-4 bg-brand-gold text-black font-semibold rounded-full text-center mt-4 shadow-[0_0_15px_rgba(212,175,55,0.4)] cursor-pointer touch-manipulation block w-full">
                  Call Now: 08160004019
                </a>
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

        <motion.div style={{ y, opacity, scale }} className="absolute inset-0 z-0">
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
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 z-20 w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 group-hover:bg-brand-gold group-hover:text-black group-hover:border-brand-gold transition-all duration-500">
                      <service.icon size={20} />
                    </div>
                  </div>
                  
                  <div className="px-6 pb-8 flex-1 flex flex-col relative z-20">
                    <h3 className="text-2xl font-bold mb-3 font-serif group-hover:text-brand-gold transition-colors">{service.title}</h3>
                    <p className="text-gray-400 text-sm mb-8 flex-1 leading-relaxed">{service.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs uppercase tracking-widest text-brand-gold font-bold">Consult AI</span>
                      <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                        <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
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
    </div>
  );
}

