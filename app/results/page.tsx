'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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

const CAT_ICONS: Record<string, string> = {
  appointment:'📅', test:'🔬', lifestyle:'🥗', watchfor:'👁', information:'ℹ️'
};

// Posiciones SVG para cada segmento del colon
const SEGMENT_SVG: Record<string, {x:number,y:number}> = {
  cecum:           {x:268, y:210},
  ascending:       {x:270, y:155},
  hepatic_flexure: {x:255, y:95},
  transverse:      {x:175, y:72},
  splenic_flexure: {x:100, y:95},
  descending:      {x:85,  y:160},
  sigmoid:         {x:110, y:225},
  rectum:          {x:160, y:270},
  terminal_ileum:  {x:290, y:225},
  unknown:         {x:175, y:160},
};

function ColonSVG({ findings, activeFinding, onMarkerClick }: {
  findings: any[], activeFinding: string|null, onMarkerClick: (id:string)=>void
}) {
  return (
    <div style={{position:'relative', width:'100%', height:380, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <svg viewBox="0 0 360 320" width="100%" height="100%" style={{maxWidth:340}}>
        {/* Recto */}
        <path d="M152,300 C150,278 150,258 153,238" fill="none" stroke="#C8856A" strokeWidth="18" strokeLinecap="round"/>
        {/* Sigma */}
        <path d="M153,238 C160,218 174,208 172,188 C169,168 150,162 150,142" fill="none" stroke="#C8856A" strokeWidth="18" strokeLinecap="round"/>
        {/* Descendente */}
        <path d="M150,142 C150,112 150,85 148,60" fill="none" stroke="#C8856A" strokeWidth="18" strokeLinecap="round"/>
        {/* Angulo esplénico */}
        <path d="M148,60 C151,44 166,36 183,34" fill="none" stroke="#C8856A" strokeWidth="18" strokeLinecap="round"/>
        {/* Transverso */}
        <path d="M183,34 C208,32 236,32 260,34" fill="none" stroke="#C8856A" strokeWidth="18" strokeLinecap="round"/>
        {/* Angulo hepático */}
        <path d="M260,34 C278,36 285,50 285,68" fill="none" stroke="#C8856A" strokeWidth="18" strokeLinecap="round"/>
        {/* Ascendente */}
        <path d="M285,68 C285,105 283,140 281,175" fill="none" stroke="#C8856A" strokeWidth="18" strokeLinecap="round"/>
        {/* Ciego */}
        <path d="M281,175 C281,196 275,214 263,226" fill="none" stroke="#C8856A" strokeWidth="18" strokeLinecap="round"/>
        {/* Apéndice */}
        <path d="M263,226 C270,238 272,250 267,258" fill="none" stroke="#B87560" strokeWidth="8" strokeLinecap="round" opacity="0.6"/>

        {/* Reflejos */}
        <path d="M152,300 C150,278 150,258 153,238" fill="none" stroke="#E8A08A" strokeWidth="5" strokeLinecap="round" opacity="0.3"/>
        <path d="M150,142 C150,112 150,85 148,60" fill="none" stroke="#E8A08A" strokeWidth="5" strokeLinecap="round" opacity="0.3"/>
        <path d="M183,34 C208,32 236,32 260,34" fill="none" stroke="#E8A08A" strokeWidth="5" strokeLinecap="round" opacity="0.3"/>
        <path d="M285,68 C285,105 283,140 281,175" fill="none" stroke="#E8A08A" strokeWidth="5" strokeLinecap="round" opacity="0.3"/>

        {/* Labels anatómicos */}
        <text x="118" y="308" fontSize="9" fill="#aaa" textAnchor="middle" fontFamily="sans-serif">Recto</text>
        <text x="120" y="200" fontSize="9" fill="#aaa" textAnchor="end" fontFamily="sans-serif">Sigma</text>
        <text x="118" y="110" fontSize="9" fill="#aaa" textAnchor="end" fontFamily="sans-serif">Descendente</text>
        <text x="218" y="22" fontSize="9" fill="#aaa" textAnchor="middle" fontFamily="sans-serif">Transverso</text>
        <text x="300" y="122" fontSize="9" fill="#aaa" textAnchor="start" fontFamily="sans-serif">Ascendente</text>

        {/* Markers de hallazgos */}
        {findings.map((f, i) => {
          const pos = SEGMENT_SVG[f.location] || SEGMENT_SVG.unknown;
          const color = FINDING_COLORS[f.type] || '#94A3B8';
          const isActive = f.id === activeFinding;
          return (
            <g key={f.id} onClick={() => onMarkerClick(f.id)} style={{cursor:'pointer'}}>
              <circle cx={pos.x} cy={pos.y} r={isActive ? 16 : 13} fill={color} opacity={0.25}/>
              <circle cx={pos.x} cy={pos.y} r={isActive ? 9 : 7} fill={color}/>
              <text x={pos.x} y={pos.y+1} fontSize="8" fill="#fff" textAnchor="middle" dominantBaseline="central" fontFamily="sans-serif" fontWeight="bold">{i+1}</text>
            </g>
          );
        })}
      </svg>

      {/* Leyenda */}
      <div style={{position:'absolute', bottom:8, left:8, display:'flex', flexDirection:'column', gap:3}}>
        {[...new Set(findings.map((f:any) => f.type))].map(type => (
          <div key={type} style={{display:'flex', alignItems:'center', gap:5, background:'#fff', border:'0.5px solid #e0ddd5', borderRadius:5, padding:'2px 7px', fontSize:10, color:'#666'}}>
            <span style={{width:6, height:6, borderRadius:'50%', background:FINDING_COLORS[type]||'#94A3B8', flexShrink:0}}/>
            {TYPE_LABELS[type]||type}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [report, setReport] = useState<any>(null);
  const [active, setActive] = useState<string|null>(null);
  const [conductOpen, setConductOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('colonscope_report');
      if (!stored) {
        router.push('/');
        return;
      }
      setReport(JSON.parse(stored));
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) return (
    <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8f6f2'}}>
      <p style={{fontSize:14, color:'#888'}}>Cargando resultados…</p>
    </div>
  );

  if (!report) return null;

  const activeFind = report.findings?.find((f:any) => f.id === active);
  const conduct = report.conduct || {};
  const cfg = CONDUCT_CFG[conduct.level] || CONDUCT_CFG.follow_up;

  return (
    <div style={{minHeight:'100vh', background:'#f8f6f2', paddingBottom:40}}>

      {/* Nav */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', background:'#fff', borderBottom:'0.5px solid #e0ddd5', flexWrap:'wrap', gap:8}}>
        <div style={{display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:28, height:28, borderRadius:8, background:'#FAECE7', display:'flex', alignItems:'center', justifyContent:'center'}}>
            <div style={{width:11, height:11, borderRadius:'50%', background:'#D85A30'}}/>
          </div>
          <span style={{fontSize:15, fontWeight:600, color:'#1a1a1a'}}>ColonScope</span>
          {report.metadata?.report_date && (
            <span style={{fontSize:11, color:'#aaa', padding:'2px 8px', borderRadius:20, background:'#f5f0ec', border:'0.5px solid #e0ddd5'}}>
              {report.metadata.report_date}
            </span>
          )}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          {report.preparation?.descriptor && (
            <span style={{fontSize:11, padding:'3px 10px', borderRadius:20, background:'#E1F5EE', color:'#085041', fontWeight:500}}>
              Preparación: {report.preparation.descriptor}
              {report.preparation.score ? ` · ${report.preparation.scale} ${report.preparation.score}/9` : ''}
            </span>
          )}
          <button
            onClick={() => { sessionStorage.removeItem('colonscope_report'); router.push('/'); }}
            style={{fontSize:11, padding:'5px 12px', borderRadius:8, border:'0.5px solid #ddd', background:'#fff', cursor:'pointer', color:'#666'}}
          >
            Nuevo análisis
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div style={{display:'grid', gridTemplateColumns:'minmax(0,1.3fr) minmax(0,1fr)', gap:14, padding:14, maxWidth:1100, margin:'0 auto'}}>

        {/* Columna izquierda: visor */}
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <div style={{borderRadius:12, overflow:'hidden', background:'#f5f0ec', border:'0.5px solid #e0ddd5'}}>
            <ColonSVG
              findings={report.findings||[]}
              activeFinding={active}
              onMarkerClick={(id) => setActive(a => a === id ? null : id)}
            />
          </div>
          <div style={{padding:'9px 12px', background:'#fff', border:'0.5px solid #e0ddd5', borderRadius:8, fontSize:11, color:'#aaa', lineHeight:1.55}}>
            ⚠️ <strong style={{color:'#888'}}>Aviso:</strong> ColonScope es una herramienta educativa. La información mostrada NO constituye diagnóstico médico ni reemplaza la evaluación de tu gastroenterólogo.
          </div>
        </div>

        {/* Columna derecha: panel */}
        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <div>
            <div style={{fontSize:11, color:'#aaa', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:500, marginBottom:3}}>
              Hallazgos ({report.findings?.length || 0})
            </div>
            <div style={{fontSize:10, color:'#bbb'}}>Haz clic en un hallazgo para ver el detalle</div>
          </div>

          {/* Lista de hallazgos */}
          <div style={{display:'flex', flexDirection:'column', gap:5}}>
            {(report.findings||[]).map((f:any, i:number) => {
              const color = FINDING_COLORS[f.type]||'#94A3B8';
              const isAct = f.id === active;
              return (
                <div
                  key={f.id}
                  onClick={() => setActive(a => a === f.id ? null : f.id)}
                  style={{display:'flex', gap:10, padding:'10px 12px', borderRadius:9, background: isAct ? '#faf8f6' : '#fff', border: isAct ? `1px solid ${color}50` : '0.5px solid #e0ddd5', cursor:'pointer', position:'relative', alignItems:'flex-start', transition:'all .12s'}}
                >
                  {isAct && <div style={{position:'absolute', left:0, top:6, bottom:6, width:3, background:color, borderRadius:'0 2px 2px 0'}}/>}
                  <div style={{width:22, height:22, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:'#fff', flexShrink:0, marginTop:1}}>{i+1}</div>
                  <div>
                    <div style={{fontSize:12, fontWeight:500, color:'#1a1a1a', marginBottom:2}}>{TYPE_LABELS[f.type]||f.type}</div>
                    <div style={{fontSize:11, color:'#888'}}>
                      {SEGMENT_LABELS[f.location]||f.location}
                      {f.size_mm ? ` · ${f.size_mm} mm` : ''}
                      {f.biopsy_taken ? ' · Biopsia tomada' : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalle del hallazgo activo */}
          {activeFind ? (
            <div style={{padding:'12px 14px', background:'#fff', border:'0.5px solid #e0ddd5', borderLeft:`3px solid ${FINDING_COLORS[activeFind.type]||'#94A3B8'}`, borderRadius:9}}>
              <div style={{display:'flex', alignItems:'center', gap:7, marginBottom:8}}>
                <span style={{width:8, height:8, borderRadius:'50%', background:FINDING_COLORS[activeFind.type]||'#94A3B8', flexShrink:0}}/>
                <span style={{fontSize:12, fontWeight:500, color:'#1a1a1a'}}>
                  {TYPE_LABELS[activeFind.type]} — {SEGMENT_LABELS[activeFind.location]}
                </span>
              </div>
              <p style={{fontSize:13, color:'#555', lineHeight:1.7, marginBottom:10}}>{activeFind.plain_language}</p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px 14px', borderTop:'0.5px solid #eee', paddingTop:8}}>
                {activeFind.size_mm && <>
                  <div style={{fontSize:10, color:'#aaa', textTransform:'uppercase', letterSpacing:'.05em'}}>Tamaño</div>
                  <div style={{fontSize:11, color:'#555', fontWeight:500}}>{activeFind.size_mm} mm</div>
                </>}
                {activeFind.size_description && <>
                  <div style={{fontSize:10, color:'#aaa', textTransform:'uppercase', letterSpacing:'.05em'}}>Morfología</div>
                  <div style={{fontSize:11, color:'#555', fontWeight:500}}>{activeFind.size_description}</div>
                </>}
                {activeFind.count && <>
                  <div style={{fontSize:10, color:'#aaa', textTransform:'uppercase', letterSpacing:'.05em'}}>Cantidad</div>
                  <div style={{fontSize:11, color:'#555', fontWeight:500}}>{activeFind.count}</div>
                </>}
                <>
                  <div style={{fontSize:10, color:'#aaa', textTransform:'uppercase', letterSpacing:'.05em'}}>Biopsia</div>
                  <div style={{fontSize:11, color:'#555', fontWeight:500}}>
                    {activeFind.biopsy_taken === true ? `Sí (${activeFind.biopsy_count||1})` : activeFind.biopsy_taken === false ? 'No' : 'No indicado'}
                  </div>
                </>
                {activeFind.pathology_result && <>
                  <div style={{fontSize:10, color:'#aaa', textTransform:'uppercase', letterSpacing:'.05em'}}>Resultado AP</div>
                  <div style={{fontSize:11, color:'#555', fontWeight:500}}>{activeFind.pathology_result}</div>
                </>}
              </div>
              <details style={{marginTop:8}}>
                <summary style={{fontSize:10, color:'#bbb', cursor:'pointer'}}>Ver texto original del informe</summary>
                <p style={{fontSize:11, color:'#bbb', fontStyle:'italic', marginTop:5, lineHeight:1.5}}>"{activeFind.description_raw}"</p>
              </details>
            </div>
          ) : (
            <div style={{padding:14, textAlign:'center', fontSize:12, color:'#bbb', border:'0.5px dashed #e0ddd5', borderRadius:9}}>
              Selecciona un hallazgo para ver la explicación
            </div>
          )}

          <hr style={{border:'none', borderTop:'0.5px solid #e0ddd5'}}/>

          {/* Conducta */}
          <div style={{border:'0.5px solid #e0ddd5', borderRadius:9, overflow:'hidden'}}>
            <div
              onClick={() => setConductOpen(o => !o)}
              style={{display:'flex', alignItems:'center', gap:8, padding:'10px 12px', background:cfg.bg, cursor:'pointer'}}
            >
              <span style={{fontSize:11, fontWeight:500, padding:'2px 9px', borderRadius:20, background:cfg.badge, color:'#fff', flexShrink:0}}>{cfg.label}</span>
              <span style={{flex:1, fontSize:12, fontWeight:500, color:'#1a1a1a'}}>¿Qué deberías hacer ahora?</span>
              <span style={{fontSize:11, color:'#888'}}>{conductOpen ? '▲' : '▼'}</span>
            </div>
            {conductOpen && (
              <div style={{padding:'10px 12px', display:'flex', flexDirection:'column', gap:7}}>
                {(conduct.items||[]).map((item:any, i:number) => (
                  <div key={i} style={{display:'flex', gap:7, alignItems:'flex-start'}}>
                    <span style={{fontSize:13, flexShrink:0, lineHeight:1.65}}>{CAT_ICONS[item.category]||'•'}</span>
                    <p style={{fontSize:12, color:'#555', lineHeight:1.65, margin:0}}>{item.text}</p>
                  </div>
                ))}
                {conduct.next_colonoscopy_years && (
                  <div style={{padding:'7px 9px', background:'#f8f6f2', borderRadius:7, fontSize:11, color:'#666'}}>
                    📅 Próxima colonoscopia recomendada en <strong>{conduct.next_colonoscopy_years} años</strong>
                  </div>
                )}
                <p style={{fontSize:10, color:'#bbb', lineHeight:1.55, margin:'2px 0 0'}}>
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
