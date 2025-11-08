
import type { Donor, TeamMember } from './types';

export const CAMPAIGN_GOAL = 50000;

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    name: 'د. سارة المصري',
    title: 'أخصائية دعم نفسي',
    linkedin: '#',
  },
  {
    id: 2,
    name: 'م. خالد أبو يوسف',
    title: 'مدير البرامج التعليمية',
    linkedin: '#',
  },
  {
    id: 3,
    name: 'د. ليلى ناصر',
    title: 'مستشارة تربوية',
    linkedin: '#',
  },
  {
    id: 4,
    name: 'م. رائد الحاج',
    title: 'منسق المشاريع',
    linkedin: '#',
  }
];


const buildInitialDonors = (): { donors: Donor[], total: number } => {
  const donations = [
    { name: 'مؤسسة الأيادي البيضاء', amount: 10000 },
    { name: 'فاعل خير', amount: 5000 },
    { name: 'شركة النور للتكنولوجيا', amount: 2500 },
    { name: 'عائلة المرحوم الحاج إبراهيم', amount: 500 },
    { name: 'متبرع مجهول', amount: 125 },
    { name: 'أحمد خليل', amount: 50 },
    { name: 'ريم يوسف', amount: 25 },
    { name: 'متبرع مجهول', amount: 100 },
    { name: 'سامي أبو سعدة', amount: 200 },
    { name: 'فاعل خير', amount: 75 },
  ];

  let cumulativeTotal = 0;
  const processedDonors: Donor[] = donations.map((donation, index) => {
    cumulativeTotal += donation.amount;
    return {
      id: index + 1,
      name: donation.name,
      amount: donation.amount,
      cumulativeTotal: cumulativeTotal,
    };
  });

  return { donors: processedDonors.reverse(), total: cumulativeTotal };
};

const { donors, total } = buildInitialDonors();

export const INITIAL_DONORS: Donor[] = donors;
export const INITIAL_TOTAL: number = total;