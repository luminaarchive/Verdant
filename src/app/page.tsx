'use client'

import Link from 'next/link'
import { Camera, Cpu, FileText, Shield, Microscope, GraduationCap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#060f08', minHeight: '100vh', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* NAV */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a3a1a' }}>
        <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '2px', color: '#22c55e' }}>NaLI</span>
        <Link href="/login" style={{ color: '#86efac', textDecoration: 'none', fontSize: '14px' }}>Sign In</Link>
      </nav>

      {/* HERO */}
      <section style={{ 
        minHeight: '90vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '80px 40px',
        background: 'radial-gradient(ellipse at center, #0d2b12 0%, #060f08 70%)'
      }}>
        <div style={{ maxWidth: '700px' }}>
          <div style={{ 
            display: 'inline-block',
            backgroundColor: '#0f2214', 
            border: '1px solid #166534', 
            borderRadius: '100px', 
            padding: '6px 16px', 
            fontSize: '12px', 
            color: '#86efac', 
            marginBottom: '32px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Wildlife Field Intelligence
          </div>
          
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: '900', lineHeight: '1', marginBottom: '24px', letterSpacing: '-2px' }}>
            Na<span style={{ color: '#22c55e' }}>LI</span>
          </h1>
          
          <p style={{ fontSize: '18px', color: '#9ca3af', maxWidth: '500px', lineHeight: '1.6', marginBottom: '48px' }}>
            AI-powered species identification for rangers, researchers, and wildlife enthusiasts in Indonesia.
          </p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/register" style={{
              backgroundColor: '#22c55e',
              color: '#000',
              padding: '14px 32px',
              borderRadius: '100px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: '15px',
              display: 'inline-block'
            }}>
              Start Identifying
            </Link>
            <Link href="/login" style={{
              backgroundColor: 'transparent',
              color: '#86efac',
              padding: '14px 32px',
              borderRadius: '100px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
              border: '1px solid #166534',
              display: 'inline-block'
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '100px 40px', backgroundColor: '#060f08' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ color: '#22c55e', fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase' }}>● How It Works</span>
          <h2 style={{ fontSize: '40px', fontWeight: '800', marginTop: '12px', color: 'white' }}>Three steps. Instant intelligence.</h2>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '24px', 
          maxWidth: '1000px', 
          margin: '0 auto' 
        }}>
          {[
            { num: '01', icon: <Camera size={28} color="#22c55e" />, title: 'Capture', desc: 'Take a photo, record audio, or write a description while out in the field.' },
            { num: '02', icon: <Cpu size={28} color="#22c55e" />, title: 'Analyze', desc: 'NaLI Agent cross-references GBIF, IUCN, and advanced AI vision models.' },
            { num: '03', icon: <FileText size={28} color="#22c55e" />, title: 'Document', desc: 'Get an instant field log with conservation status and anomaly detection.' },
          ].map((item) => (
            <div key={item.num} style={{
              backgroundColor: '#0f2214',
              border: '1px solid #1a3a1a',
              borderRadius: '20px',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '72px', fontWeight: '900', color: '#22c55e', opacity: 0.08, position: 'absolute', top: '-10px', right: '20px', lineHeight: 1 }}>{item.num}</div>
              <div style={{ marginBottom: '16px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'white' }}>{item.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BUILT FOR THE FIELD */}
      <section style={{ padding: '100px 40px', backgroundColor: '#0a1a0c' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', color: 'white' }}>Built For The Field</h2>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '32px', 
          maxWidth: '900px', 
          margin: '0 auto' 
        }}>
          {[
            { icon: <Shield size={32} color="#22c55e" />, title: 'Rangers', desc: 'Real-time species ID and automated patrol reports on the go.' },
            { icon: <Microscope size={32} color="#22c55e" />, title: 'Researchers', desc: 'Instant literature cross-reference and anomaly detection.' },
            { icon: <GraduationCap size={32} color="#22c55e" />, title: 'Students', desc: 'Fieldwork assistance with scientific accuracy and personal logs.' },
          ].map((item) => (
            <div key={item.title} style={{ textAlign: 'center', padding: '32px 24px' }}>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'white' }}>{item.title}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section style={{ padding: '80px 40px', textAlign: 'center', backgroundColor: '#060f08', borderTop: '1px solid #1a3a1a' }}>
        <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Ready to identify your first species?</h2>
        <p style={{ color: '#6b7280', marginBottom: '40px' }}>Join rangers and researchers protecting Indonesia's wildlife.</p>
        <Link href="/register" style={{
          backgroundColor: '#22c55e',
          color: '#000',
          padding: '16px 48px',
          borderRadius: '100px',
          textDecoration: 'none',
          fontWeight: '700',
          fontSize: '16px',
          display: 'inline-block'
        }}>
          Create Free Account
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 40px', borderTop: '1px solid #1a3a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#060f08' }}>
        <span style={{ fontWeight: '800', letterSpacing: '2px', color: '#22c55e', fontSize: '14px' }}>NaLI</span>
        <span style={{ color: '#374151', fontSize: '12px' }}>Powered by Claude AI · GBIF · IUCN Red List</span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link href="/login" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '13px' }}>Sign In</Link>
          <Link href="/register" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '13px' }}>Register</Link>
        </div>
      </footer>

    </div>
  )
}
