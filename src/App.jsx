import { Navigate, Route, Routes } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import InspectionForm from './pages/InspectionForm'

const App = () => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Navigate to="/inspection" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="inspection" element={<InspectionForm />} />
    </Route>
    <Route path="*" element={<Navigate to="/inspection" replace />} />
  </Routes>
)

export default App
