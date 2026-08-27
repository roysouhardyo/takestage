'use client'

import { useState } from 'react'
import { Header } from '@/components/ui/Header'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { Stage } from '@/types'

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [stages, setStages] = useState<Stage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/stages?secret=${encodeURIComponent(secret)}`)
      if (!res.ok) {
        setError('Invalid admin secret.')
        return
      }
      const data = await res.json()
      setStages(data.stages)
      setAuthenticated(true)
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  const handleExpireStage = async (id: string) => {
    if (!confirm('Are you sure you want to force expire this stage?')) return
    try {
      const res = await fetch('/api/admin/expire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, stage_id: id }),
      })
      if (res.ok) {
        setStages((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: 'completed' } : s)),
        )
      }
    } catch {
      alert('Failed to expire stage.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-stage-black text-white">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-white mb-6">
          Admin Dashboard
        </h1>

        {!authenticated ? (
          <form onSubmit={handleLogin} className="max-w-md p-6 rounded-2xl bg-stage-card border border-white/5 space-y-4">
            <Input
              label="Admin Secret Key"
              type="password"
              placeholder="Enter ADMIN_SECRET"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              error={error || undefined}
            />
            <Button variant="primary" size="md" fullWidth loading={loading} type="submit">
              Access Dashboard
            </Button>
          </form>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-stage-muted">{stages.length} Total Stages</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-white/5 uppercase text-xxs font-mono text-stage-muted">
                  <tr>
                    <th className="p-3">Brand / Domain</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Payment ID</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stages.map((stage) => (
                    <tr key={stage.id} className="hover:bg-white/2">
                      <td className="p-3 font-semibold text-white">
                        {stage.brand_name || stage.normalized_domain}
                      </td>
                      <td className="p-3 font-mono">{stage.duration_minutes} min</td>
                      <td className="p-3">
                        <Badge label={stage.status} variant={stage.status === 'active' ? 'live' : 'default'} />
                      </td>
                      <td className="p-3 font-mono text-xxs text-stage-muted truncate max-w-xs">
                        {stage.dodo_payment_id || '—'}
                      </td>
                      <td className="p-3 text-right">
                        {stage.status === 'active' && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleExpireStage(stage.id)}
                          >
                            Force Expire
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
