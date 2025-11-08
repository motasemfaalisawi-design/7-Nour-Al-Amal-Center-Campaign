
export interface Donor {
  id: number;
  name: string;
  amount: number;
  cumulativeTotal: number;
}

export interface DonationDetails {
  name: string;
  amount: number;
  email: string;
  note?: string;
  isAnonymous: boolean;
  receiptId: string;
  date: string;
}

export interface TeamMember {
  id: number;
  name: string;
  title: string;
  linkedin: string;
  imageUrl?: string;
}

export type Page = 'campaign' | 'form' | 'thankyou' | 'terms';