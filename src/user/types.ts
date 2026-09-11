export const PROFILE_ROLES = [
  'Founder', 'Co-Founder', 'Investor', 'VC Professional', 'Angel Investor',
  'Entrepreneur', 'Operator', 'Employee', 'Student', 'Mentor / Advisor',
  'Startup Professional', 'Other',
] as const;

export type ProfileRole = (typeof PROFILE_ROLES)[number];

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: ProfileRole | null;
  company_name: string | null;
  website: string | null;
  industry: string | null;
  startup_stage: string | null;
  location: string | null;
  team_size: string | null;
  funding_status: string | null;
  investor_type: string | null;
  sectors_of_interest: string[];
  stages_of_interest: string[];
  college: string | null;
  field_of_study: string | null;
  graduation_year: number | null;
  job_title: string | null;
  profile_visibility: 'private' | 'public';
  personalization_consent: boolean;
  created_at: string;
  updated_at: string;
};
