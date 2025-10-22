import { useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ScrollArea,
  Separator,
} from '@components/ui';
import { LucideIcon } from '@icons';
import { cn } from '@/lib/utils';

function DashboardHeader({ user, navItems, onSignOut }) {
  const userInitials = useMemo(() => {
    if (!user) {
      return '';
    }

    const initials = [user.firstName, user.lastName]
      .filter(Boolean)
      .map((part) => part.charAt(0)?.toUpperCase())
      .join('');

    if (initials) {
      return initials;
    }

    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return '';
  }, [user]);

  return (
    <header className="border-b border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 border-border/70 text-muted-foreground hover:border-border hover:text-foreground lg:hidden"
              >
                <LucideIcon name="Menu" size="sm" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                Quick navigation
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navItems.map((item) => (
                <DropdownMenuItem key={item.to} asChild>
                  <Link to={item.to} className="flex items-center gap-2">
                    <LucideIcon name={item.icon} size="sm" className="text-muted-foreground" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            to="/dashboard"
            className="group inline-flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            <span className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Udoy</span>
            <span className="text-[10px] uppercase tracking-[0.45em] text-muted-foreground sm:text-xs">
              Emerge, Rise, Thrive
            </span>
          </Link>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground lg:inline">
              You are signed in as
            </span>
            <span className="text-sm font-semibold text-foreground">
              {user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user?.email ?? 'Guest'}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-semibold uppercase text-primary">
                  {userInitials || 'U'}
                </span>
                <LucideIcon name="ChevronDown" size="sm" className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center gap-2">
                  <LucideIcon name="UserRound" size="sm" className="text-muted-foreground" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/topics" className="flex items-center gap-2">
                  <LucideIcon name="BookOpen" size="sm" className="text-muted-foreground" />
                  Learning library
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onSignOut} className="text-destructive focus:text-destructive">
                <LucideIcon name="LogOut" size="sm" className="text-destructive" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function DashboardSidebar({ navItems }) {
  return (
    <aside className="hidden w-72 flex-col border-r border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60 lg:flex">
      <div className="flex h-16 items-center border-b border-border/60 px-6">
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">Navigate</span>
      </div>
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-border/80 hover:bg-muted/40 hover:text-foreground',
                  isActive && 'border-primary/60 bg-primary/5 text-foreground'
                )
              }
            >
              <LucideIcon name={item.icon} size="sm" className="text-muted-foreground" />
              <span>{item.label}</span>
              {item.badge ? (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      <div className="border-t border-border/60 px-6 py-4 text-xs text-muted-foreground">
        <p>Need help? Email <a href="mailto:support@udoy.in" className="font-semibold text-primary">support@udoy.in</a>.</p>
      </div>
    </aside>
  );
}

function DashboardFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex flex-col gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>© {new Date().getFullYear()} Udoy Platform. All rights reserved.</span>
        <div className="flex flex-wrap items-center gap-3">
          <a href="/docs/roadmap" className="hover:text-foreground">Roadmap</a>
          <Separator orientation="vertical" className="hidden h-4 bg-border sm:inline" />
          <a href="mailto:support@udoy.in" className="hover:text-foreground">
            Contact support
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function DashboardLayout({ user, navItems, onSignOut, children }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col lg:flex-row">
        <DashboardSidebar navItems={navItems} />
        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardHeader user={user} navItems={navItems} onSignOut={onSignOut} />
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}
