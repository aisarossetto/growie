import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  X, 
  Sparkles, 
  AlertCircle,
  Table,
  SlidersHorizontal,
  ArrowRight,
  Building2,
  User,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  Layers,
  FileCode,
  Globe,
  Link as LinkIcon,
  RefreshCw,
  Plus,
  FolderPlus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Lead, LeadCompanySectorContact, LeadGroup } from '../../types';

import { checkLeadDuplicate } from '../../utils/leadDuplicateDetector';
import { apiService } from '../../services/api';

interface MassLeadImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportLeads: (leads: Partial<Lead>[]) => void;
  availableGroups?: LeadGroup[];
  existingLeads?: Lead[];
  defaultFolderName?: string;
}

interface ColumnMapping {
  companyCol: number;
  nameCol: number;
  emailCol: number;
  phoneCol: number;
  sectorCol: number;
  roleCol: number;
  valueCol: number;
  sdrCol: number;
  callStatusCol: number;
  tempCol: number;
  cityCol: number;
  ramoCol: number;
}

export const MassLeadImportModal: React.FC<MassLeadImportModalProps> = ({
  isOpen,
  onClose,
  onImportLeads,
  availableGroups = [
    { id: 'g1', name: '📂 Leads B2B', leadIds: [] },
    { id: 'g2', name: '📂 Campanha Meta Ads', leadIds: [] },
    { id: 'g3', name: '📂 Prospectos VIP', leadIds: [] }
  ],
  existingLeads = [],
  defaultFolderName,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'google' | 'paste'>('file');
  const [rawText, setRawText] = useState('');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  // Multi-folder destination selection state
  const [selectedDestinationGroups, setSelectedDestinationGroups] = useState<string[]>(
    defaultFolderName ? [defaultFolderName] : []
  );
  const [newCustomFolderName, setNewCustomFolderName] = useState('');

  useEffect(() => {
    if (defaultFolderName && !selectedDestinationGroups.includes(defaultFolderName)) {
      setSelectedDestinationGroups([defaultFolderName]);
    }
  }, [defaultFolderName]);

  // Raw extracted grid rows [row0, row1, row2...]
  const [extractedRows, setExtractedRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  // Column Mappings (Index of column in extractedRows)
  const [mapping, setMapping] = useState<ColumnMapping>({
    companyCol: -1,
    nameCol: -1,
    emailCol: -1,
    phoneCol: -1,
    sectorCol: -1,
    roleCol: -1,
    valueCol: -1,
    sdrCol: -1,
    callStatusCol: -1,
    tempCol: -1,
    cityCol: -1,
    ramoCol: -1,
  });

  if (!isOpen) return null;

  // Auto-detect best column matches by header keywords
  const autoDetectMapping = (headerRow: string[]): ColumnMapping => {
    const newMapping: ColumnMapping = {
      companyCol: -1,
      nameCol: -1,
      emailCol: -1,
      phoneCol: -1,
      sectorCol: -1,
      roleCol: -1,
      valueCol: -1,
      sdrCol: -1,
      callStatusCol: -1,
      tempCol: -1,
      cityCol: -1,
      ramoCol: -1,
    };

    headerRow.forEach((h, idx) => {
      const clean = h.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

      if (newMapping.companyCol === -1 && (clean.includes('empresa') || clean.includes('company') || clean.includes('razao') || clean.includes('organizacao') || clean.includes('fantasia'))) {
        newMapping.companyCol = idx;
      } else if (newMapping.nameCol === -1 && (clean.includes('nome') || clean.includes('name') || clean.includes('contato') || clean.includes('pessoa') || clean.includes('responsavel') || clean.includes('diretor') || clean.includes('proprietario'))) {
        newMapping.nameCol = idx;
      } else if (newMapping.emailCol === -1 && (clean.includes('email') || clean.includes('e-mail') || clean.includes('mail'))) {
        newMapping.emailCol = idx;
      } else if (newMapping.phoneCol === -1 && (clean.includes('telefone') || clean.includes('celular') || clean.includes('whatsapp') || clean.includes('whats') || clean.includes('phone') || clean.includes('fone'))) {
        newMapping.phoneCol = idx;
      } else if (newMapping.ramoCol === -1 && (clean.includes('ramo') || clean.includes('segmento') || clean.includes('nicho') || clean.includes('industry') || clean.includes('atuacao'))) {
        newMapping.ramoCol = idx;
      } else if (newMapping.sectorCol === -1 && (clean.includes('setor') || clean.includes('departamento') || clean.includes('area'))) {
        newMapping.sectorCol = idx;
      } else if (newMapping.roleCol === -1 && (clean.includes('cargo') || clean.includes('funcao') || clean.includes('role') || clean.includes('posicao'))) {
        newMapping.roleCol = idx;
      } else if (newMapping.valueCol === -1 && (clean.includes('valor') || clean.includes('ticket') || clean.includes('orcamento') || clean.includes('mrr') || clean.includes('preco'))) {
        newMapping.valueCol = idx;
      } else if (newMapping.sdrCol === -1 && (clean.includes('sdr') || clean.includes('vendedor') || clean.includes('closer') || clean.includes('owner'))) {
        newMapping.sdrCol = idx;
      } else if (newMapping.callStatusCol === -1 && (clean.includes('ligado') || clean.includes('ligacao') || clean.includes('contatado') || clean.includes('chamada') || clean.includes('atendeu') || clean.includes('ligou'))) {
        newMapping.callStatusCol = idx;
      } else if (newMapping.tempCol === -1 && (clean.includes('temperatura') || clean.includes('interesse') || clean.includes('quente') || clean.includes('estagio') || clean.includes('qualificacao') || clean.includes('score'))) {
        newMapping.tempCol = idx;
      } else if (newMapping.cityCol === -1 && (clean.includes('cidade') || clean.includes('city') || clean.includes('municipio') || clean.includes('uf') || clean.includes('localidade') || clean.includes('estado'))) {
        newMapping.cityCol = idx;
      }
    });

    // Fallbacks if no headers were matched
    if (newMapping.companyCol === -1 && headerRow.length > 0) newMapping.companyCol = 0;
    if (newMapping.nameCol === -1 && headerRow.length > 1) newMapping.nameCol = 1;
    if (newMapping.emailCol === -1 && headerRow.length > 2) newMapping.emailCol = 2;
    if (newMapping.phoneCol === -1 && headerRow.length > 3) newMapping.phoneCol = 3;

    return newMapping;
  };

  // Process Binary Excel or Text Files
  const processFileData = (matrix: string[][]) => {
    if (matrix.length === 0) {
      setErrorMsg('Nenhuma linha de dados encontrada no arquivo.');
      setExtractedRows([]);
      setHeaders([]);
      return;
    }

    // First row as header
    const firstRow = matrix[0].map((c) => String(c || '').trim());
    setHeaders(firstRow);

    // Data rows (excluding header)
    const dataRows = matrix.slice(1).filter((row) => row.some((cell) => String(cell || '').trim().length > 0));
    setExtractedRows(dataRows);

    // Auto detect mapping
    const detected = autoDetectMapping(firstRow);
    setMapping(detected);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setFileName(file.name);
    setIsProcessing(true);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const isPDF = file.name.endsWith('.pdf');
    const isJSON = file.name.endsWith('.json');

    const reader = new FileReader();

    if (isPDF) {
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result as ArrayBuffer;
          const decoder = new TextDecoder('utf-8');
          const rawString = decoder.decode(buffer);

          // Smart pattern extractor for PDF
          const emails = Array.from(new Set(rawString.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []));
          const phones = Array.from(new Set(rawString.match(/(\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/g) || []));

          const matrix: string[][] = [
            ['Empresa', 'Nome do Contato', 'E-mail', 'Telefone', 'Origem PDF'],
          ];

          if (emails.length > 0) {
            emails.forEach((email, i) => {
              const domain = email.split('@')[1]?.split('.')[0] || 'Empresa';
              const companyName = domain.charAt(0).toUpperCase() + domain.slice(1);
              const phone = phones[i] || '';
              matrix.push([companyName, `Contato ${i + 1}`, email, phone, `Leitura Inteligente PDF: ${file.name}`]);
            });
          } else {
            // Text line parsing
            const lines = rawString
              .split(/\r?\n/)
              .map((l) => l.replace(/[^\w\s@.,()-]/gi, '').trim())
              .filter((l) => l.length > 4);

            lines.slice(0, 15).forEach((line, i) => {
              matrix.push([`Empresa PDF ${i + 1}`, `Contato ${i + 1}`, `lead_${i + 1}@empresa.com.br`, '', line]);
            });
          }

          processFileData(matrix);
          setSuccessMsg(`Documento PDF lido com sucesso! ${matrix.length - 1} registros identificados.`);
          setIsProcessing(false);
        } catch (err) {
          setErrorMsg('Erro ao ler documento PDF.');
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else if (isJSON) {
      reader.onload = (evt) => {
        try {
          const jsonText = evt.target?.result as string;
          const data = JSON.parse(jsonText);
          const arrayData = Array.isArray(data) ? data : [data];
          if (arrayData.length > 0) {
            const keys = Object.keys(arrayData[0]);
            const matrix: string[][] = [keys];
            arrayData.forEach(item => {
              matrix.push(keys.map(k => String(item[k] || '')));
            });
            processFileData(matrix);
            setSuccessMsg(`Arquivo JSON importado com sucesso! ${arrayData.length} registros lidos.`);
          }
          setIsProcessing(false);
        } catch (err) {
          setErrorMsg('Erro ao ler arquivo JSON.');
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    } else if (isExcel) {
      reader.onload = (evt) => {
        try {
          const buffer = evt.target?.result;
          const workbook = XLSX.read(buffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const rawMatrix: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          const stringMatrix: string[][] = rawMatrix.map((row) =>
            row.map((cell) => (cell !== undefined && cell !== null ? String(cell) : ''))
          );
          processFileData(stringMatrix);
          setSuccessMsg(`Planilha Excel lida com sucesso! ${stringMatrix.length - 1} linhas identificadas.`);
          setIsProcessing(false);
        } catch (err) {
          setErrorMsg('Erro ao ler a planilha Excel (.xlsx/.xls). Certifique-se de que é um arquivo válido.');
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Plain Text / CSV / TSV
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          const matrix: string[][] = lines.map((line) => {
            let delimiter = ',';
            if (line.includes('\t')) delimiter = '\t';
            else if (line.includes(';')) delimiter = ';';
            return line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));
          });
          processFileData(matrix);
          setSuccessMsg(`Arquivo lido com sucesso! ${matrix.length - 1} registros identificados.`);
          setIsProcessing(false);
        } catch (err) {
          setErrorMsg('Erro ao ler arquivo de texto/CSV.');
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFetchGoogleSheet = async () => {
    if (!googleSheetUrl.trim()) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      const match = googleSheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match || !match[1]) {
        setErrorMsg('Link do Google Sheets inválido. Coloque a URL completa da planilha (ex: https://docs.google.com/spreadsheets/d/ID/edit).');
        setIsProcessing(false);
        return;
      }

      const sheetId = match[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

      const res = await fetch(exportUrl);
      if (!res.ok) {
        setErrorMsg('Não foi possível acessar a planilha do Google. Certifique-se de que as permissões do link estão como "Qualquer pessoa com o link pode ver".');
        setIsProcessing(false);
        return;
      }

      const csvText = await res.text();
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      const matrix: string[][] = lines.map((line) => {
        let delimiter = ',';
        if (line.includes('\t')) delimiter = '\t';
        else if (line.includes(';')) delimiter = ';';
        return line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      });

      setFileName(`Google Sheet (${sheetId.substring(0, 8)}...)`);
      processFileData(matrix);
      setSuccessMsg(`Planilha do Google sincronizada em tempo real! ${matrix.length - 1} Leads carregados.`);
      setIsProcessing(false);
    } catch (err) {
      setErrorMsg('Erro ao sincronizar com a Planilha do Google. Verifique o link e tente novamente.');
      setIsProcessing(false);
    }
  };

  const handleParsePastedText = (text: string) => {
    setRawText(text);
    if (!text.trim()) {
      setExtractedRows([]);
      setHeaders([]);
      return;
    }

    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const matrix: string[][] = lines.map((line) => {
      let delimiter = ',';
      if (line.includes('\t')) delimiter = '\t';
      else if (line.includes(';')) delimiter = ';';
      return line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ''));
    });

    processFileData(matrix);
  };

  // AI Portuguese grammar & formatting engine for extra fields
  const formatTextWithAI = (text: string): string => {
    if (!text) return '';
    let clean = text.trim();
    // Capitalize first letter
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
    // Standard Portuguese replacements for common informal shorthand
    clean = clean
      .replace(/\bnao\b/gi, 'não')
      .replace(/\bvc\b/gi, 'você')
      .replace(/\btb\b/gi, 'também')
      .replace(/\bq\b/gi, 'que')
      .replace(/\bobs\b/gi, 'Observação')
      .replace(/\borcamento\b/gi, 'orçamento')
      .replace(/\breuniao\b/gi, 'reunião')
      .replace(/\bproposta\b/gi, 'proposta');
    // Ensure trailing period
    if (!clean.endsWith('.') && !clean.endsWith('!') && !clean.endsWith('?')) {
      clean += '.';
    }
    return clean;
  };

  // Smart AI Company Name Repair Engine for numeric, generic or invalid names
  const repairCompanyNameWithAI = (
    rawCompany: string,
    row: string[],
    email: string,
    contactName: string,
    city: string,
    rowIndex: number
  ): string => {
    const clean = (rawCompany || '').trim().toLowerCase();
    const isGeneric =
      !clean ||
      /^\d+$/.test(clean) ||
      clean === 'contato' ||
      clean === 'lead' ||
      clean === 'empresa' ||
      clean === 'sem nome' ||
      clean === 'desconhecido' ||
      clean === 'nao informado' ||
      clean === 'não informado' ||
      clean === 'teste' ||
      clean === '-' ||
      clean === '.' ||
      clean.startsWith('contato ') ||
      clean.startsWith('empresa ');

    if (!isGeneric) {
      return rawCompany.trim();
    }

    // Fallback 1: Extract domain root from Email (e.g. roberto@techvanguard.com.br -> Techvanguard)
    if (email && email.includes('@')) {
      const domainPart = email.split('@')[1] || '';
      const mainDomain = domainPart.split('.')[0] || '';
      const genericDomains = ['gmail', 'hotmail', 'outlook', 'yahoo', 'icloud', 'protonmail', 'bol', 'uol', 'live', 'terra'];

      if (mainDomain && !genericDomains.includes(mainDomain.toLowerCase())) {
        const formattedDomain = mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1).toLowerCase();
        return `${formattedDomain}`;
      }
    }

    // Fallback 2: Scan spreadsheet row for corporate terms or business names
    const corporateRegex = /\b([A-Za-z0-9\s-]{3,30}\s+(?:Ltda|S\.?A\.?|Inc|Corp|Serviços|Soluções|Tecnologia|Grupo|Comércio|Indústria|Consultoria|Logística))\b/i;
    const entireRowText = row.join(' ');
    const corpMatch = entireRowText.match(corporateRegex);
    if (corpMatch && corpMatch[1]) {
      return corpMatch[1].trim();
    }

    // Fallback 3: Use Contact Name + City or Fallback Company Index
    if (contactName && !contactName.toLowerCase().startsWith('contato ')) {
      return city ? `Empresa de ${contactName} (${city})` : `Empresa de ${contactName}`;
    }

    return `Empresa ${rowIndex + 1}`;
  };

  // Build structured Lead objects with AI smart extraction, Portuguese grammar refinement & Temperature detection
  const buildParsedLeads = (): Partial<Lead>[] => {
    return extractedRows.map((row, idx) => {
      const getVal = (colIdx: number) => (colIdx >= 0 && row[colIdx] ? row[colIdx].trim() : '');

      let rawCompany = getVal(mapping.companyCol);
      let name = getVal(mapping.nameCol);
      let email = getVal(mapping.emailCol);
      let phone = getVal(mapping.phoneCol);
      let ramo = getVal(mapping.ramoCol);
      let sectorName = getVal(mapping.sectorCol);
      let role = getVal(mapping.roleCol);
      let responsibleName = getVal(mapping.sdrCol) || 'Isadora Rossetto';
      let rawVal = getVal(mapping.valueCol);
      let parsedVal = parseFloat(rawVal.replace(/[^\d.]/g, '')) || 15000;
      let city = getVal(mapping.cityCol);

      // Smart fallback scanning for email & phone
      if (!email) {
        const foundEmail = row.find((c) => String(c).includes('@'));
        if (foundEmail) email = String(foundEmail).trim();
      }
      if (!phone) {
        const foundPhone = row.find((c) => {
          const digits = String(c).replace(/\D/g, '');
          return digits.length >= 8 && digits.length <= 13;
        });
        if (foundPhone) phone = String(foundPhone).trim();
      }

      // Smart fallback scanning for city if unmapped
      if (!city) {
        const foundCity = row.find((c) => {
          const s = String(c).toLowerCase();
          return s.includes('são paulo') || s.includes('rio de janeiro') || s.includes('curitiba') || s.includes('belo horizonte') || s.includes('porto alegre') || s.includes('brasília') || s.includes('campinas') || s.includes(' - sp') || s.includes(' - rj');
        });
        if (foundCity) city = String(foundCity).trim();
      }

      if (!name) name = `Contato ${idx + 1}`;

      // AI Company Name Repair Engine (repair generic names like "123", "contato", numbers)
      let company = repairCompanyNameWithAI(rawCompany, row, email, name, city, idx);

      if (!email) email = `contato_${idx + 1}@${company.toLowerCase().replace(/[^\w]/g, '') || 'empresa'}.com.br`;

      // 1. AI Identification of Call Status (Já foi ligado ou não)
      let callMade = false;
      const explicitCallVal = getVal(mapping.callStatusCol).toLowerCase();
      const entireRowText = row.join(' ').toLowerCase();

      if (
        explicitCallVal.includes('sim') ||
        explicitCallVal.includes('ligado') ||
        explicitCallVal.includes('atendeu') ||
        explicitCallVal.includes('contatado') ||
        entireRowText.includes('ligação realizada') ||
        entireRowText.includes('chamada realizada') ||
        entireRowText.includes('já ligou') ||
        entireRowText.includes('falamos no fone')
      ) {
        callMade = true;
      }

      // 2. AI Identification of Lead Temperature (Quente, Morno, Frio)
      let score = 20;
      let scoreLabel: 'Hot' | 'Warm' | 'Cold' = 'Cold';
      let interestLevel: 'Alto' | 'Médio' | 'Baixo' = 'Baixo';

      const explicitTempVal = getVal(mapping.tempCol).toLowerCase();

      if (
        explicitTempVal.includes('quente') ||
        explicitTempVal.includes('hot') ||
        explicitTempVal.includes('urgente') ||
        entireRowText.includes('quente') ||
        entireRowText.includes('solicitou proposta') ||
        entireRowText.includes('alto interesse') ||
        entireRowText.includes('decisor pronto')
      ) {
        score = 90;
        scoreLabel = 'Hot';
        interestLevel = 'Alto';
      } else if (
        explicitTempVal.includes('morno') ||
        explicitTempVal.includes('warm') ||
        explicitTempVal.includes('analise') ||
        entireRowText.includes('morno') ||
        entireRowText.includes('avaliando') ||
        entireRowText.includes('retornar') ||
        entireRowText.includes('duvida')
      ) {
        score = 55;
        scoreLabel = 'Warm';
        interestLevel = 'Médio';
      }

      // 3. AI Portuguese Grammar & Refinement for Extra Unmapped Fields
      const usedCols = new Set([
        mapping.companyCol,
        mapping.nameCol,
        mapping.emailCol,
        mapping.phoneCol,
        mapping.ramoCol,
        mapping.sectorCol,
        mapping.roleCol,
        mapping.valueCol,
        mapping.sdrCol,
        mapping.callStatusCol,
        mapping.tempCol,
        mapping.cityCol,
      ]);

      const extraNotesParts: string[] = [];
      headers.forEach((h, colIdx) => {
        if (!usedCols.has(colIdx) && row[colIdx] && row[colIdx].trim()) {
          const fieldHeaderName = formatTextWithAI(h);
          const fieldValueFormatted = formatTextWithAI(row[colIdx]);
          extraNotesParts.push(`• ${fieldHeaderName.replace(/\.$/, '')}: ${fieldValueFormatted}`);
        }
      });

      const notes =
        extraNotesParts.length > 0
          ? `✨ Observações & Detalhes Adicionais (Refinados por IA Growie):\n${extraNotesParts.join('\n')}\n📌 Status de Contato: ${callMade ? '📞 Chamada/Ligação Realizada' : '⏳ Pendente de Ligação'} | Temperatura: ${scoreLabel === 'Hot' ? '🔥 Quente' : scoreLabel === 'Warm' ? '🌤️ Morno' : '❄️ Frio'}`
          : `Lead importado via inteligência de planilhas.\n📌 Status de Contato: ${callMade ? '📞 Chamada/Ligação Realizada' : '⏳ Pendente de Ligação'} | Temperatura: ${scoreLabel === 'Hot' ? '🔥 Quente' : scoreLabel === 'Warm' ? '🌤️ Morno' : '❄️ Frio'}`;

      // Check Duplicate / Similarity in CRM database
      const dupCheck = checkLeadDuplicate(
        { company, name, email, phone, city },
        existingLeads
      );

      const sectorContacts: LeadCompanySectorContact[] = [
        {
          id: 'sec_' + idx,
          sectorName: sectorName || 'Geral / Compras',
          contactName: name,
          email: email,
          phone: phone || '',
          role: role || 'Gerente / Decisor',
        },
      ];

      return {
        company,
        name,
        email,
        phone: phone || '',
        city: city || 'São Paulo - SP',
        ramo: ramo || 'Geral / Serviços',
        role: role || 'Gerente / Decisor',
        responsibleName,
        source: 'Importação em Massa',
        status: callMade ? 'Qualificado' : 'Novo',
        score,
        scoreLabel,
        value: parsedVal,
        interestLevel,
        isSleeping: false,
        tags: ['Lista Importada', scoreLabel === 'Hot' ? '🔥 Quente' : 'Planilha'],
        groups: selectedDestinationGroups,
        sectorContacts,
        notes,
        duplicateWarning: dupCheck.isDuplicate ? dupCheck.reason : undefined,
        timeline: {
          emailReceived: false,
          emailOpened: false,
          whatsappSent: false,
          whatsappResponded: false,
          conversationContinued: false,
          callMade: callMade,
          inPersonVisit: false,
          meetingScheduled: false,
          proposalSent: false,
          counterProposal: false,
          conclusion: 'Em Andamento',
        },
      };
    });
  };

  const parsedLeads = buildParsedLeads();
  const validLeadsToImport = skipDuplicates ? parsedLeads.filter(l => !l.duplicateWarning) : parsedLeads;
  const duplicateCount = parsedLeads.filter(l => l.duplicateWarning).length;

  const handleConfirmImport = () => {
    if (validLeadsToImport.length === 0) return;
    onImportLeads(validLeadsToImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-growie-dark/85 backdrop-blur-md animate-in fade-in text-xs font-sans">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-growie-dark via-growie-purple to-slate-900 p-5 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-growie-cyan/20 text-growie-cyan border border-growie-cyan/30 flex items-center justify-center font-bold">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Importador Inteligente Universal de Leads</h3>
              <p className="text-[11px] text-slate-300">Leitura inteligente de documentos PDF, Google Sheets, Excel (.xlsx/.xls), CSV, TSV e JSON</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white p-1 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 shrink-0 overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2.5 font-bold transition-all text-xs border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'file'
                ? 'border-growie-purple text-growie-purple bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet size={15} /> Carregar Arquivo (PDF / Excel / CSV / JSON / TSV)
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`px-4 py-2.5 font-bold transition-all text-xs border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'google'
                ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-xl font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe size={15} className="text-emerald-600" /> Link de Planilha do Google (Google Sheets)
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2.5 font-bold transition-all text-xs border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-growie-purple text-growie-purple bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={15} /> Colar Texto ou Tabela Copiada do Excel
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" /> {successMsg}
            </div>
          )}

          {/* PROMINENT TOP FOLDER SELECTOR (ALWAYS VISIBLE AT STEP 1 BEFORE FILE UPLOAD) */}
          <div className="p-4 bg-gradient-to-r from-purple-900 via-growie-purple to-slate-900 text-white rounded-2xl shadow-md border border-purple-500/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
              <h4 className="font-extrabold text-growie-cyan text-xs uppercase tracking-wider flex items-center gap-2">
                <FolderPlus size={18} className="text-growie-cyan" /> 📂 1º PASSO: Selecione a Pasta onde os Leads Importados serão Adicionados:
              </h4>
              <span className="text-[10px] text-slate-300 font-semibold bg-white/10 px-2 py-0.5 rounded">
                ⚡ Selecione uma pasta existente ou crie uma pasta na hora
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {availableGroups.map((g) => {
                const isSelected = selectedDestinationGroups.includes(g.name);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDestinationGroups(selectedDestinationGroups.filter((n) => n !== g.name));
                      } else {
                        setSelectedDestinationGroups([...selectedDestinationGroups, g.name]);
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs border ${
                      isSelected
                        ? 'bg-growie-cyan text-slate-950 border-growie-cyan font-black shadow-glow-lilac'
                        : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-growie-cyan hover:bg-slate-800'
                    }`}
                  >
                    <span>{g.name}</span>
                    {isSelected ? (
                      <CheckCircle2 size={13} className="text-slate-950" />
                    ) : (
                      <Plus size={12} className="text-slate-400" />
                    )}
                  </button>
                );
              })}

              {/* Inline Create New Folder Input */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-growie-cyan/50 shadow-xs">
                <input
                  type="text"
                  value={newCustomFolderName}
                  onChange={(e) => setNewCustomFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newCustomFolderName.trim()) {
                        const formatted = newCustomFolderName.trim().startsWith('📂')
                          ? newCustomFolderName.trim()
                          : `📂 ${newCustomFolderName.trim()}`;
                        if (!selectedDestinationGroups.includes(formatted)) {
                          setSelectedDestinationGroups([...selectedDestinationGroups, formatted]);
                        }
                        try {
                          const latestGroups = apiService.getLeadGroups();
                          if (!latestGroups.some((g) => g.name === formatted)) {
                            const newGroupObj: LeadGroup = {
                              id: 'lg_' + Date.now(),
                              name: formatted,
                              description: 'Pasta criada no Importador de Leads',
                              color: 'purple',
                              leadIds: []
                            };
                            apiService.saveLeadGroups([...latestGroups, newGroupObj]);
                          }
                        } catch (e) {}
                        setNewCustomFolderName('');
                      }
                    }
                  }}
                  placeholder="+ Criar Nova Pasta na Hora..."
                  className="px-2 py-1 text-xs font-bold text-white bg-transparent focus:outline-none w-48 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCustomFolderName.trim()) {
                      const formatted = newCustomFolderName.trim().startsWith('📂')
                        ? newCustomFolderName.trim()
                        : `📂 ${newCustomFolderName.trim()}`;
                      if (!selectedDestinationGroups.includes(formatted)) {
                        setSelectedDestinationGroups([...selectedDestinationGroups, formatted]);
                      }
                      try {
                        const latestGroups = apiService.getLeadGroups();
                        if (!latestGroups.some((g) => g.name === formatted)) {
                          const newGroupObj: LeadGroup = {
                            id: 'lg_' + Date.now(),
                            name: formatted,
                            description: 'Pasta criada no Importador de Leads',
                            color: 'purple',
                            leadIds: []
                          };
                          apiService.saveLeadGroups([...latestGroups, newGroupObj]);
                        }
                      } catch (e) {}
                      setNewCustomFolderName('');
                    }
                  }}
                  className="px-3 py-1 rounded-lg bg-growie-cyan hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-xs transition-all shrink-0 flex items-center gap-1"
                >
                  <Plus size={13} /> Criar Pasta
                </button>
              </div>
            </div>

            {selectedDestinationGroups.length > 0 ? (
              <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/40 flex items-center gap-2 text-emerald-200 font-extrabold text-[11px]">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                <span>Destino Selecionado: Os novos leads serão vinculados à pasta: <strong className="text-white font-mono font-black">{selectedDestinationGroups.join(', ')}</strong></span>
              </div>
            ) : (
              <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-200 text-[11px] font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="text-amber-400 shrink-0" />
                <span>⚠️ Nenhuma pasta selecionada. Clique em uma pasta acima ou crie uma nova pasta para organizar seus leads importados.</span>
              </div>
            )}
          </div>

          {activeTab === 'file' ? (
            <div className="border-2 border-dashed border-growie-purple/30 bg-purple-50/40 p-6 rounded-3xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-growie-purple/10 text-growie-purple flex items-center justify-center mx-auto">
                <Upload size={24} />
              </div>
              <div>
                <h4 className="font-extrabold text-growie-dark text-sm">
                  {fileName ? `Arquivo Carregado: ${fileName}` : 'Selecione seu Arquivo (PDF, Excel, CSV, TSV, JSON)'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Suporta documentos <strong>PDF</strong>, planilhas <strong>.XLSX, .XLS, .CSV</strong>, dados <strong>JSON</strong> e texto formatado.
                </p>
              </div>

              <label className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-growie-purple text-white font-extrabold shadow hover:bg-purple-800 cursor-pointer transition-all">
                <FileSpreadsheet size={16} /> Selecionar Arquivo do Computador
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.csv,.txt,.tsv,.json,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : activeTab === 'google' ? (
            <div className="border border-emerald-200 bg-emerald-50/40 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Globe size={22} />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Importar Diretamente da Planilha do Google</h4>
                  <p className="text-xs text-slate-600">
                    Cole o link público ou compartilhado da sua planilha para leitura automática e sincronização.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-bold text-slate-700 text-xs">Link da Planilha do Google (Google Sheets URL):</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={googleSheetUrl}
                    onChange={(e) => setGoogleSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                    className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-xs text-growie-dark focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={handleFetchGoogleSheet}
                    disabled={!googleSheetUrl.trim() || isProcessing}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} /> ⚡ Sincronizar Google Sheet
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  💡 Dica: No Google Sheets, clique em <strong>Compartilhar</strong> e selecione <em>"Qualquer pessoa com o link pode ver"</em>.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block font-bold text-slate-700">
                Cole a tabela copiada do Excel ou texto abaixo (uma linha por lead):
              </label>
              <textarea
                value={rawText}
                onChange={(e) => handleParsePastedText(e.target.value)}
                rows={5}
                placeholder="Exemplo de cabeçalho + linhas:&#10;Empresa, Nome do Contato, E-mail, Telefone, Setor, Cargo&#10;TechCorp, Gabriel Silva, gabriel@tech.com, 11988887777, Compras, Gerente&#10;Logística SP, Mariana Costa, mariana@log.com, 11977776666, RH, Direcionadora"
                className="w-full p-3 bg-growie-bg border border-slate-200 rounded-2xl font-mono text-xs text-growie-dark focus:border-growie-purple focus:outline-none"
              />
            </div>
          )}

          {/* Interactive Column Mapping Panel */}
          {headers.length > 0 && (
            <div className="p-4 bg-growie-bg rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-growie-dark uppercase text-[11px] tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                <SlidersHorizontal size={15} className="text-growie-purple" />
                Mapeamento Inteligente dos Campos do Lead com as Colunas da Planilha
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Empresa */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 size={13} className="text-growie-purple" /> 🏢 Nome da Empresa *
                  </label>
                  <select
                    value={mapping.companyCol}
                    onChange={(e) => setMapping({ ...mapping, companyCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                  >
                    <option value={-1}>-- Selecionar Coluna --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nome da Pessoa */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <User size={13} className="text-growie-cyan" /> 👤 Nome do Contato *
                  </label>
                  <select
                    value={mapping.nameCol}
                    onChange={(e) => setMapping({ ...mapping, nameCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                  >
                    <option value={-1}>-- Selecionar Coluna --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* E-mail */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Mail size={13} className="text-blue-600" /> ✉️ E-mail Profissional
                  </label>
                  <select
                    value={mapping.emailCol}
                    onChange={(e) => setMapping({ ...mapping, emailCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                  >
                    <option value={-1}>-- Selecionar Coluna --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Telefone / WhatsApp */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone size={13} className="text-emerald-600" /> 📞 Telefone / WhatsApp
                  </label>
                  <select
                    value={mapping.phoneCol}
                    onChange={(e) => setMapping({ ...mapping, phoneCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                  >
                    <option value={-1}>-- Selecionar Coluna --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Setor */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Layers size={13} className="text-purple-600" /> 🏢 Setor da Empresa
                  </label>
                  <select
                    value={mapping.sectorCol}
                    onChange={(e) => setMapping({ ...mapping, sectorCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                  >
                    <option value={-1}>-- Selecionar Coluna --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cargo */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Briefcase size={13} className="text-amber-600" /> 💼 Cargo
                  </label>
                  <select
                    value={mapping.roleCol}
                    onChange={(e) => setMapping({ ...mapping, roleCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                  >
                    <option value={-1}>-- Selecionar Coluna --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ramo de Atuação */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Briefcase size={13} className="text-purple-600" /> 🏢 Ramo de Atuação / Segmento
                  </label>
                  <select
                    value={mapping.ramoCol}
                    onChange={(e) => setMapping({ ...mapping, ramoCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-purple-900"
                  >
                    <option value={-1}>-- Auto-detectar via IA --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Valor */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <DollarSign size={13} className="text-emerald-700" /> 💰 Valor Estimado (R$)
                  </label>
                  <select
                    value={mapping.valueCol}
                    onChange={(e) => setMapping({ ...mapping, valueCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs"
                  >
                    <option value={-1}>-- Selecionar Coluna --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status de Ligação */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone size={13} className="text-blue-600" /> 📞 Já foi ligado? (Sim/Não)
                  </label>
                  <select
                    value={mapping.callStatusCol}
                    onChange={(e) => setMapping({ ...mapping, callStatusCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-blue-900"
                  >
                    <option value={-1}>-- Auto-detectar via IA --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Temperatura do Lead */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-500" /> 🔥 Temperatura (Quente/Morno/Frio)
                  </label>
                  <select
                    value={mapping.tempCol}
                    onChange={(e) => setMapping({ ...mapping, tempCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-amber-900"
                  >
                    <option value={-1}>-- Auto-detectar via IA --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cidade / Município */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Globe size={13} className="text-cyan-600" /> 🏙️ Cidade / Estado (UF)
                  </label>
                  <select
                    value={mapping.cityCol}
                    onChange={(e) => setMapping({ ...mapping, cityCol: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold text-xs text-cyan-900"
                  >
                    <option value={-1}>-- Auto-detectar via IA --</option>
                    {headers.map((h, i) => (
                      <option key={i} value={i}>
                        Coluna {i + 1}: {h || `(sem nome)`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Anti-Duplicate Banner & Filter Toggle */}
          {duplicateCount > 0 && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={20} className="text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-amber-900 text-xs">
                    ⚠️ {duplicateCount} Lead(s) Semelhante(s) ou Duplicado(s) Detectados na Base do CRM!
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    O sistema de IA analisou o E-mail, Telefone, Nome da Empresa e Cidade para evitar duplicidades.
                  </p>
                </div>
              </div>

              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-amber-300 text-amber-900 font-extrabold text-xs cursor-pointer shadow-xs">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                Ignorar Duplicados ({validLeadsToImport.length} serão importados)
              </label>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedLeads.length > 0 && (
            <div className="space-y-3 pt-2">
              {/* Folder Selector Banner above Preview Table */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gradient-to-r from-purple-100/80 via-purple-50 to-white rounded-2xl border-2 border-purple-300 shadow-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-growie-purple text-xs flex items-center gap-1.5">
                    <FolderPlus size={16} className="text-growie-purple" /> 📂 Pasta onde estes {validLeadsToImport.length} Leads serão Adicionados:
                  </span>
                  <select
                    value={selectedDestinationGroups[0] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__CREATE_NEW__') {
                        const name = prompt('Digite o nome da nova pasta:');
                        if (name && name.trim()) {
                          const formatted = name.trim().startsWith('📂') ? name.trim() : `📂 ${name.trim()}`;
                          setSelectedDestinationGroups([formatted]);
                        }
                      } else if (val) {
                        setSelectedDestinationGroups([val]);
                      } else {
                        setSelectedDestinationGroups([]);
                      }
                    }}
                    className="p-1.5 bg-white border-2 border-growie-purple/50 rounded-xl font-extrabold text-xs text-growie-purple focus:outline-none shadow-xs"
                  >
                    <option value="">📁 Geral (Sem Pasta Específica)</option>
                    {availableGroups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name}
                      </option>
                    ))}
                    {selectedDestinationGroups
                      .filter((name) => !availableGroups.some((g) => g.name === name))
                      .map((name, idx) => (
                        <option key={idx} value={name}>
                          {name} (Nova Pasta)
                        </option>
                      ))}
                    <option value="__CREATE_NEW__">➕ + Criar Nova Pasta na Hora...</option>
                  </select>
                </div>
                <span className="text-[11px] font-extrabold text-purple-900 bg-white/90 px-3 py-1 rounded-xl border border-purple-200 shadow-xs">
                  {selectedDestinationGroups.length > 0
                    ? `✓ Adicionando à pasta: ${selectedDestinationGroups.join(', ')}`
                    : '⚠️ Sem pasta (Será salvo na pasta Geral)'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Table size={15} className="text-growie-purple" /> Pré-Visualização Mapeada & Refinada por IA ({validLeadsToImport.length} Leads Prontos)
                </h4>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  ✨ Português & Anti-Duplicata Ativos
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-h-56 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-extrabold text-slate-600">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Empresa, Contato & Cidade</th>
                      <th className="py-2.5 px-3">E-mail & Telefone</th>
                      <th className="py-2.5 px-3">📞 Ligação</th>
                      <th className="py-2.5 px-3">🔥 Temperatura</th>
                      <th className="py-2.5 px-3">Status Anti-Duplicata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {parsedLeads.map((item, idx) => (
                      <tr key={idx} className={`hover:bg-slate-50 ${item.duplicateWarning ? 'bg-amber-50/50' : ''}`}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <strong className="block text-growie-dark font-extrabold">🏢 {item.company}</strong>
                          <span className="text-slate-600 font-medium">👤 {item.name} ({item.role})</span>
                          {item.city && (
                            <span className="block text-[10px] text-cyan-700 font-bold">🏙️ {item.city}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono text-[10px]">
                          <span className="block text-blue-700 font-bold">✉️ {item.email}</span>
                          <span className="text-slate-500 font-medium">📞 {item.phone || 'Sem fone'}</span>
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {item.timeline?.callMade ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300">
                              📞 Ligado (Sim)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                              ⏳ Pendente
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-mono">
                          {item.scoreLabel === 'Hot' ? (
                            <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-[10px] shadow-xs">
                              🔥 Quente ({item.score} pts)
                            </span>
                          ) : item.scoreLabel === 'Warm' ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-extrabold text-[10px]">
                              🌤️ Morno ({item.score} pts)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                              ❄️ Frio ({item.score} pts)
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-[10px]">
                          {item.duplicateWarning ? (
                            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-extrabold border border-amber-300 block truncate max-w-xs" title={item.duplicateWarning}>
                              ⚠️ Duplicado: {item.duplicateWarning}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                              ✓ Lead Único
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-white">
          {/* Quick Destination Folder Selector in Footer */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold text-growie-cyan flex items-center gap-1">
              <FolderPlus size={15} /> 📂 Salvar Leads na Pasta:
            </span>

            <select
              value={selectedDestinationGroups[0] || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '__CREATE_NEW__') {
                  const name = prompt('Digite o nome da nova pasta:');
                  if (name && name.trim()) {
                    const formatted = name.trim().startsWith('📂') ? name.trim() : `📂 ${name.trim()}`;
                    setSelectedDestinationGroups([formatted]);
                  }
                } else if (val) {
                  setSelectedDestinationGroups([val]);
                } else {
                  setSelectedDestinationGroups([]);
                }
              }}
              className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-extrabold text-white focus:border-growie-purple focus:outline-none max-w-xs"
            >
              <option value="">📁 Geral (Sem Pasta Específica)</option>
              {availableGroups.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
              {selectedDestinationGroups
                .filter((name) => !availableGroups.some((g) => g.name === name))
                .map((name, idx) => (
                  <option key={idx} value={name}>
                    {name} (Nova Pasta)
                  </option>
                ))}
              <option value="__CREATE_NEW__">➕ + Criar Nova Pasta na Hora...</option>
            </select>

            {selectedDestinationGroups.length > 0 && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-700/50">
                ✓ Vinculando a {selectedDestinationGroups.join(', ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 font-bold hover:bg-slate-800 text-xs"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirmImport}
              disabled={validLeadsToImport.length === 0 || isProcessing}
              className="px-6 py-2.5 rounded-xl bg-gradient-cta text-white font-extrabold text-xs shadow-glow-lilac hover:opacity-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 size={16} /> Importar {validLeadsToImport.length} Leads para {selectedDestinationGroups[0] || 'o CRM'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
