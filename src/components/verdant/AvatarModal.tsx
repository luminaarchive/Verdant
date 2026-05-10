'use client'

import React, { useState, useRef, useCallback } from 'react'
import { X, Upload, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STOCK_AVATARS = [
  'forest','ocean','mountain','river','valley','coral',
  'moss','fern','cedar','amber','dune','tidal',
].map(seed => `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}`)

interface AvatarModalProps {
  userId: string
  currentUrl: string | null
  onClose: () => void
  onUpdate: (url: string) => void
}

export function AvatarModal({ userId, currentUrl, onClose, onUpdate }: AvatarModalProps) {
  const [tab, setTab] = useState<'upload' | 'stock'>('stock')
  const [selected, setSelected] = useState<string | null>(currentUrl)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const compressImage = useCallback((f: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = Math.min(img.width, img.height, 400)
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas not supported'))
        const sx = (img.width - size) / 2
        const sy = (img.height - size) / 2
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size)
        canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Compression failed')), 'image/webp', 0.85)
      }
      img.onerror = reject
      img.src = URL.createObjectURL(f)
    })
  }, [])

  const handleFile = (f: File) => {
    if (f.size > 2 * 1024 * 1024) { setError('Max 2MB'); return }
    if (!['image/jpeg','image/png','image/webp'].includes(f.type)) { setError('JPG, PNG or WebP only'); return }
    setError('')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleConfirm = async () => {
    setUploading(true)
    setError('')
    try {
      const supabase = createClient()
      if (tab === 'upload' && file) {
        const blob = await compressImage(file)
        const path = `${userId}/avatar.webp`
        const { error: upErr } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/webp' })
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
        const url = `${publicUrl}?t=${Date.now()}`
        await supabase.from('user_profiles').update({ avatar_url: url }).eq('id', userId)
        onUpdate(url)
      } else if (tab === 'stock' && selected) {
        await supabase.from('user_profiles').update({ avatar_url: selected }).eq('id', userId)
        onUpdate(selected)
      }
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    }
    setUploading(false)
  }

  const tabStyle = (active: boolean) => ({
    flex: 1, padding: '8px', fontSize: '13px', fontWeight: active ? 600 : 500,
    fontFamily: "'Manrope', sans-serif" as const,
    background: active ? 'var(--bg-surface)' : 'transparent',
    color: active ? 'var(--text-main)' : 'var(--text-muted)',
    border: 'none', borderRadius: '8px', cursor: 'pointer' as const,
    boxShadow: active ? 'var(--shadow-sm)' : 'none',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
      <div className="scale-in" style={{ position: 'relative', width: '100%', maxWidth: '460px', background: 'var(--bg-surface)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', padding: '24px', margin: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="heading-card" style={{ fontSize: '20px', margin: 0 }}>Change Avatar</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--bg-elevated)', borderRadius: '10px', marginBottom: '20px' }}>
          <button onClick={() => setTab('stock')} style={tabStyle(tab === 'stock')}>Stock Avatars</button>
          <button onClick={() => setTab('upload')} style={tabStyle(tab === 'upload')}>Upload Photo</button>
        </div>

        {tab === 'stock' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {STOCK_AVATARS.map(url => (
              <button key={url} onClick={() => { setSelected(url); setFile(null); setPreview(null) }}
                style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', border: selected === url ? '3px solid var(--green-mid)' : '2px solid var(--border)', padding: 0, cursor: 'pointer', overflow: 'hidden', background: 'var(--bg-elevated)', transition: 'all 0.15s', transform: selected === url ? 'scale(1.08)' : 'scale(1)', boxShadow: selected === url ? '0 0 0 3px rgba(46,93,62,0.15)' : 'none' }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden
              onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
            {preview ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <img src={preview} alt="Preview" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green-mid)' }} />
                <button onClick={() => inputRef.current?.click()} className="btn btn-ghost" style={{ fontSize: '12px', height: '32px' }}>Choose different</button>
              </div>
            ) : (
              <button onClick={() => inputRef.current?.click()}
                style={{ width: '100%', padding: '40px 20px', border: '2px dashed var(--border-strong)', borderRadius: '12px', background: 'var(--bg-elevated)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', transition: 'all 0.15s' }}>
                <Upload size={24} />
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: 500 }}>Click to upload or drag photo</span>
                <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: '11px' }}>JPG, PNG, WebP · Max 2MB</span>
              </button>
            )}
          </div>
        )}

        {error && <p style={{ color: 'var(--destructive)', fontSize: '12px', fontFamily: "'Manrope', sans-serif", marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ height: '36px', fontSize: '13px' }}>Cancel</button>
          <button onClick={handleConfirm} disabled={uploading || (tab === 'upload' && !file) || (tab === 'stock' && !selected)}
            className="btn btn-primary" style={{ height: '36px', fontSize: '13px', opacity: uploading ? 0.6 : 1 }}>
            {uploading ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
