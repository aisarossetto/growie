import { Lead } from '../types';

/**
 * Utility to analyze lead similarity and detect duplicates before adding to the CRM.
 */
export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: string;
  matchedLead?: Lead;
  similarityScore: number; // 0 to 100
}

const cleanStr = (str?: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(ltda|sa|s\/a|me|eireli|epp|inc|corp|corporation)\b/gi, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const cleanDigits = (phone?: string): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
};

export const checkLeadDuplicate = (
  candidate: Partial<Lead>,
  existingLeads: Lead[]
): DuplicateCheckResult => {
  if (!existingLeads || existingLeads.length === 0) {
    return { isDuplicate: false, similarityScore: 0 };
  }

  const candEmail = (candidate.email || '').toLowerCase().trim();
  const candPhone = cleanDigits(candidate.phone);
  const candCompany = cleanStr(candidate.company);
  const candName = cleanStr(candidate.name);
  const candCity = cleanStr(candidate.city);

  for (const lead of existingLeads) {
    const leadEmail = (lead.email || '').toLowerCase().trim();
    const leadPhone = cleanDigits(lead.phone);
    const leadCompany = cleanStr(lead.company);
    const leadName = cleanStr(lead.name);
    const leadCity = cleanStr(lead.city);

    // 1. Exact Email Match
    if (candEmail && candEmail.includes('@') && candEmail === leadEmail) {
      return {
        isDuplicate: true,
        reason: `E-mail idêntico ao lead "${lead.name}" (${lead.company}) já cadastrado.`,
        matchedLead: lead,
        similarityScore: 100,
      };
    }

    // 2. Phone Match (if phone is provided and has >= 8 digits)
    if (candPhone.length >= 8 && leadPhone.length >= 8) {
      const p1 = candPhone.slice(-8);
      const p2 = leadPhone.slice(-8);
      if (p1 === p2) {
        return {
          isDuplicate: true,
          reason: `Telefone/WhatsApp (${candidate.phone}) coincide com "${lead.name}" (${lead.company}).`,
          matchedLead: lead,
          similarityScore: 95,
        };
      }
    }

    // 3. Similar Company Name & City Match
    if (candCompany && leadCompany && candCompany.length >= 3) {
      const companyMatches = candCompany === leadCompany || candCompany.includes(leadCompany) || leadCompany.includes(candCompany);
      
      if (companyMatches) {
        // If city also matches or contact name matches
        const cityMatches = candCity && leadCity && candCity === leadCity;
        const nameMatches = candName && leadName && (candName === leadName || candName.includes(leadName) || leadName.includes(candName));

        if (cityMatches && nameMatches) {
          return {
            isDuplicate: true,
            reason: `Mesma empresa "${lead.company}", contato "${lead.name}" e cidade "${lead.city || 'SP'}" já cadastrados.`,
            matchedLead: lead,
            similarityScore: 90,
          };
        } else if (companyMatches && nameMatches) {
          return {
            isDuplicate: true,
            reason: `Empresa "${lead.company}" e contato "${lead.name}" parecem ser idênticos ao cadastrado.`,
            matchedLead: lead,
            similarityScore: 85,
          };
        } else if (companyMatches && cityMatches) {
          return {
            isDuplicate: true,
            reason: `Empresa "${lead.company}" da cidade "${lead.city}" já cadastrada no CRM.`,
            matchedLead: lead,
            similarityScore: 80,
          };
        }
      }
    }

    // 4. Contact Name + City Match
    if (candName && leadName && candName.length >= 4 && candName === leadName) {
      if (candCity && leadCity && candCity === leadCity) {
        return {
          isDuplicate: true,
          reason: `Contato "${lead.name}" da cidade "${lead.city}" já cadastrado.`,
          matchedLead: lead,
          similarityScore: 75,
        };
      }
    }
  }

  return { isDuplicate: false, similarityScore: 0 };
};
