import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';
import { 
  Filter, 
  Calendar, 
  PlusCircle, 
  FileText, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2, 
  Eye, 
  Download, 
  Search, 
  RefreshCw, 
  Layers, 
  TrendingUp, 
  Tag, 
  Edit3, 
  Trash2, 
  Copy,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { FlyerRecord, FlyerStatus, FlyerContent } from '../types';
import { REGIONAL_LOGOS } from '../data/regionalLogos';
import { FLYER_TEMPLATES } from '../data/templates';
import { 
  loadFlyerRecordsFromFirebase, 
  saveFlyerRecordToFirebase, 
  deleteFlyerRecordFromFirebase 
} from '../lib/firebase';
import { DolomitiFullLogo } from './CorporateVectors';
import { FlyerCanvas } from './FlyerCanvas';

interface FlyerDashboardProps {
  uiLanguage: 'de' | 'it';
  onLoadFlyerIntoEditor: (content: FlyerContent) => void;
  onOpenNewFlyerModal?: () => void;
}

const BRAND_COLORS = {
  primary: '#0D4D5E',
  secondary: '#417483',
  accent: '#AAD0D1',
  issued: '#10B981', // Emerald green
  scheduled: '#0284C7', // Sky blue
  draft: '#F59E0B', // Amber
  bg: '#F4F9FA'
};

const CATEGORY_LABELS: Record<string, string> = {
  hotel_skipass: 'Hotel + Skipass',
  events_races: 'Gare & Eventi',
  cross_country_course: 'Corsi & Scuole',
  season_pass: 'Pass Stagionali',
  family_promo: 'Offerte Famiglia',
  general: 'Generale & Promo'
};

const CATEGORY_COLORS: Record<string, string> = {
  hotel_skipass: '#0D4D5E',
  events_races: '#E11D48',
  cross_country_course: '#D97706',
  season_pass: '#059669',
  family_promo: '#7C3AED',
  general: '#417483'
};

export const FlyerDashboard: React.FC<FlyerDashboardProps> = ({ uiLanguage, onLoadFlyerIntoEditor }) => {
  const ui = (de: string, it: string) => uiLanguage === 'de' ? de : it;
  const [records, setRecords] = useState<FlyerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedRegionId, setSelectedRegionId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // View state: 'grid' | 'timeline' | 'table' | 'charts'
  const [activeTab, setActiveTab] = useState<'grid' | 'timeline' | 'table' | 'charts'>('grid');

  // Preview Modal state
  const [previewRecord, setPreviewRecord] = useState<FlyerRecord | null>(null);

  // Modal State for New / Scheduled Flyer
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    regionId: string;
    status: FlyerStatus;
    publishDate: string;
    validityPeriod: string;
    location: string;
    category: FlyerRecord['category'];
    priceInfo: string;
    targetAudience: string;
    templateId: string;
  }>({
    title: '',
    regionId: '3_zinnen',
    status: 'scheduled',
    publishDate: new Date().toISOString().split('T')[0],
    validityPeriod: 'Stagione 2026',
    location: 'Dolomiti NordicSki',
    category: 'hotel_skipass',
    priceInfo: 'Da 190€',
    targetAudience: 'Sciatori di Fondo',
    templateId: 'official_price_list'
  });

  // Fetch flyer records
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await loadFlyerRecordsFromFirebase();
      setRecords(data);
    } catch (err) {
      console.error('Error loading flyer records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(item => {
      // Region filter
      if (selectedRegionId !== 'all' && item.regionId !== selectedRegionId) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesRegion = item.regionName.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        const matchesTarget = item.targetAudience?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesRegion && !matchesLoc && !matchesTarget) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedRegionId, selectedStatus, selectedCategory, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = records.length;
    const issued = records.filter(r => r.status === 'issued').length;
    const scheduled = records.filter(r => r.status === 'scheduled').length;
    const activeRegionsCount = new Set(records.map(r => r.regionId)).size;
    return { total, issued, scheduled, activeRegionsCount };
  }, [records]);

  // Chart 1 Data: Flyer count per Region (Issued vs Scheduled)
  const regionChartData = useMemo(() => {
    return REGIONAL_LOGOS.map(reg => {
      const regRecords = records.filter(r => r.regionId === reg.id);
      const issued = regRecords.filter(r => r.status === 'issued').length;
      const scheduled = regRecords.filter(r => r.status === 'scheduled').length;
      const shortName = reg.name.replace(/^\d+\s*/, '').split('/')[0].trim();
      return {
        id: reg.id,
        name: shortName,
        fullName: reg.name,
        Emessi: issued,
        '{ui('In Planung', 'In Programmazione')}': scheduled,
        Totale: issued + scheduled
      };
    }).filter(d => d.Totale > 0 || selectedRegionId === 'all');
  }, [records, selectedRegionId]);

  // Chart 2 Data: Monthly Timeline Data (October 2025 - April 2026)
  const timelineChartData = useMemo(() => {
    const months = [
      { key: '2025-10', label: 'Ott 25' },
      { key: '2025-11', label: 'Nov 25' },
      { key: '2025-12', label: 'Dic 25' },
      { key: '2026-01', label: 'Gen 26' },
      { key: '2026-02', label: 'Feb 26' },
      { key: '2026-03', label: 'Mar 26' },
      { key: '2026-04', label: 'Apr 26' }
    ];

    const sourceData = selectedRegionId === 'all' 
      ? records 
      : records.filter(r => r.regionId === selectedRegionId);

    return months.map(m => {
      const monthRecords = sourceData.filter(r => r.publishDate && r.publishDate.startsWith(m.key));
      const issued = monthRecords.filter(r => r.status === 'issued').length;
      const scheduled = monthRecords.filter(r => r.status === 'scheduled').length;
      return {
        month: m.label,
        'Flyer Emessi': issued,
        'In Programmazione': scheduled
      };
    });
  }, [records, selectedRegionId]);

  // Chart 3 Data: Category Breakdown
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    const sourceData = selectedRegionId === 'all' 
      ? records 
      : records.filter(r => r.regionId === selectedRegionId);

    sourceData.forEach(r => {
      const cat = r.category || 'general';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.keys(counts).map(catKey => ({
      name: CATEGORY_LABELS[catKey] || catKey,
      categoryKey: catKey,
      value: counts[catKey],
      color: CATEGORY_COLORS[catKey] || '#417483'
    }));
  }, [records, selectedRegionId]);

  // Handle saving new scheduled flyer record
  const handleSaveNewRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Inserisci un titolo per la pubblicazione del flyer.');
      return;
    }

    const reg = REGIONAL_LOGOS.find(r => r.id === formData.regionId);
    const template = FLYER_TEMPLATES.find(t => t.id === formData.templateId) || FLYER_TEMPLATES[0];

    const newContent: FlyerContent = {
      ...(template.defaultContent as FlyerContent),
      regionId: formData.regionId,
      customRegionName: reg?.regionName || '',
      title: formData.title,
      validityPeriod: formData.validityPeriod,
      location: formData.location,
      badgeText: formData.status === 'issued' ? 'UFFICIALE EMESSO' : 'IN PROGRAMMAZIONE'
    };

    try {
      await saveFlyerRecordToFirebase({
        title: formData.title,
        regionId: formData.regionId,
        regionName: reg?.name || 'Dolomiti NordicSki',
        status: formData.status,
        publishDate: formData.publishDate,
        validityPeriod: formData.validityPeriod,
        location: formData.location,
        category: formData.category,
        priceInfo: formData.priceInfo,
        targetAudience: formData.targetAudience,
        content: newContent
      });

      setIsScheduleModalOpen(false);
      await fetchRecords();
      alert('Nuova programmazione flyer salvata con successo!');
    } catch (err) {
      console.error('Failed to create flyer record:', err);
      alert('Errore durante il salvataggio.');
    }
  };

  const handleDeleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Sei sicuro di voler eliminare questo flyer dal registro?')) return;
    try {
      await deleteFlyerRecordFromFirebase(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const handleDuplicateRecord = async (record: FlyerRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const duplicatedRecord: Partial<FlyerRecord> = {
        ...record,
        title: `${record.title} (Copia)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewsCount: 0,
        downloadsCount: 0,
        status: 'draft' as FlyerStatus
      };
      
      // Remove ID to ensure a new one is generated
      delete duplicatedRecord.id;
      
      const newRecord = await saveFlyerRecordToFirebase(duplicatedRecord);
      setRecords(prev => [newRecord, ...prev]);
      alert('Flyer duplicato con successo!');
    } catch (err) {
      console.error('Error duplicating record:', err);
      alert('Errore durante la duplicazione.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP DASHBOARD BANNER */}
        <div className="bg-gradient-to-r from-[#0D4D5E] via-[#072F3A] to-[#2E5562] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#AAD0D1] border border-white/15 text-xs font-bold uppercase tracking-wider font-vietnam">
                <Building2 className="w-3.5 h-3.5" />
                <span>Dolomiti NordicSki · {ui('Gebietsübergreifende Plattform', 'Piattaforma Multiregionale')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-vietnam tracking-tight">
                {ui('Flyer-Register & Planung', 'Registro Grafico & Programmazione Flyer')}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base font-normal leading-relaxed">
                {ui('Zentrale Übersicht über veröffentlichte und geplante Flyer der 8 DNS-Gebiete. Nach Organisation filtern, Zeiträume analysieren und offizielle Veröffentlichungen verwalten.', 'Panoramica centralizzata dei flyer pubblicati e in programma per tutte le 8 aree DNS. Filtra per organizzazione, analizza la copertura temporale e gestisci le release ufficiali.')}
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#AAD0D1] hover:bg-[#82b8b9] text-[#0D4D5E] font-black text-xs sm:text-sm shadow-md transition-all transform active:scale-95 font-vietnam"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{ui('Neuen Flyer planen', 'Programma Nuovo Flyer')}</span>
              </button>
            </div>
          </div>

          {/* Background Decorative Pattern */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
            <DolomitiFullLogo variant="negative" className="w-[500px] h-auto" />
          </div>
        </div>

        {/* METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0D4D5E]/10 text-[#0D4D5E] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 font-vietnam">{metrics.total}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{ui('Flyer gesamt', 'Flyer Totali')}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600 font-vietnam">{metrics.issued}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{ui('Veröffentlicht', 'Pubblicati / Emessi')}</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-sky-600 font-vietnam">{metrics.scheduled}</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Programmazione</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-purple-700 font-vietnam">{metrics.activeRegionsCount} / 8</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{ui('Aktive Gebiete', 'Aree Attive')}</div>
            </div>
          </div>

        </div>

        {/* INTERACTIVE FILTER BAR */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Cerca per titolo, località, target..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0D4D5E]"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              
              {/* Organization / Region Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-[#0D4D5E]" />
                <select 
                  value={selectedRegionId} 
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="all">Tutte le Organizzazioni (9 Regioni)</option>
                  {REGIONAL_LOGOS.map(reg => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Filter className="w-3.5 h-3.5 text-[#0D4D5E]" />
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="all">Tutti gli Stati</option>
                  <option value="issued">🟢 Pubblicati / Emessi</option>
                  <option value="scheduled">📅 In Programmazione</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700">
                <Tag className="w-3.5 h-3.5 text-[#0D4D5E]" />
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="all">Tutte le Categorie</option>
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                    <option key={catKey} value={catKey}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filters */}
              {(selectedRegionId !== 'all' || selectedStatus !== 'all' || selectedCategory !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedRegionId('all');
                    setSelectedStatus('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
                  title="Reset Filtri"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}

            </div>
          </div>

          {/* VIEW MODE TABS */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'grid' 
                    ? 'bg-white text-[#0D4D5E] shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Galleria Flyer ({filteredRecords.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('charts')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'charts' 
                    ? 'bg-white text-[#0D4D5E] shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Grafici & Analisi</span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'timeline' 
                    ? 'bg-white text-[#0D4D5E] shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendario Release</span>
              </button>

              <button
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'table' 
                    ? 'bg-white text-[#0D4D5E] shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tabella Registro</span>
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium hidden sm:block">
              Mostrando {filteredRecords.length} di {records.length} flyer
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* TAB CONTENT: CHARTS VIEW */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            
            {/* Chart 1: Regional Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-vietnam">
                    Distribuzione Flyer per Organizzazione
                  </h3>
                  <p className="text-xs text-slate-500">
                    Confronto tra flyer emessi ed in programma per le 9 regioni di Dolomiti NordicSki
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#0D4D5E]" />
                    <span>Emessi</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#AAD0D1]" />
                    <span>In Programmazione</span>
                  </span>
                </div>
              </div>

              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: '#64748B', fontWeight: 600 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0D4D5E', color: '#FFFFFF', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                    />
                    <Bar dataKey="Emessi" fill="#0D4D5E" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="In Programmazione" fill="#AAD0D1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grid for Chart 2 & Chart 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 2: Monthly Release Timeline */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-vietnam">
                    Programmazione Temporale Release (Stagione 2025/26)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Volume mensile di pubblicazione flyer per organizzazione
                  </p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#072F3A', color: '#FFFFFF', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="Flyer Emessi" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="In Programmazione" stackId="1" stroke="#0284C7" fill="#0284C7" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Category Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-vietnam">
                    Ripartizione per Tipologia Offer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Scomposizione percentuale tra Skipass, Gare, Corsi e Pacchetti Hotel
                  </p>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0D4D5E', color: '#FFFFFF', borderRadius: '12px' }} />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value) => <span className="text-xs font-semibold text-slate-700">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB CONTENT: GRID GALLERY VIEW */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'grid' && (
          <div>
            {isLoading ? (
              <div className="py-20 text-center text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0D4D5E] mb-2" />
                <p className="font-semibold text-sm">Caricamento registro flyer in corso...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-base">Nessun flyer trovato</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Nessun flyer corrisponde ai filtri selezionati. Prova a modificare la ricerca o il filtro per organizzazione.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map((item) => {
                  const reg = REGIONAL_LOGOS.find(r => r.id === item.regionId);
                  const isIssued = item.status === 'issued';

                  return (
                    <div 
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden group"
                    >
                      {/* Top Header & Status */}
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-2 h-2 rounded-full shrink-0 bg-[#0D4D5E]" />
                          <span className="text-xs font-bold text-slate-800 font-vietnam truncate">
                            {item.regionName}
                          </span>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-vietnam tracking-wider shrink-0 flex items-center gap-1 ${
                          isIssued 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-sky-100 text-sky-800 border border-sky-200'
                        }`}>
                          {isIssued ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-sky-600" />}
                          <span>{isIssued ? 'Emesso' : 'In Programma'}</span>
                        </span>
                      </div>

                      {/* REAL LIVE GRAPHICAL FLYER PREVIEW THUMBNAIL */}
                      <div 
                        onClick={() => setPreviewRecord(item)}
                        className="w-full h-64 sm:h-72 bg-slate-800/95 relative overflow-hidden flex items-start justify-center cursor-pointer group/preview border-b border-slate-200"
                      >
                        {/* Scaled Miniature Canvas */}
                        <div className="mt-3 pointer-events-none select-none shadow-2xl rounded-xl overflow-hidden bg-white">
                          <FlyerCanvas content={item.content} scale={0.4} />
                        </div>

                        {/* Interactive Hover Overlay */}
                        <div className="absolute inset-0 bg-[#072F3A]/70 opacity-0 group-hover/preview:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 gap-2">
                          <span className="px-3.5 py-2 rounded-xl bg-white text-[#0D4D5E] text-xs font-black shadow-xl flex items-center gap-2 font-vietnam transform translate-y-2 group-hover/preview:translate-y-0 transition-transform">
                            <Eye className="w-4 h-4 text-[#0D4D5E]" />
                            <span>Ingrandisci Anteprima HD</span>
                          </span>
                          <span className="text-[11px] text-slate-200 font-medium">Clicca per aprire la grafica completa</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-[#0D4D5E]" />
                            <span>
                              {isIssued ? 'Data Pubblicazione:' : 'Programmato per:'} {item.publishDate}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-900 font-vietnam group-hover:text-[#0D4D5E] transition-colors leading-snug">
                            {item.title}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                              {CATEGORY_LABELS[item.category] || item.category}
                            </span>
                            {item.validityPeriod && (
                              <span className="text-[11px] text-slate-600 font-medium">
                                • {item.validityPeriod}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Additional Info Box */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                          {item.priceInfo && (
                            <div className="font-bold text-[#0D4D5E]">
                              {item.priceInfo}
                            </div>
                          )}
                          {item.location && (
                            <div className="flex items-center gap-1 text-[11px]">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>
                          )}
                          {item.targetAudience && (
                            <div className="text-[10.5px] text-slate-500 line-clamp-1 italic">
                              Target: {item.targetAudience}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPreviewRecord(item)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-[#AAD0D1]/40 text-[#0D4D5E] transition-all"
                              title="Anteprima Ingrandita HD"
                            >
                              <Eye className="w-4 h-4 text-[#0D4D5E]" />
                            </button>

                            <button
                              onClick={(e) => handleDuplicateRecord(item, e)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-[#AAD0D1]/40 text-[#0D4D5E] transition-all"
                              title="Duplica flyer"
                            >
                              <Copy className="w-4 h-4 text-[#0D4D5E]" />
                            </button>
                          </div>

                          <button
                            onClick={() => onLoadFlyerIntoEditor(item.content)}
                            className="flex-1 py-2 px-3 rounded-xl bg-[#0D4D5E] hover:bg-[#072F3A] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs font-vietnam"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#AAD0D1]" />
                            <span>Modifica</span>
                          </button>

                          <button
                            onClick={(e) => handleDeleteRecord(item.id, e)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Elimina flyer dal registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB CONTENT: TIMELINE VIEW */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'timeline' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900 font-vietnam">
                Calendario Programmazione Release (Stagione 2025/2026)
              </h3>
              <p className="text-xs text-slate-500">
                Sviluppo cronologico delle campagne pubblicitarie regionali
              </p>
            </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
              {filteredRecords.map((record) => {
                const isIssued = record.status === 'issued';
                return (
                  <div key={record.id} className="relative pl-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    {/* Node Circle */}
                    <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full border-2 flex items-center justify-center bg-white shadow-2xs ${
                      isIssued ? 'border-emerald-500 text-emerald-600' : 'border-sky-500 text-sky-600'
                    }`}>
                      {isIssued ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0D4D5E] font-vietnam">
                          {record.regionName}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-500">
                          {record.publishDate}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 font-vietnam group-hover:text-[#0D4D5E] transition-colors">
                        {record.title}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {record.validityPeriod} — {record.location}
                      </p>
                    </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isIssued ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'
                        }`}>
                          {isIssued ? 'Pubblicato' : 'In Arrivo'}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPreviewRecord(record)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#AAD0D1]/40 text-[#0D4D5E] transition-all"
                            title="Anteprima Ingrandita HD"
                          >
                            <Eye className="w-4 h-4 text-[#0D4D5E]" />
                          </button>
                          
                          <button
                            onClick={(e) => handleDuplicateRecord(record, e)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#AAD0D1]/40 text-[#0D4D5E] transition-all"
                            title="Duplica"
                          >
                            <Copy className="w-4 h-4 text-[#0D4D5E]" />
                          </button>
                        </div>

                        <button
                          onClick={() => onLoadFlyerIntoEditor(record.content)}
                          className="px-3 py-2 rounded-xl bg-[#0D4D5E] hover:bg-[#072F3A] text-white text-xs font-bold transition-all flex items-center gap-1 font-vietnam"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#AAD0D1]" />
                          <span className="hidden sm:inline">Modifica</span>
                        </button>

                        <button
                          onClick={(e) => handleDeleteRecord(record.id, e)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Elimina"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* TAB CONTENT: TABLE VIEW */}
        {/* ------------------------------------------------------------------- */}
        {activeTab === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase font-vietnam">
                  <tr>
                    <th className="p-4">Organizzazione / Regione</th>
                    <th className="p-4">Titolo Flyer</th>
                    <th className="p-4">Stato</th>
                    <th className="p-4">Data Pubblicazione</th>
                    <th className="p-4">Categoria</th>
                    <th className="p-4">Target / Note</th>
                    <th className="p-4 text-right">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-slate-900 font-vietnam">
                        {r.regionName}
                      </td>
                      <td className="p-4 font-bold text-[#0D4D5E]">
                        {r.title}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === 'issued' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {r.status === 'issued' ? 'Emesso' : 'In Programma'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-semibold">
                        {r.publishDate}
                      </td>
                      <td className="p-4 text-slate-600">
                        {CATEGORY_LABELS[r.category] || r.category}
                      </td>
                      <td className="p-4 text-slate-500 max-w-xs truncate">
                        {r.targetAudience || r.location}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreviewRecord(r)}
                            className="p-2 rounded-lg bg-slate-100 text-[#0D4D5E] hover:bg-[#AAD0D1]/40 transition-all"
                            title="Anteprima HD"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDuplicateRecord(r, e)}
                            className="p-2 rounded-lg bg-slate-100 text-[#0D4D5E] hover:bg-[#AAD0D1]/40 transition-all"
                            title="Duplica"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onLoadFlyerIntoEditor(r.content)}
                            className="px-3 py-1.5 rounded-lg bg-[#0D4D5E] text-white font-bold text-xs hover:bg-[#072F3A] transition-all inline-flex items-center gap-1 font-vietnam"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#AAD0D1]" />
                            <span>Modifica</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteRecord(r.id, e)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: SCHEDULE / REGISTER NEW FLYER */}
      {/* ------------------------------------------------------------------- */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 font-vietnam">
                  Programma Nuovo Flyer
                </h3>
                <p className="text-xs text-slate-500">
                  Registra o pianifica un'uscita promozionale per una regione
                </p>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewRecord} className="space-y-4">
              
              {/* Region Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Organizzazione / Regione Target
                </label>
                <select
                  value={formData.regionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, regionId: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  {REGIONAL_LOGOS.map(reg => (
                    <option key={reg.id} value={reg.id}>
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Titolo Offerta / Iniziativa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Pacchetto Settimana Bianca 2026"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              {/* Status & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Stato Release
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as FlyerStatus }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="scheduled">📅 In Programmazione</option>
                    <option value="issued">🟢 Emesso / Pubblicato</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Data Pubblicazione
                  </label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tipologia Offerta
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                    <option key={catKey} value={catKey}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Validity & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Periodo Validità
                  </label>
                  <input
                    type="text"
                    placeholder="Es. Gennaio - Marzo 2026"
                    value={formData.validityPeriod}
                    onChange={(e) => setFormData(prev => ({ ...prev, validityPeriod: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Località / Piste
                  </label>
                  <input
                    type="text"
                    placeholder="Es. Centro Fondo Sesto"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Template Preset */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Layout Grafico Base
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                >
                  {FLYER_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0D4D5E] hover:bg-[#072F3A] text-white text-xs font-bold shadow-sm transition-all font-vietnam"
                >
                  Salva in Registro Regioni
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* MODAL: FULL HD FLYER PREVIEW */}
      {/* ------------------------------------------------------------------- */}
      {previewRecord && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D4D5E]/10 text-[#0D4D5E] flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0D4D5E] uppercase font-vietnam">
                      {previewRecord.regionName}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      previewRecord.status === 'issued' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                    }`}>
                      {previewRecord.status === 'issued' ? 'Emesso' : 'In Programma'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-vietnam">
                    Anteprima Grafica: {previewRecord.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setPreviewRecord(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Canvas Body */}
            <div className="flex-1 overflow-y-auto bg-slate-100/90 rounded-2xl p-4 sm:p-6 flex items-center justify-center min-h-[380px]">
              <div className="shadow-2xl rounded-xl overflow-hidden bg-white max-w-full">
                <FlyerCanvas content={previewRecord.content} />
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div className="text-xs text-slate-500 font-medium">
                Formato: <span className="font-bold uppercase text-slate-800">{previewRecord.content.format}</span> • Orientamento: <span className="font-bold capitalize text-slate-800">{previewRecord.content.orientation}</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setPreviewRecord(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                >
                  Chiudi
                </button>
                
                <button
                  onClick={() => {
                    onLoadFlyerIntoEditor(previewRecord.content);
                    setPreviewRecord(null);
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#0D4D5E] hover:bg-[#072F3A] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm font-vietnam"
                >
                  <Edit3 className="w-4 h-4 text-[#AAD0D1]" />
                  <span>Apri e Modifica nell'Editor</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
