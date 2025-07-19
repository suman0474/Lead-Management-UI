// import { Lead, PaginatedLeads, FilterOptions } from '@/types/lead';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// const getAuthHeaders = (): HeadersInit => {
//   const token = localStorage.getItem('authToken');
//   // Don't throw if token is missing, let the server handle authentication
//   const headers: HeadersInit = {
//     'Content-Type': 'application/json',
//   };
//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`;
//   }
//   return headers;
// };

// // Rest of the file remains the same, just update the fetch calls to use the modified getAuthHeaders
// // ... [previous code remains the same until the first fetch call]

// export const leadService = {
//   async getLeads(page: number = 0, size: number = 10): Promise<PaginatedLeads> {
//     const response = await fetch(`${API_BASE_URL}/leads?page=${page}&size=${size}`, {
//       headers: getAuthHeaders(),
//       credentials: 'include'  // Keep this for cookie-based auth
//     });
//     if (!response.ok) {
//       const error = await response.text();
//       if (response.status === 401 || response.status === 403) {
//         // Redirect to login or handle unauthorized
//         window.location.href = '/login';
//         return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 };
//       }
//       throw new Error(error || 'Failed to fetch leads');
//     }
//     return response.json();
//   },

//   // Update all other methods similarly, adding the error handling for 401/403
//   // and using getAuthHeaders() without throwing if token is missing

//   async searchLeads(query: {
//     name?: string[];
//     occupation?: string[];
//     state?: string[];
//     designation?: string[];
//     searchTerm?: string;
//     sentDate?: string;
//     page?: number;
//     size?: number;
//   }): Promise<PaginatedLeads> {
//     const params = new URLSearchParams();

//     if (query.page !== undefined) params.append("page", String(query.page));
//     if (query.size !== undefined) params.append("size", String(query.size));
//     if (query.searchTerm) params.append("searchTerm", query.searchTerm);
//     if (query.sentDate) params.append("sentDate", query.sentDate);

//     query.name?.forEach((n) => params.append("name", n));
//     query.occupation?.forEach((o) => params.append("occupation", o));
//     query.state?.forEach((s) => params.append("state", s));
//     query.designation?.forEach((d) => params.append("designation", d));

//     const response = await fetch(`${API_BASE_URL}/leads/search?${params.toString()}`, {
//       headers: getAuthHeaders(),
//       credentials: 'include'
//     });

//     if (!response.ok) {
//       if (response.status === 401 || response.status === 403) {
//         window.location.href = '/login';
//         return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 };
//       }
//       const error = await response.text();
//       throw new Error(error || "Failed to fetch leads");
//     }
//     return response.json();
//   },

//   // Update getFilterOptions to handle missing token
//   async getFilterOptions(): Promise<FilterOptions> {
//     try {
//       const [designations, occupations, states] = await Promise.all([
//         fetch(`${API_BASE_URL}/leads/distinct/designations`, {
//           headers: getAuthHeaders(),
//           credentials: 'include'
//         }).catch(() => ({ ok: false })),
//         fetch(`${API_BASE_URL}/leads/distinct/occupations`, {
//           headers: getAuthHeaders(),
//           credentials: 'include'
//         }).catch(() => ({ ok: false })),
//         fetch(`${API_BASE_URL}/leads/distinct/states`, {
//           headers: getAuthHeaders(),
//           credentials: 'include'
//         }).catch(() => ({ ok: false }))
//       ]);

//       const [designationData, occupationData, stateData] = await Promise.all([
//         designations.ok ? designations.json().catch(() => []) : [],
//         occupations.ok ? occupations.json().catch(() => []) : [],
//         states.ok ? states.json().catch(() => []) : []
//       ]);

//       return {
//         designations: Array.isArray(designationData) ? designationData : [],
//         occupations: Array.isArray(occupationData) ? occupationData : [],
//         states: Array.isArray(stateData) ? stateData : []
//       };
//     } catch (error) {
//       console.error('Error fetching filter options:', error);
//       return {
//         designations: [],
//         occupations: [],
//         states: []
//       };
//     }
//   },

//   // ... [rest of the methods remain the same, just update headers and add error handling]
// };

import { Lead, PaginatedLeads, FilterOptions } from '@/types/lead';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const leadService = {
  async getLeads(page: number = 0, size: number = 10): Promise<PaginatedLeads> {
    const response = await fetch(`${API_BASE_URL}/leads?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.text();
      if (response.status === 401 || response.status === 403) {
        window.location.href = '/login';
        return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 };
      }
      throw new Error(error || 'Failed to fetch leads');
    }
    return response.json();
  },

  async searchLeads(query: {
    name?: string[];
    occupation?: string[];
    state?: string[];
    designation?: string[]; // This will be mapped to 'name' parameter
    searchTerm?: string;
    sentDate?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedLeads> {
    console.group('searchLeads - Input Query');
    console.log('Raw query object:', JSON.parse(JSON.stringify(query)));
    
    const params = new URLSearchParams();

    // Add pagination and search parameters
    if (query.page !== undefined) params.append("page", String(query.page));
    if (query.size !== undefined) params.append("size", String(query.size));
    if (query.searchTerm) params.append("searchTerm", query.searchTerm);
    if (query.sentDate) params.append("sentDate", query.sentDate);

    // Log before mapping designation to name parameter
    console.log('Before mapping - Name filters:', query.name);
    console.log('Before mapping - Designation filters:', query.designation);

    // Handle name filters
    if (query.name && query.name.length > 0) {
      query.name.forEach((n) => {
        if (n) params.append("name", n);
      });
    }
    
    // Handle designation filters separately
    if (query.designation && query.designation.length > 0) {
      query.designation.forEach((d) => {
        if (d) params.append("designation", d);
      });
    }
    
    // Add occupation filters if they exist
    if (query.occupation && query.occupation.length > 0) {
      query.occupation.forEach((o) => {
        if (o) params.append("occupation", o);
      });
    }
    
    // Add state filters if they exist
    if (query.state && query.state.length > 0) {
      query.state.forEach((s) => {
        if (s) params.append("state", s);
      });
    }

    console.log('Final URL parameters:', Object.fromEntries(params.entries()));
    console.groupEnd();

    console.log('Sending request to:', `${API_BASE_URL}/leads/search?${params.toString()}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/leads/search?${params.toString()}`, {
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('API Error Status:', response.status, response.statusText);
        if (response.status === 401 || response.status === 403) {
          console.warn('Authentication required, redirecting to login');
          window.location.href = '/login';
          return { content: [], totalElements: 0, totalPages: 0, size: 0, number: 0 };
        }
        const error = await response.text();
        console.error('API Error Response:', error);
        throw new Error(error || "Failed to fetch leads");
      }
      
      const data = await response.json();
      console.group('API Response');
      console.log('Total elements:', data.totalElements);
      console.log('Total pages:', data.totalPages);
      console.log('Current page items:', data.content?.length || 0);
      if (data.content && data.content.length > 0) {
        console.log('Sample item:', {
          name: data.content[0].name,
          designation: data.content[0].designation,
          occupation: data.content[0].occupation,
          state: data.content[0].state
        });
      }
      console.groupEnd();
      
      return data;
    } catch (error) {
      console.error('Error in searchLeads:', error);
      throw error;
    }
  },

  async getLeadById(id: string): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch lead');
    }
    return response.json();
  },

  async createLead(lead: Omit<Lead, 'leadId'>): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(lead),
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create lead');
    }
    return response.json();
  },

  async updateLead(id: string, lead: Partial<Lead>): Promise<Lead> {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(lead),
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to update lead');
    }
    return response.json();
  },

  async deleteLead(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/leads/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to delete lead');
    }
  },

  async getFilterOptions(): Promise<FilterOptions> {
    // Helper function to handle fetch with proper error handling
    interface FetchResponse {
      ok: boolean;
      json: () => Promise<string[]>;
    }

    const fetchWithErrorHandling = async (url: string): Promise<FetchResponse> => {
      try {
        const response = await fetch(url, {
          headers: getAuthHeaders(),
          credentials: 'include'
        });
        return response;
      } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
        // Return a mock response with empty data
        return {
          ok: false,
          json: async () => []
        };
      }
    };

    try {
      const [designations, occupations, states] = await Promise.all([
        fetchWithErrorHandling(`${API_BASE_URL}/leads/distinct/designations`),
        fetchWithErrorHandling(`${API_BASE_URL}/leads/distinct/occupations`),
        fetchWithErrorHandling(`${API_BASE_URL}/leads/distinct/states`)
      ]);

      const [designationData, occupationData, stateData] = await Promise.all([
        designations.ok ? designations.json().catch(() => []) : [],
        occupations.ok ? occupations.json().catch(() => []) : [],
        states.ok ? states.json().catch(() => []) : []
      ]);

      return {
        designations: Array.isArray(designationData) ? designationData : [],
        occupations: Array.isArray(occupationData) ? occupationData : [],
        states: Array.isArray(stateData) ? stateData : []
      };
    } catch (error) {
      console.error('Error fetching filter options:', error);
      return {
        designations: [],
        occupations: [],
        states: []
      };
    }
  },

  async getStates(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/leads/distinct/states`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch states');
    }
    return response.json();
  },

  async getOccupations(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/leads/distinct/occupations`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch occupations');
    }
    return response.json();
  },

  async getDesignations(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/leads/distinct/designations`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch designations');
    }
    return response.json();
  },

  async uploadExcel(file: File): Promise<Lead[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/leads/upload/excel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to upload Excel file');
    }
    return response.json();
  },

  async uploadCsv(file: File): Promise<Lead[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/leads/upload/csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to upload CSV file');
    }
    return response.json();
  }
};