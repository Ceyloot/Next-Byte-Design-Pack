export interface CookieConsentSettings {
  id: string;
  main_title: string;
  main_description: string;
  consent_tab_title: string;
  details_tab_title: string;
  privacy_policy_link: string;
  button_accept_all: string;
  button_necessary_only: string;
  button_customize: string;
  created_at: string;
  updated_at: string;
}

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  is_required: boolean;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserCookieConsent {
  id: string;
  user_id: string;
  consent_given_at: string;
  marketing_cookies: boolean;
  statistics_cookies: boolean;
  personalization_cookies: boolean;
  functional_cookies: boolean;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface CookiePreferences {
  marketing_cookies: boolean;
  statistics_cookies: boolean;
  personalization_cookies: boolean;
  functional_cookies: boolean;
}

export type ConsentAction = 'accept_all' | 'necessary_only' | 'custom';
