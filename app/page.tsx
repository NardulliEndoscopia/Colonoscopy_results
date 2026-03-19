'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [c1, setC1] = useState(false);
  const [c2, setC2] = useState(false);
  const router = useRouter();
  const ok = c1 && c2;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: '#f8f6f2' }}>
      <div style={{ width: '100%', maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FAECE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#D85A30' }} />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>ColonScope</div>
            <div style={{ fontSize: 12, color: '#888' }}>Entiende tu colonoscopia en minutos</div>
          </div>
        </div>

        {/* Warning */}
        <div style={{ padding: '12px 14px', background: '#FAEEDA', borderRadius: 10, fontSize: 13, color: '#633806', lineHeight: 1.6 }}>
          <strong style={{ display: 'block', marginBottom: 3 }}>⚠️ Aviso importante</strong>
          Esta herramienta es <strong>solo educativa</strong> y NO sustituye la consulta con tu gastroenterólogo. Úsala para entender mejor tu informe, no para tomar decisiones clínicas.
        </div>

        {/* Privacy */}
        <div style={{ padding: '12px 14px', background: '#E6F1FB', borderRadius: 10, fontSize: 13, color: '#0C447C', lineHeight: 1.6 }}>
          <strong style={{ display: 'block', marginBottom: 3 }}>🔒 Tu privacidad está protegida</strong>
          Tu informe se procesa en tiempo real y <strong>no se almacena</strong> en ningún servidor. Al cerrar esta pestaña, todos los datos se eliminan automáticamente.
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 14px', background: '#fff', borderRadius: 10, border: '0.5px solid #e0ddd5' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#444', lineHeight: 1.6 }}>
            <input type="checkbox" checked={c1} onChange={e => setC1(e.target.checked)} style={{ marginTop: 3, accentColor: '#D85A30', cursor: 'pointer' }} />
            He leído y acepto las condiciones de uso y la política de privacidad.
          </label>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#444', lineHeight: 1.6 }}>
            <input type="checkbox" checked={c2} onChange={e => setC2(e.target.checked)} style={{ marginTop: 3, accentColor: '#D85A30', cursor: 'pointer' }} />
            Entiendo que ColonScope es una herramienta educativa y no un diagnóstico médico.
          </label>
        </div>

        {/* CTA */}
        <button
          disabled={!ok}
          onClick={() => router.push('/upload')}
          style={{
            padding: '13px', borderRadius: 10, border: 'none',
            background: ok ? '#D85A30' : '#ddd',
            color: ok ? '#fff' : '#aaa',
            fontSize: 14, fontWeight: 600,
            cursor: ok ? 'pointer' : 'not-allowed',
            transition: 'all .15s',
          }}
        >
          Continuar →
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', lineHeight: 1.6 }}>
          ColonScope no está homologado como dispositivo médico y no debe usarse para tomar decisiones clínicas.
        </p>
      </div>
    </div>
  );
}
