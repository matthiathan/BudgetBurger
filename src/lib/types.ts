export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  categoryId: string;
  date: string; // ISO 8601 format
  notes: string;
  currency: string;
};

export type Category = {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string; // Icon name from lucide-react
  monthlyBudget?: number;
};

export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO 8601 format
  currency: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed';
};

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

export type UserSettings = {
  currency: 'ZAR' | 'USD' | 'AUD' | 'YEN';
  language: 'en-US' | 'es' | 'af' | 'zh';
  theme: 'light' | 'dark' | 'auto';
  accent: string;
  font: 'Inter' | 'Roboto' | 'Poppins' | 'System';
  layout: 'sidebar-left' | 'topbar';
  roundedCorners: boolean;
  compactMode: false;
};
