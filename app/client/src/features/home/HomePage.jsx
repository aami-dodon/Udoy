import { LucideIcon } from '../../../../shared/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@components/ui';
import SiteFooter from '@/components/SiteFooter';

const roles = [
  {
    name: 'Students',
    description:
      'Young dreamers who will access world-class, 2025-ready learning that nurtures confidence, curiosity, and grit.',
    icon: 'Sparkles',
    highlight: 'Every milestone is intended to unlock transparent rewards funded by the community.',
  },
  {
    name: 'Creators',
    description:
      'Middle-aged and retired alumni who return to craft relevant lessons rooted in decades of lived experience.',
    icon: 'PenTool',
    highlight:
      'Seasoned creators are giving back to society with relatable, compassionate content for every learner.',
  },
  {
    name: 'Teachers',
    description:
      'Retired and experienced educators who will elevate every module with structure, clarity, and pedagogy.',
    icon: 'GraduationCap',
    highlight: 'Quality checks are planned to ensure each lesson guides students from basics to mastery.',
  },
  {
    name: 'Coaches',
    description:
      'Remote mentors who will help students find their strengths, build confidence, and stay accountable.',
    icon: 'Compass',
    highlight: 'Guided check-ins are designed to keep learning personal, encouraging, and purposeful.',
  },
  {
    name: 'Sponsors',
    description:
      'Individuals and organisations ready to fund student achievements through transparent token rewards.',
    icon: 'Coins',
    highlight: 'Impact dashboards are being built to show how every contribution changes a learner’s trajectory.',
  },
];

const flywheel = [
  {
    title: 'Learn',
    description: 'Students will access curated paths, blending adaptive content with real-life problem solving.',
    icon: 'BookOpen',
  },
  {
    title: 'Create',
    description:
      'Seasoned alumni creators will transform their journeys into fresh lessons and tools for today’s students.',
    icon: 'Loop',
  },
  {
    title: 'Elevate',
    description: 'Teachers will refine content, coaches will mentor progress, and sponsors will unlock the next opportunity.',
    icon: 'ArrowBigUpDash',
  },
  {
    title: 'Inspire',
    description: 'Empowered students are expected to re-enter the ecosystem to lift the next cohort even higher.',
    icon: 'Star',
  },
];

const impactMetrics = [
  { value: '92%', label: 'targeted student growth within 6 months once launched.' },
  { value: '4.7/5', label: 'aspired learner confidence rating after guided coaching.' },
  { value: '100%', label: 'planned sponsor contributions mapped transparently to achievements.' },
];

const faqs = [
  {
    question: 'How does Udoy ensure transparency for sponsors?',
    answer:
      'Every token will be tracked on a public impact ledger. Sponsors will see which milestones were unlocked, the student who earned them, and the next goal in their journey.',
  },
  {
    question: 'Can I volunteer from outside India?',
    answer:
      'Absolutely. Udoy is being built for remote collaboration. Coaches will receive training, digital toolkits, and timezone-friendly schedules to mentor from anywhere.',
  },
  {
    question: 'What support do alumni creators receive?',
    answer:
      'Returning alumni creators collaborate with teachers and product mentors, ensuring every lesson channels their experience, stays accessible in low-bandwidth environments, and is review-ready before launch.',
  },
  {
    question: 'How are students onboarded?',
    answer:
      'Community partners and grassroots organisations will help identify learners. Each student will receive a personalised learning path, device support guidance, and a dedicated coach for accountability.',
  },
];

function RoleCard({ role }) {
  return (
    <Card className="h-full transition-none hover:translate-y-0 hover:shadow-gentle">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-evergreen">
            <LucideIcon name={role.icon} size="lg" className="text-evergreen" />
          </span>
          <CardTitle>{role.name}</CardTitle>
        </div>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-2xl bg-porcelain-tint/80 p-4 text-sm text-neutral-700">
          <strong className="block text-sm font-semibold text-evergreen">Why it matters</strong>
          <p>{role.highlight}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const HomePage = () => {
  return (
    <>
      <main className="flex flex-col gap-24">
      <section id="hero" className="relative overflow-hidden bg-hero-gradient text-white">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="absolute -left-16 top-32 h-72 w-72 rounded-full bg-ecru blur-3xl" />
          <div className="absolute bottom-20 right-10 h-80 w-80 rounded-full bg-mint-sage/50 blur-3xl" />
        </div>
        <header className="container relative z-10 flex items-center justify-between py-8">
          <div>
            <p className="font-display text-2xl font-semibold text-white">Udoy</p>
            <p className="text-sm uppercase tracking-widest text-white/70">Emerge, Rise, Thrive</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
              Log in
            </Button>
            <Button variant="accent" size="lg">
              Sign up
            </Button>
          </div>
        </header>
        <div className="container relative z-10 grid gap-12 pb-24 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-center">
          <div className="space-y-8">
            <Badge variant="accent" className="text-sm font-medium text-black-olive">
              Where potential meets opportunity
            </Badge>
            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
                Udoy is being built as the launchpad for children ready to rise above circumstance.
              </h1>
              <p className="body-large max-w-2xl text-white/80">
                We are building a cycle of learning, mentorship, and transparent rewards so underrepresented talent can emerge,
                excel, and inspire the next generation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="lg" className="bg-white text-black-olive hover:bg-porcelain">
                Join as a sponsor
              </Button>
              <Button variant="secondary" size="lg">
                Become a mentor
              </Button>
              <a
                href="/learning-paths"
                className="w-full text-left text-base font-semibold text-white underline decoration-white/60 underline-offset-4 transition-colors hover:text-white md:w-auto"
              >
                Explore learning paths
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <LucideIcon name="Users" size="sm" />
                Designed to deliver thousands of hours of mentorship remotely
              </div>
              <div className="flex items-center gap-3">
                <LucideIcon name="ShieldCheck" size="sm" />
                Safeguarded onboarding and verified impact reporting in the pipeline
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="surface-card border-0 bg-white/10 p-10 text-white shadow-2xl backdrop-blur">
              <h2 className="font-display text-2xl text-white">The Udoy Flywheel</h2>
              <Separator className="my-6 bg-white/30" />
              <ol className="space-y-4 text-sm text-white/80">
                {flywheel.map((item, index) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/70 font-semibold text-evergreen">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-base font-semibold text-white">{item.title}</p>
                      <p className="text-sm text-white/70">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section id="mission" className="container section">
        <div className="grid gap-12 md:grid-cols-[0.8fr,1fr] md:items-center">
          <div className="space-y-6">
            <Badge variant="subtle" className="w-max">
              Our Mission
            </Badge>
            <h2 className="section-heading">
              Empowering students to not only catch up — but to outshine.
            </h2>
            <p className="body-large">
              Udoy aims to orchestrate a supportive ecosystem where middle-aged alumni creators, seasoned teachers, remote
              coaches, and transparent sponsors rally around each learner. Together, they will form an unbroken chain of
              belonging, mastery, and purpose.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/80 p-6 shadow-gentle">
                <h3 className="text-xl font-semibold text-evergreen">Belonging first</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  A caring network will surround every child with mentorship, emotional safety, and courage to dream big.
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 p-6 shadow-gentle">
                <h3 className="text-xl font-semibold text-evergreen">Pathways that scale</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Dynamic roadmaps will adapt to each learner, blending foundational skills with future-ready opportunities.
                </p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="surface-card space-y-6">
              <h3 className="text-xl font-semibold text-evergreen">Impact in motion</h3>
              <p className="text-sm text-neutral-600">
                Each contribution is envisioned to fuel a transparent journey from learning to leadership.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {impactMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl bg-porcelain-tint/60 p-4 text-center">
                    <p className="text-3xl font-semibold text-evergreen">{metric.value}</p>
                    <p className="mt-1 text-xs text-neutral-600">{metric.label}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <blockquote className="text-base italic text-neutral-700">
                “Udoy has the potential to give students the confidence to design their own future. The mentorship loop is
                planned to keep them inspired long after graduation.”
              </blockquote>
              <p className="text-sm font-medium text-evergreen">Ananya Rao · Academic Partner, Bengaluru</p>
            </div>
          </div>
        </div>
      </section>

      <section id="roles" className="bg-porcelain-tint/70">
        <div className="container section">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="subtle" className="mx-auto">
              Ecosystem Roles
            </Badge>
            <h2 className="section-heading mt-6">
              Everyone in Udoy’s ecosystem has a seat at the table — and a role in the flywheel.
            </h2>
            <p className="body-large mt-4">
              We plan to celebrate collaboration. Each role will feed the next, building a rising tide where excellence becomes
              collective.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {roles.map((role) => (
              <RoleCard key={role.name} role={role} />
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="container section">
        <div className="grid gap-10 lg:grid-cols-[1fr,0.8fr]">
          <div className="space-y-8">
            <Badge variant="subtle" className="w-max">
              Engagement
            </Badge>
            <h2 className="section-heading">Choose how you want to activate the change.</h2>
            <p className="body-large">
              Become a sponsor, coach, or community partner. Together, we can ensure brilliance is no longer limited by
              circumstance once Udoy launches.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex h-full flex-col rounded-2xl border border-porcelain-shade bg-white/70 p-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-evergreen">Sponsor a cohort</h3>
                  <p className="text-sm text-neutral-600">
                    Plan to fund achievement tokens, devices, and community labs. Track every learner you empower.
                  </p>
                </div>
                <div className="mt-auto pt-6">
                  <Button variant="link" className="px-0 text-left text-evergreen">
                    View sponsor playbook
                  </Button>
                </div>
              </div>
              <div className="flex h-full flex-col rounded-2xl border border-porcelain-shade bg-white/70 p-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-evergreen">Volunteer to coach</h3>
                  <p className="text-sm text-neutral-600">
                    Guide 2–3 learners weekly, with structured prompts and support from lead mentors once programs open.
                  </p>
                </div>
                <div className="mt-auto pt-6">
                  <Button variant="link" className="px-0 text-left text-evergreen">
                    Explore mentor training
                  </Button>
                </div>
              </div>
            </div>
              <div className="flex flex-wrap gap-3 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <LucideIcon name="Calendar" size="sm" className="text-evergreen" />
                  Planned cohort onboarding every quarter
                </div>
                <div className="flex items-center gap-2">
                  <LucideIcon name="Globe" size="sm" className="text-evergreen" />
                  Designed to be remote-first and globally inclusive
                </div>
              </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg">I want to contribute</Button>
              <Button variant="outline" size="lg">
                Talk to our team
              </Button>
            </div>
          </div>
          <div className="surface-card">
            <h3 className="text-xl font-semibold text-evergreen">The Udoy Loop</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Every action is intended to spark the next. Sponsors will unlock access, students will grow, alumni will return,
              and the cycle will compound.
            </p>
            <div className="mt-8 space-y-6">
              {flywheel.map((item) => (
                <div key={item.title} className="flex items-start gap-4 rounded-2xl bg-porcelain-tint/70 p-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-evergreen">
                    <LucideIcon name={item.icon} size="lg" className="text-evergreen" />
                  </div>
                  <div>
                    <p className="font-semibold text-black-olive">{item.title}</p>
                    <p className="text-sm text-neutral-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-porcelain-tint/60">
        <div className="container section">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="subtle" className="mx-auto">
              FAQ
            </Badge>
            <h2 className="section-heading mt-6">Answers for new partners, mentors, and learners.</h2>
            <p className="body-large mt-4">
              Still curious about how Udoy will work? Explore the most common questions from our community.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-porcelain-shade bg-white/90 p-8 shadow-gentle">
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-lg font-medium text-black-olive">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pt-3 text-sm text-neutral-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      </main>

      <SiteFooter />
    </>
  );
};

export default HomePage;
