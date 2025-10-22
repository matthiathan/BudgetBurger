import { 
    Utensils, 
    Bus, 
    ShoppingBag, 
    Home, 
    Ticket, 
    Briefcase, 
    PenTool, 
    type LucideProps, 
    HelpCircle 
} from 'lucide-react';
import type { FC } from 'react';

const iconMap: Record<string, FC<LucideProps>> = {
  Utensils,
  Bus,
  ShoppingBag,
  Home,
  Ticket,
  Briefcase,
  PenTool,
  'default': HelpCircle
};

type CategoryIconProps = {
  name: string;
} & LucideProps;

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const IconComponent = iconMap[name] || iconMap['default'];
  return <IconComponent {...props} />;
}
