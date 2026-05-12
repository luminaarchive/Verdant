import Link from "next/link";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Shield, Microscope, GraduationCap, Camera, Cpu, FileText } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"] });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"] });

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-[#0A0F0A] text-[#F0F4F0] selection:bg-[#4ADE80]/30 ${dmSans.className}`}>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0F0A]/80 backdrop-blur-md border-b border-[#1E2E1E]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#4ADE80]"></div>
            <span className="text-xl font-bold tracking-widest">NaLI</span>
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-[#8A9E8A]">
            <Link href="#features" className="hover:text-[#F0F4F0] transition-colors">Features</Link>
            <Link href="#process" className="hover:text-[#F0F4F0] transition-colors">How It Works</Link>
            <Link href="#pricing" className="hover:text-[#F0F4F0] transition-colors">Pricing</Link>
          </div>

          <Link 
            href="/register" 
            className="bg-[#4ADE80] text-black font-semibold px-6 py-2 rounded-full hover:bg-[#22c55e] transition-colors text-sm"
          >
            Start Identifying
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111A11] via-[#0A0F0A] to-[#0A0F0A] z-0"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col items-start mt-10">
          <div className="inline-block border border-[#1E2E1E] bg-[#111A11] text-[#86EFAC] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-8">
            Wildlife Field Intelligence • Indonesia
          </div>
          
          <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold leading-[1.1] mb-6 max-w-4xl`}>
            Every species.<br />Every field.<br />Every second.
          </h1>
          
          <p className="text-lg md:text-xl text-[#8A9E8A] max-w-2xl mb-12 leading-relaxed">
            NaLI identifies wildlife from photos, sound, and description. 
            Instant field intelligence for rangers, researchers, and students.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            <Link 
              href="/register" 
              className="bg-[#4ADE80] text-black font-bold px-8 py-4 rounded-full hover:bg-[#22c55e] transition-colors text-center"
            >
              Start Identifying
            </Link>
            <Link 
              href="#process" 
              className="border border-[#1E2E1E] text-[#F0F4F0] font-bold px-8 py-4 rounded-full hover:bg-[#111A11] transition-colors text-center"
            >
              See How It Works
            </Link>
          </div>

          {/* DATA STRIP */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-[#1E2E1E] pt-12 ${jetbrains.className} text-sm`}>
            <div>
              <div className="text-3xl font-bold text-[#86EFAC] mb-2">72,000+</div>
              <div className="text-[#8A9E8A] uppercase tracking-wider text-xs">Species in Database</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#86EFAC] mb-2">17,000</div>
              <div className="text-[#8A9E8A] uppercase tracking-wider text-xs">Indonesian Endemic Species Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#86EFAC] mb-2">&lt; 30s</div>
              <div className="text-[#8A9E8A] uppercase tracking-wider text-xs">Average Identification Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="border-y border-[#1E2E1E] bg-[#0A0F0A] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-[#8A9E8A] text-sm font-bold uppercase tracking-widest whitespace-nowrap">
            Powered by data from
          </div>
          <div className={`flex flex-wrap justify-center gap-8 md:gap-16 text-[#F0F4F0]/50 font-bold text-xl tracking-wider ${playfair.className}`}>
            <span>GBIF</span>
            <span>IUCN Red List</span>
            <span>KLHK</span>
            <span>BirdNET</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="process" className="py-32 px-6 bg-[#0A0F0A]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-[#4ADE80] text-sm font-bold tracking-widest uppercase mb-4 block">The Process</span>
            <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold text-[#F0F4F0] max-w-2xl`}>
              From field observation to scientific record in seconds.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", icon: Camera, title: "Capture", desc: "Submit a photo, audio recording, or text description of your sighting." },
              { num: "02", icon: Cpu, title: "Analyze", desc: "NaLI Agent cross-references GBIF, IUCN data, and advanced AI vision models." },
              { num: "03", icon: FileText, title: "Document", desc: "Receive an auto-generated field log, complete with anomaly detection flags." }
            ].map((step) => (
              <div key={step.num} className="relative bg-[#111A11] border border-[#1E2E1E] p-10 rounded-2xl overflow-hidden group">
                <div className={`${playfair.className} absolute -top-6 right-4 text-[120px] font-bold text-[#0A0F0A] opacity-50 select-none`}>
                  {step.num}
                </div>
                <div className="relative z-10">
                  <step.icon className="w-8 h-8 text-[#4ADE80] mb-8" />
                  <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                  <p className="text-[#8A9E8A] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUILT FOR THE FIELD */}
      <section id="features" className="py-32 px-6 bg-[#111A11] border-y border-[#1E2E1E]">
        <div className="max-w-7xl mx-auto">
          <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold text-center mb-20`}>Built For The Field</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <Shield className="w-10 h-10 text-[#4ADE80] mb-6" />
              <h3 className="text-2xl font-bold mb-4">Rangers</h3>
              <p className="text-[#8A9E8A] leading-relaxed">
                Obtain real-time species identification in remote areas and generate automated patrol reports directly from your mobile device.
              </p>
            </div>
            <div>
              <Microscope className="w-10 h-10 text-[#4ADE80] mb-6" />
              <h3 className="text-2xl font-bold mb-4">Researchers</h3>
              <p className="text-[#8A9E8A] leading-relaxed">
                Instantly cross-reference sightings with established literature and automatically flag geographic distribution anomalies.
              </p>
            </div>
            <div>
              <GraduationCap className="w-10 h-10 text-[#4ADE80] mb-6" />
              <h3 className="text-2xl font-bold mb-4">Students</h3>
              <p className="text-[#8A9E8A] leading-relaxed">
                Accelerate fieldwork with scientifically accurate assistance and seamlessly build a verifiable personal observation log.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONSERVATION STATUS SHOWCASE */}
      <section className="py-32 px-6 bg-[#0A0F0A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6`}>See conservation status instantly</h2>
            <p className="text-[#8A9E8A] max-w-2xl mx-auto text-lg">
              NaLI integrates directly with the IUCN Red List API to provide real-time conservation data for every identified species.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { status: "CR", full: "Critically Endangered", color: "bg-red-500", text: "text-red-500", border: "border-red-500/30", example: "Pongo tapanuliensis" },
              { status: "EN", full: "Endangered", color: "bg-orange-500", text: "text-orange-500", border: "border-orange-500/30", example: "Elephas maximus sumatranus" },
              { status: "VU", full: "Vulnerable", color: "bg-yellow-500", text: "text-yellow-500", border: "border-yellow-500/30", example: "Komodoensis" },
              { status: "LC", full: "Least Concern", color: "bg-[#4ADE80]", text: "text-[#4ADE80]", border: "border-[#4ADE80]/30", example: "Macaca fascicularis" }
            ].map((item) => (
              <div key={item.status} className={`bg-[#111A11] border ${item.border} rounded-2xl p-8 flex flex-col items-center text-center`}>
                <div className={`w-16 h-16 rounded-full ${item.color} bg-opacity-20 flex items-center justify-center mb-6`}>
                  <span className={`${item.text} font-bold text-2xl`}>{item.status}</span>
                </div>
                <h3 className="font-bold mb-2 uppercase tracking-wide text-sm">{item.full}</h3>
                <p className={`${jetbrains.className} text-[#8A9E8A] text-xs italic mt-auto pt-4`}>ex. {item.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 bg-[#111A11] border-y border-[#1E2E1E] text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6`}>
            Ready to protect Indonesia's wildlife?
          </h2>
          <p className="text-[#8A9E8A] text-xl mb-12">
            Join rangers and researchers in the field.
          </p>
          <Link 
            href="/register" 
            className="inline-block bg-[#4ADE80] text-black font-bold px-10 py-5 rounded-full hover:bg-[#22c55e] transition-colors text-lg"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0A0F0A] py-16 px-6 border-t border-[#1E2E1E]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#4ADE80]"></div>
              <span className="text-2xl font-bold tracking-widest">NaLI</span>
            </div>
            <p className="text-[#8A9E8A] text-sm">
              Built for Indonesia's conservation community
            </p>
            <p className="text-[#1E2E1E] text-xs mt-4">
              &copy; {new Date().getFullYear()} NatIve / NaLI
            </p>
          </div>

          <div className="flex gap-12 text-sm font-medium text-[#8A9E8A]">
            <div className="flex flex-col gap-4">
              <Link href="#features" className="hover:text-[#F0F4F0] transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-[#F0F4F0] transition-colors">Pricing</Link>
            </div>
            <div className="flex flex-col gap-4">
              <Link href="#" className="hover:text-[#F0F4F0] transition-colors">About</Link>
              <Link href="#" className="hover:text-[#F0F4F0] transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
