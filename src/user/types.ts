export const PROFILE_ROLES = [
  'Founder', 'Co-Founder', 'Investor', 'VC Professional', 'Angel Investor',
  'Entrepreneur', 'Operator', 'Employee', 'Student', 'Mentor / Advisor',
  'Startup Professional', 'Other',
] as const;

export type ProfileRole = (typeof PROFILE_ROLES)[number];
export type ProfileGender = 'Male' | 'Female' | 'Prefer not to say';
export type PersonalizationStatus = 'not_started' | 'completed' | 'skipped';

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  gender: ProfileGender | null;
  phone_number: string | null;
  role: ProfileRole | null;
  company_name: string | null;
  job_title: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  bio: string | null;
  startup_stage: string | null;
  team_size: string | null;
  funding_status: string | null;
  investor_type: string | null;
  sectors_of_interest: string[];
  stages_of_interest: string[];
  interests: string[];
  college: string | null;
  field_of_study: string | null;
  graduation_year: number | null;
  profile_visibility: 'private' | 'public';
  onboarding_completed: boolean;
  personalization_consent: boolean;
  personalization_status: PersonalizationStatus;
  created_at: string;
  updated_at: string;
};
