import Link from "next/link";
import { Camera, Bot, FileText, Leaf, Microscope, GraduationCap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a1f0e] text-white flex flex-col">
      {/* HEADER */}
      <header className="px-6 py-6 flex justify-between items-center max-w-4xl mx-auto w-full">
        <div className="text-2xl font-bold text-[#22c55e] tracking-tight">NaLI</div>
        <Link href="/login" className="text-gray-300 hover:text-white font-medium">
          Sign In
        </Link>
      </header>

      {/* HERO */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-4xl mx-auto w-full text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          Wildlife Field <span className="text-[#22c55e]">Intelligence</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed">
          AI-powered species identification for rangers, researchers, and wildlife enthusiasts in Indonesia.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            href="/register" 
            className="bg-[#22c55e] text-black font-bold py-4 px-8 rounded-xl text-lg shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:bg-[#1ea34d] transition-colors"
          >
            Start Identifying
          </Link>
        </div>

        {/* HOW IT WORKS */}
        <div className="mt-24 mb-16 w-full text-left">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0f2e16] p-6 rounded-2xl border border-[#1a4724]">
              <div className="bg-[#1a4724] w-12 h-12 rounded-full flex items-center justify-center mb-4 text-[#22c55e]">
                <Camera size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">1. Capture</h3>
              <p className="text-gray-400 leading-relaxed">
                Take a photo, record audio, or write a description while out in the field.
              </p>
            </div>
            
            <div className="bg-[#0f2e16] p-6 rounded-2xl border border-[#1a4724]">
              <div className="bg-[#1a4724] w-12 h-12 rounded-full flex items-center justify-center mb-4 text-[#22c55e]">
                <Bot size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">2. Analyze</h3>
              <p className="text-gray-400 leading-relaxed">
                The NaLI Agent instantly cross-references your capture with GBIF, IUCN, and advanced AI vision models.
              </p>
            </div>

            <div className="bg-[#0f2e16] p-6 rounded-2xl border border-[#1a4724]">
              <div className="bg-[#1a4724] w-12 h-12 rounded-full flex items-center justify-center mb-4 text-[#22c55e]">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3. Document</h3>
              <p className="text-gray-400 leading-relaxed">
                Receive an instant field log complete with conservation status and geographical anomaly detection.
              </p>
            </div>
          </div>
        </div>

        {/* FOR WHO */}
        <div className="w-full text-left bg-black/30 rounded-3xl p-8 md:p-12 border border-[#1a4724]">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Built For The Field</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <Leaf className="text-[#22c55e] mr-4 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Rangers</h3>
                <p className="text-gray-400">Get real-time species identification and generate automated patrol reports on the go.</p>
              </div>
            </div>
            <div className="flex items-start">
              <Microscope className="text-[#22c55e] mr-4 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Researchers</h3>
                <p className="text-gray-400">Conduct instant literature cross-referencing and detect geographic distribution anomalies.</p>
              </div>
            </div>
            <div className="flex items-start">
              <GraduationCap className="text-[#22c55e] mr-4 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Students</h3>
                <p className="text-gray-400">Assist fieldwork with scientific accuracy and build a verifiable personal observation log.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-[#1a4724] py-8 text-center bg-[#051408]">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p className="mb-4 md:mb-0">NaLI uses Claude AI, GBIF, and IUCN Red List data.</p>
          <div className="space-x-4">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
