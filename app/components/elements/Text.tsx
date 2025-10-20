import clsx from 'clsx';

import {missingClass, formatText} from '~/lib/utils';

export function Text({
  as: Component = 'span',
  className,
  color = 'default',
  format,
  size = 'copy',
  width = 'default',
  children,
  ...props
}: {
  as?: React.ElementType;
  className?: string;
  color?: 'default' | 'primary' | 'subtle' | 'notice' | 'contrast';
  format?: boolean;
  size?: 'lead' | 'copy' | 'fine';
  width?: 'default' | 'narrow' | 'wide';
  children: React.ReactNode;
  [key: string]: any;
}) {
  const colors: Record<string, string> = {
    default: 'inherit',
    primary: 'text-primary/90',
    subtle: 'text-primary/50',
    notice: 'text-notice',
    contrast: 'text-contrast/90',
  };

  const sizes: Record<string, string> = {
    lead: 'text-lead font-bold',
    copy: 'text-copy',
    fine: 'text-fine subpixel-antialiased',
  };

  const widths: Record<string, string> = {
    default: 'max-w-prose',
    narrow: 'max-w-prose-narrow',
    wide: 'max-w-prose-wide',
  };

  const styles = clsx(
    missingClass(className, 'max-w-') && widths[width],
    missingClass(className, 'whitespace-') && 'whitespace-pre-wrap',
    missingClass(className, 'text-') && colors[color],
    sizes[size],
    className,
  );

  return (
    <Component {...props} className={styles}>
      {format ? formatText(children) : children}
    </Component>
  );
}

export function Heading({
  as: Component = 'h2',
  children,
  className = '',
  format,
  size = 'heading',
  ...props
}: {
  as?: React.ElementType;
  children?: React.ReactNode;
  format?: boolean;
  size?: 'display' | 'heading' | 'lead' | 'copy';
} & React.HTMLAttributes<HTMLHeadingElement>) {
  const sizes = {
    display: 'font-bold text-display',
    heading: 'font-bold text-heading',
    lead: 'font-bold text-lead',
    copy: 'font-medium text-copy',
  };

  const styles = clsx(
    missingClass(className, 'whitespace-') && 'whitespace-pre-wrap',
    missingClass(className, 'font-') && sizes[size],
    className,
  );

  return (
    <Component {...props} className={styles}>
      {format ? formatText(children) : children}
    </Component>
  );
}

export function Section({
  as: Component = 'section',
  children,
  className,
  divider = 'none',
  display = 'grid',
  heading,
  padding = 'all',
  ...props
}: {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  divider?: 'none' | 'top' | 'bottom' | 'both';
  display?: 'grid' | 'flex';
  heading?: string;
  padding?: 'x' | 'y' | 'swimlane' | 'all';
  [key: string]: any;
}) {
  const paddings = {
    x: '',
    y: '',
    swimlane: 'pt-4 md:pt-8 lg:pt-12 md:pb-4 lg:pb-8',
    all: '',
  };

  const dividers = {
    none: 'border-none',
    top: 'border-t border-primary/05',
    bottom: 'border-b border-primary/05',
    both: 'border-y border-primary/05',
  };
  const displays = {
    flex: 'flex',
    grid: 'grid',
  };

  const styles = clsx(
    'w-full',
    displays[display],
    missingClass(className, '\\mp[xy]?-') && paddings[padding],
    dividers[divider],
    className,
  );

  return (
    <Component {...props} className={styles}>
      {heading && (
        <Heading
          className="text-xl md:text-2xl font-bold mb-6 uppercase"
          as="h4"
        >
          {heading}
        </Heading>
      )}
      {children}
    </Component>
  );
}

export function PageHeader({
  children,
  className,
  heading,
  variant = 'default',
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  heading?: string;
  variant?: 'default' | 'blogPost' | 'allCollections';
  [key: string]: any;
}) {
  const variants: Record<string, string> = {
    default: 'container grid gap-4 py-8 justify-items-start',
    blogPost:
      'container grid md:text-center gap-4 py-8 md:justify-items-center',
    allCollections: 'flex justify-between items-baseline gap-8 p-6 md:py-8 md:px-12',
  };

  const styles = clsx(variants[variant], className);

  return (
    <header {...props} className={styles}>
      {heading && (
        <Heading
          as="h1"
          size="heading"
          className="inline-block w-full text-heading1"
        >
          {heading}
        </Heading>
      )}
      {children}
    </header>
  );
}
