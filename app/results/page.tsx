'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const ColonViewer3D = dynamic(() => import('@/components/ColonViewer3D'), {
  ssr: false,
  loading: () => <div style={{ height: 460, borderRadius: 12, background: '#f5f0ec', border: '0.5px solid #e0ddd5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#aaa' }}>Cargando modelo 3D…</div>,
});

const TYPE_LABELS: Record<string, string> = {
  polyp_tubular:'Pólipo tubular', polyp_villous:'Pólipo velloso', polyp_serrated:'Pólipo serrado',
  polyp_hyperplastic:'Pólipo hiperplásico', polyp_unspecified:'Pólipo', inflammation:'Inflamación / hiperemia',
  diverticula:'Diverticulosis', vascular_ectasia:'Ectasia vascular', tumor_suspected:'Lesión a estudio',
  hemorrhoids:'Hemorroides', normal:'Sin hallazgo significativo', other:'Otro hallazgo',
};

const SEGMENT_LABELS: Record<string, string> = {
  cecum:'Ciego', ascending:'Colon ascendente', hepatic_flexure:'Ángulo hepático',
  transverse:'Colon transverso', splenic_flexure:'Ángulo esplénico', descending:'Colon descendente',
  sigmoid:'Sigma', rectum:'Recto', terminal_ileum:'Íleon terminal', unknown:'No especificado',
};

const FINDING_COLORS: Record<string, string> = {
  polyp_tubular:'#E85A2E', polyp_villous:'#C53030', polyp_serrated:'#D97706',
  polyp_hyperplastic:'#F59E0B', polyp_unspecified:'#EF6820', inflammation:'#FACC15',
  diverticula:'#60A5FA', vascular_ectasia:'#A78BFA', tumor_suspected:'#DC2626',
  hemorrhoids:'#F472B6', normal:'#34D399', other:'#94A3B8',
};

const CONDUCT_CFG: Record<string, {bg:string,badge:string,label:string}> = {
  routine:   { bg:'#E1F5EE', badge:'#1D9E75', label:'Seguimiento rutinario' },
  follow_up: { bg:'#FEF3C7', badge:'#BA7517', label:'Consulta de seguimiento' },
  soon:      { bg:'#FFEDD5', badge:'#C2410C', label:'Consulta próximamente' },
  urgent:    { bg:'#FEE2E2', badge:'#B91C1C', label:'Consulta esta semana' },
};

const CAT_ICONS: Record<string, string> = { appointment:'📅', test:'🔬', lifestyle:'🥗', watchfor:'👁', information:'ℹ️' };

export default function ResultsPage() {
  const [report, setReport] = useState<any>(null);
  const [active, setActive] = useState<string | null>(null);
  const [conductOpen, setConductOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('colonscope_report');
      if (!stored) { router.push('/'); return; }
      setReport(JSON.parse(stored));
    } catch { router.push('/'); }
  }, [router]);

  if (!report) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#888' }}>Cargando…</div>;

  const activeFind = report.findings?.find((f: any) => f.id === active);
  const conduct = report.conduct || {};
  const cfg = CONDUCT_CFG[conduct.level] || CONDUCT_CFG.follow_up;

  return (
    <div style={{ minHeight: '100vh', background: '#f8f6f2', padding: '0 0 40px' }}>

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', background: '#fff', borderBottom: '0.5px solid #e0ddd5', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#FAECE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#D85A30' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>ColonScope</span>
          {report.metadata?.report_date && <span style={{ fontSize: 11, color: '#aaa', padding: '2px 8px', borderRadius: 20, background: '#f5f0ec', border: '0.5px solid #e0ddd5' }}>{report.metadata.report_date}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {report.preparation?.descriptor && (
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#E1F5EE', color: '#085041', fontWeight: 500 }}>
              Preparación: {report.preparation.descriptor}{report.preparation.score ? ` · ${report.preparation.scale} ${report.preparation.score}/9` : ''}
            </span>
          )}
          <button onClick={() => { sessionStorage.removeItem('colonscope_report'); router.push('/'); }} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 8, border: '0.5px solid #ddd', background: '#fff', cursor: 'pointer', color: '#666' }}>
            Nuevo análisis
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 14, padding: '14px', maxWidth: 1100, margin: '0 auto' }}>

        {/* Left: 3D viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ColonViewer3D findings={report.findings || []} activeFinding={active} onMarkerClick={(id) => setActive(a => a === id ? null : id)} />
          {report.raw_extraction_confidence === 'low' && (
            <div style={{ padding: '9px 12px', background: '#FEF3C7', borderRadius: 8, fontSize: 12, color: '#92400E' }}>
              ⚠️ La extracción del informe fue de baja confianza. Verifica los hallazgos con tu médico.
            </div>
          )}
          <div style={{ padding: '9px 12px', background: '#fff', border: '0.5px solid #e0ddd5', borderRadius: 8, fontSize: 11, color: '#aaa', lineHeight: 1.55 }}>
            ⚠️ <strong style={{ color: '#888' }}>Aviso:</strong> ColonScope es una herramienta educativa. La información mostrada NO constituye diagnóstico médico ni reemplaza la evaluación de tu gastroenterólogo.
          </div>
        </div>

        {/* Right: panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 500, marginBottom: 3 }}>
              Hallazgos ({report.findings?.length || 0})
            </div>
            <div style={{ fontSize: 10, color: '#bbb' }}>Haz clic para ver detalle y resaltarlo en el modelo 3D</div>
          </div>

          {/* Findings list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {(report.findings || []).map((f: any, i: number) => {
              const color = FINDING_COLORS[f.type] || '#94A3B8';
              const isAct = f.id === active;
              return (
                <div key={f.id} onClick={() => setActive(a => a === f.id ? null : f.id)}
                  style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 9, background: isAct ? '#faf8f6' : '#fff', border: isAct ? `0.5px solid ${color}50` : '0.5px solid #e0ddd5', cursor: 'pointer', position: 'relative', alignItems: 'flex-start', transition: 'all .12s' }}>
                  {isAct && <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, background: color, borderRadius: '0 2px 2px 0' }} />}
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#fff', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a', marginBottom: 2 }}>{TYPE_LABELS[f.type] || f.type}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>
                      {SEGMENT_LABELS[f.location] || f.location}
                      {f.size_mm ? ` · ${f.size_mm} mm` : ''}
                      {f.biopsy_taken ? ' · Biopsia tomada' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          {activeFind ? (
            <div style={{ padding: '12px 14px', background: '#fff', border: `0.5px solid #e0ddd5`, borderLeft: `3px solid ${FINDING_COLORS[activeFind.type] || '#94A3B8'}`, borderRadius: 9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: FINDING_COLORS[activeFind.type] || '#94A3B8', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#1a1a1a' }}>{TYPE_LABELS[activeFind.type]} — {SEGMENT_LABELS[activeFind.location]}</span>
              </div>
              <p style={{ fontSize: 12, color: '#666', lineHeight: 1.65, marginBottom: 10 }}>{activeFind.plain_language}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 14px', borderTop: '0.5px solid #eee', paddingTop: 8 }}>
                {activeFind.size_mm && <><div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.05em' }}>Tamaño</div><div style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{activeFind.size_mm} mm</div></>}
                {activeFind.size_description && <><div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.05em' }}>Tipo</div><div style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{activeFind.size_description}</div></>}
                {activeFind.count && <><div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.05em' }}>Cantidad</div><div style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{activeFind.count}</div></>}
                <><div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.05em' }}>Biopsia</div><div style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{activeFind.biopsy_taken === true ? `Sí (${activeFind.biopsy_count || 1})` : activeFind.biopsy_taken === false ? 'No' : 'No indicado'}</div></>
                {activeFind.pathology_result && <><div style={{ fontSize: 10, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.05em' }}>Resultado AP</div><div style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{activeFind.pathology_result}</div></>}
              </div>
              <details style={{ marginTop: 8 }}>
                <summary style={{ fontSize: 10, color: '#bbb', cursor: 'pointer' }}>Ver texto original del informe</summary>
                <p style={{ fontSize: 10, color: '#bbb', fontStyle: 'italic', marginTop: 5, lineHeight: 1.5 }}>"{activeFind.description_raw}"</p>
              </details>
            </div>
          ) : (
            <div style={{ padding: '14px', textAlign: 'center', fontSize: 12, color: '#bbb', border: '0.5px dashed #e0ddd5', borderRadius: 9 }}>
              Selecciona un hallazgo para ver la explicación
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '0.5px solid #e0ddd5' }} />

          {/* Conduct panel */}
          <div style={{ border: '0.5px solid #e0ddd5', borderRadius: 9, overflow: 'hidden' }}>
            <div onClick={() => setConductOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: cfg.bg, cursor: 'pointer' }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 9px', borderRadius: 20, background: cfg.badge, color: '#fff', flexShrink: 0 }}>{cfg.label}</span>
              <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: '#1a1a1a' }}>¿Qué deberías hacer ahora?</span>
              <span style={{ fontSize: 11, color: '#888' }}>{conductOpen ? '▲' : '▼'}</span>
            </div>
            {conductOpen && (
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {(conduct.items || []).map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1.65 }}>{CAT_ICONS[item.category] || '•'}</span>
                    <p style={{ fontSize: 12, color: '#666', lineHeight: 1.65, margin: 0 }}>{item.text}</p>
                  </div>
                ))}
                {conduct.next_colonoscopy_years && (
                  <div style={{ padding: '7px 9px', background: '#f8f6f2', borderRadius: 7, fontSize: 11, color: '#666' }}>
                    📅 Próxima colonoscopia recomendada en <strong>{conduct.next_colonoscopy_years} años</strong>
                  </div>
                )}
                <p style={{ fontSize: 10, color: '#bbb', lineHeight: 1.55, margin: '2px 0 0' }}>
                  ⚠️ Esta guía es orientativa. Tu gastroenterólogo tiene el contexto completo de tu salud y tomará la decisión final.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
