export interface PartnerPreferences {
  minAge: number;
  maxAge: number;
  minHeight: string;
  maxHeight: string;
  locations: string[];
  openToRelocate: boolean;
  religions: string[];
  caste: string;
  education: string[];
  professions: string[];
  minIncome: string;
  maritalStatus: string[];
  partnerIntent: string;
  diet: string[];
  lifestyleHabits: string[];
  aboutPartner: string;
}

export const defaultPreferences: PartnerPreferences = {
  minAge: 24,
  maxAge: 30,
  minHeight: "5'2\"",
  maxHeight: "5'11\"",
  locations: ['Kerala', 'Bengaluru', 'UAE / Gulf'],
  openToRelocate: true,
  religions: ['Open to all communities'],
  caste: 'Open to all',
  education: ['Graduate Degree', 'Postgraduate / Masters'],
  professions: ['Software / IT', 'Healthcare / Medical', 'Design / Creative'],
  minIncome: '₹8 Lakhs+',
  maritalStatus: ['Never Married'],
  partnerIntent: 'Serious Marriage (within 1 year)',
  diet: ['Vegetarian', 'Eggetarian', 'Non-Vegetarian'],
  lifestyleHabits: ['Non-smoker', 'Family-oriented'],
  aboutPartner: 'Looking for a kind, emotionally mature partner who values open conversations and mutual growth.',
};
