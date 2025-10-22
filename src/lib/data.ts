import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

import type { Transaction, Category, Goal, UserProfile } from './types';

// In a real application, this data would be fetched from a database like Firestore.
// For this example, we're using mock data with a simulated delay.

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', amount: 65.5, type: 'expense', category: 'Food', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Dinner with friends', categoryId: '1' },
  { id: '2', amount: 2500, type: 'income', category: 'Salary', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Monthly paycheck', categoryId: '6' },
  { id: '3', amount: 120.0, type: 'expense', category: 'Transport', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Monthly train pass', categoryId: '2' },
  { id: '4', amount: 45.0, type: 'expense', category: 'Shopping', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), notes: 'New shirt', categoryId: '3' },
  { id: '5', amount: 800.0, type: 'expense', category: 'Housing', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Rent payment', categoryId: '4' },
  { id: '6', amount: 15.0, type: 'expense', category: 'Entertainment', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Movie ticket', categoryId: '5' },
  { id: '7', amount: 200, type: 'income', category: 'Freelance', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), notes: 'Side project', categoryId: '7' },
];

const MOCK_CATEGORIES: Category[] = [
    { id: '1', name: 'Food', type: 'expense', color: '#FF6B6B', icon: 'Utensils', monthlyBudget: 500 },
    { id: '2', name: 'Transport', type: 'expense', color: '#4ECDC4', icon: 'Bus', monthlyBudget: 150 },
    { id: '3', name: 'Shopping', type: 'expense', color: '#45B7D1', icon: 'ShoppingBag' },
    { id: '4', name: 'Housing', type: 'expense', color: '#F7B801', icon: 'Home', monthlyBudget: 1000 },
    { id: '5', name: 'Entertainment', type: 'expense', color: '#9B5DE5', icon: 'Ticket' },
    { id: '6', name: 'Salary', type: 'income', color: '#2ECC71', icon: 'Briefcase' },
    { id: '7', name: 'Freelance', type: 'income', color: '#3498DB', icon: 'PenTool' },
];

const MOCK_GOALS: Goal[] = [
  { id: '1', title: 'Emergency Fund', targetAmount: 5000, currentAmount: 1500, deadline: '2025-12-31', currency: 'ZAR', priority: 'high', status: 'active' },
  { id: '2', title: 'Vacation to Japan', targetAmount: 3000, currentAmount: 2100, deadline: '2024-11-30', currency: 'ZAR', priority: 'medium', status: 'active' },
  { id: '3', title: 'New Laptop', targetAmount: 1800, currentAmount: 400, deadline: '2025-03-01', currency: 'ZAR', priority: 'low', status: 'active' },
];

const MOCK_USER: UserProfile = {
  uid: 'mock-user-id',
  displayName: 'Alex',
  email: 'alex@example.com',
  photoURL: null,
};

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getTransactions(userId?: string): Promise<Transaction[]> {
  // This function is now only for server-side rendering or API routes if needed,
  // but not for initial page load in client components.
  // The client components will use useCollection.
  if (!userId) return MOCK_TRANSACTIONS;
  const { firestore } = initializeFirebase();
  const transactionsRef = collection(firestore, `users/${userId}/transactions`);
  const q = query(transactionsRef, orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
}

export async function getRecentTransactions(userId: string, count: number = 5): Promise<Transaction[]> {
    // This function is now only for server-side rendering or API routes if needed,
    // but not for initial page load in client components.
    // The client components will use useCollection.
    if (!userId) return MOCK_TRANSACTIONS.slice(0, count);
    const { firestore } = initializeFirebase();
    const transactionsRef = collection(firestore, `users/${userId}/transactions`);
    const q = query(transactionsRef, orderBy('date', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
}

export async function getCategories(userId?: string): Promise<Category[]> {
  if (!userId) return MOCK_CATEGORIES;
  const { firestore } = initializeFirebase();
  const categoriesRef = collection(firestore, `users/${userId}/categories`);
  const querySnapshot = await getDocs(categoriesRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function getGoals(userId?: string): Promise<Goal[]> {
  if (!userId) return MOCK_GOALS;
  const { firestore } = initializeFirebase();
  const goalsRef = collection(firestore, `users/${userId}/goals`);
  const querySnapshot = await getDocs(goalsRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
}


export async function getUser(userId?: string): Promise<UserProfile> {
    if (!userId) return MOCK_USER;
    const { firestore } = initializeFirebase();
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return { uid: userSnap.id, ...userSnap.data() } as UserProfile;
    }
    return MOCK_USER;
}
