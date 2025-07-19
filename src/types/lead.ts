
export interface Lead {
  leadId: string;
  name: string;
  designation: string;
  website?: string;
  leadLink?: string;
  occupation: string;
  companyHeadcount?: string;
  state: string;
  sentDate: string;
  sentBy: string;
  email?: string;
  mobileNumber?: string;
  comments?: string;
  linkedinAccountName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadFilters {
  name?: string[];
  designation?: string[];
  occupation?: string[];
  state?: string[];
  sentDate?: string;
}

export interface PaginatedLeads {
  totalElements: number;
  content: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

}

export interface FilterOptions {
  designations: string[];
  occupations: string[];
  states: string[];
}
