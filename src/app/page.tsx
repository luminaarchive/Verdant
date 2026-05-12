'use client';

import Link from "next/link";
import { Camera, Cpu, FileText, Shield, Microscope, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060f08] text-white selection:bg-green-500/30 font-sans">
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      {/* HERO SECTION */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-24 pt-20 pb-32" style={{ background: 'radial-gradient(circle at center, #0d2b12 0%, #060f08 100%)' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
          className="max-w-4xl"
        >
          <h1 className="text-6xl md:text-8xl font-bold tracking-widest mb-4">
            NaLI
          </h1>
          <h2 className="text-2xl md:text-4xl font-light text-[#86efac] mb-8 tracking-wide">
            Wildlife Field Intelligence
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-lg mb-12 leading-relaxed">
            AI-powered species identification for rangers, researchers, and wildlife enthusiasts in Indonesia.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/register" 
              className="bg-[#22c55e] text-black font-semibold px-8 py-3 rounded-full hover:scale-105 transition-transform flex items-center justify-center"
            >
              Start Identifying
            </Link>
            <Link 
              href="/login" 
              className="border border-green-700 text-green-400 font-semibold px-8 py-3 rounded-full hover:bg-green-900/30 transition-colors flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Fading Divider */}
        <div className="absolute bottom-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-green-900/50 to-transparent"></div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 py-32 px-6 md:px-24 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 mb-16 justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <h2 className="text-3xl font-bold text-white">How It Works</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: "01", icon: Camera, title: "Capture", desc: "Take a photo, record audio, or write a description out in the field." },
            { num: "02", icon: Cpu, title: "Analyze", desc: "Instantly cross-reference with GBIF, IUCN, and advanced AI vision models." },
            { num: "03", icon: FileText, title: "Document", desc: "Receive an instant field log with conservation status and geographical anomaly detection." }
          ].map((step, i) => (
            <motion.div 
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative bg-[#0f2214] border border-green-900/50 rounded-2xl p-8 hover:border-green-700 transition-colors overflow-hidden group"
            >
              <div className="absolute -top-4 -left-2 text-6xl font-black text-green-500/10 pointer-events-none group-hover:text-green-500/20 transition-colors">
                {step.num}
              </div>
              <div className="relative z-10">
                <step.icon className="w-7 h-7 text-[#22c55e] mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-[#9ca3af] leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BUILT FOR THE FIELD */}
      <section className="relative z-10 py-32 px-6 md:px-24 bg-[#08170b]">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-bold text-white mb-16 text-center"
          >
            Built For The Field
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <Shield className="w-8 h-8 text-[#22c55e] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Rangers</h3>
              <p className="text-[#9ca3af] leading-relaxed">
                Get real-time species identification and generate automated patrol reports on the go.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Microscope className="w-8 h-8 text-[#22c55e] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Researchers</h3>
              <p className="text-[#9ca3af] leading-relaxed">
                Conduct instant literature cross-referencing and detect geographic distribution anomalies.
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <GraduationCap className="w-8 h-8 text-[#22c55e] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Students</h3>
              <p className="text-[#9ca3af] leading-relaxed">
                Assist fieldwork with scientific accuracy and build a verifiable personal observation log.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TECH STACK STRIP */}
      <section className="relative z-10 border-y border-green-900/30 bg-[#060f08] py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500 font-medium tracking-wide">
          Powered by <span className="text-gray-400 mx-2">Claude AI</span> &middot; <span className="text-gray-400 mx-2">GBIF</span> &middot; <span className="text-gray-400 mx-2">IUCN Red List</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-green-900/30 bg-[#051408] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="font-bold text-xl tracking-widest text-green-700 mb-6 md:mb-0">NaLI</div>
          <div className="flex gap-8 text-gray-500">
            <Link href="/login" className="hover:text-green-400 transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-green-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
