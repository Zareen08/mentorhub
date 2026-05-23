import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return String(date);
  }
}

export function formatDateTime(date: string | Date): string {
  try {
    const d = new Date(date);
    // Avoid date-fns crashing on special characters — build string manually
    return format(d, 'MMM d, yyyy') + ' at ' + format(d, 'h:mm a');
  } catch {
    return String(date);
  }
}

export function formatRelative(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return String(date);
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

export function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export function getAvatarUrl(name: string, color = '3B82F6'): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=128`;
}

export const SKILLS = [
  'React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'AWS',
  'Product Management', 'UI/UX Design', 'Data Science', 'DevOps',
  'Machine Learning', 'GraphQL', 'Vue.js', 'Django', 'Docker',
  'System Design', 'Leadership', 'Startup', 'Marketing', 'Finance',
];

export const AVAILABILITY_OPTIONS = [
  'MONDAY_AM', 'MONDAY_PM', 'TUESDAY_AM', 'TUESDAY_PM',
  'WEDNESDAY_AM', 'WEDNESDAY_PM', 'THURSDAY_AM', 'THURSDAY_PM',
  'FRIDAY_AM', 'FRIDAY_PM', 'SATURDAY_AM', 'SATURDAY_PM',
];

export function formatAvailability(slot: string): string {
  const parts = slot.split('_');
  const day = parts[0].charAt(0) + parts[0].slice(1).toLowerCase();
  const time = parts[1] === 'AM' ? 'Morning' : 'Afternoon';
  return `${day} ${time}`;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'amber',
    CONFIRMED: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
    RESCHEDULED: 'purple',
  };
  return map[status] || 'gray';
}
