import Link from 'next/link';
import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface SharedButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

interface ButtonAsButtonProps
  extends SharedButtonProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof SharedButtonProps> {
  href?: never;
}

interface ButtonAsLinkProps
  extends SharedButtonProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof SharedButtonProps> {
  href: string;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const classes = `button button-${variant} ${className}`.trim();

  if ('href' in props && props.href) {
    const { href, ...linkProps } = props;
    return (
      <Link className={classes} {...linkProps} href={href}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButtonProps;

  return (
    <button className={classes} {...buttonProps}>
      {children}
    </button>
  );
}
