import { useState, useMemo } from 'react';
import { DatasetSelector } from '../components/DatasetSelector';
import { KPICard } from '../components/KPICard';
import { FunnelPanel } from '../components/FunnelPanel';
import { MetricChart } from '../components/MetricChart';
import { InsightPanel } from '../components/InsightPanel';
import { useDatasets } from '../hooks/useDatasets';
import { useSummary } from '../hooks/useSummary';
import { useDays } from '../hooks/useDays';

export function Dashboard() {
  const { datasets, loading: dsLoading } = useDatasets();
  const [activeDataset, setActiveDataset] = useState<string>('A');
  const [activeMetric, setActiveMetric] = useState<string>('traffic');

  if (!dsLoading && datasets.length > 0 && !datasets.includes(activeDataset)) {
    setActiveDataset(datasets[0]);
  }

  const {
    data: summary,
    initialLoading: summaryInitialLoading,
    refreshing: summaryRefreshing,
    error: summaryError,
  } = useSummary(activeDataset);

  const {
    data: days,
    initialLoading: daysInitialLoading,
    refreshing: daysRefreshing,
  } = useDays(activeDataset);

  const isRefreshing = summaryRefreshing || daysRefreshing;

  const funnelTotals = useMemo(() => {
    if (!summary) return { traffic: null, leads_created: null, leads_qualified: null, deals_created: null, deals_won: null };
    const getTotal = (key: string) => summary.metrics.find((m) => m.key === key)?.total ?? null;
    return {
      traffic:         getTotal('traffic'),
      leads_created:   getTotal('leads_created'),
      leads_qualified: getTotal('leads_qualified'),
      deals_created:   getTotal('deals_created'),
      deals_won:       getTotal('deals_won'),
    };
  }, [summary]);

  const periodLabel = summary
    ? `${summary.period.from} — ${summary.period.to} (${summary.period.total_days} días)`
    : '';

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-brand">
          <div className="logo-dot" />
          <h1>Dashboard</h1>
        </div>

        <div className="header-right">
          {periodLabel && <span className="period-label">{periodLabel}</span>}
          {!dsLoading && datasets.length > 0 && (
            <DatasetSelector
              datasets={datasets}
              active={activeDataset}
              onChange={(ds) => { setActiveDataset(ds); setActiveMetric('traffic'); }}
            />
          )}
        </div>
      </header>

      {/* ── Thin progress bar — visible only while refreshing (not initial load) ── */}
      <div className={`refresh-bar ${isRefreshing ? 'refresh-bar--active' : ''}`} />

      {/* ── Body ── */}
      <main className="dashboard-body">

        {/* Initial load spinner — only shown the very first time (no data yet) */}
        {summaryInitialLoading && (
          <div className="state-center">
            <div className="spinner" />
            Cargando métricas…
          </div>
        )}

        {summaryError && (
          <div className="state-center">
            <span className="error-badge">⚠ {summaryError}</span>
          </div>
        )}

        {/* Content — always visible once data exists, fades subtly while refreshing */}
        {summary && !summaryInitialLoading && (
          <div className={isRefreshing ? 'content-refreshing' : 'content-loaded'}>

            {/* ── KPI Grid ── */}
            <section>
              <div className="kpi-grid">
                {summary.metrics.map((stat) => (
                  <KPICard key={stat.key} stat={stat} />
                ))}
              </div>
            </section>

            {/* ── Weekly insight summary ── */}
            <InsightPanel
              metrics={summary.metrics}
              periodLabel={`Últimos 7 días · ${summary.period.from} — ${summary.period.to}`}
            />

            {/* ── Funnel + Chart ── */}
            <section className="charts-row">
              <FunnelPanel funnel={summary.funnel} totals={funnelTotals} />

              {daysInitialLoading ? (
                <div className="state-center card">
                  <div className="spinner" /> Cargando serie…
                </div>
              ) : (
                <MetricChart
                  days={days}
                  metricsMeta={summary.metrics}
                  activeKey={activeMetric}
                  onKeyChange={setActiveMetric}
                />
              )}
            </section>

          </div>
        )}
      </main>
    </div>
  );
}
