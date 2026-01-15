import { ReactNode } from 'react';
import { cn } from '@/shared/lib';

type TypographyVariant = 'sm' | 'xs' | 'headline' | 'md';
type TextAlign = 'left' | 'center' | 'right' | 'justify';
type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type FontFamily = 'sans' | 'serif' | 'mono' | 'dm-sans' | 'newsreader';

interface TypographyProps {
  variant?: TypographyVariant;
  children: ReactNode;
  className?: string;
  fontSize?: string | number;
  color?: string;
  align?: TextAlign;
  weight?: FontWeight;
  fontFamily?: FontFamily;
  italic?: boolean;
  underline?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
  lineHeight?: string | number;
  letterSpacing?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function Typography({
  variant = 'md',
  children,
  className = '',
  fontSize,
  color,
  align = 'left',
  weight,
  fontFamily,
  italic = false,
  underline = false,
  uppercase = false,
  lowercase = false,
  capitalize = false,
  lineHeight,
  letterSpacing,
  as: Component = 'p',
}: TypographyProps) {
  // Default variant styles
  const variants = {
    sm: {
      fontFamily: 'font-dm-sans',
      fontWeight: 'font-medium',
      fontSize: 'text-sm', // 14px
      lineHeight: 'leading-5', // 20px
      letterSpacing: 'tracking-tight', // -1.5%
    },
    xs: {
      fontFamily: 'font-dm-sans',
      fontWeight: 'font-medium',
      fontSize: 'text-xs', // 12px
      lineHeight: 'leading-4', // 16px
      letterSpacing: 'tracking-tight', // -1%
    },
    headline: {
      fontFamily: 'font-newsreader',
      fontWeight: 'font-normal',
      fontSize: 'text-3xl', // 30px (close to 32px)
      lineHeight: 'leading-10', // 40px
      letterSpacing: 'tracking-tight', // -1%
    },
    md: {
      fontFamily: 'font-dm-sans',
      fontWeight: 'font-medium',
      fontSize: 'text-base', // 16px
      lineHeight: 'leading-6', // 24px
      letterSpacing: 'tracking-tight', // -1.5%
    },
  };

  const variantConfig = variants[variant];

  // Font family mapping
  const fontFamilies = {
    'sans': 'font-sans',
    'serif': 'font-serif',
    'mono': 'font-mono',
    'dm-sans': 'font-dm-sans',
    'newsreader': 'font-newsreader',
  };

  // Font weight mapping
  const fontWeights = {
    'normal': 'font-normal',
    'medium': 'font-medium',
    'semibold': 'font-semibold',
    'bold': 'font-bold',
  };

  // Text alignment mapping
  const textAligns = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right',
    'justify': 'text-justify',
  };

  // Build className
  const baseClasses = cn(
    // Default variant styles
    variantConfig.fontFamily,
    variantConfig.fontWeight,
    variantConfig.fontSize,
    variantConfig.lineHeight,
    variantConfig.letterSpacing,
    
    // Text alignment
    textAligns[align],
    
    // Overrides
    fontFamily && fontFamilies[fontFamily],
    weight && fontWeights[weight],
    color && `text-${color}`,
    
    // Text formatting
    italic && 'italic',
    underline && 'underline',
    uppercase && 'uppercase',
    lowercase && 'lowercase',
    capitalize && 'capitalize',
    
    // Custom className
    className
  );

  // Build inline styles for custom values
  const inlineStyles: React.CSSProperties = {};
  
  if (fontSize) {
    inlineStyles.fontSize = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
  }
  
  if (lineHeight) {
    inlineStyles.lineHeight = typeof lineHeight === 'number' ? `${lineHeight}px` : lineHeight;
  }
  
  if (letterSpacing) {
    inlineStyles.letterSpacing = letterSpacing;
  }

  return (
    <Component 
      className={baseClasses} 
      style={Object.keys(inlineStyles).length > 0 ? inlineStyles : undefined}
    >
      {children}
    </Component>
  );
}