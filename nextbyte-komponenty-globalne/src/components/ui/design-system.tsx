import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

// Design System - Stworzony na podstawie pięknego stylu zarządzania kursami
// Używa gradientów, blur effects, consistent colors i spacing

export interface GradientCardProps {
  variant?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'primary';
  children: React.ReactNode;
  className?: string;
  blur?: boolean;
}

export const GradientCard = ({ 
  variant = 'blue', 
  children, 
  className,
  blur = true 
}: GradientCardProps) => {
  const variants = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/30',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/30',
    green: 'from-green-500/10 to-green-600/10 border-green-500/30',
    orange: 'from-orange-500/10 to-orange-600/10 border-orange-500/30',
    red: 'from-red-500/10 to-red-600/10 border-red-500/30',
    primary: 'from-brand-primary/10 to-blue-500/10 border-brand-primary/30'
  };

  return (
    <Card className={cn(
      `bg-gradient-to-br ${variants[variant]} border ${blur ? 'nb-szklo' : ''} shadow-lg hover:shadow-xl transition-all duration-300`,
      className
    )}>
      {children}
    </Card>
  );
};

export interface SectionHeaderProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  badge?: string;
  badgeVariant?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'primary';
  className?: string;
}

export const SectionHeader = ({ 
  icon: Icon, 
  emoji, 
  title, 
  description, 
  badge,
  badgeVariant = 'primary',
  className 
}: SectionHeaderProps) => {
  const badgeVariants = {
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    orange: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    primary: 'bg-brand-primary/20 text-brand-primary border-brand-primary/30'
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          {Icon && <Icon className="w-6 h-6 text-brand-primary" />}
          {emoji} {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {badge && (
        <Badge className={cn("px-4 py-2 text-sm", badgeVariants[badgeVariant])}>
          {badge}
        </Badge>
      )}
    </div>
  );
};

export interface ActionBarProps {
  icon?: LucideIcon;
  emoji?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  variant?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'primary';
  className?: string;
}

export const ActionBar = ({ 
  icon: Icon, 
  emoji, 
  title, 
  description, 
  children,
  variant = 'primary',
  className 
}: ActionBarProps) => {
  const variants = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/30',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/30',
    green: 'from-green-500/10 to-green-600/10 border-green-500/30',
    orange: 'from-orange-500/10 to-orange-600/10 border-orange-500/30',
    red: 'from-red-500/10 to-red-600/10 border-red-500/30',
    primary: 'from-brand-primary/10 to-blue-500/10 border-brand-primary/30'
  };

  return (
    <div className={cn(
      `flex items-center justify-between p-6 bg-gradient-to-r ${variants[variant]} border rounded-xl`,
      className
    )}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-brand-primary/20 rounded-full">
          {Icon && <Icon className="w-6 h-6 text-brand-primary" />}
          {emoji && <span className="text-2xl">{emoji}</span>}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        {children}
      </div>
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'primary';
  className?: string;
}

export const StatCard = ({ title, value, icon: Icon, variant = 'primary', className }: StatCardProps) => {
  const variants = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    primary: 'from-brand-primary/20 to-blue-500/20 border-brand-primary/30'
  };

  return (
    <Card className={cn(
      `p-6 bg-gradient-to-br ${variants[variant]} border hover:scale-105 transition-transform duration-200`,
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-foreground/80" />
      </div>
    </Card>
  );
};

export interface FormSectionProps {
  title: string;
  emoji?: string;
  icon?: LucideIcon;
  variant?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'primary';
  children: React.ReactNode;
  className?: string;
}

export const FormSection = ({ 
  title, 
  emoji, 
  icon: Icon, 
  variant = 'blue', 
  children, 
  className 
}: FormSectionProps) => {
  const variants = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/30 text-blue-300',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/30 text-purple-300',
    green: 'from-green-500/10 to-green-600/10 border-green-500/30 text-green-300',
    orange: 'from-orange-500/10 to-orange-600/10 border-orange-500/30 text-orange-300',
    red: 'from-red-500/10 to-red-600/10 border-red-500/30 text-red-300',
    primary: 'from-brand-primary/10 to-blue-500/10 border-brand-primary/30 text-brand-primary'
  };

  const [bgGradient, borderColor, textColor] = variants[variant].split(' ');

  return (
    <div className={cn(
      `p-6 bg-gradient-to-br ${bgGradient} border ${borderColor} rounded-xl`,
      className
    )}>
      <h4 className={cn("text-lg font-bold mb-4 flex items-center gap-2", textColor)}>
        {Icon && <Icon className="w-5 h-5" />}
        {emoji} {title}
      </h4>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export interface GlassButtonProps {
  children: React.ReactNode;
  variant?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const GlassButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  onClick,
  className,
  type = 'button'
}: GlassButtonProps) => {
  const variants = {
    blue: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-500/30',
    purple: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border-purple-500/30',
    green: 'bg-green-500/20 hover:bg-green-500/30 text-green-200 border-green-500/30',
    orange: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-200 border-orange-500/30',
    red: 'bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-500/30',
    primary: 'bg-gradient-to-r from-brand-primary to-blue-500 hover:from-brand-primary/80 hover:to-blue-500/80 text-primary-foreground shadow-lg shadow-brand-primary/25'
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        `${variants[variant]} ${sizes[size]} font-medium transition-all duration-300 border`,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </Button>
  );
};

// Dark Page Layout - Gradient Background
export const DarkPageLayout = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn(
    "min-h-screen bg-gradient-to-br from-background via-card to-background p-6",
    className
  )}>
    {children}
  </div>
);

// Futuristic Container - Reusable glass/blur effect container
export interface FuturisticContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: 95 | 98 | 100;
}

export const FuturisticContainer = ({ 
  children, 
  className,
  variant = 'default',
  blur = 'xl',
  opacity = 98
}: FuturisticContainerProps) => {
  const variants = {
    default: 'border-primary/20',
    primary: 'border-primary/30',
    success: 'border-green-500/20',
    warning: 'border-yellow-500/20',
    danger: 'border-destructive/20'
  };

  const blurLevels = {
    sm: 'nb-szklo',
    md: 'nb-szklo',
    lg: 'nb-szklo',
    xl: 'nb-szklo'
  };

  return (
    <div className={cn(
      `bg-background/${opacity} ${blurLevels[blur]} border ${variants[variant]} shadow-lg rounded-lg`,
      className
    )}>
      {children}
    </div>
  );
};

// Utility Classes Export
export const DesignSystemClasses = {
  // Gradients
  gradients: {
    blue: 'from-blue-500/10 to-blue-600/10',
    purple: 'from-purple-500/10 to-purple-600/10',
    green: 'from-green-500/10 to-green-600/10',
    orange: 'from-orange-500/10 to-orange-600/10',
    red: 'from-red-500/10 to-red-600/10',
    primary: 'from-brand-primary/10 to-blue-500/10',
    darkBg: 'from-background via-card to-background'
  },
  
  // Borders
  borders: {
    blue: 'border-blue-500/30',
    purple: 'border-purple-500/30',
    green: 'border-green-500/30',
    orange: 'border-orange-500/30',
    red: 'border-red-500/30',
    primary: 'border-brand-primary/30'
  },
  
  // Text Colors
  text: {
    blue: 'text-blue-300',
    purple: 'text-purple-300',
    green: 'text-green-300',
    orange: 'text-orange-300',
    red: 'text-red-300',
    primary: 'text-brand-primary',
    white: 'text-foreground',
    muted: 'text-muted-foreground'
  },
  
  // Effects
  effects: {
    blur: 'nb-szklo',
    blurMd: 'nb-szklo',
    blurXl: 'nb-szklo',
    shadow: 'shadow-lg',
    shadowXl: 'shadow-xl',
    shadowPrimary: 'shadow-lg shadow-brand-primary/25',
    hover: 'hover:scale-105 transition-transform duration-200',
    transition: 'transition-all duration-300'
  },
  
  // Futuristic Container - Ready-to-use glass effect
  futuristicContainer: 'nb-szklo nb-szklo-plynne border border-primary/20 shadow-xl rounded-lg',
  
  // Futuristic Component - Glass effect for tooltips, popovers, and floating elements
  futuristicComponent: 'nb-szklo nb-szklo-plynne border border-primary/20 shadow-xl rounded-lg',
  
  // Glass Container - Standardowy kontener glassmorphism (alias dla futuristicComponent z hover)
  glassContainer: 'nb-szklo nb-szklo-plynne border border-primary/20 shadow-xl rounded-lg hover:border-primary/40 transition-all duration-300',
  glassContainerPrimary: 'nb-szklo nb-szklo-plynne border border-primary/30 shadow-xl shadow-primary/10 rounded-lg',
  glassContainerBlue: 'nb-szklo nb-szklo-plynne border border-blue-500/20 shadow-xl shadow-blue-500/10 rounded-lg',
  glassContainerPurple: 'nb-szklo nb-szklo-plynne border border-purple-500/20 shadow-xl shadow-purple-500/10 rounded-lg',
  glassContainerGreen: 'nb-szklo nb-szklo-plynne border border-green-400/20 shadow-xl shadow-green-400/10 rounded-lg',
};