import { Project, StudentProfile } from './types';

// Mock data used for development/demo purposes only.
// These are placeholder entries and should never render on the live site.
const DEV_MODE = import.meta.env.DEV;

export const MOCK_PROJECTS: Project[] = DEV_MODE ? [
  {
    id: '1',
    title: 'Q2 Market Competitor Audit',
    company: 'TechFlow Systems',
    description: 'Analyze top 5 competitors in the SaaS space and identify pricing gaps.',
    type: 'Market Audit',
    status: 'Open',
    compensation: '$500 Stipend',
    duration: '2 Weeks',
    skills: ['Market Research', 'Excel', 'Competitive Analysis']
  },
  {
    id: '2',
    title: 'CRM Data Sanitization',
    company: 'GreenGrowth Media',
    description: 'Clean and categorize 2,000+ leads in Salesforce for the sales team.',
    type: 'Data Cleanup',
    status: 'In Progress',
    compensation: '$400 Stipend',
    duration: '10 Days',
    skills: ['Data Entry', 'CRM', 'Attention to Detail']
  },
  {
    id: '3',
    title: 'TikTok Growth Strategy',
    company: 'VibeCheck Apparel',
    description: 'Develop a content calendar and trend report for Gen Z audience.',
    type: 'Social Media',
    status: 'Open',
    compensation: '$600 Stipend',
    duration: '3 Weeks',
    skills: ['Social Media', 'Content Strategy', 'Trends']
  }
] : [];

export const MOCK_STUDENT: StudentProfile = DEV_MODE ? {
  name: 'Alex Rivera',
  university: 'Stanford University',
  year: 1,
  bio: 'Economics student passionate about data driven decision making and market trends.',
  stackPoints: 1250,
  badges: [
    { id: 'b1', name: 'Logic Master', icon: 'Brain', date: '2026-01-15' },
    { id: 'b2', name: 'Excel Certified', icon: 'Table', date: '2026-02-10' },
    { id: 'b3', name: 'First Project', icon: 'Rocket', date: '2026-03-01' }
  ],
  projects: []
} : {
  name: '',
  university: '',
  year: 0,
  bio: '',
  stackPoints: 0,
  badges: [],
  projects: []
};
