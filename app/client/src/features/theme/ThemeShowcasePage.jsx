const brandShades = [
  { label: '500', className: 'bg-brand-500' },
  { label: '600', className: 'bg-brand-600' },
  { label: '700', className: 'bg-brand-700' },
  { label: '800', className: 'bg-brand-800' },
  { label: '900', className: 'bg-brand-900' },
];
const accentShades = [
  { label: '400', className: 'bg-accent-400' },
  { label: '500', className: 'bg-accent-500' },
  { label: '600', className: 'bg-accent-600' },
  { label: '700', className: 'bg-accent-700' },
  { label: '800', className: 'bg-accent-800' },
];
const surfaceTokens = [
  { label: 'base', className: 'bg-surface-base' },
  { label: 'muted', className: 'bg-surface-muted' },
  { label: 'raised', className: 'bg-surface-raised' },
  { label: 'subtle', className: 'bg-surface-subtle' },
];
const feedbackTokens = [
  { label: 'success', className: 'bg-success-500' },
  { label: 'warning', className: 'bg-warning-500' },
  { label: 'info', className: 'bg-info-500' },
  { label: 'danger', className: 'bg-danger-500' },
];

const buttonVariants = [
  { label: 'Primary action', className: 'btn btn--primary' },
  { label: 'Secondary action', className: 'btn btn--accent' },
  { label: 'Surface button', className: 'btn btn--secondary' },
  { label: 'Ghost button', className: 'btn btn--ghost' },
  { label: 'Destructive', className: 'btn btn--danger' },
];

const badgeVariants = [
  { label: 'Info', className: 'badge badge--info' },
  { label: 'Success', className: 'badge badge--success' },
  { label: 'Warning', className: 'badge badge--warning' },
  { label: 'Danger', className: 'badge badge--danger' },
  { label: 'Neutral', className: 'badge badge--neutral' },
];

const timelineItems = [
  {
    title: 'Lesson 1 — Foundations',
    description: 'Overview of Udoy pedagogy and navigation patterns.',
  },
  {
    title: 'Lesson 2 — Component Library',
    description: 'Hands-on with cards, badges, and quizzes.',
  },
];

const sidebarItems = [
  { label: 'Dashboard', active: true },
  { label: 'Assignments', active: false },
  { label: 'Discussions', active: false },
];

const tabItems = [
  { label: 'Overview', active: true },
  { label: 'Curriculum', active: false },
  { label: 'Resources', active: false },
];

const paginationItems = [1, 2, 3];

function ThemeShowcasePage() {
  return (
    <main className="page-container stack-xl">
      <header className="card hero-gradient shadow-raised stack-lg text-balance">
        <div className="stack-sm">
          <span className="badge badge--info w-fit">Udoy central theme</span>
          <h1 className="text-display-lg text-on-surface font-semibold">Design system showcase</h1>
          <p className="text-body-sm text-subdued">
            Each block below uses the Tailwind classes bundled with `app/shared/theme/tailwind.preset.js`. Explore the
            components directly in the client at <code>/theme</code>.
          </p>
        </div>
      </header>

      <section className="stack-lg">
        <div className="card card--muted stack-md">
          <div className="card__header">
            <h2 className="card__title">Foundations</h2>
            <p className="card__subtitle">Brand, accent, neutral, and semantic colors.</p>
          </div>
          <div className="grid-fit-md">
            <div className="card card--inset stack-sm">
              <p className="text-body-sm text-subdued">Brand spectrum</p>
              <div className="grid grid-cols-5 gap-2 text-body-xs text-center">
                {brandShades.map((shade) => (
                  <div key={shade.label} className={`rounded-lg ${shade.className} py-3`}>
                    {shade.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="card card--inset stack-sm">
              <p className="text-body-sm text-subdued">Accent spectrum</p>
              <div className="grid grid-cols-5 gap-2 text-body-xs text-center">
                {accentShades.map((shade) => (
                  <div key={shade.label} className={`rounded-lg ${shade.className} py-3`}>
                    {shade.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="card card--inset stack-sm">
              <p className="text-body-sm text-subdued">Surface tokens</p>
              <div className="grid grid-cols-2 gap-3 text-body-xs text-center">
                {surfaceTokens.map((token) => (
                  <div key={token.label} className={`rounded-lg ${token.className} py-4`}>
                    {token.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="card card--inset stack-sm">
              <p className="text-body-sm text-subdued">Feedback</p>
              <div className="grid grid-cols-4 gap-3 text-body-xs text-center">
                {feedbackTokens.map((token) => (
                  <div key={token.label} className={`rounded-lg ${token.className} py-3`}>
                    {token.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stack-lg">
        <div className="card card--muted stack-md">
          <div className="card__header">
            <h2 className="card__title">Typography</h2>
            <p className="card__subtitle">Display, heading, and body scales.</p>
          </div>
          <div className="stack-md">
            <p className="text-display-lg text-on-surface font-semibold">Display Large — Learning that feels premium.</p>
            <p className="text-heading-lg text-on-surface font-semibold">Heading Large — Instructor insights</p>
            <p className="text-heading-sm text-on-surface font-semibold">Heading Small — Module overview</p>
            <p className="text-body-base text-subdued">
              Body Base — Course descriptions, announcements, and discussion replies rely on this default body style with
              comfortable line-height for long-form reading.
            </p>
            <p className="text-body-sm text-subdued">Body Small — Secondary metadata, captions, and helper text.</p>
            <p className="text-body-xs text-subdued uppercase">Body Extra Small — Tags, counters, and UI chrome.</p>
          </div>
        </div>
      </section>

      <section className="stack-lg">
        <div className="card card--muted stack-md">
          <div className="card__header">
            <h2 className="card__title">Buttons &amp; Tags</h2>
            <p className="card__subtitle">Primary CTAs and supporting actions.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            {buttonVariants.map((variant) => (
              <button key={variant.label} type="button" className={variant.className}>
                {variant.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {badgeVariants.map((variant) => (
              <span key={variant.label} className={variant.className}>
                {variant.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="stack-lg">
        <div className="card card--muted stack-md">
          <div className="card__header">
            <h2 className="card__title">Forms</h2>
            <p className="card__subtitle">Inputs, selects, alerts, and helper text.</p>
          </div>
          <form className="stack-md max-w-content-sm">
            <label className="field" htmlFor="theme-preview-email">
              <span className="field__label">Email address</span>
              <input id="theme-preview-email" type="email" className="input" placeholder="mentor@udoy.academy" />
              <span className="field__hint">We will never share your email.</span>
            </label>
            <label className="field" htmlFor="theme-preview-select">
              <span className="field__label">Course type</span>
              <select id="theme-preview-select" className="select" defaultValue="Self-paced">
                <option>Self-paced</option>
                <option>Instructor-led</option>
                <option>Bootcamp</option>
              </select>
            </label>
            <div className="alert alert--info">
              <p className="text-body-sm text-on-surface">
                Use <code>alert--success</code>, <code>alert--warning</code>, or <code>alert--danger</code> for status messaging.
              </p>
            </div>
          </form>
        </div>
      </section>

      <section className="stack-lg">
        <div className="card card--muted stack-md">
          <div className="card__header">
            <h2 className="card__title">Cards &amp; LMS Patterns</h2>
            <p className="card__subtitle">Reusable building blocks for the learning experience.</p>
          </div>
          <div className="grid-fit-md">
            <article className="course-card">
              <header className="card__header">
                <span className="badge badge--info">Course</span>
                <h3 className="card__title">Design Systems Mastery</h3>
                <p className="card__subtitle">12 lessons • Updated 2 days ago</p>
              </header>
              <div className="progress-bar">
                <div className="progress-bar__value" style={{ width: '65%' }} />
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" className="btn btn--primary btn--sm">
                  Continue
                </button>
                <button type="button" className="btn btn--ghost btn--sm">
                  Syllabus
                </button>
              </div>
            </article>

            <div className="lesson-module stack-md">
              <div className="stack-sm">
                <h3 className="card__title">Module outline</h3>
                <p className="card__subtitle">Students progress through each lesson in sequence.</p>
              </div>
              <div className="timeline">
                {timelineItems.map((item) => (
                  <div key={item.title} className="timeline__item">
                    <h4 className="text-heading-sm text-on-surface">{item.title}</h4>
                    <p className="text-body-sm text-subdued">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="discussion-thread">
              <header className="flex items-center gap-3">
                <span className="profile-avatar">AR</span>
                <div className="stack-sm">
                  <p className="text-body-base text-on-surface font-semibold">Anita Rao</p>
                  <p className="text-body-xs text-subdued">Mentor • 5 minutes ago</p>
                </div>
              </header>
              <div className="discussion-thread__message">
                <p className="text-body-base text-on-surface">
                  Remember to use the shared <code>btn</code> and <code>card</code> classes so new features automatically adopt
                  refreshed branding.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="badge badge--neutral">#design</span>
                  <span className="badge badge--neutral">#coaching</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stack-lg">
        <div className="card card--muted stack-md">
          <div className="card__header">
            <h2 className="card__title">Navigation &amp; Feedback</h2>
            <p className="card__subtitle">Navbar, sidebar, tabs, pagination, and toasts.</p>
          </div>
          <nav className="navbar card--inset">
            <div className="navbar__brand">
              <span className="profile-avatar">U</span>
              <span className="text-body-base text-on-surface font-semibold">Udoy LMS</span>
            </div>
            <div className="navbar__menu">
              <button type="button" className="btn btn--ghost btn--sm">
                Courses
              </button>
              <button type="button" className="btn btn--ghost btn--sm">
                Schedule
              </button>
              <button type="button" className="btn btn--accent btn--sm">
                Launch class
              </button>
            </div>
          </nav>
          <div className="flex flex-wrap gap-6">
            <aside className="sidebar max-w-sm">
              <div className="sidebar__section">
                <span className="text-body-xs text-subdued uppercase">Navigation</span>
                {sidebarItems.map((item) => (
                  <a
                    key={item.label}
                    href="#"
                    className={`sidebar__item${item.active ? ' sidebar__item--active' : ''}`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </aside>
            <div className="stack-md flex-1 min-w-[18rem]">
              <div className="tabs">
                {tabItems.map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    className={`tab${tab.active ? ' tab--active' : ''}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="pagination">
                {paginationItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`pagination__item${item === 2 ? ' pagination__item--active' : ''}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="toast">
                <p className="text-body-sm text-on-surface">
                  Saved! Learners will see the new course card immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ThemeShowcasePage;
