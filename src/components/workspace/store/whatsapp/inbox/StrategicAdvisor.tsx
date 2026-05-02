'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/shadcn-ui/badge';
import { Button } from '@/components/shadcn-ui/button';
import { cn } from '@/lib/utils';
import './StrategicAdviser.css';
import { InboxInsights } from './WhatsAppInbox';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  AlertCircle, 
  Zap, 
  ArrowRight 
} from 'lucide-react';

interface StrategicAdvisorProps {
  intent?: string;
  confidence?: number;
  strategy?: string | {
    action: string;
    reason: string;
    expected_impact: string;
    success_rate_hint: string;
    message_suggestion: string;
    merchant_next_step?: string;
  };
  recommendations?: string[];
  cartValue?: string;
  advisoryProfile?: any; // Keep for legacy if needed
  insights?: InboxInsights;
  aiAutonomyMode?: string;
  blueprintSteps?: string[];
  onResumeAi?: () => void;
}

const protocolMap: Record<string, string> = {
  'DISCOVERY': 'Discovery Phase',
  'CHECKOUT': 'Checkout Flow',
  'NEGOTIATION': 'Price Negotiation',
  'RETENTION': 'Retention Strategy',
  'SUPPORT': 'Customer Support',
  'product_inquiry': 'Product Inquiry',
  'general_inquiry': 'General Inquiry',
  'cart_build': 'Building Cart',
  'address_collection': 'Collecting Address',
  'payment_pending': 'Awaiting Payment',
  'initial_contact': 'Initial Contact',
  'TRENDING_UP': 'Trending Up',
  'TRENDING_DOWN': 'Trending Down',
  'STABLE': 'Stable',
  'WARNING': 'High Risk',
  'NORMAL': 'Steady',
};

const getLabel = (code?: string) => {
  if (!code || code === 'none' || code === 'NONE' || code === 'idle') return '';
  return protocolMap[code] || protocolMap[code.toLowerCase()] || code.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export function StrategicAdvisor({
  intent = "Exploring",
  confidence = 85,
  strategy = "Analyzing behavior...",
  recommendations = [],
  cartValue = "XAF 0",
  insights,
  aiAutonomyMode,
  blueprintSteps = [],
  onResumeAi,
}: StrategicAdvisorProps) {
  const strategyData = typeof strategy === 'object' ? strategy : { action: strategy, reason: '', expected_impact: '', success_rate_hint: '', message_suggestion: '', merchant_next_step: '' };
  
  const [pulse, setPulse] = React.useState(false);

  React.useEffect(() => {
    if (strategyData.action) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [strategyData.action]);

  const domainLabel = getLabel(insights?.domain) || 'Active Control';
  const stateLabel = getLabel(insights?.currentState) || 'Analyzing';
  const prevStateLabel = insights?.previousState ? getLabel(insights.previousState) : null;

  const buyProb = Math.round((insights?.conversionProbability || 0.45) * 100);
  const dropRisk = Math.round((insights?.dropRisk || 0.20) * 100);
  const priceSensitivity = Math.round((insights?.priceSensitivity || 0.4) * 100);
  const decisiveness = Math.round((insights?.decisiveness || 0.8) * 100);
  const trustLevel = Math.round((insights?.trustLevel || 0.5) * 100);
  const activeIntervention = insights?.activeIntervention || 'NONE';

  const showIntervention = insights?.isStateTransitionPaused === true;

  return (
    <aside className="w-full h-full flex flex-col bg-[#09090b] text-zinc-400 overflow-y-auto custom-scrollbar border-l border-white/5">
      {/* 4.1.A Protocol Header */}
      <header className="p-6 border-b border-white/5 sticky top-0 bg-[#09090b]/90 backdrop-blur-xl z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
              <Brain className="text-indigo-400 size-5" />
            </div>
            <div>
              <h2 className="text-zinc-100 font-semibold text-lg tracking-tight">Workman</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{domainLabel}</span>
                {prevStateLabel && (
                  <>
                    <ArrowRight className="size-3 text-zinc-700" />
                    <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">{stateLabel}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline" className="h-6 bg-zinc-900 border-zinc-800 text-zinc-400 font-mono text-[10px] px-2">
            v2.1 Stable
          </Badge>
        </div>

        {showIntervention && (
          <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="text-amber-500 size-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-amber-200">Action Required</p>
              <p className="text-[10px] text-amber-500/80 italic truncate">{insights?.pauseReason || 'Awaiting merchant input'}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-7 text-[10px] bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-500 font-bold shrink-0" 
              onClick={onResumeAi}
            >
              Resume AI Flow
            </Button>
          </div>
        )}
      </header>

      <div className="p-6 space-y-8 pb-32">
        {/* 4.1.B Intent & Sentiment */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Live Intent Analysis</span>
            <span className="text-[11px] font-bold text-indigo-400">{confidence}% Match</span>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 p-5 rounded-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl font-bold text-zinc-100 tracking-tight">{getLabel(intent)}</span>
              <div className="flex items-end gap-1 h-6">
                {(insights?.sentimentHistory || [0.5, 0.7, 0.4, 0.8, 0.6]).map((v, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1 rounded-full transition-all duration-500",
                      v > 0.6 ? "bg-emerald-500" : v > 0.3 ? "bg-amber-400" : "bg-rose-500"
                    )}
                    style={{ height: `${v * 100}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: `${confidence}%` }} />
            </div>
          </div>
        </section>

        {/* 4.1.D Live Sales Strategy (REPOSITIONED) */}
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Sales Protocol</span>
            {strategyData.success_rate_hint && (
              <span className="text-[10px] font-bold bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-400">{strategyData.success_rate_hint} Match</span>
            )}
          </div>
          <div className={cn(
            "bg-zinc-900 border border-zinc-800 p-6 rounded-2xl glow-strategic transition-all duration-500",
            pulse && "strategy-card-pulse"
          )}>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Current Objective</p>
                <p className="text-lg font-bold text-zinc-100 leading-tight">{strategyData.action}</p>
              </div>
              
              <div className="space-y-2 pt-4 border-t border-zinc-800">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Merchant Action</p>
                <p className="text-xs text-zinc-300 leading-relaxed font-medium bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
                  {strategyData.merchant_next_step || strategyData.reason}
                </p>
                {strategyData.expected_impact && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold bg-emerald-500/5 w-fit px-2 py-0.5 rounded-md">
                    <Zap className="size-2.5" />
                    {strategyData.expected_impact}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 4.1.C Bento Metrics Dashboard */}
        <section className="space-y-4">
          <span className="text-xs font-medium text-zinc-500">Customer Trajectory</span>
          <div className="grid grid-cols-2 gap-4">
            {/* Journey Card */}
            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between aspect-square">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-semibold">
                <span>Purchase Prob.</span>
                <TrendingUp className="size-3 text-emerald-500" />
              </div>
              <div>
                <p className="text-3xl font-black text-zinc-100">{buyProb}%</p>
                <div className="h-1 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${buyProb}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between aspect-square">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-semibold">
                <span>Churn Risk</span>
                <AlertCircle className={cn("size-3", dropRisk > 50 ? "text-rose-500" : "text-zinc-600")} />
              </div>
              <div>
                <p className="text-3xl font-black text-zinc-100">{dropRisk}%</p>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={cn("h-1 flex-1 rounded-full", (dropRisk / 20) >= i ? "bg-rose-500" : "bg-zinc-800")} />
                  ))}
                </div>
              </div>
            </div>

            {/* Behavioral DNA */}
            <div className="col-span-2 bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-semibold border-b border-zinc-800 pb-2">
                <span>Behavioral Profile</span>
                <span className="text-zinc-600">Syncing...</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Price Sensitivity', val: priceSensitivity, color: 'text-indigo-400' },
                  { label: 'Decisiveness', val: decisiveness, color: 'text-emerald-400' },
                  { label: 'Trust Level', val: trustLevel, color: 'text-sky-400' },
                ].map((m, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-medium text-zinc-400">{m.label}</span>
                      <span className={cn("font-bold", m.color)}>{m.val}%</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden pt-0.5 pb-0.5">
                     <div className={cn("h-full rounded-full transition-all duration-1000", m.color.replace('text', 'bg'))} style={{ width: `${m.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Integration */}
            <div className="col-span-2 bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Cart</p>
                <p className="text-2xl font-black text-zinc-100 mt-1">{cartValue}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 mb-1">Conversion Impact</p>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none">High Influence</Badge>
              </div>
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}
