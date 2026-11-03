export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type UserCompanyStatus = 
  | 'no_application' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'has_company';

export type CompanyRole = 'owner' | 'admin' | 'manager' | 'member';

export interface CompanyApplication {
  id: string;
  user_id: string;
  company_name: string;
  company_description: string;
  industry: string;
  website?: string;
  contact_email: string;
  contact_phone?: string;
  reason: string;
  status: ApplicationStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  metadata?: {
    nip?: string;
    no_website?: boolean;
    first_name?: string;
    last_name?: string;
    street_address?: string;
    city?: string;
    postal_code?: string;
    voivodeship?: string;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

export interface CompanyApplicationFormData {
  company_name: string;
  company_description: string;
  industry: string;
  website?: string;
  contact_email: string;
  contact_phone?: string;
  reason?: string;
  nip?: string;
  no_website?: boolean;
  first_name?: string;
  last_name?: string;
  street_address?: string;
  city?: string;
  postal_code?: string;
  voivodeship?: string;
}

export interface CompanyMember {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: CompanyRole;
  joined_at: string;
  byte_allocated: number;
  storage_used_gb: number;
}

export interface CompanyInvitation {
  id: string;
  company_id: string;
  email: string;
  role: CompanyRole;
  token: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
}

export interface UserCompanyInfo {
  company: {
    id: string;
    name: string;
    logo_url: string | null;
    industry: string | null;
    description: string | null;
    storage_used_gb: number;
    storage_limit_gb: number;
  };
  role: CompanyRole;
  bytesAllocated: number;
  joinedAt: string;
  memberCount: number;
  storagePercentage: number;
}