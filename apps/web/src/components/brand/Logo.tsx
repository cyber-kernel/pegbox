import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl';

  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 focus:outline-none group select-none"
      aria-label="Pegbox Home"
    >
      <div className="relative flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
        <Image
          src="/brand/pegbox-icon.svg"
          alt=""
          width={iconSize}
          height={iconSize}
          className="shrink-0"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span
          className={`font-heading font-bold ${textSize} tracking-tight leading-none`}
          style={{ letterSpacing: '-0.02em' }}
        >
          <span className="text-ink">Peg</span>
          <span className="text-primary">box</span>
        </span>
        {showTagline && (
          <span className="text-[11px] text-muted font-medium tracking-normal mt-0.5">
            Browser file tools
          </span>
        )}
      </div>
    </Link>
  );
}

