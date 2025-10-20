import clsx from 'clsx';

import {missingClass} from '~/lib/utils';

import {Link} from './Link';

export function ButtonLink({
  link = '/',
  text = 'View More',
  className = '',
  style = 'style1',
}: {
  link?: string;
  className?: string;
  text?: string;
  style?:
    | 'style1'
    | 'style2'
    | 'style3'
    | 'style4'
    | 'style5'
    | 'style6'
    | 'style7'
    | 'style8';
  [key: string]: any;
}) {
  const baseButtonClasses = 'inline-block font-semibold';

  const buttonStyles = {
    style1: `${baseButtonClasses} px-8 py-3 text-white bg-amber-500 rounded-full`,
    style2: `${baseButtonClasses} px-8 py-3 text-white bg-red-600 rounded-full`,
    style3: `${baseButtonClasses} px-8 py-3 text-white bg-amber-500`,
    style4: `${baseButtonClasses} px-8 py-3 text-white bg-red-600`,
    style5: `${baseButtonClasses} px-8 py-3 text-white bg-black`,
    style6: `${baseButtonClasses} px-8 py-3 text-black bg-white`,
    style7: `${baseButtonClasses} px-8 py-3 border-2 border-white text-white rounded-full`,
    style8: `${baseButtonClasses} border-b text-white border-white pb-1`,
  };

  const styles = clsx(
    missingClass(className, 'bg-') && buttonStyles[style],
    className,
  );

  return (
    <Link to={link} className={styles}>
      <span>{text}</span>
    </Link>
  );
}
