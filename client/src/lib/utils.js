import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatTimeLeft(endTime) {
  const now = new Date();
  const end = new Date(endTime);
  const diffInMs = end - now;
  
  if (diffInMs <= 0) return "Ended";
  
  const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `Ends in ${days}d ${hours}h`;
  } else if (hours > 0) {
    return `Ends in ${hours}h ${minutes}m`;
  } else {
    return `Ends in ${minutes}m`;
  }
}

export function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
