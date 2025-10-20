import clsx from 'clsx';

export function Grid({
  as: Component = 'div',
  className,
  flow = 'row',
  gap = 'default',
  items = 4,
  layout = 'default',
  ...props
}: {
  as?: React.ElementType;
  className?: string;
  flow?: 'row' | 'col';
  gap?: 'default' | 'blog';
  items?: number;
  layout?: 'default' | 'products' | 'auto' | 'blog';
  [key: string]: any;
}) {
  const layouts = {
    default: `grid-cols-1 ${items === 2 && 'md:grid-cols-2'} 
    ${items === 3 && 'md:grid-cols-2 lg:grid-cols-3'} ${
      items > 3 && 'md:grid-cols-2'
    } 
    ${items >= 4 && 'lg:grid-cols-4'} ${items >= 5 && 'lg:grid-cols-5'} 
    ${items >= 6 && 'lg:grid-cols-6'}`,
    products: `grid-cols-1 ${items >= 3 && 'md:grid-cols-3'} 
    ${items >= 4 && 'lg:grid-cols-4'} ${items >= 5 && 'lg:grid-cols-5'} 
    ${items >= 6 && 'lg:grid-cols-6'}`,
    auto: 'auto-cols-auto',
    blog: 'md:grid-cols-3',
    look: 'grid gap-12 md:gap-y-24',
  };

  const gaps = {
    default: 'grid gap-2 gap-y-6 md:gap-4 lg:gap-6',
    blog: 'grid gap-6 gap-y-8',
  };

  const flows = {
    row: 'grid-flow-row',
    col: 'grid-flow-col',
  };

  const styles = clsx(flows[flow], gaps[gap], layouts[layout], className);

  return <Component {...props} className={styles} />;
}
