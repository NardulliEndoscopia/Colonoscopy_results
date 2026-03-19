'use client';
import { useRef, useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

const SEGMENT_POSITIONS: Record<string, [number, number, number]> = {
  cecum:           [ 0.38, 0.12,  0.05],
  ascending:       [ 0.40, 0.38,  0.05],
  hepatic_flexure: [ 0.35, 0.62,  0.05],
  transverse:      [ 0.00, 0.70,  0.05],
  splenic_flexure: [-0.35, 0.62,  0.05],
  descending:      [-0.40, 0.38,  0.05],
  sigmoid:         [-0.25, 0.15,  0.05],
  rectum:          [ 0.00, 0.05,  0.05],
  terminal_ileum:  [ 0.50, 0.10,  0.05],
  unknown:         [ 0.00, 0.50,  0.20],
};

const FINDING_COLORS: Record<string, string> = {
  polyp_tubular:       '#E85A2E',
  polyp_villous:       '#C53030',
  polyp_serrated:      '#D97706',
  polyp_hyperplastic:  '#F59E0B',
  polyp_unspecified:   '#EF6820',
  inflammation:        '#FACC15',
  diverticula:         '#60A5FA',
  vascular_ectasia:    '#A78BFA',
  tumor_suspected:     '#DC2626',
  hemorrhoids:         '#F472B6',
  normal:              '#34D399',
  other:               '#94A3B8',
};

const SEGMENT_LABELS: Record<string, string> = {
  cecum:'Ciego', ascending:'Colon ascendente', hepatic_flexure:'Ángulo hepático',
  transverse:'Colon transverso', splenic_flexure:'Ángulo esplénico',
  descending:'Colon descendente', sigmoid:'Sigma', rectum:'Recto',
  terminal_ileum:'Íleon terminal', unknown:'Ubicación no especificada',
};

function ColonModel() {
  const { scene } = useGLTF('/models/COLON3D-v1.glb');
  const cloned = useMemo(() => scene.clone(true), [scene]);
  useEffect(() => {
    cloned.traverse((c: any) => {
      if (c.isMesh && c.material) {
        c.material = c.material.clone();
        c.castShadow = true;
      }
    });
  }, [cloned]);
  return <primitive object={cloned} />;
}

function FindingMarker({ finding, isActive, onClick }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pos = (SEGMENT_POSITIONS[finding.location] || SEGMENT_POSITIONS.unknown) as [number,number,number];
  const color = FINDING_COLORS[finding.type] || '#94A3B8';

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    const base = isActive ? 1.4 : hovered ? 1.2 : 1.0;
    const pulse = isActive ? Math.sin(t * 3) * 0.1 : 0;
    meshRef.current.scale.setScalar(base + pulse);
  });

  return (
    <group position={pos}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(finding.id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[0.026, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isActive ? 0.7 : 0.2} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.003, 0.001, 0.06, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {(isActive || hovered) && (
        <Html center distanceFactor={2.5} position={[0, 0.08, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{ background: '#fff', border: '0.5px solid #ddd', borderRadius: 7, padding: '5px 9px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', color: '#333' }}>
            <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, marginRight: 5 }} />
            {SEGMENT_LABELS[finding.location] || finding.location}
          </div>
        </Html>
      )}
    </group>
  );
}

function SceneContent({ findings, activeFinding, onMarkerClick }: any) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 3, 2]} intensity={1.2} />
      <directionalLight position={[-2, 1, -1]} intensity={0.4} />
      <Environment preset="studio" background={false} />
      <Suspense fallback={null}><ColonModel /></Suspense>
      {findings.map((f: any) => (
        <FindingMarker key={f.id} finding={f} isActive={f.id === activeFinding} onClick={onMarkerClick} />
      ))}
    </>
  );
}

useGLTF.preload('/models/COLON3D-v1.glb');

const TYPE_LABELS: Record<string, string> = {
  polyp_tubular:'Pólipo tubular', polyp_villous:'Pólipo velloso', polyp_serrated:'Pólipo serrado',
  polyp_hyperplastic:'Pólipo hiperplásico', polyp_unspecified:'Pólipo', inflammation:'Inflamación',
  diverticula:'Diverticulosis', vascular_ectasia:'Ectasia vascular', tumor_suspected:'Lesión a estudio',
  hemorrhoids:'Hemorroides', normal:'Sin hallazgo', other:'Otro hallazgo',
};

function Legend({ findings }: { findings: any[] }) {
  const types = [...new Set(findings.map((f: any) => f.type))];
  return (
    <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {types.map(type => (
        <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '0.5px solid #e0ddd5', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: '#666' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: FINDING_COLORS[type] || '#94A3B8', flexShrink: 0 }} />
          {TYPE_LABELS[type] || type}
        </div>
      ))}
    </div>
  );
}

export default function ColonViewer3D({ findings = [], activeFinding = null, onMarkerClick = () => {}, height = 460 }: {
  findings?: any[], activeFinding?: string | null, onMarkerClick?: (id: string) => void, height?: number
}) {
  const controlsRef = useRef<any>(null);
  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 12, overflow: 'hidden', background: '#f5f0ec', border: '0.5px solid #e0ddd5' }}>
      <Canvas camera={{ position: [0, 0.4, 1.8], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <SceneContent findings={findings} activeFinding={activeFinding} onMarkerClick={onMarkerClick} />
        <OrbitControls ref={controlsRef} enablePan={false} minDistance={0.8} maxDistance={3.5} target={[0, 0.4, 0]} enableDamping dampingFactor={0.08} />
      </Canvas>
      <button onClick={() => controlsRef.current?.reset()} style={{ position: 'absolute', top: 10, right: 10, width: 30, height: 30, borderRadius: 7, border: '0.5px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#666' }} title="Resetear vista">⟳</button>
      <Legend findings={findings} />
      <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 10, color: '#aaa', pointerEvents: 'none' }}>Arrastra · Scroll para zoom</div>
    </div>
  );
}
