const missionHighlights = [
  {
    title: '2025-ready learning journeys',
    description:
      'Carefully sequenced subjects and life-skills content designed for curious young minds to outpace the world of tomorrow.',
  },
  {
    title: 'Tools that invite experimentation',
    description:
      'Interactive labs, maker activities, and reflective journals that transform curiosity into confidence and lasting mastery.',
  },
  {
    title: 'A circle of mentors and cheerleaders',
    description:
      'Coaches walk beside every learner, helping them discover passions, conquer challenges, and celebrate each milestone.',
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

function LandingPage() {
  return (
    <main className="flex flex-col gap-26 pb-30">
      <section className="page-container" id="hero">
        <div className="card hero-gradient relative overflow-hidden shadow-raised border border-neutral-800/60">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
            <div className="stack-lg text-pretty">
              <span className="badge badge--info w-fit">Emerge · Rise · Thrive</span>
              <h1 className="text-display-xl font-semibold text-on-surface">
                A launchpad where underprivileged children outshine expectations
              </h1>
              <p className="text-body-lg text-subdued max-w-readable">
                Udoy ignites possibility through 2025-ready learning, advanced tools, and a nurturing ecosystem that connects
                creators, validators, coaches, and sponsors. Every achievement is celebrated, every contribution is visible,
                and every learner finds the courage to lead their own story.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <a href="#join" className="btn btn--primary btn--lg">
                  Start your Udoy journey
                </a>
                <a href="#sponsors" className="btn btn--accent btn--lg">
                  Become a sponsor
                </a>
                <button type="button" className="btn btn--ghost btn--lg text-on-surface" aria-label="Login">
                  Login
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {missionHighlights.map((item) => (
                  <article key={item.title} className="card card--muted stack-sm">
                    <h2 className="text-heading-sm text-on-surface font-semibold">{item.title}</h2>
                    <p className="text-body-sm text-subdued">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="card card--inset stack-lg backdrop-blur-panel">
              <h2 className="text-heading-lg font-semibold text-on-surface">Impact ripples across the Udoy ecosystem</h2>
              <p className="text-body-sm text-subdued">
                Every action powers the next generation—from creators shaping lessons to sponsors funding the sparks of
                discovery.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {impactStats.map((stat) => (
                  <div key={stat.label} className="card card--muted stack-sm">
                    <span className="text-eyebrow text-accent uppercase tracking-[0.3em]">{stat.label}</span>
                    <p className="text-heading-xl font-semibold text-on-surface">{stat.value}</p>
                    <p className="text-body-xs text-subdued">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container stack-xl" id="ecosystem">
        <header className="stack-md max-w-readable">
          <span className="badge badge--neutral w-fit">A thriving learning ecosystem</span>
          <h2 className="text-display-lg text-on-surface font-semibold">Everyone has a role in the Udoy movement</h2>
          <p className="text-body-base text-subdued">
            Udoy unites students, educators, mentors, and sponsors in a transparent cycle of growth. Together we create,
            validate, coach, and fund every step so learners stay inspired and supported.
          </p>
        </header>
        <div className="grid-fit-md">
          {ecosystemRoles.map((role) => (
            <article key={role.title} className="card card--muted stack-sm">
              <h3 className="text-heading-md text-on-surface font-semibold">{role.title}</h3>
              <p className="text-body-sm text-subdued">{role.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-container stack-xl" id="cycle">
        <header className="stack-md max-w-readable">
          <span className="badge badge--info w-fit">Learning without limits</span>
          <h2 className="text-display-lg text-on-surface font-semibold">A regenerative cycle that keeps giving back</h2>
          <p className="text-body-base text-subdued">
            Udoy’s circular model ensures that every learner who rises returns as a guide, creator, or sponsor, amplifying the
            impact for future cohorts.
          </p>
        </header>
        <div className="grid gap-6 lg:grid-cols-4">
          {growthCycle.map((step, index) => (
            <article key={step.title} className="card card--inset stack-sm">
              <span className="badge badge--success w-fit">Step {index + 1}</span>
              <h3 className="text-heading-sm text-on-surface font-semibold">{step.title}</h3>
              <p className="text-body-sm text-subdued">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-container stack-xl" id="stories">
        <header className="stack-md max-w-readable">
          <span className="badge badge--warning w-fit">Stories of emergence</span>
          <h2 className="text-display-lg text-on-surface font-semibold">Voices from the Udoy community</h2>
          <p className="text-body-base text-subdued">
            From classrooms and creator studios to sponsor circles, the Udoy network believes in possibility. These are the
            voices that remind us why the mission matters.
          </p>
        </header>
        <div className="grid-fit-md">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="card card--muted stack-md text-pretty">
              <p className="text-body-lg text-on-surface">“{item.quote}”</p>
              <footer className="stack-sm">
                <p className="text-body-sm text-on-surface font-semibold">{item.name}</p>
                <p className="text-body-xs text-subdued">{item.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="page-container stack-xl" id="sponsors">
        <div className="card card--brand stack-lg">
          <header className="stack-sm max-w-readable">
            <span className="badge badge--neutral w-fit">Sponsor impact</span>
            <h2 className="text-display-lg text-on-surface font-semibold">Fuel transformations you can see</h2>
            <p className="text-body-base text-subdued">
              Sponsor contributions become tokens that learners earn for measurable progress. Real-time dashboards reveal the
              lives you touch, the goals they conquer, and the passions you help ignite.
            </p>
          </header>
          <ul className="grid gap-5 lg:grid-cols-3">
            <li className="card card--inset stack-sm">
              <h3 className="text-heading-sm text-on-surface font-semibold">Transparent credit flow</h3>
              <p className="text-body-sm text-subdued">
                Track every credit from donation to student milestone with verifiable, privacy-safe reporting.
              </p>
            </li>
            <li className="card card--inset stack-sm">
              <h3 className="text-heading-sm text-on-surface font-semibold">Celebrate achievements</h3>
              <p className="text-body-sm text-subdued">
                Receive stories, artefacts, and progress celebrations from the learners you champion.
              </p>
            </li>
            <li className="card card--inset stack-sm">
              <h3 className="text-heading-sm text-on-surface font-semibold">Invest in communities</h3>
              <p className="text-body-sm text-subdued">
                Help students become future creators, validators, and coaches—keeping the cycle thriving for years to come.
              </p>
            </li>
          </ul>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#join" className="btn btn--primary btn--lg">
              Sponsor the rise
            </a>
            <a href="#stories" className="btn btn--ghost btn--lg text-on-surface">
              Explore community stories
            </a>
          </div>
        </div>
      </section>

      <section className="page-container" id="join">
        <div className="card card--muted stack-lg lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div className="stack-md max-w-readable">
            <span className="badge badge--success w-fit">Join the mission</span>
            <h2 className="text-display-lg text-on-surface font-semibold">Ready to help a learner take flight?</h2>
            <p className="text-body-base text-subdued">
              Whether you are learning, creating, coaching, or sponsoring, Udoy welcomes you into an ecosystem built on hope,
              discipline, and radical transparency.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <button type="button" className="btn btn--primary btn--lg">
              Register as a learner
            </button>
            <button type="button" className="btn btn--accent btn--lg">
              Sign up as a sponsor
            </button>
            <button type="button" className="btn btn--ghost btn--lg text-on-surface">
              Volunteer as a coach
            </button>
            <button type="button" className="btn btn--secondary btn--lg">
              Explore creator opportunities
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
