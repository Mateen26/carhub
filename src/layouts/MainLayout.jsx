import { Outlet } from 'react-router-dom'

import Header from '../components/Header'

const MainLayout = ({ children }) => (
  <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground transition-colors">
    <div className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-secondary/10 dark:from-primary/5 dark:via-transparent dark:to-secondary/5" />
    </div>
    <Header className="print:hidden" />
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 print:hidden sm:px-6 lg:px-8">
      {children ?? <Outlet />}
    </main>
  </div>
)

export default MainLayout

