'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Tab = 'foto' | 'archivo' | 'texto';

const MESSAGES = [
  'Extrayendo texto del documento…',
  'Identificando hallazgos clínicos…',
  'Estructurando datos…',
  'Preparando la visualización 3D…',
];

export default function UploadPage() {
  const [tab, setTab] = useState<Tab>('foto');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function analyze(body: FormData | { text: string }) {
    setLoading(true);
    setError('');
    const iv = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 3500);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        ...(body instanceof FormData
          ? { body }
          : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Error al analizar');
      sessionStorage.setItem('colonscope_report', JSON.stringify(data));
      router.push('/results');
    } catch (e: any) {
      setError(e.message || 'No pudimos procesar el informe. Prueba pegando el texto directamente.');
      setLoading(false);
    } finally {
      clearInterval(iv);
    }
  }

  async function handleFile(file: File) {
    if (file.size > 20 * 1024 * 1024) { setError('El archivo supera los 20 MB.'); return; }
    const fd = new FormData();
    fd.append('file', file);
    await analyze(fd);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const inputStyle = (active: boolean): React.CSSProperties => ({
    flex: 1, padding: '9px 0', fontSize: 13, textAlign: 'center',
    cursor: 'pointer', border: 'none', borderBottom: active ? '2px solid #D85A30' : '2px solid transparent',
    background: 'transparent', color: active ? '#D85A30' : '#888', fontWeight: active ? 600 : 400,
    transition: 'all .15s',
  });

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, background: '#f8f6f2' }}>
      <div style={{ position: 'relative', width: 64, height: 64 }}>
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#eee" strokeWidth="4" />
          <circle cx="32" cy="32" r="26" fill="none" stroke="#D85A30" strokeWidth="4"
            strokeDasharray="163" strokeDashoffset="40" strokeLinecap="round"
            transform="rotate(-90 32 32)"
            style={{ animation: 'spin 1.4s linear infinite' }} />
        </svg>
        <style>{`@keyframes spin{to{stroke-dashoffset:-163}}`}</style>
      </div>
      <p style={{ fontSize: 14, color: '#666', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>{MESSAGES[msgIdx]}</p>
      <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>
        Tu informe no se almacena en ningún servidor.
      </p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: '#f8f6f2' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <a href="/" style={{ fontSize: 12, color: '#aaa' }}>← Volver</a>
        </div>

        <div style={{ background: '#fff', borderRadius: 14, border: '0.5px solid #e0ddd5', padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: '#1a1a1a', marginBottom: 4 }}>Sube tu informe</div>
            <div style={{ fontSize: 13, color: '#888' }}>Elige el formato que prefieras</div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
            {(['foto', 'archivo', 'texto'] as Tab[]).map(t => (
              <button key={t} style={inputStyle(tab === t)} onClick={() => setTab(t)}>
                {t === 'foto' ? '📷 Foto' : t === 'archivo' ? '📎 PDF / Word' : '✏️ Texto'}
              </button>
            ))}
          </div>

          {/* Tab: foto / archivo */}
          {(tab === 'foto' || tab === 'archivo') && (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              style={{ border: '1.5px dashed #ddd', borderRadius: 10, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', transition: 'background .12s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#faf9f7')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontSize: 28, marginBottom: 10 }}>{tab === 'foto' ? '📷' : '📄'}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#333', marginBottom: 6 }}>
                {tab === 'foto' ? 'Arrastra tu foto aquí' : 'Arrastra tu PDF o Word aquí'}
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginBottom: 14 }}>
                {tab === 'foto' ? 'JPG, PNG, HEIC · máx. 10 MB' : '.pdf, .docx, .doc · máx. 20 MB'}
              </div>
              <span style={{ padding: '7px 16px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 12, color: '#666', background: '#fff' }}>
                Seleccionar {tab === 'foto' ? 'foto' : 'archivo'}
              </span>
              <input
                ref={fileRef} type="file" style={{ display: 'none' }}
                accept={tab === 'foto' ? 'image/*' : '.pdf,.doc,.docx'}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {/* Tab: texto */}
          {tab === 'texto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Pega aquí el texto completo de tu informe de colonoscopia..."
                style={{ width: '100%', height: 180, padding: '12px', borderRadius: 8, border: '0.5px solid #ddd', fontSize: 13, lineHeight: 1.6, resize: 'vertical', fontFamily: 'inherit', color: '#333' }}
              />
              <button
                disabled={text.trim().length < 50}
                onClick={() => analyze({ text })}
                style={{ padding: '11px', borderRadius: 9, border: 'none', background: text.trim().length >= 50 ? '#D85A30' : '#eee', color: text.trim().length >= 50 ? '#fff' : '#aaa', fontSize: 14, fontWeight: 600, cursor: text.trim().length >= 50 ? 'pointer' : 'not-allowed' }}
              >
                Analizar mi informe
              </button>
              {text.length > 0 && text.length < 50 && (
                <p style={{ fontSize: 11, color: '#e07830' }}>El texto parece muy corto. ¿Has pegado el informe completo?</p>
              )}
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 12px', background: '#FCEBEB', borderRadius: 8, fontSize: 13, color: '#7F1D1D', lineHeight: 1.5 }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', marginTop: 16, lineHeight: 1.6 }}>
          ⚠️ Herramienta educativa · No almacena datos · No reemplaza al médico
        </p>
      </div>
    </div>
  );
}
