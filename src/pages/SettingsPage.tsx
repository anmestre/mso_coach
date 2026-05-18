import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Save, Database, Info, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAppStore } from '../stores/useAppStore'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

export function SettingsPage() {
  const { currentSeason, players, games } = useAppStore()
  const [clubName, setClubName] = useState('MSO Coach')

  function handleSave() {
    toast.success('Settings saved!')
  }

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white'
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1'

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure your club and app settings</p>
      </div>

      {/* Club Settings */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-green-600" />
          <h3 className="font-semibold text-slate-700">Club Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Club Name</label>
            <input
              type="text"
              value={clubName}
              onChange={e => setClubName(e.target.value)}
              className={inputClass}
              placeholder="Your club name"
            />
          </div>
          <Button onClick={handleSave}>
            <Save size={16} />
            Save Settings
          </Button>
        </div>
      </Card>

      {/* Current Season */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Info size={18} className="text-blue-500" />
          <h3 className="font-semibold text-slate-700">Current Season</h3>
        </div>
        <dl className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <dt className="text-slate-500">Season</dt>
            <dd className="font-semibold text-slate-800">{currentSeason.name}</dd>
          </div>
          <div className="flex justify-between items-center text-sm">
            <dt className="text-slate-500">Period</dt>
            <dd className="font-medium text-slate-700">
              {format(parseISO(currentSeason.start_date), 'd MMM yyyy')} –{' '}
              {format(parseISO(currentSeason.end_date), 'd MMM yyyy')}
            </dd>
          </div>
          <div className="flex justify-between items-center text-sm">
            <dt className="text-slate-500">Status</dt>
            <dd>
              <Badge variant={currentSeason.is_current ? 'success' : 'neutral'}>
                {currentSeason.is_current ? 'Active' : 'Inactive'}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between items-start text-sm">
            <dt className="text-slate-500">Competitions</dt>
            <dd className="flex flex-wrap gap-1 justify-end max-w-[200px]">
              {currentSeason.competitions.map(comp => (
                <Badge key={comp} variant="info" className="text-xs">{comp}</Badge>
              ))}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Data Summary */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Database size={18} className="text-slate-500" />
          <h3 className="font-semibold text-slate-700">Data Summary</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-slate-800">{players.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Players</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-slate-800">{games.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Games</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-slate-800">
              {games.filter(g => g.status === 'completed').length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Completed</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-slate-800">
              {games.filter(g => g.status === 'scheduled').length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Scheduled</p>
          </div>
        </div>
      </Card>

      {/* Supabase Connection */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Database size={18} className="text-amber-500" />
          <h3 className="font-semibold text-slate-700">Database Connection</h3>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <p className="font-medium mb-1">Running in Demo Mode</p>
          <p>
            This app is currently using in-memory data. To persist data with Supabase, add your{' '}
            <code className="bg-amber-100 px-1 rounded font-mono text-xs">VITE_SUPABASE_URL</code> and{' '}
            <code className="bg-amber-100 px-1 rounded font-mono text-xs">VITE_SUPABASE_ANON_KEY</code>{' '}
            environment variables.
          </p>
        </div>
        <dl className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">VITE_SUPABASE_URL</dt>
            <dd>
              <Badge variant={import.meta.env.VITE_SUPABASE_URL ? 'success' : 'warning'}>
                {import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Not set'}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between text-sm">
            <dt className="text-slate-500">VITE_SUPABASE_ANON_KEY</dt>
            <dd>
              <Badge variant={import.meta.env.VITE_SUPABASE_ANON_KEY ? 'success' : 'warning'}>
                {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Not set'}
              </Badge>
            </dd>
          </div>
        </dl>
      </Card>

      {/* App info */}
      <Card className="p-4">
        <h3 className="font-semibold text-slate-700 mb-3">About</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">App</dt>
            <dd className="font-medium text-slate-700">MSO Coach</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Phase</dt>
            <dd className="font-medium text-slate-700">Phase 1 MVP</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Version</dt>
            <dd className="font-medium text-slate-700">0.1.0</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
