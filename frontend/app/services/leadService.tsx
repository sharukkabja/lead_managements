import api from './api';

const leadService = {
  getLeads: (params?: Record<string, any>) =>
    api.get('/leads', { params }),

  getLeadById: (id: number) =>
    api.get(`/leads/${id}/timeline`),

  createLead: (data: any) =>
    api.post('/leads', data),

  updateStatus: (id: number, status: string) =>
    api.put(`/leads/${id}/status`, { status }),
  
  CheckDuplicateLead: (data: any) =>
    api.post('/leads/check-duplicate', data),
};

export default leadService;
