import { create } from 'zustand';

export const useCompanyStore = create((set) => ({
  companies: [
    // Mock data - in production, this comes from your backend
    { id: 1, name: 'Acme Corp', admin_email: 'admin@acme.com', created_at: '2025-01-15' },
    { id: 2, name: 'TechStart Inc', admin_email: 'admin@techstart.com', created_at: '2025-02-20' },
  ],
  
  addCompany: (company) => set((state) => ({
    companies: [...state.companies, company]
  })),
  
  checkCompanyExists: (companyName) => {
    return set((state) => {
      const exists = state.companies.some(
        c => c.name.toLowerCase() === companyName.toLowerCase()
      );
      return { companyExists: exists };
    });
  },
  
  getCompanyByName: (companyName) => {
    return set((state) => {
      const company = state.companies.find(
        c => c.name.toLowerCase() === companyName.toLowerCase()
      );
      return { selectedCompany: company };
    });
  },
}));
