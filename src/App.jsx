import React, { useState, useEffect } from 'react';
import { 
  Heart, Shield, AlertTriangle, Search, Filter, Euro, PlusCircle, 
  UserCheck, CreditCard, ChevronRight, CheckCircle2, FileText, 
  Share2, ArrowLeft, Building2, TrendingUp, Wallet, Lock, Users
} from 'lucide-react';

// Dati iniziali di esempio per le campagne
const INITIAL_CAMPAIGNS = [
  {
    id: '1',
    title: 'Riparazione auto per non perdere il posto di lavoro',
    category: 'Trasporti',
    author: 'Marco R.',
    isVerified: true,
    story: 'Sono un operaio pendolare e la settimana scorsa la guarnizione della testata della mia auto si è rotta. Senza auto non posso raggiungere la fabbrica a 40km di distanza. I miei risparmi non coprono il preventivo del meccanico.',
    targetAmount: 1200,
    grossRaised: 800,
    proofDocument: 'Preventivo_Officina_Rossi.pdf',
    createdAt: '2026-03-10',
    updates: [
      { date: '2026-03-12', text: 'Ho portato l\'auto in officina per la diagnosi definitiva. Grazie a chi sta donando!' }
    ]
  },
  {
    id: '2',
    title: 'Contributo urgente per intervento oculistico',
    category: 'Salute',
    author: 'Elena M.',
    isVerified: true,
    story: 'Mio figlio necessita di un intervento specialistico non interamente coperto dal SSN. Dobbiamo coprire le spese della clinica e del soggiorno per l\'operazione fissata a breve.',
    targetAmount: 3500,
    grossRaised: 2100,
    proofDocument: 'Certificato_Medico_Diagnosi.pdf',
    createdAt: '2026-03-05',
    updates: []
  },
  {
    id: '3',
    title: 'Copertura spese bollette arretrate e riscaldamento',
    category: 'Emergenza Casa',
    author: 'Giuseppe V.',
    isVerified: false,
    story: 'A causa di un periodo di infortunio non pagato, mi sono accumulate due bollette del gas del periodo invernale. Rischio il distacco della fornitura per la mia famiglia.',
    targetAmount: 650,
    grossRaised: 150,
    proofDocument: 'Bolletta_Gas_Sollecito.pdf',
    createdAt: '2026-03-14',
    updates: []
  }
];

export default function App() {
  // Stati principali dell'app
  const [campaigns, setCampaigns] = useState(() => {
    const saved = localStorage.getItem('p2p_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [activeTab, setActiveTab] = useState('home'); // home, create, admin, profile
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutte');
  
  // Stato Modal Donazione
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(20);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorMessage, setDonorMessage] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);

  // Stato Modulo Nuova Campagna
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    category: 'Trasporti',
    targetAmount: '',
    story: '',
    proofDocument: null
  });

  // Salva su LocalStorage
  useEffect(() => {
    localStorage.getItem('p2p_campaigns');
  }, [campaigns]);

  // Calcolo Commissione Piattaforma (25%)
  const PLATFORM_FEE_PERCENTAGE = 0.25;

  const calculateBreakdown = (grossAmount) => {
    const amount = parseFloat(grossAmount) || 0;
    const platformFee = amount * PLATFORM_FEE_PERCENTAGE;
    const netToBeneficiary = amount - platformFee;
    return {
      gross: amount,
      fee: platformFee,
      net: netToBeneficiary
    };
  };

  // Gestione Invio Donazione
  const handleDonate = (e) => {
    e.preventDefault();
    if (!selectedCampaign || donationAmount <= 0) return;

    setIsProcessingPayment(true);

    // Simulazione di pagamento Stripe Connect
    setTimeout(() => {
      const gross = parseFloat(donationAmount);
      
      setCampaigns(prev => prev.map(c => {
        if (c.id === selectedCampaign.id) {
          return {
            ...c,
            grossRaised: c.grossRaised + gross
          };
        }
        return c;
      }));

      // Aggiorna anche lo stato della campagna selezionata
      setSelectedCampaign(prev => ({
        ...prev,
        grossRaised: prev.grossRaised + gross
      }));

      setIsProcessingPayment(false);
      setDonationSuccess(true);
    }, 1500);
  };

  // Creazione Nuova Richiesta
  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!newCampaign.title || !newCampaign.targetAmount || !newCampaign.story) return;

    const created = {
      id: Date.now().toString(),
      title: newCampaign.title,
      category: newCampaign.category,
      author: 'Tu (Utente Registrato)',
      isVerified: true, // Assegnato automaticamente per il test
      story: newCampaign.story,
      targetAmount: parseFloat(newCampaign.targetAmount),
      grossRaised: 0,
      proofDocument: newCampaign.proofDocument ? newCampaign.proofDocument.name : 'Documento_Caricato.pdf',
      createdAt: new Date().toISOString().split('T')[0],
      updates: []
    };

    setCampaigns([created, ...campaigns]);
    setNewCampaign({ title: '', category: 'Trasporti', targetAmount: '', story: '', proofDocument: null });
    setActiveTab('home');
    alert('Richiesta d\'aiuto pubblicata con successo!');
  };

  // Calcolo Statistiche Amministratore (Le tue commissioni del 25%)
  const totalGrossRaised = campaigns.reduce((acc, c) => acc + c.grossRaised, 0);
  const totalPlatformFees = totalGrossRaised * PLATFORM_FEE_PERCENTAGE;
  const totalNetToBeneficiaries = totalGrossRaised - totalPlatformFees;

  // Filtro Campagne
  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.story.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tutte' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {/* HEADER / NAVBAR */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => { setActiveTab('home'); setSelectedCampaign(null); }}
          >
            <div className="bg-teal-600 text-white p-2 rounded-xl">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">Solidarietà<span className="text-teal-600">Diretta</span></span>
              <span className="block text-[10px] text-slate-500 font-medium -mt-1">P2P Mutual Aid Platform</span>
            </div>
          </div>

          <nav className="flex items-center gap-1 sm:gap-4">
            <button 
              onClick={() => { setActiveTab('home'); setSelectedCampaign(null); }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'home' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Bacheca
            </button>
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${activeTab === 'create' ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Chiedi Aiuto</span>
            </button>
            <button 
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${activeTab === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Pannello Fee (25%)</span>
            </button>
          </nav>
        </div>
      </header>

      {/* BANNER INFORMATIVO SULLA TRASPARENZA */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400 shrink-0" />
            <span><strong>Trasparenza Garantita:</strong> Il 75% di ogni donazione va direttamente al beneficiario. Il 25% copre costi di gestione, verifiche KYC e transazioni.</span>
          </div>
          <span className="text-slate-400 underline cursor-pointer hover:text-white">Termini e Condizioni</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 mt-6">
        
        {/* VISTA 1: DETTAGLIO SINGOLA CAMPAGNA */}
        {selectedCampaign ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <button 
              onClick={() => setSelectedCampaign(null)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition"
            >
              <ArrowLeft className="w-4 h-4" /> Torna alla bacheca
            </button>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {selectedCampaign.category}
                </span>
                <span className="text-xs text-slate-400">Pubblicato il {selectedCampaign.createdAt}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {selectedCampaign.title}
              </h1>

              {/* Informazioni Autore e Verifica */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                  {selectedCampaign.author[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-slate-800 text-sm">
                    {selectedCampaign.author}
                    {selectedCampaign.isVerified && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <UserCheck className="w-3 h-3" /> Identità & Documenti Verificati
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">Beneficiario diretto dei fondi</span>
                </div>
              </div>

              {/* Barra di Progresso */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-2xl font-extrabold text-slate-900">€{selectedCampaign.grossRaised}</span>
                    <span className="text-xs text-slate-500 ml-1">raccolti lordi</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">Obiettivo: €{selectedCampaign.targetAmount}</span>
                </div>

                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (selectedCampaign.grossRaised / selectedCampaign.targetAmount) * 100)}%` }}
                  ></div>
                </div>

                {/* Ripartizione Reale Trasparente */}
                <div className="pt-2 border-t border-slate-200/60 flex justify-between text-xs text-slate-500">
                  <span>Netto al beneficiario (75%): <strong className="text-slate-800">€{(selectedCampaign.grossRaised * 0.75).toFixed(2)}</strong></span>
                  <span>Fee piattaforma (25%): <strong className="text-slate-800">€{(selectedCampaign.grossRaised * 0.25).toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Pulsante Azione Donazione */}
              <button 
                onClick={() => { setDonationSuccess(false); setIsDonateModalOpen(true); }}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 transition flex items-center justify-center gap-2 text-lg"
              >
                <Heart className="w-5 h-5 fill-current" /> Sostieni questa richiesta
              </button>

              {/* Storia */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 text-lg">La storia</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{selectedCampaign.story}</p>
              </div>

              {/* Prova Giustificativa / Documenti */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
                  <FileText className="w-4 h-4" /> Documento Giustificativo Allegato
                </div>
                <p className="text-xs text-amber-900/70">
                  Per garantire l'autenticità della richiesta, l'utente ha fornito la documentazione fiscale/medica necessaria:
                </p>
                <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-amber-200 text-xs font-mono text-slate-700">
                  <span>{selectedCampaign.proofDocument}</span>
                  <span className="text-teal-700 font-sans font-semibold">Verificato ✓</span>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'home' ? (
          
          /* VISTA 2: BACHECA PRINCIPALE (FEED) */
          <div className="space-y-6">
            {/* HERO BAR */}
            <div className="bg-gradient-to-r from-teal-700 to-slate-800 text-white rounded-2xl p-6 sm:p-10 shadow-xl space-y-4">
              <span className="bg-teal-500/30 text-teal-200 text-xs font-semibold px-3 py-1 rounded-full border border-teal-400/30">
                Mutual Aid & Crowdfunding
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold leading-tight">
                Aiuto reciproco, trasparente e diretto tra persone.
              </h1>
              <p className="text-teal-100/80 text-sm sm:text-base max-w-2xl">
                Sostieni spese mediche urgenti, riparazioni necessarie per lavorare ed emergenze familiari con donazioni sicure e tracciate.
              </p>
            </div>

            {/* FILTRI E RICERCA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Cerca richieste d'aiuto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                {['Tutte', 'Trasporti', 'Salute', 'Emergenza Casa'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                      selectedCategory === cat 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* GRIGLIA CAMPAGNE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((c) => {
                const progress = Math.min(100, (c.grossRaised / c.targetAmount) * 100);
                const { net } = calculateBreakdown(c.grossRaised);

                return (
                  <div 
                    key={c.id} 
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="p-5 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-md">
                          {c.category}
                        </span>
                        {c.isVerified && (
                          <span className="flex items-center gap-1 text-green-600 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verificato
                          </span>
                        )}
                      </div>

                      <h3 
                        onClick={() => setSelectedCampaign(c)}
                        className="font-bold text-slate-900 text-base line-clamp-2 hover:text-teal-600 cursor-pointer transition"
                      >
                        {c.title}
                      </h3>

                      <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed">
                        {c.story}
                      </p>

                      {/* Progresso */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-900">€{c.grossRaised} <span className="text-slate-400 font-normal">raccolti</span></span>
                          <span className="text-slate-500">Obiettivo €{c.targetAmount}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-600 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="text-[11px] text-slate-400 flex justify-between">
                          <span>Destinati al beneficiario (75%):</span>
                          <strong className="text-slate-600">€{net.toFixed(0)}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Di {c.author}</span>
                      <button 
                        onClick={() => setSelectedCampaign(c)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
                      >
                        Dettagli & Dona <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : activeTab === 'create' ? (
          
          /* VISTA 3: CREA RICHIESTA D'AIUTO */
          <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Crea una Richiesta d'Aiuto</h2>
              <p className="text-xs text-slate-500 mt-1">
                Spiega chiaramente la tua situazione e allega un documento per accelerare le verifiche.
              </p>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titolo della richiesta</label>
                <input 
                  type="text"
                  required
                  placeholder="Es. Riparazione auto per andare al lavoro"
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoria</label>
                  <select
                    value={newCampaign.category}
                    onChange={(e) => setNewCampaign({...newCampaign, category: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Trasporti">Trasporti / Auto</option>
                    <option value="Salute">Salute / Operazioni</option>
                    <option value="Emergenza Casa">Emergenza Casa / Bollette</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Importo Necessario (€)</label>
                  <input 
                    type="number"
                    required
                    min="10"
                    placeholder="Es. 800"
                    value={newCampaign.targetAmount}
                    onChange={(e) => setNewCampaign({...newCampaign, targetAmount: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">La tua storia e motivazione</label>
                <textarea 
                  required
                  rows={5}
                  placeholder="Descrivi dettagliatamente la situazione, perché hai bisogno di aiuto e come utilizzerai i fondi..."
                  value={newCampaign.story}
                  onChange={(e) => setNewCampaign({...newCampaign, story: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Documento Giustificativo (Preventivo/Certificato/Bolletta)</label>
                <input 
                  type="file"
                  onChange={(e) => setNewCampaign({...newCampaign, proofDocument: e.target.files[0]})}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-100 text-xs text-teal-800 space-y-1">
                <strong>Informativa di accredito:</strong>
                <p>Ricorda che il 75% delle donazioni ti verrà accreditato direttamente sul conto corrente (IBAN) collegato via Stripe, mentre il 25% viene trattenuto dalla piattaforma per i costi di gestione e verifica.</p>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Pubblica Richiesta d'Aiuto
              </button>
            </form>
          </div>
        ) : (
          
          /* VISTA 4: PANNELLO AMMINISTRATORE (STATISTICHE FEE 25%) */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-4 h-4" /> Dashboard Piattaforma & Stripe Connect
              </div>
              <h2 className="text-2xl font-bold">Monitoraggio Commissioni (25%)</h2>
              <p className="text-slate-400 text-xs max-w-xl">
                Visualizzazione in tempo reale degli incassi lordi, della quota trattenuta dalla piattaforma per il servizio e dei trasferimenti netti erogati ai beneficiari.
              </p>
            </div>

            {/* CARD METRICHE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Totale Donazioni Lored</span>
                <div className="text-2xl font-extrabold text-slate-900">€{totalGrossRaised.toFixed(2)}</div>
                <span className="text-[11px] text-slate-500">Transato totale nell'app</span>
              </div>

              <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 space-y-1">
                <span className="text-xs font-bold text-indigo-600 uppercase">La tua Commissione (25%)</span>
                <div className="text-2xl font-extrabold text-indigo-900">€{totalPlatformFees.toFixed(2)}</div>
                <span className="text-[11px] text-indigo-600">Trattenuta piattaforma</span>
              </div>

              <div className="bg-teal-50 p-5 rounded-xl border border-teal-100 space-y-1">
                <span className="text-xs font-bold text-teal-600 uppercase">Erogato ai Beneficiari (75%)</span>
                <div className="text-2xl font-extrabold text-teal-900">€{totalNetToBeneficiaries.toFixed(2)}</div>
                <span className="text-[11px] text-teal-600">Trasferito su IBAN</span>
              </div>
            </div>

            {/* TABELLA DETTAGLIO PER CAMPAGNA */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold text-slate-900 text-sm">
                Ripartizione Fondi per Campagna
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Campagna</th>
                      <th className="p-3">Raccolto Lordo</th>
                      <th className="p-3">Quota Piattaforma (25%)</th>
                      <th className="p-3">Netto Beneficiario (75%)</th>
                      <th className="p-3">Stato Stripe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {campaigns.map(c => {
                      const { gross, fee, net } = calculateBreakdown(c.grossRaised);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-800">{c.title}</td>
                          <td className="p-3 font-bold text-slate-900">€{gross.toFixed(2)}</td>
                          <td className="p-3 text-indigo-600 font-bold">€{fee.toFixed(2)}</td>
                          <td className="p-3 text-teal-600 font-bold">€{net.toFixed(2)}</td>
                          <td className="p-3">
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                              Connect Attivo
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL DONAZIONE CON CALCOLO 25% TRASPARENTE */}
      {isDonateModalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsDonateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-lg font-bold"
            >
              ✕
            </button>

            {!donationSuccess ? (
              <>
                <div>
                  <span className="text-xs font-bold text-teal-600 uppercase">Donazione Sicura</span>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedCampaign.title}</h3>
                </div>

                <form onSubmit={handleDonate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Seleziona Importo Donazione (€)</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {[10, 20, 50, 100].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setDonationAmount(val)}
                          className={`py-2 rounded-lg text-xs font-bold border transition ${
                            donationAmount === val 
                              ? 'bg-teal-600 text-white border-teal-600' 
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          €{val}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="number"
                      min="1"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 text-center"
                    />
                  </div>

                  {/* BOX TRASPARENZA FEE 25% */}
                  {donationAmount > 0 && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Donazione Lorda:</span>
                        <strong className="text-slate-900">€{parseFloat(donationAmount).toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between text-teal-700">
                        <span>Al Beneficiario (75%):</span>
                        <strong>€{(donationAmount * 0.75).toFixed(2)}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-200/60">
                        <span>Servizio & Verifiche (25%):</span>
                        <span>€{(donationAmount * 0.25).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Messaggio di sostegno (opzionale)</label>
                    <input 
                      type="text"
                      placeholder="Un piccolo aiuto con tutto il cuore!"
                      value={donorMessage}
                      onChange={(e) => setDonorMessage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="anon"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="rounded text-teal-600"
                    />
                    <label htmlFor="anon" className="text-xs text-slate-600">Dona in modo anonimo</label>
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                  >
                    {isProcessingPayment ? (
                      <span>Elaborazione Pagamento Stripe...</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" /> Concludi Donazione (€{donationAmount})
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Grazie per il tuo Aiuto!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  La tua donazione è stata elaborata con successo. Il 75% è già stato trasferito al beneficiario.
                </p>
                <button 
                  onClick={() => setIsDonateModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl"
                >
                  Chiudi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
