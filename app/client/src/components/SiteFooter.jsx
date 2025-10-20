import { Badge, Button, Separator } from '@components/ui';
import { cn } from '@/lib/utils';

const defaultBrand = {
  badgeLabel: 'Udoy',
  badgeVariant: 'accent',
  headline: 'Rise beyond circumstances.',
  description:
    'Udoy aims to build equitable access to future-ready learning. Together, we will nurture resilience, celebrate progress, and make opportunity undeniable.',
};

const defaultActions = [
  {
    label: 'Pledge to sponsor a learner',
    variant: 'default',
    className: 'bg-white text-black-olive hover:bg-porcelain',
  },
  {
    label: 'Register interest in the mentorship network',
    variant: 'ghost',
    className: 'text-white hover:bg-white/10',
  },
];

const defaultNewsletter = {
  title: 'Stay in the loop',
  description: 'Future updates will share wins, stories, and open cohorts.',
  label: 'Email address',
  placeholder: 'you@example.com',
  buttonLabel: 'Subscribe',
};

const defaultNavLinks = [
  { href: '#mission', label: 'Mission' },
  { href: '#roles', label: 'Ecosystem' },
  { href: '#impact', label: 'Impact' },
];

export function SiteFooter({
  brand = defaultBrand,
  actions = defaultActions,
  newsletter = defaultNewsletter,
  navLinks = defaultNavLinks,
  className,
}) {
  const { badgeLabel, badgeVariant = 'accent', headline, description, badgeClassName } = brand;
  const { title, description: newsletterDescription, label, placeholder, buttonLabel, inputProps = {} } = newsletter;

  return (
    <footer className={cn('bg-black-olive text-porcelain', className)}>
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {badgeLabel ? (
              <Badge variant={badgeVariant} className={cn('bg-ecru text-black-olive', badgeClassName)}>
                {badgeLabel}
              </Badge>
            ) : null}
            {headline ? <h3 className="text-3xl font-semibold text-white">{headline}</h3> : null}
            {description ? <p className="max-w-xl text-sm text-white/70">{description}</p> : null}
            {actions?.length ? (
              <div className="flex flex-wrap gap-4">
                {actions.map(({ label: actionLabel, variant = 'default', className: actionClassName, href, asChild, ...rest }, index) => {
                  if (!actionLabel) {
                    return null;
                  }

                  const buttonContent = href ? (
                    <a href={href} {...rest}>
                      {actionLabel}
                    </a>
                  ) : (
                    actionLabel
                  );

                  return (
                    <Button
                      key={`${actionLabel}-${index}`}
                      variant={variant}
                      className={cn(actionClassName)}
                      asChild={Boolean(href) || asChild}
                      {...(!href ? rest : {})}
                    >
                      {buttonContent}
                    </Button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <div className="space-y-6 text-sm text-white/70">
            {title ? (
              <div>
                <h4 className="font-display text-2xl font-semibold text-white">{title}</h4>
                {newsletterDescription ? <p className="mt-2">{newsletterDescription}</p> : null}
              </div>
            ) : null}
            <div className="flex flex-col gap-3">
              {label ? (
                <label className="text-xs uppercase tracking-wide text-white/60" htmlFor="newsletter-email">
                  {label}
                </label>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-ecru focus:outline-none focus:ring-2 focus:ring-ecru"
                  {...inputProps}
                />
                {buttonLabel ? (
                  <Button className="bg-ecru text-black-olive hover:bg-ecru-bright">{buttonLabel}</Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <Separator className="my-12 bg-white/10" />
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Udoy Collective. All rights reserved.</p>
          {navLinks?.length ? (
            <div className="flex gap-6">
              {navLinks.map(({ href, label: navLabel }) =>
                href && navLabel ? (
                  <a key={navLabel} href={href} className="transition hover:text-white">
                    {navLabel}
                  </a>
                ) : null,
              )}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;
