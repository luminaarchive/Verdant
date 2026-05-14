export const id = {
  common: {
    language: "Bahasa",
    english: "Inggris",
    indonesian: "Indonesia",
    signIn: "Masuk",
    createAccount: "Buat Akun",
    startIdentifying: "Mulai Identifikasi",
    tryDemo: "Coba Demo",
    joinEarlyAccess: "Bergabung Akses Awal",
    viewFieldWorkflow: "Lihat Alur Lapangan",
    fieldObservation: "Observasi Lapangan",
    analyzeObservation: "Analisis Observasi",
    monitoring: "Pemantauan",
    archive: "Arsip",
    alerts: "Peringatan",
    cases: "Kasus Lapangan",
    system: "Sistem",
    pending: "Menunggu",
    unconfigured: "Belum dikonfigurasi",
    available: "Tersedia",
    degraded: "Terbatas",
    unverified: "Belum diverifikasi",
    ok: "OK",
  },
  nav: {
    dashboard: "Dasbor",
    observe: "Observasi",
    monitor: "Pantau",
    demo: "Demo",
    workflow: "Alur Kerja",
    pricing: "Harga",
    fieldUse: "Penggunaan Lapangan",
    security: "Keamanan",
  },
  footer: {
    privacy: "Kebijakan Privasi",
    contact: "Kontak",
    builtBy: "Dibangun oleh NatIve",
    tagline: "Nature Life Intelligence and Human Assistance",
  },
  landing: {
    eyebrow: "Intelijen lapangan satwa liar untuk Indonesia",
    title: "Identifikasi Spesies. Catat Observasi. Deteksi Anomali Ekologis.",
    subtitle:
      "NaLI membantu ranger, peneliti, dan tim konservasi mengidentifikasi spesies satwa dari foto, audio, dan catatan lapangan sambil menghasilkan catatan ekologis terstruktur dan alur kerja operasional otonom.",
    observationReview: "Tinjauan observasi",
    anomaly: "Anomali",
    audience: {
      kicker: "Dirancang untuk",
      title: "Tim lapangan yang membutuhkan bukti berguna, bukan tampilan berlebihan.",
      description:
        "NaLI dibentuk untuk pekerjaan observasi berulang dalam patroli, survei, perjalanan riset, dan praktik lapangan.",
      cards: {
        rangers: {
          title: "Ranger",
          description: "Pemeriksaan spesies cepat, perekaman GPS, dan catatan anomali siap patroli.",
        },
        researchers: {
          title: "Peneliti",
          description: "Observasi terstruktur yang selaras dengan alur tinjauan ilmiah.",
        },
        ngos: {
          title: "Organisasi Konservasi",
          description: "Catatan lapangan aman untuk pemantauan habitat dan perencanaan intervensi.",
        },
        students: {
          title: "Mahasiswa Biologi",
          description: "Latihan identifikasi lapangan dengan nama ilmiah dan konteks status konservasi.",
        },
      },
    },
    publicDemo: {
      kicker: "Demo spesies publik",
      title: "Coba pencarian spesies berbasis sumber",
      description:
        "Cari spesies satwa Indonesia dan lihat bagaimana NaLI menyusun konteks ekologis sebelum verifikasi lapangan.",
      disclaimer:
        "Demo publik ini menggunakan data referensi golden-set NaLI. Hasil bukan observasi lapangan yang telah diverifikasi.",
      inputLabel: "Nama spesies",
      placeholder: "Coba harimau sumatera, komodo, jalak bali...",
      button: "Cari spesies",
      loading: "Memeriksa data referensi",
      empty: "Masukkan nama lokal, umum, atau ilmiah spesies.",
      failed: "NaLI tidak dapat menyelesaikan pencarian demo publik. Coba lagi dari perangkat ini.",
      notFound: "Tidak ada spesies golden-set NaLI yang cocok dengan kueri demo ini.",
      resultLabel: "Konteks ekologis terstruktur",
      populationTrend: "Tren populasi",
      distribution: "Konteks distribusi",
      review: "Rekomendasi tinjauan",
      source: "Sumber",
      demoBadge: "Demo publik · bukan observasi lapangan terverifikasi",
    },
    workflow: {
      kicker: "Cara kerja NaLI",
      title: "Alur observasi tertelusur dari bukti lapangan ke catatan tersimpan.",
      description: "Setiap tahap cukup jelas untuk tinjauan, koreksi, dan serah terima ilmiah.",
      steps: {
        input: "Input observasi",
        candidate: "Identifikasi kandidat spesies",
        gbif: "Periksa distribusi GBIF",
        iucn: "Ambil konteks konservasi IUCN",
        review: "Buat rekomendasi tinjauan",
        saved: "Catatan Lapangan Tersimpan",
      },
      notes: {
        inputs: "Input tetap tertaut ke catatan observasi untuk verifikasi berikutnya.",
        context: "Pemeriksaan GBIF dan IUCN memberi konteks, bukan menentukan kebenaran tersembunyi.",
        review: "Bendera anomali tetap dapat ditinjau sebelum laporan diekspor.",
      },
    },
    liveReview: {
      label: "Demo berbasis sumber",
      demo: "Demo publik",
      sourceLabel: "Contoh referensi GBIF + IUCN",
      disclaimer: "Demo publik · bukan observasi lapangan terverifikasi",
      stageContext:
        "Status alur contoh ini menunjukkan bagaimana NaLI menyusun sinyal sebelum catatan lapangan terverifikasi disimpan.",
      stages: {
        media: "Status alur contoh: media diterima",
        candidate: "Status alur contoh: kandidat spesies dibuat",
        gbif: "Status alur contoh: distribusi GBIF diperiksa",
        iucn: "Status alur contoh: konteks IUCN diambil",
        review: "Status alur contoh: rekomendasi tinjauan dibuat",
        saved: "Status alur contoh: catatan lapangan siap",
      },
      records: {
        tapanuli: {
          evidence: "Foto + catatan lapangan",
          review: "Validasi ahli direkomendasikan",
          context: "Konteks kera besar dengan sebaran kecil memerlukan koordinat terlindungi dan tinjauan ahli sebelum ekspor.",
        },
        tiger: {
          evidence: "Bingkai kamera jebak + GPS",
          review: "Tinjauan otomatis diperlukan",
          context: "Bukti karnivora kritis di dekat tepi penggunaan manusia perlu dieskalasi secara hati-hati.",
        },
        komodo: {
          evidence: "Foto + catatan ranger",
          review: "Aman untuk arsip rutin",
          context: "Konteks sebaran yang sesuai mendukung pengarsipan rutin saat sinyal distribusi dan habitat selaras.",
        },
      },
    },
    results: {
      kicker: "Hasil observasi",
      title: "Catatan lapangan berbasis bukti untuk tinjauan operasional.",
      description:
        "Nama, status, keyakinan, lokasi, waktu, rekomendasi tinjauan, dan peringatan terlihat tanpa membuka banyak menu.",
      demoLabel: "Contoh catatan lapangan",
      demoDisclosure: "Contoh catatan lapangan menggunakan referensi golden-set NaLI dan bukan observasi terverifikasi.",
      sourceLabel: "Contoh catatan lapangan · belum diverifikasi",
      disclaimer: "Demo publik · bukan observasi lapangan terverifikasi",
      auditNote: "Sinyal dan interpretasi tetap dipisahkan untuk audit dan serah terima peninjau.",
      reviewNote: "Konteks spesies berisiko tinggi dapat memicu rekomendasi tinjauan dan eskalasi kasus lapangan.",
      records: {
        tapanuli: {
          evidence: "Foto + catatan lapangan",
          review: "Validasi ahli direkomendasikan",
          context: "Sensitivitas habitat sebaran kecil memerlukan koordinat terlindungi dan penanganan ekspor yang hati-hati.",
        },
        tiger: {
          evidence: "Bingkai kamera jebak + GPS",
          review: "Tinjauan otomatis diperlukan",
          context: "Kedekatan dengan permukiman manusia dapat meningkatkan tingkat anomali dan peluang eskalasi.",
        },
        komodo: {
          evidence: "Foto + catatan ranger",
          review: "Aman untuk arsip rutin",
          context: "Sebaran dan habitat yang sesuai mendukung arsip rutin setelah verifikasi lapangan.",
        },
      },
    },
    evidenceCard: {
      distribution: "GPS / Distribusi",
      evidence: "Bukti",
      review: "Tinjauan",
      status: "Status demo",
    },
    difference: {
      kicker: "Intelijen lapangan agentik",
      title: "Mengapa NaLI berbeda dari alat AI generik",
      description: "Dirancang khusus untuk alur kerja observasi satwa liar Indonesia, bukan percakapan generik.",
      items: {
        sources: {
          title: "Konteks spesies berbasis sumber",
          description: "Output spesies dibingkai dengan distribusi GBIF dan konteks konservasi IUCN saat tersedia.",
        },
        status: {
          title: "Pengayaan status konservasi",
          description: "Kategori risiko membentuk privasi, tinjauan, dan eskalasi, bukan hanya hiasan.",
        },
        memory: {
          title: "Memori observasi lapangan",
          description: "Struktur longitudinal menyiapkan NaLI untuk menalar observasi dan wilayah berulang.",
        },
        review: {
          title: "Rekomendasi anomali dan tinjauan",
          description: "Sinyal penyedia dikalibrasi menjadi rekomendasi terstruktur untuk validasi manusia.",
        },
        offline: {
          title: "Alur offline ringan",
          description: "Perekaman lapangan dapat diantrekan dengan aman saat konektivitas terputus.",
        },
        cases: {
          title: "Eskalasi kasus konservasi",
          description: "Observasi penting dapat menjadi kasus lapangan operasional dengan bukti tertaut.",
        },
        bilingual: {
          title: "UX lapangan Inggris dan Indonesia",
          description: "Alur penting dilokalkan untuk konteks konservasi Indonesia.",
        },
      },
    },
    field: {
      kicker: "Untuk kondisi lapangan",
      title: "Dirancang untuk perangkat Android, sinyal terputus, dan ritme patroli nyata.",
      description:
        "Antarmuka menjaga jalur inti perekaman dan tinjauan tetap mudah dipakai saat tim bergerak, lelah, basah, atau offline.",
      features: {
        offline: "Mode offline ringan",
        sync: "Sinkronisasi otomatis",
        lowConnectivity: "Alur konektivitas rendah",
        pwa: "PWA Android",
        gps: "Perekaman GPS",
        fastId: "Identifikasi lapangan cepat",
      },
    },
    conservation: {
      kicker: "Status konservasi",
      title: "Kategori IUCN ditampilkan sebagai konteks ekologis, bukan hiasan.",
      description:
        "NaLI menampilkan risiko konservasi dengan jelas agar tim dapat memprioritaskan verifikasi, privasi, dan respons.",
      statuses: {
        cr: {
          label: "Kritis",
          description: "Risiko kepunahan sangat tinggi di alam liar. Akses lokasi harus dilindungi.",
        },
        en: {
          label: "Terancam Punah",
          description: "Risiko kepunahan tinggi. Catatan harus mendukung keputusan intervensi dan habitat.",
        },
        vu: {
          label: "Rentan",
          description: "Risiko tinggi tanpa pemantauan, penilaian tekanan, dan perlindungan habitat berkelanjutan.",
        },
        nt: {
          label: "Hampir Terancam",
          description: "Dekat dengan ambang terancam. Perubahan tren perlu perhatian awal.",
        },
        lc: {
          label: "Risiko Rendah",
          description: "Risiko kepunahan lebih rendah, tetap bernilai untuk catatan distribusi dan perilaku musiman.",
        },
      },
    },
    privacy: {
      kicker: "Privasi dan keamanan",
      title: "Catatan ekologis sensitif diperlakukan sebagai data lapangan terlindungi.",
      description: "NaLI menghindari mekanik feed publik dan menjaga koordinat berisiko tinggi dalam akses terkendali.",
      items: {
        private: "Observasi lapangan bersifat privat secara default",
        noFeed: "Tidak ada feed sosial publik",
        gps: "Perlindungan GPS untuk spesies terancam",
        signedUrl: "Akses URL bertanda tangan untuk bukti media",
        secure: "Penanganan data ilmiah yang aman",
      },
    },
    trust: {
      kicker: "Kepercayaan akses awal",
      title: "Dibangun untuk alur kerja konservasi Indonesia.",
      description:
        "Akses awal terbuka untuk ranger, peneliti, NGO konservasi, dan mahasiswa biologi Indonesia. Dibangun untuk alur kerja konservasi dan sumber data keanekaragaman hayati Indonesia.",
      sources: {
        integrated: {
          label: "Referensi terintegrasi",
          description: "GBIF · IUCN Red List",
        },
        ready: {
          label: "Arsitektur siap",
          description: "Arsitektur audio siap BirdNET tanpa mengklaim panggilan produksi BirdNET aktif.",
        },
        scope: {
          label: "Ruang lingkup yang jujur",
          description:
            "Tidak ada institusi, penerapan lapangan, atau aktivitas sosial publik yang dibuat-buat sebagai bukti produksi.",
        },
      },
    },
    pricing: {
      kicker: "Akses awal terencana",
      title: "Rencana harga akses awal",
      description: "Harga ditampilkan untuk perencanaan rilis. Pembayaran belum aktif.",
      popular: "Paling Populer",
      note: "Harga berlaku saat pembayaran diluncurkan.",
      tiers: {
        seeds: {
          name: "Seeds",
          price: "Gratis",
          feature1: "10 observasi/bulan",
          feature2: "Identifikasi foto",
          feature3: "10 entri catatan lapangan",
          feature4: "Status konservasi dasar",
        },
        sapling: {
          name: "Sapling",
          price: "Rp 45.000/bulan",
          feature1: "100 observasi/bulan",
          feature2: "Identifikasi Foto + Audio",
          feature3: "Mode offline ringan",
          feature4: "Catatan lapangan tanpa batas",
        },
        forestKeeper: {
          name: "Forest Keeper",
          price: "Rp 149.000/bulan",
          feature1: "Observasi tanpa batas",
          feature2: "Identifikasi Foto + Audio",
          feature3: "Ekspor data",
          feature4: "Dukungan prioritas",
        },
      },
    },
    finalCta: {
      kicker: "Intelijen lapangan NaLI",
      title: "Bergabung akses awal untuk intelijen ekologis siap lapangan.",
      description:
        "Mulai dari identifikasi, jaga bukti tetap terstruktur, dan berikan tim konservasi catatan yang dapat dipercaya saat kondisi tidak sempurna.",
    },
  },
  privacyPage: {
    eyebrow: "Kebijakan Privasi",
    title: "Data lapangan ekologis terlindungi",
    context:
      "NaLI dirancang untuk observasi lapangan privat, lokasi keanekaragaman hayati sensitif, dan penanganan data konservasi.",
    items: {
      observations: "Observasi lapangan bersifat privat secara default dan terikat ke ruang kerja terautentikasi.",
      coordinates: "Koordinat sensitif harus dilindungi untuk spesies terancam dan habitat kritis.",
      media: "Bukti media ditangani melalui penyimpanan privat dan pola akses bertanda tangan saat dikonfigurasi.",
      exports: "Ekspor ilmiah harus menjaga auditabilitas dan menghindari paparan lokasi terlindungi yang tidak perlu.",
    },
  },
  contactPage: {
    eyebrow: "Kontak",
    title: "Koordinasi akses awal",
    context:
      "NaLI berada dalam akses awal untuk alur kerja konservasi Indonesia. Gunakan alur akses akun atau kanal kontak yang dikonfigurasi pemilik deployment untuk koordinasi.",
    note: "Tidak ada institusi, lembaga, atau penerapan lapangan yang diklaim kecuali telah diverifikasi secara eksplisit.",
  },
  auth: {
    workspace: "Ruang kerja intelijen lapangan",
    signInTitle: "Masuk ke NaLI",
    signInContext: "Akses observasi lapangan pribadi dan ruang kerja intelijen ekologis Anda.",
    email: "Email",
    password: "Kata sandi",
    passwordPlaceholder: "Masukkan kata sandi",
    emailPlaceholder: "nama@institusi.org",
    newToNali: "Baru menggunakan NaLI?",
    alreadyRegistered: "Sudah terdaftar?",
    hidePassword: "Sembunyikan kata sandi",
    showPassword: "Tampilkan kata sandi",
    registerEyebrow: "Catatan lapangan konservasi",
    registerTitle: "Buat Akun",
    registerContext:
      "Siapkan ruang kerja pribadi untuk observasi lapangan, penalaran ekologis, dan pemantauan konservasi.",
    fullName: "Nama lengkap",
    institutionOptional: "Institusi opsional",
    institutionPlaceholder: "Taman nasional, NGO, universitas",
    passwordMinimum: "Minimal 6 karakter",
    role: "Peran",
    roles: {
      ranger: "Ranger",
      rangerDescription: "Observasi patroli, catatan spesies dilindungi, dan alur tinjauan lapangan.",
      researcher: "Peneliti",
      researcherDescription: "Catatan survei, tinjauan ekologis, dan ekspor observasi ilmiah.",
      student: "Mahasiswa",
      studentDescription: "Pembelajaran lapangan terpandu dengan nama ilmiah dan konteks konservasi.",
    },
  },
  observe: {
    title: "Observasi lapangan",
    context: "Rekam media, catatan, dan lokasi untuk penalaran ekologis terstruktur.",
    upload: "Unggah media lapangan",
    uploadHint: "Gunakan foto satwa yang jelas atau gambar habitat pendukung.",
    description: "Catatan lapangan",
    descriptionPlaceholder: "Jelaskan spesies, perilaku, habitat, dan konteks operasional.",
    gps: "Lokasi GPS",
    gpsAcquired: "Lokasi diperoleh",
    gpsLowAccuracy: "Akurasi lokasi rendah",
    gpsUnavailable: "Lokasi tidak tersedia",
    offlineQueued: "Observasi disimpan ke antrean offline. Sinkronkan saat konektivitas lapangan kembali.",
    uploadFailed: "Observasi tidak dapat dikirim. Periksa konektivitas, penyimpanan, dan data lapangan.",
    completed: "Analisis observasi selesai",
  },
  archive: {
    eyebrow: "Arsip Observasi Lapangan",
    title: "Arsip Observasi",
    context: "Observasi lapangan tersimpan dengan status proses, status tinjauan, keyakinan, dan prioritas konservasi.",
    newObservation: "Observasi Baru",
    loadErrorTitle: "Arsip observasi tidak dapat dimuat",
    loadErrorDetail:
      "NaLI tidak dapat menjangkau catatan lapangan tersimpan. Periksa konektivitas Supabase dan status sesi sebelum melanjutkan validasi.",
    emptyTitle: "Belum ada catatan observasi",
    emptyDetail:
      "Buat observasi lapangan dengan media, catatan, dan koordinat GPS. Analisis yang selesai akan muncul di sini dengan penalaran dan status tinjauan.",
    speciesPending: "Spesies menunggu",
    commonNamePending: "Nama umum menunggu",
    fieldArchive: "Arsip lapangan",
  },
  monitoring: {
    eyebrow: "Pemantauan ekosistem",
    title: "Intelijen ekologis regional",
    context:
      "Tampilan pemantauan menggunakan observasi tersimpan, pola longitudinal, kasus lapangan, peringatan ekologis, dan catatan perubahan keyakinan.",
    emptyTitle: "Belum ada sinyal pemantauan regional",
    emptyDetail:
      "Kirim observasi lapangan dan biarkan orkestrasi menyimpan snapshot penalaran. Pemantauan akan terisi saat observasi, pola, kasus, atau peringatan tersedia.",
    regionalWatchGrid: "Kisi pemantauan regional",
    ecologicalPressureRegions: "Wilayah tekanan ekologis",
    noLocatedRegions: "Belum ada wilayah observasi berlokasi",
    noLocatedRegionsDetail:
      "Pemantauan membutuhkan observasi tersimpan dengan koordinat untuk membangun kisi regional.",
  },
  alerts: {
    eyebrow: "Pemantauan ekologis",
    title: "Peringatan ekologis",
    context:
      "Peringatan operasional tertelusur yang dihasilkan dari pola longitudinal, kasus lapangan, dan sinyal yang dikonfirmasi peninjau.",
    loadErrorTitle: "Peringatan ekologis tidak dapat dimuat",
    loadErrorDetail:
      "NaLI tidak dapat menjangkau catatan peringatan tersimpan. Periksa konektivitas Supabase dan migrasi intelijen longitudinal.",
    emptyTitle: "Tidak ada peringatan ekologis aktif",
    emptyDetail:
      "Peringatan muncul saat penalaran longitudinal mendeteksi observasi spesies terancam berulang, klaster anomali meningkat, konflik habitat, atau gangguan migrasi.",
    noEvidence: "Tidak ada bukti peringatan aktif",
    linkedEvidence: "Bukti tertaut",
    evidencePending: "Referensi bukti menunggu",
  },
  cases: {
    eyebrow: "Operasi konservasi",
    title: "Kasus lapangan",
    context:
      "Sinyal ekologis yang dieskalasi dan tertaut ke observasi, klaster anomali, peninjau, dan catatan operasional.",
    loadErrorTitle: "Kasus lapangan tidak dapat dimuat",
    loadErrorDetail:
      "NaLI tidak dapat menjangkau catatan kasus tersimpan. Periksa konektivitas Supabase dan migrasi kasus lapangan.",
    emptyTitle: "Tidak ada kasus lapangan terbuka",
    emptyDetail:
      "Kasus dibuat saat observasi memenuhi aturan eskalasi seperti spesies terancam, klaster anomali berulang, atau tekanan habitat.",
    noRecords: "Tidak ada catatan eskalasi",
    linkedObservations: "Observasi tertaut",
    linkedClusters: "Klaster tertaut",
    noLinkedObservations: "Belum ada observasi tertaut yang tersimpan.",
    noLinkedClusters: "Belum ada klaster tertaut yang tersimpan.",
    notesPending: "Catatan operasional akan muncul setelah pembaruan peninjau atau eskalasi tersimpan.",
  },
  system: {
    eyebrow: "Kesiapan sistem",
    title: "Status rilis operasional",
    context:
      "Pemeriksaan rilis untuk autentikasi, penyimpanan, konfigurasi penyedia, operasi offline, dan peringatan runtime.",
    providerHealth: "Kesehatan penyedia",
    validationCommands: "Perintah validasi produksi",
    knownWarnings: "Peringatan yang diketahui",
    activeLanguage: "Bahasa aktif",
    productionReadiness: "Kesiapan produksi NaLI",
  },
  loading: {
    monitoring: "Memuat pemantauan ekologis regional.",
    alerts: "Memuat peringatan ekologis.",
    cases: "Memuat kasus lapangan.",
    observation: "Memuat catatan observasi.",
  },
  warnings: {
    optionalProviders:
      "Kunci penyedia opsional dapat tetap tidak tersedia sampai integrasi penyedia langsung diaktifkan.",
    healthDegraded:
      "Pemeriksaan kesehatan melaporkan terbatas saat tabel Supabase atau penyimpanan tidak dapat dijangkau runtime.",
    backgroundAnalysis:
      "Analisis observasi berjalan di latar belakang setelah catatan lapangan dibuat; gunakan /api/agent/analyze sebagai cadangan manual jika eksekusi lokal terputus.",
  },
} as const;
