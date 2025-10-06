export interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  stripePriceId?: string;
}
