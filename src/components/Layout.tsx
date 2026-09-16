import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true },
  { to: '/trends', label: 'Trends' },
  { to: '/sleep', label: 'Sleep' },
  { to: '/workouts', label: 'Workouts' },
  { to: '/insights', label: 'Insights' },
  { to: '/athletic-level', label: 'Level' },
  { to: '/data', label: 'Data' },
]

function navLinkClass(isActive: boolean) {
  return [
    'shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors',
    isActive ? 'bg-surface-2 font-medium text-ink' : 'font-normal text-ink-muted hover:text-ink',
  ].join(' ')
}

export function Layout() {
  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="sticky top-0 z-10 border-b border-line bg-page">
        <div className="mx-auto flex h-[60px] max-w-[1120px] items-center gap-5 px-4 sm:px-7">
          <span className="flex shrink-0 items-baseline gap-2">
            <span className="text-[17px] font-bold tracking-tight">whoopity</span>
            <span className="inline-block h-[5px] w-[5px] rounded-full bg-accent" />
          </span>
          <nav className="ml-auto flex items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1120px] px-4 py-11 sm:px-7">
        <Outlet />
      </main>
    </div>
  )
}
