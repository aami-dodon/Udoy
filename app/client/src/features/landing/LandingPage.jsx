const navLinks = [
  { label: 'Overview', href: '#overview' },
  { label: 'Pillars', href: '#pillars' },
  { label: 'Ecosystem', href: '#ecosystem' },
  { label: 'Cycle', href: '#cycle' },
  { label: 'Stories', href: '#stories' },
  { label: 'Sponsor impact', href: '#sponsors' },
  { label: 'Join', href: '#join' },
];

const heroHighlights = [
  {
    title: 'Curriculum tuned to 2025',
    description:
      'Adaptive playlists and maker projects that deliver the most relevant knowledge for the world children will inherit.',
  },
  {
    title: 'Learning that feels hands-on',
    description:
      'Kits, labs, and offline-friendly tools keep curiosity alive even when bandwidth is low or resources feel scarce.',
  },
  {
    title: 'Mentors beside every learner',
    description:
      'Experienced coaches, validators, and alumni guide each step so young minds feel seen, safe, and supported.',
  },
];

const learningPillars = [
  {
    title: 'Rooted in local realities',
    description:
      'We co-create lessons with community educators so every concept respects culture, language, and lived experiences.',
  },
  {
    title: 'Powered by shared ownership',
    description:
      'Former learners, parents, mentors, and sponsors collaborate through transparent dashboards to keep progress visible.',
  },
  {
    title: 'Designed for joyful focus',
    description:
      'A light, breathable interface, calm typography, and natural greens invite learners to stay longer and explore deeper.',
  },
];

const impactStats = [
  {
    label: 'Learners empowered',
    value: '18K+',
    detail: 'Students who now pursue science, arts, and life-skills with renewed self-belief.',
  },
  {
    label: 'Creator homes',
    value: '1.2K',
    detail: 'Former students crafting rich lessons and projects from within their own communities.',
  },
  {
    label: 'Mentor network',
    value: '850+',
    detail: 'Coaches and retired teachers guiding every learner with empathy and rigor.',
  },
  {
    label: 'Sponsor transparency',
    value: '100%',
    detail: 'Every token is trackable, from contribution to the moment a learner earns it.',
  },
];

const ecosystemRoles = [
  {
    title: 'Students',
    description:
      'Access immersive courses, build resilient learning habits, and earn tokens for progress and perseverance.',
  },
  {
    title: 'Content creators',
    description:
      'Design multimedia lessons, quizzes, and challenges that mirror real classroom needs and spark imagination.',
  },
  {
    title: 'Validators',
    description:
      'Experienced educators who review every learning artifact to guarantee accuracy, safety, and inclusivity.',
  },
  {
    title: 'Coaches',
    description:
      'Mentors who assemble courses, monitor progress, and champion every breakthrough moment.',
  },
  {
    title: 'Sponsors',
    description:
      'Change-makers funding tokens that reward achievements while enjoying full visibility into the impact they create.',
  },
  {
    title: 'Admins',
    description:
      'Stewards of data, compliance, and platform health who keep every Udoy experience safe and thriving.',
  },
];

const growthCycle = [
  {
    title: 'Ignite curiosity',
    description:
      'Learners explore adaptive lessons built for low bandwidth environments and diverse learning styles.',
  },
  {
    title: 'Create and validate',
    description:
      'Former students produce content from home while retired teachers fine-tune each module for classroom excellence.',
  },
  {
    title: 'Coach and celebrate',
    description:
      'Mentors guide reflection, award credits, and surface personalised pathways that fuel momentum.',
  },
  {
    title: 'Sponsor the rise',
    description:
      'Credits flow transparently to learners the moment achievements are confirmed, inspiring a new cycle of growth.',
  },
];

const testimonials = [
  {
    quote:
      'Udoy gives my classroom the freedom to dream bigger. Lessons arrive ready, relevant, and rooted in empathy.',
    name: 'Nalini Rao',
    role: 'Retired science teacher & validator',
  },
  {
    quote:
      'Tracking how every token powers a learner’s breakthrough makes sponsoring Udoy the most meaningful investment I have made.',
    name: 'Karthik Mehra',
    role: 'Sponsor & community advocate',
  },
  {
    quote:
      'I built my first robotics project here. Now I create new challenges so other kids can feel that same spark.',
    name: 'Rhea Thomas',
    role: 'Former learner, now content creator',
  },
];

const sponsorBenefits = [
  {
    title: 'Transparent credit flow',
    description: 'Track every credit from donation to student milestone with verifiable, privacy-safe reporting.',
  },
  {
    title: 'Celebrate achievements',
    description: 'Receive stories, artefacts, and progress celebrations from the learners you champion.',
  },
  {
    title: 'Invest in communities',
    description: 'Help students become future creators, validators, and coaches—fueling the cycle for years to come.',
  },
];

const faqs = [
  {
    question: 'Who can join Udoy as a learner?',
    answer:
      'Any student between the ages of 10 and 18 who needs access to future-ready learning can apply with the help of a guardian or community partner.',
  },
  {
    question: 'How are the lessons created and verified?',
    answer:
      'Former Udoy learners design modules from their homes. Every resource then passes through experienced, retired teachers who validate accuracy and inclusivity.',
  },
  {
    question: 'What visibility do sponsors receive?',
    answer:
      'Sponsors see learner goals, credits awarded, and milestone stories through a transparent dashboard that respects student privacy.',
  },
  {
    question: 'Can I contribute as a volunteer coach?',
    answer:
      'Absolutely. Coaches mentor weekly cohorts, facilitate projects, and help learners reflect on progress with support from our training team.',
  },
];

function LandingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-surface-base text-on-surface">
      <header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-surface-raised/95 backdrop-blur-md" id="top">
        <div className="mx-auto flex w-full max-w-page items-center justify-between gap-6 px-5 py-5 md:px-8">
          <a href="#overview" className="flex items-center gap-3 text-heading-sm font-semibold text-brand-700">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-heading-sm font-semibold uppercase tracking-[0.18em] text-brand-700 shadow-soft">
              U
            </span>
            <span className="flex flex-col">
              <span>Udoy</span>
              <span className="text-body-xs text-subdued">Emerge · Rise · Thrive</span>
            </span>
          </a>
          <nav className="hidden lg:flex items-center gap-6 text-body-sm text-subdued">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-brand-700">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <button type="button" className="btn btn--ghost btn--sm" aria-label="Login">
              Login
            </button>
            <button type="button" className="btn btn--primary btn--sm">
              Register
            </button>
          </div>
          <div className="sm:hidden">
            <a href="#join" className="btn btn--primary btn--sm">
              Join Udoy
            </a>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-24 pb-32">
        <section className="page-container" id="overview">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-neutral-200 bg-surface-raised p-10 shadow-soft">
            <div className="absolute inset-0 -z-10 rounded-[2.75rem] bg-gradient-to-br from-brand-50 via-surface-raised to-accent-50" />
            <div className="absolute -top-24 -right-20 h-80 w-80 rounded-full bg-brand-100/60 blur-3xl" aria-hidden="true" />
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
              <div className="stack-xl text-pretty">
                <span className="badge badge--info w-fit">A natural launchpad for talent</span>
                <h1 className="text-display-xl font-semibold text-on-surface">
                  Help underprivileged children rise with future-ready learning
                </h1>
                <p className="max-w-readable text-body-lg text-subdued">
                  Udoy blends 2025-ready knowledge, joyful experimentation, and a circle of mentors who champion every learner. Sponsors see impact in real time, creators craft lessons from their homes, and coaches keep curiosity burning bright.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <a href="#join" className="btn btn--primary btn--lg">
                    Explore Udoy
                  </a>
                  <a href="#sponsors" className="btn btn--accent btn--lg">
                    Sponsor a cohort
                  </a>
                  <button type="button" className="btn btn--ghost btn--lg" aria-label="Login">
                    Login to your space
                  </button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {heroHighlights.map((item) => (
                    <article key={item.title} className="stack-sm rounded-2xl border border-neutral-200 bg-surface-subtle p-6 shadow-soft">
                      <h2 className="text-heading-sm font-semibold text-on-surface">{item.title}</h2>
                      <p className="text-body-sm text-subdued">{item.description}</p>
                    </article>
                  ))}
                </div>
              </div>
              <div className="stack-lg">
                <div className="stack-md rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50 via-surface-raised to-accent-50 p-8 shadow-soft">
                  <h2 className="text-heading-lg font-semibold text-on-surface">Impact you can trace</h2>
                  <p className="text-body-sm text-subdued max-w-readable">
                    Every learner’s growth is logged through thoughtful reflections, mentor inputs, and sponsor dashboards that celebrate each milestone.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {impactStats.map((stat) => (
                      <article key={stat.label} className="stack-sm rounded-2xl border border-neutral-200 bg-surface-raised p-5 shadow-soft">
                        <span className="text-eyebrow text-brand-600 uppercase tracking-[0.28em]">{stat.label}</span>
                        <p className="text-heading-xl font-semibold text-on-surface">{stat.value}</p>
                        <p className="text-body-xs text-subdued">{stat.detail}</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="stack-sm rounded-3xl border border-neutral-200 bg-surface-subtle p-6 shadow-soft">
                  <h3 className="text-heading-sm font-semibold text-on-surface">An interface made to breathe</h3>
                  <p className="text-body-sm text-subdued">
                    The refreshed light theme bathes every screen in gentle greens, warm neutrals, and airy spacing—keeping focus on the content and the child engaging with it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-container stack-xl" id="pillars">
          <header className="stack-md max-w-readable">
            <span className="badge badge--neutral w-fit">The Udoy promise</span>
            <h2 className="text-display-lg font-semibold text-on-surface">Our learning environment is light, calm, and trusted</h2>
            <p className="text-body-base text-subdued">
              Each pillar anchors the new visual identity—earthy greens, natural light, and typography that feels both elegant and approachable.
            </p>
          </header>
          <div className="grid gap-6 lg:grid-cols-3">
            {learningPillars.map((pillar) => (
              <article key={pillar.title} className="stack-md rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-soft">
                <h3 className="text-heading-md font-semibold text-on-surface">{pillar.title}</h3>
                <p className="text-body-sm text-subdued">{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-container stack-xl" id="ecosystem">
          <header className="stack-md max-w-readable">
            <span className="badge badge--neutral w-fit">A thriving learning ecosystem</span>
            <h2 className="text-display-lg font-semibold text-on-surface">Everyone has a role in the Udoy movement</h2>
            <p className="text-body-base text-subdued">
              Udoy unites students, educators, mentors, and sponsors in a transparent cycle of growth. Together we create, validate, coach, and fund every step so learners stay inspired and supported.
            </p>
          </header>
          <div className="grid-fit-md">
            {ecosystemRoles.map((role) => (
              <article
                key={role.title}
                className="stack-sm rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-soft transition-transform duration-200 hover:-translate-y-1"
              >
                <h3 className="text-heading-md font-semibold text-on-surface">{role.title}</h3>
                <p className="text-body-sm text-subdued">{role.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-container stack-xl" id="cycle">
          <header className="stack-md max-w-readable">
            <span className="badge badge--info w-fit">Learning without limits</span>
            <h2 className="text-display-lg font-semibold text-on-surface">A regenerative cycle that keeps giving back</h2>
            <p className="text-body-base text-subdued">
              Udoy’s circular model ensures that every learner who rises returns as a guide, creator, or sponsor, amplifying the impact for future cohorts.
            </p>
          </header>
          <div className="grid gap-6 lg:grid-cols-4">
            {growthCycle.map((step, index) => (
              <article
                key={step.title}
                className="stack-sm rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-soft"
              >
                <span className="badge badge--success w-fit">Step {index + 1}</span>
                <h3 className="text-heading-sm font-semibold text-on-surface">{step.title}</h3>
                <p className="text-body-sm text-subdued">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-container stack-xl" id="stories">
          <header className="stack-md max-w-readable">
            <span className="badge badge--warning w-fit">Stories of emergence</span>
            <h2 className="text-display-lg font-semibold text-on-surface">Voices from the Udoy community</h2>
            <p className="text-body-base text-subdued">
              From classrooms and creator studios to sponsor circles, the Udoy network believes in possibility. These are the voices that remind us why the mission matters.
            </p>
          </header>
          <div className="grid-fit-md">
            {testimonials.map((item) => (
              <blockquote
                key={item.name}
                className="stack-md rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-soft text-pretty"
              >
                <p className="text-body-lg text-on-surface">“{item.quote}”</p>
                <footer className="stack-sm">
                  <p className="text-body-sm font-semibold text-on-surface">{item.name}</p>
                  <p className="text-body-xs text-subdued">{item.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="page-container stack-xl" id="sponsors">
          <div className="stack-lg rounded-[2.25rem] border border-brand-200 bg-gradient-to-br from-brand-50 via-surface-raised to-accent-50 p-10 shadow-soft">
            <header className="stack-sm max-w-readable">
              <span className="badge badge--neutral w-fit">Sponsor impact</span>
              <h2 className="text-display-lg font-semibold text-on-surface">Fuel transformations you can see</h2>
              <p className="text-body-base text-subdued">
                Sponsor contributions become tokens that learners earn for measurable progress. Real-time dashboards reveal the lives you touch, the goals they conquer, and the passions you help ignite.
              </p>
            </header>
            <ul className="grid gap-5 lg:grid-cols-3">
              {sponsorBenefits.map((benefit) => (
                <li key={benefit.title} className="stack-sm rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-soft">
                  <h3 className="text-heading-sm font-semibold text-on-surface">{benefit.title}</h3>
                  <p className="text-body-sm text-subdued">{benefit.description}</p>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#join" className="btn btn--primary btn--lg">
                Sponsor the rise
              </a>
              <a href="#stories" className="btn btn--ghost btn--lg">
                Explore community stories
              </a>
            </div>
          </div>
        </section>

        <section className="page-container stack-xl" id="faqs">
          <header className="stack-md max-w-readable">
            <span className="badge badge--neutral w-fit">Questions & clarity</span>
            <h2 className="text-display-lg font-semibold text-on-surface">Everything you need to know to get started</h2>
            <p className="text-body-base text-subdued">
              The Udoy experience is intentionally transparent—from how we onboard learners to how every contribution is recorded.
            </p>
          </header>
          <div className="grid gap-4">
            {faqs.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-neutral-200 bg-surface-raised p-6 shadow-soft">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-heading-sm font-semibold text-on-surface">
                  {item.question}
                  <span className="text-body-lg text-brand-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-body-sm text-subdued">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="page-container" id="join">
          <div className="stack-lg rounded-[2rem] border border-neutral-200 bg-surface-raised p-10 shadow-soft lg:flex lg:items-center lg:justify-between lg:gap-10">
            <div className="stack-md max-w-readable">
              <span className="badge badge--success w-fit">Join the mission</span>
              <h2 className="text-display-lg font-semibold text-on-surface">Ready to help a learner take flight?</h2>
              <p className="text-body-base text-subdued">
                Whether you are learning, creating, coaching, or sponsoring, Udoy welcomes you into an ecosystem built on hope, discipline, and radical transparency.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <button type="button" className="btn btn--primary btn--lg">
                Register as a learner
              </button>
              <button type="button" className="btn btn--accent btn--lg">
                Sign up as a sponsor
              </button>
              <button type="button" className="btn btn--ghost btn--lg">
                Volunteer as a coach
              </button>
              <button type="button" className="btn btn--secondary btn--lg">
                Explore creator opportunities
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-surface-raised">
        <div className="mx-auto flex w-full max-w-page flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <a href="#overview" className="flex items-center gap-3 text-heading-sm font-semibold text-brand-700">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-body-lg font-semibold uppercase tracking-[0.18em] text-brand-700 shadow-soft">
              U
            </span>
            <span className="flex flex-col">
              <span>Udoy</span>
              <span className="text-body-xs text-subdued">Emerge · Rise · Thrive</span>
            </span>
          </a>
          <p className="text-body-sm text-subdued">© {currentYear} Udoy. Building brighter futures together.</p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#top" className="btn btn--ghost btn--sm">
              Back to top
            </a>
            <button type="button" className="btn btn--primary btn--sm">
              Register now
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
