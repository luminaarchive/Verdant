export type Language = 'en' | 'id'

export const translations = {
  en: {
    sidebar: {
      discover: 'Discover',
      research: 'Research',
      pulse: 'Pulse',
      digest: 'Digest',
      history: 'History',
      journal: 'Journal',
      watchlists: 'Watchlists',
      profile: 'Profile',
      settings: 'Settings',
      themeLight: 'Light',
      themeDark: 'Dark',
      themeSystem: 'System'
    },
    discover: {
      title: 'Global Environmental Intelligence',
      subtitle: 'Real-time aggregated signals from trusted scientific and institutional sources worldwide.',
      investigate: 'Investigate with Verdant',
      featured: 'Featured Intelligence',
      liveFeed: 'Live Signal Feed'
    },
    digest: {
      title: 'Intelligence Digest',
      subtitle: 'What changed in your environmental world since your last visit.',
      todayBrief: 'Today\'s Brief',
      keySignals: 'Key Signals Detected'
    },
    research: {
      newQueryPlaceholder: 'Ask a complex environmental question...',
      focusMode: 'Focus',
      deepMode: 'Deep Research',
      analyticaMode: 'Analytica',
      outputLanguage: 'Output Language',
      generate: 'Generate Report'
    },
    profile: {
      title: 'Scientific Intelligence Profile',
      reputationScore: 'Reputation Score',
      domainAuthority: 'Domain Authority',
      evidenceIntegrity: 'Evidence Integrity',
      contradictionHandling: 'Contradiction Handling',
      exportCV: 'Export Reputation Resume',
      preferredLang: 'Preferred Intelligence Language'
    },
    auth: {
      signIn: 'Sign In',
      createAccount: 'Create Account',
      email: 'Institutional Email',
      password: 'Password',
      fullName: 'Full Name',
      organization: 'Organization (optional)',
      welcome: 'Welcome Back',
      join: 'Join the environmental research community.'
    },
    system: {
      lastVerified: 'Last verified',
      sourcesSnapshot: 'Sources snapshot',
      evidenceFreeze: 'Evidence freeze date',
      revalidationNeeded: 'Revalidation needed',
      scientificDisagreement: 'Scientific Disagreement Detected'
    }
  },
  id: {
    sidebar: {
      discover: 'Eksplorasi',
      research: 'Penelitian',
      pulse: 'Denyut Nadi',
      digest: 'Rangkuman',
      history: 'Riwayat',
      journal: 'Jurnal Ilmiah',
      watchlists: 'Daftar Pantau',
      profile: 'Profil Peneliti',
      settings: 'Pengaturan',
      themeLight: 'Terang',
      themeDark: 'Gelap',
      themeSystem: 'Sistem'
    },
    discover: {
      title: 'Intelijen Lingkungan Global',
      subtitle: 'Sinyal teragregasi secara real-time dari sumber institusional dan ilmiah terpercaya di seluruh dunia.',
      investigate: 'Investigasi dengan Verdant',
      featured: 'Intelijen Utama',
      liveFeed: 'Umpan Sinyal Langsung'
    },
    digest: {
      title: 'Rangkuman Intelijen',
      subtitle: 'Perubahan strategis dalam ekosistem lingkungan Anda sejak kunjungan terakhir.',
      todayBrief: 'Laporan Hari Ini',
      keySignals: 'Sinyal Kunci Terdeteksi'
    },
    research: {
      newQueryPlaceholder: 'Ajukan pertanyaan lingkungan kompleks...',
      focusMode: 'Fokus',
      deepMode: 'Riset Mendalam',
      analyticaMode: 'Analitika',
      outputLanguage: 'Bahasa Laporan',
      generate: 'Hasilkan Laporan'
    },
    profile: {
      title: 'Profil Intelijen Ilmiah',
      reputationScore: 'Skor Reputasi',
      domainAuthority: 'Otoritas Domain',
      evidenceIntegrity: 'Integritas Bukti',
      contradictionHandling: 'Penanganan Kontradiksi',
      exportCV: 'Ekspor Resume Reputasi',
      preferredLang: 'Bahasa Intelijen Utama'
    },
    auth: {
      signIn: 'Masuk',
      createAccount: 'Buat Akun',
      email: 'Email Institusional',
      password: 'Kata Sandi',
      fullName: 'Nama Lengkap',
      organization: 'Organisasi (Opsional)',
      welcome: 'Selamat Datang Kembali',
      join: 'Bergabung dengan komunitas riset lingkungan.'
    },
    system: {
      lastVerified: 'Verifikasi terakhir',
      sourcesSnapshot: 'Cuplikan sumber',
      evidenceFreeze: 'Tanggal pembekuan bukti',
      revalidationNeeded: 'Membutuhkan revalidasi',
      scientificDisagreement: 'Ketidaksepakatan Ilmiah Terdeteksi'
    }
  }
}

export function getLanguagePreference(): Language {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem('verdant-lang') as Language
  return stored || 'en'
}

export function setLanguagePreference(lang: Language) {
  if (typeof window === 'undefined') return
  localStorage.setItem('verdant-lang', lang)
}
