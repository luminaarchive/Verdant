'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Eye, EyeOff, ChevronDown, Loader2 } from "lucide-react";
import * as Select from "@radix-ui/react-select";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [institution, setInstitution] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          institution: institution || null,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#060f08', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* LEFT PANEL - Hidden on mobile, 60% on desktop */}
      <div className="hidden lg:flex" style={{ 
        width: '60%', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        padding: '60px', 
        background: 'radial-gradient(circle at top left, #0d2b12 0%, #060f08 100%)',
        position: 'relative'
      }}>
        <div style={{ zIndex: 10 }}>
          <Link href="/" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px', color: '#22c55e', textDecoration: 'none' }}>NaLI</Link>
        </div>

        <div style={{ zIndex: 10, maxWidth: '600px' }}>
          <h1 style={{ fontSize: '48px', fontFamily: 'serif', fontStyle: 'italic', fontWeight: '500', marginBottom: '32px', lineHeight: '1.2' }}>
            "Every observation matters."
          </h1>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #1a3a1a', backgroundColor: 'rgba(15, 34, 20, 0.5)', fontSize: '14px', color: '#86efac' }}>2,000+ species documented</span>
            <span style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #1a3a1a', backgroundColor: 'rgba(15, 34, 20, 0.5)', fontSize: '14px', color: '#86efac' }}>Active in 5 provinces</span>
            <span style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #1a3a1a', backgroundColor: 'rgba(15, 34, 20, 0.5)', fontSize: '14px', color: '#86efac' }}>Trusted by researchers</span>
          </div>
        </div>

        <div style={{ zIndex: 10, fontSize: '14px', color: '#166534', fontWeight: '500' }}>
          NaLI Wildlife Field Intelligence
        </div>
      </div>

      {/* RIGHT PANEL - Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '40px 32px',
        backgroundColor: '#060f08'
      }}>
        <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
          
          <div className="lg:hidden" style={{ marginBottom: '40px' }}>
            <Link href="/" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px', color: '#22c55e', textDecoration: 'none' }}>NaLI</Link>
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '8px', color: 'white' }}>Create your field account</h2>
          <p style={{ color: '#9ca3af', marginBottom: '40px', fontSize: '14px', lineHeight: '1.6' }}>
            Join rangers and researchers protecting Indonesia's wildlife
          </p>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#86efac', opacity: 0.8 }}>Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="John Doe"
                style={{ 
                  width: '100%', backgroundColor: '#0f2214', border: '1px solid #1a3a1a', 
                  color: 'white', borderRadius: '12px', padding: '12px 16px', outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#86efac', opacity: 0.8 }}>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
                style={{ 
                  width: '100%', backgroundColor: '#0f2214', border: '1px solid #1a3a1a', 
                  color: 'white', borderRadius: '12px', padding: '12px 16px', outline: 'none',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#86efac', opacity: 0.8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ 
                    width: '100%', backgroundColor: '#0f2214', border: '1px solid #1a3a1a', 
                    color: 'white', borderRadius: '12px', padding: '12px 16px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#166534', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#86efac', opacity: 0.8 }}>Role</label>
              <Select.Root value={role} onValueChange={setRole}>
                <Select.Trigger style={{ 
                  width: '100%', backgroundColor: '#0f2214', border: '1px solid #1a3a1a', 
                  color: 'white', borderRadius: '12px', padding: '12px 16px', outline: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  boxSizing: 'border-box'
                }}>
                  <Select.Value placeholder="Select a role" />
                  <Select.Icon>
                    <ChevronDown size={18} color="#166534" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content style={{ backgroundColor: '#0f2214', border: '1px solid #1a3a1a', borderRadius: '12px', overflow: 'hidden', zIndex: 50, marginTop: '8px', color: 'white' }}>
                    <Select.Viewport style={{ padding: '4px' }}>
                      <Select.Item value="ranger" style={{ padding: '12px 32px', fontSize: '14px', cursor: 'pointer', outline: 'none' }}>
                        <Select.ItemText>Ranger 🌿</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="researcher" style={{ padding: '12px 32px', fontSize: '14px', cursor: 'pointer', outline: 'none' }}>
                        <Select.ItemText>Researcher 🔬</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="student" style={{ padding: '12px 32px', fontSize: '14px', cursor: 'pointer', outline: 'none' }}>
                        <Select.ItemText>Student 🎓</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '500', color: '#86efac', opacity: 0.8 }}>Institution <span style={{ color: '#166534' }}>(Optional)</span></label>
              <input 
                type="text" 
                value={institution}
                onChange={e => setInstitution(e.target.value)}
                placeholder="University or Park Name"
                style={{ 
                  width: '100%', backgroundColor: '#0f2214', border: '1px solid #1a3a1a', 
                  color: 'white', borderRadius: '12px', padding: '12px 16px', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <p style={{ color: '#f87171', fontSize: '14px', margin: 0 }}>{error}</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', backgroundColor: '#22c55e', color: 'black', fontWeight: '700', 
                borderRadius: '12px', padding: '14px', marginTop: '16px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#9ca3af' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: '500' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
