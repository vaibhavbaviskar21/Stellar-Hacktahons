"use client"

import React, { useState } from 'react'

export default function UploadResume() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [cid, setCid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!file) return
    setLoading(true)
    setError(null)
    setCid(null)
    try {
      const backend = (process.env.NEXT_PUBLIC_BACKEND_URL as string) || 'http://localhost:4000'
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${backend}/upload-ipfs`, { method: 'POST', body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || `Upload failed: ${res.status}`)
      }
      const j = await res.json()
      if (!j.ok) throw new Error(j?.error || 'upload failed')
      setCid(j.cid || null)
    } catch (e: any) {
      setError(e?.message || String(e))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div className="flex items-center gap-2">
        <button disabled={!file || loading} onClick={submit} className="btn bg-primary text-white px-3 py-1">
          {loading ? 'Uploading...' : 'Upload to IPFS'}
        </button>
        {cid && (
          <a href={`https://dweb.link/ipfs/${cid}`} target="_blank" rel="noreferrer" className="text-sm text-primary">
            View on IPFS
          </a>
        )}
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  )
}
