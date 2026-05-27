import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchResponseData, SearchResult } from '@/mock/responses';
import { FileText, Globe, Database, Calendar, Filter, X, ChevronRight, Download, Search, Info } from 'lucide-react';
import { toast } from 'sonner';

interface SearchResultCardProps {
  data: SearchResponseData;
}

const TYPE_ICONS = {
  pdf: FileText,
  doc: FileText,
  spreadsheet: Database,
  policy: Globe,
};

export function SearchResultCard({ data }: SearchResultCardProps) {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  
  // Filter States
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique teams and types for filters
  const teams = useMemo(() => {
    return ['All', ...Array.from(new Set(data.results.map((r) => r.team)))];
  }, [data.results]);

  const types = useMemo(() => {
    return ['All', ...Array.from(new Set(data.results.map((r) => r.sourceType)))];
  }, [data.results]);

  // Client-side filtering
  const filteredResults = useMemo(() => {
    return data.results.filter((res) => {
      const matchTeam = selectedTeam === 'All' || res.team === selectedTeam;
      const matchType = selectedType === 'All' || res.sourceType === selectedType;
      const matchSearch =
        searchQuery.trim() === '' ||
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.snippet.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTeam && matchType && matchSearch;
    });
  }, [data.results, selectedTeam, selectedType, searchQuery]);

  const handleExport = () => {
    toast.success('Search export complete', {
      description: `Exported ${filteredResults.length} search results references.`,
    });
  };

  // Helper to highlight matches in text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-500/30 text-foreground rounded-sm px-0.5 font-bold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card border border-border shadow-md rounded-2xl p-5 space-y-5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-foreground tracking-tight">{data.title}</h3>
          <p className="text-[11px] text-muted-foreground">
            Query: "{data.query}" • Found {filteredResults.length} matching files
          </p>
        </div>
        <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Search Agent
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-muted/20 border border-border/50 rounded-xl p-3 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-semibold">Filters</span>
        </div>

        {/* Text Search Input inside filters */}
        <div className="relative flex-1 min-w-[150px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search results..."
            className="w-full bg-background border border-border rounded-lg py-1 pl-7 pr-2.5 text-xs outline-none focus:border-primary/50"
          />
          <Search className="w-3 h-3 text-muted-foreground absolute left-2.5 top-2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Team Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Team:</span>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="bg-background border border-border rounded-lg px-2 py-1 outline-none text-xs"
          >
            {teams.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Type Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-background border border-border rounded-lg px-2 py-1 outline-none text-xs"
          >
            {types.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All' : t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
        >
          <Download className="w-3 h-3" />
          Export CSV
        </button>
      </div>

      {/* Main Content Area (Layout splits to 2 columns if a result is selected) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start relative">
        <div className={`space-y-2.5 ${selectedResult ? 'lg:max-w-md' : 'w-full'}`}>
          {filteredResults.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-xs italic">
              No results match your search criteria.
            </div>
          ) : (
            filteredResults.map((res) => {
              const Icon = TYPE_ICONS[res.sourceType] || FileText;
              const isSelected = selectedResult?.id === res.id;

              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedResult(isSelected ? null : res)}
                  className={`border rounded-xl p-3.5 text-xs text-left cursor-pointer transition-all hover:bg-muted/10 ${
                    isSelected
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-sm'
                      : 'border-border/50 hover:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-primary/10 text-primary">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-foreground hover:underline">
                        {res.title}
                      </span>
                    </div>
                    {/* Relevance Score fill-bar */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-semibold text-muted-foreground">Match:</span>
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${res.relevanceScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-foreground">
                        {res.relevanceScore}%
                      </span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                    {highlightText(res.snippet, searchQuery || data.query)}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground font-semibold">
                    <span className="bg-muted px-1.5 py-0.5 rounded uppercase">
                      {res.sourceType}
                    </span>
                    <span>{res.team} Team</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {res.date}
                    </span>
                    {isSelected && (
                      <span className="text-primary font-bold ml-auto flex items-center gap-0.5">
                        Selected
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Document Preview Sidebar */}
        <AnimatePresence>
          {selectedResult && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full lg:w-80 bg-muted/10 border border-border/80 rounded-xl p-4 space-y-4 shrink-0"
            >
              {/* Sidebar Header */}
              <div className="flex items-start justify-between border-b border-border/50 pb-2">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground truncate max-w-[200px]">
                    {selectedResult.title}
                  </h4>
                  <span className="text-[9px] text-muted-foreground uppercase font-semibold">
                    Document Preview
                  </span>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="p-0.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Text content with highlighted query term */}
              <div className="text-[11px] text-foreground/90 font-medium leading-relaxed max-h-48 overflow-y-auto pr-1 bg-background/50 border border-border/30 rounded-lg p-2.5 whitespace-pre-wrap font-mono">
                {highlightText(selectedResult.previewContent, searchQuery || data.query)}
              </div>

              {/* Metadata details */}
              <div className="space-y-2 text-[10px]">
                <div className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 pb-1 border-b border-border/30">
                  <Info className="w-3 h-3 text-primary" />
                  File Metadata
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 leading-relaxed">
                  <span className="text-muted-foreground">Source Path:</span>
                  <span className="font-semibold text-foreground truncate select-all">{selectedResult.source}</span>

                  <span className="text-muted-foreground">File Type:</span>
                  <span className="font-semibold text-foreground uppercase">{selectedResult.sourceType}</span>

                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-semibold text-foreground">1.8 MB (Mocked)</span>

                  <span className="text-muted-foreground">Owning Team:</span>
                  <span className="font-semibold text-foreground">{selectedResult.team}</span>

                  <span className="text-muted-foreground">Last Modified:</span>
                  <span className="font-semibold text-foreground">{selectedResult.date}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
