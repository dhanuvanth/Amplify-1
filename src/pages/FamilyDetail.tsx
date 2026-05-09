import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { FAMILIES } from '../data/mock';
import { AssetCard } from '../components/catalog/AssetCard';
import { Button } from '../components/ui/Button';
import { loadCatalogAssets, type CatalogAsset } from '../lib/catalog';

export function FamilyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assets, setAssets] = useState<CatalogAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const catalogAssets = await loadCatalogAssets();
      if (!cancelled) {
        setAssets(catalogAssets);
        setIsLoading(false);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id || !FAMILIES[id]) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="text-xl font-bold text-gray-900">Family not found</h2>
        <Button className="mt-4" onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  const f = FAMILIES[id];
  const familyAssets = assets.filter((asset) => asset.family === id);
  const depArr = Array.isArray(f.dependsOn) ? f.dependsOn : [f.dependsOn];

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 px-4 py-4 text-sm md:px-10">
        <button onClick={() => navigate('/')} className="font-medium text-sky-500 hover:text-sky-600 transition-colors">Home</button>
        <span className="text-gray-300">/</span>
        <span className="font-medium text-gray-900" style={{ color: f.color }}>{f.name}</span>
      </div>

      <div className="px-4 pb-8 md:px-10">
        <div 
          className="grid grid-cols-1 overflow-hidden rounded-2xl border bg-white lg:grid-cols-[2fr_1fr_1fr_1fr]"
          style={{ borderColor: `${f.color}30`, borderTopWidth: '4px', borderTopColor: f.color }}
        >
          {/* Main Hero Col */}
          <div className="p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-gray-100" style={{ backgroundColor: `${f.color}05` }}>
            <div className="mb-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: f.color }}>
              {f.tagline}
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 leading-tight">
              {f.name}
            </h1>
            <p className="mb-8 text-sm leading-relaxed text-gray-600 max-w-lg">
              {f.longDesc}
            </p>
            
            <div className="flex flex-wrap gap-4">
              {[
                [familyAssets.length, 'Assets'],
                [familyAssets.filter((asset) => asset.maturity === 'battle-tested').length, 'Battle-Tested'],
                [familyAssets.filter((asset) => asset.demoReady).length, 'Demo-Ready'],
                [familyAssets.reduce((sum, asset) => sum + asset.stats.deployments, 0), 'Deploys']
              ].map(([n, l], i) => (
                <div key={i} className="min-w-[80px] rounded-xl border border-white/50 bg-white p-3 text-center shadow-sm">
                  <div className="text-2xl font-bold" style={{ color: f.color }}>{isLoading ? '...' : n}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* When to Sell Col */}
          <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full" style={{ backgroundColor: f.color }} />
              <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: f.color }}>When to Sell</h3>
            </div>
            <div className="space-y-4">
              {f.useCases.map((u: string, i: number) => (
                <div key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                  <ChevronRight className="h-4 w-4 shrink-0 mt-0.5" style={{ color: f.color }} />
                  <span>{u}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Depends On Col */}
          <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-gray-100 bg-white">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-gray-400" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Depends On</h3>
            </div>
            <div className="space-y-4">
              {depArr.map((d: string, i: number) => (
                <div key={i} className="text-sm text-gray-600 leading-relaxed font-medium">
                  {d}
                </div>
              ))}
            </div>
          </div>

          {/* Enables Col */}
          <div className="p-6 lg:p-8 bg-white">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Enables</h3>
            </div>
            <div className="space-y-4">
              {f.enables.map((e: string, i: number) => (
                <div key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
                  <span>{e}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Solutions */}
      <div className="px-4 pb-10 md:px-10">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-500">Signature Solutions</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {f.solutions.map((s: string, i: number) => {
            const [title, ...rest] = s.split(' — ');
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                style={{ borderLeftWidth: '3px', borderLeftColor: f.color }}
              >
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: f.color }} />
                <div>
                  <h3 className="text-sm font-bold" style={{ color: f.color }}>{title}</h3>
                  {rest.length > 0 && (
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{rest.join(' — ')}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Assets Grid */}
      <div className="px-4 md:px-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">
            Assets <span className="font-normal text-gray-500">({isLoading ? '...' : familyAssets.length})</span>
          </h2>
          <button 
            onClick={() => navigate('/submit')}
            className="flex items-center gap-1 text-xs font-medium hover:underline"
            style={{ color: f.color }}
          >
            + Submit to {f.name} <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm font-medium text-gray-500 shadow-sm">
            Loading family assets...
          </div>
        ) : familyAssets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-20 text-center">
            <h3 className="text-sm font-medium text-gray-500">No assets yet in this family.</h3>
            <button onClick={() => navigate('/submit')} className="mt-2 text-sm font-medium text-sky-500 hover:text-sky-600">
              Be the first to contribute
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {familyAssets.map((a, i) => (
              <AssetCard key={a.id} asset={a} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
