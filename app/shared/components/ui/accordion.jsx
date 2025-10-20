import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({ className, ...props }) => (
  <AccordionPrimitive.Item
    className={cn('border-b border-porcelain-shade py-4 last:border-b-0', className)}
    {...props}
  />
);

const AccordionTrigger = ({ className, children, ...props }) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      className={cn(
        'flex flex-1 items-center justify-between text-left text-base font-medium text-black-olive transition hover:text-evergreen [&[data-state=open]>svg]:rotate-180',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown className="h-5 w-5 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);

const AccordionContent = ({ className, ...props }) => (
  <AccordionPrimitive.Content
    className={cn(
      'overflow-hidden text-sm text-neutral-600 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
      className
    )}
    {...props}
  />
);

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
