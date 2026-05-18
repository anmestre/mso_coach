import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { SquadPage } from './pages/SquadPage'
import { PlayerProfilePage } from './pages/PlayerProfilePage'
import { PlayerFormPage } from './pages/PlayerFormPage'
import { TrainingPage } from './pages/TrainingPage'
import { CalendarPage } from './pages/CalendarPage'
import { GameFormPage } from './pages/GameFormPage'
import { GameDetailPage } from './pages/GameDetailPage'
import { MatchDayPage } from './pages/MatchDayPage'
import { OpponentsPage } from './pages/OpponentsPage'
import { StatsPage } from './pages/StatsPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/squad" element={<SquadPage />} />
          <Route path="/squad/new" element={<PlayerFormPage />} />
          <Route path="/squad/:id" element={<PlayerProfilePage />} />
          <Route path="/squad/:id/edit" element={<PlayerFormPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/calendar/new" element={<GameFormPage />} />
          <Route path="/games/:id" element={<GameDetailPage />} />
          <Route path="/games/:id/matchday" element={<MatchDayPage />} />
          <Route path="/games/:id/edit" element={<GameFormPage />} />
          <Route path="/matchday" element={<Navigate to="/calendar" replace />} />
          <Route path="/opponents" element={<OpponentsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
