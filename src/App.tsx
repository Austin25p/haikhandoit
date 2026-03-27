import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { MapPin, Phone, MessageSquare, Instagram, Music, Paintbrush, Hammer, Sparkles, Headphones, X, Send, ChevronRight, Menu, Factory } from 'lucide-react';
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
    image: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?auto=format&fit=crop&q=80&w=800',
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

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const centerX = box.width / 2;
    const centerY = box.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10;
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={`perspective-1000 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.5 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-brand-gray w-full max-w-lg rounded-2xl overflow-hidden border border-brand-gold/30 shadow-2xl shadow-brand-gold/10 flex flex-col h-[600px] max-h-[90vh]"
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-brand-gold text-black' : 'bg-white/10 text-white'}`}>
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
              <div className="bg-white/10 text-white rounded-2xl p-3 flex gap-2 items-center">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-brand-gold rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-brand-gold rounded-full" />
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-brand-gold rounded-full" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/50 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this service..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white focus:outline-none focus:border-brand-gold transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-brand-gold text-black flex items-center justify-center disabled:opacity-50 hover:bg-brand-gold-light transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-gold selection:text-black">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 glass-panel border-b-0 border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center text-black font-bold text-xl">
              H
            </div>
            <span className="text-xl font-serif font-bold tracking-wider">HAIKHANDOIT</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className="text-sm font-medium hover:text-brand-gold transition-colors">Home</button>
            <button onClick={() => scrollToSection('services')} className="text-sm font-medium hover:text-brand-gold transition-colors">Services</button>
            <button onClick={() => scrollToSection('location')} className="text-sm font-medium hover:text-brand-gold transition-colors">Location</button>
            <a href="tel:08160004019" className="px-5 py-2.5 bg-brand-gold text-black font-semibold rounded-full hover:bg-brand-gold-light transition-colors flex items-center gap-2">
              <Phone size={16} />
              Call Now
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
              <div className="flex flex-col p-6 gap-4">
                <button onClick={() => scrollToSection('home')} className="text-left text-lg font-medium">Home</button>
                <button onClick={() => scrollToSection('services')} className="text-left text-lg font-medium">Services</button>
                <button onClick={() => scrollToSection('location')} className="text-left text-lg font-medium">Location</button>
                <a href="tel:08160004019" className="px-5 py-3 bg-brand-gold text-black font-semibold rounded-full text-center mt-4">
                  Call Now: 08160004019
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <motion.div style={{ y }} className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000"
            alt="Premium Interior"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/60 to-brand-dark"></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6">
              Excellence in <br />
              <span className="text-gradient-gold">Every Detail.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-light">
              100X Efficiency. Premium Quality. From construction painting to music production, we deliver unparalleled results in Lagos and Ogun State.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => scrollToSection('services')}
                className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                Explore Ventures
                <ChevronRight size={18} />
              </button>
              <a
                href="https://wa.me/2347011236342"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-brand-gold text-black font-semibold rounded-full hover:bg-brand-gold-light transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                Book Appointment
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 relative z-10 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif font-bold mb-4"
            >
              Our <span className="text-gradient-gold">Ventures</span>
            </motion.h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Discover our diverse range of premium services, each backed by our commitment to 100X efficiency and quality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, idx) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <TiltCard className="h-full">
                  <div className="group h-full bg-brand-gray rounded-3xl overflow-hidden border border-white/5 hover:border-brand-gold/50 transition-colors flex flex-col relative">
                    <div className="h-48 overflow-hidden relative">
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10" />
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-brand-gold">
                        <service.icon size={20} />
                      </div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold mb-3 font-serif">{service.title}</h3>
                      <p className="text-gray-400 text-sm mb-6 flex-1 leading-relaxed">{service.description}</p>
                      <button
                        onClick={() => setActiveService(service)}
                        className="w-full py-3 rounded-xl border border-brand-gold/30 text-brand-gold font-medium hover:bg-brand-gold hover:text-black transition-all flex items-center justify-center gap-2"
                      >
                        <MessageSquare size={16} />
                        Ask AI Consultant
                      </button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-32 relative z-10 bg-brand-gray">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">
                Visit Our <span className="text-gradient-gold">Headquarters</span>
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Experience our premium services firsthand. Our doors are open for consultations, product viewing, and business inquiries.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Address</h4>
                    <p className="text-gray-400">13 Ardulai crescent, alagbole akute,<br/>Ogun state, Nigeria</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Contact</h4>
                    <p className="text-gray-400">Call: 08160004019<br/>WhatsApp: 07011236342</p>
                  </div>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=13+Ardulai+crescent,+alagbole+akute,+ogun+state,+nigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors items-center gap-2"
              >
                <MapPin size={18} />
                Get Directions
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative"
            >
              {/* Google Maps Embed using q parameter for specific address */}
              <iframe
                src="https://maps.google.com/maps?q=13%20Ardulai%20crescent,%20alagbole%20akute,%20ogun%20state,%20nigeria&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 grayscale contrast-125 opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-gold rounded flex items-center justify-center text-black font-bold">
              H
            </div>
            <span className="text-lg font-serif font-bold tracking-wider">HAIKHANDOIT</span>
          </div>
          
          <p className="text-gray-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Haikhandoit Ventures. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a href="https://instagram.com/haikhandoitventures2024" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-black transition-colors">
              <Instagram size={18} />
            </a>
            <a href="https://tiktok.com/@haikhandoit_ventures2024" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold hover:text-black transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* AI Modal */}
      <AnimatePresence>
        {activeService && (
          <AIConsultantModal service={activeService} onClose={() => setActiveService(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

