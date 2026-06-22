import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const SIZES = {
  sidebar: {
    width: 256,
    height: 64,
    className: 'h-14 w-auto min-w-[9rem] max-w-full object-contain sm:h-16',
  },
  auth: {
    width: 320,
    height: 96,
    className: 'h-20 w-auto min-w-[11rem] max-w-full object-contain sm:h-24',
  },
  topbar: {
    width: 200,
    height: 56,
    className: 'h-12 w-auto min-w-[7.5rem] max-w-full object-contain sm:h-14',
  },
  icon: {
    width: 48,
    height: 48,
    className: 'h-10 w-10 min-h-10 min-w-10 object-contain sm:h-12 sm:w-12',
  },
} as const;

type LogoSize = keyof typeof SIZES;

type LogoProps = {
  size?: LogoSize;
  href?: string;
  className?: string;
  priority?: boolean;
};

export function Logo({ size = 'sidebar', href, className, priority }: LogoProps) {
  const dim = SIZES[size];
  const isIcon = size === 'icon';
  const lightSrc = isIcon ? '/icons/favicon.svg' : '/icons/vs2.svg';
  const darkSrc = isIcon ? '/icons/favicon.svg' : '/icons/vs1.svg';

  const img = (
    <span className={cn('inline-flex max-w-full items-center', isIcon && 'justify-center')}>
      <Image
        src={lightSrc}
        alt="VaultString"
        width={dim.width}
        height={dim.height}
        priority={priority ?? (size === 'sidebar' || size === 'auth')}
        className={cn(dim.className, 'dark:hidden', className)}
      />
      <Image
        src={darkSrc}
        alt="VaultString"
        width={dim.width}
        height={dim.height}
        priority={priority ?? (size === 'sidebar' || size === 'auth')}
        className={cn(dim.className, 'hidden dark:block', className)}
      />
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 items-center">
        {img}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0 items-center">{img}</span>;
}
