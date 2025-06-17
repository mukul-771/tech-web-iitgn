'use client';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { extend } from '@react-three/fiber';
import { MathUtils, Vector3, Color } from 'three';
import * as THREE from 'three';
import { Environment, Lightformer } from '@react-three/drei';

extend({ IcosahedronGeometry: THREE.IcosahedronGeometry });

const vertexShader = `
uniform float u_intensity;
uniform float u_time;

varying vec2 vUv;
varying float vDisplacement;

// Classic Perlin 3D Noise functions
vec4 permute(vec4 x) {
    return mod(((x*34.0)+1.0)*x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
}

float cnoise(vec3 P) {
    vec3 Pi0 = floor(P);
    vec3 Pi1 = Pi0 + vec3(1.0);
    Pi0 = mod(Pi0, 289.0);
    Pi1 = mod(Pi1, 289.0);
    vec3 Pf0 = fract(P);
    vec3 Pf1 = Pf0 - vec3(1.0);
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 / 7.0;
    vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 / 7.0;
    vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = fade(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

void main() {
    vUv = uv;

    vDisplacement = cnoise(position + vec3(2.0 * u_time));

    vec3 newPosition = position + normal * (u_intensity * vDisplacement);

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}
`;

const fragmentShader = `
uniform float u_intensity;
uniform float u_time;
uniform vec3 u_color;

varying vec2 vUv;
varying float vDisplacement;

void main() {
    float distort = 2.0 * vDisplacement * u_intensity * sin(vUv.y * 10.0 + u_time);
    vec3 color = mix(u_color, vec3(1.0, 1.0, 1.0), distort);
    gl_FragColor = vec4(color, 1.0);
}
`;

const Blob = ({ color, scale = 1 }: { color: string; scale?: number }) => {
  const mesh = useRef<THREE.Mesh>(null);
  const hover = useRef(false);
  const isHovering = useRef(false);
  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_intensity: { value: 0.3 },
      u_color: { value: new Color(color) },
    }),
    [color]
  );
  const targetPosition = useRef(new Vector3(0, 0, 0));
  const currentPosition = useRef(new Vector3(0, 0, 0));
  useFrame((state) => {
    const { clock, pointer } = state;
    if (mesh.current) {
      const material = mesh.current.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = 0.4 * clock.getElapsedTime();
      material.uniforms.u_intensity.value = MathUtils.lerp(
        material.uniforms.u_intensity.value,
        hover.current ? 0.7 : 0.5,
        0.02
      );

      // Set target position based on hover state
      if (isHovering.current) {
        // Follow mouse when hovering
        targetPosition.current.set(pointer.x * 1, pointer.y * 1, 0);
      } else {
        // Return to center when not hovering
        targetPosition.current.set(0, 0, 0);
      }

      currentPosition.current.lerp(targetPosition.current, 0.1);
      mesh.current.position.copy(currentPosition.current);
    }
  });
  return (
    <mesh
      ref={mesh}
      scale={1.8 * scale} // Apply responsive scale
      position={[0, 0, 0]}
      onPointerOver={() => {
        hover.current = true;
        isHovering.current = true;
      }}
      onPointerOut={() => {
        hover.current = false;
        isHovering.current = false;
      }}
    >
      <icosahedronGeometry args={[2, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export function TechCube3D() {
  const [blobColor, setBlobColor] = useState('#06b6d4'); // Default cyan-teal
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Fetch blob settings on component mount
    const fetchBlobSettings = async () => {
      try {
        const response = await fetch('/api/admin/blob-settings');
        if (response.ok) {
          const settings = await response.json();
          setBlobColor(settings.color);
        }
      } catch (error) {
        console.error('Error fetching blob settings:', error);
      }
    };

    fetchBlobSettings();

    // Set up polling to check for color changes every 5 seconds
    const interval = setInterval(fetchBlobSettings, 5000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Don't render on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] min-h-[300px] sm:min-h-[400px] md:min-h-[500px] flex justify-center items-center relative overflow-visible">
      <Canvas
        camera={{ position: [0.0, 0.0, 8.0] }}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '500px'
        }}
        gl={{
          antialias: true,
          alpha: true
        }}
      >
        <planeGeometry args={[0.026, 0.5]} />
        <Environment preset="studio" environmentIntensity={0.5} />
        <Blob color={blobColor} scale={1} />
        <Environment
          files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/dancing_hall_1k.hdr"
          resolution={1024}
        >
          <group rotation={[-Math.PI / 3, 0, 0]}>
            <Lightformer
              intensity={4}
              rotation-x={Math.PI / 2}
              position={[0, 5, -9]}
              scale={[10, 10, 1]}
            />
            {[2, 0, 2, 0, 2, 0, 2, 0].map((x, i) => (
              <Lightformer
                key={i}
                form="circle"
                intensity={4}
                rotation={[Math.PI / 2, 0, 0]}
                position={[x, 4, i * 4]}
                scale={[4, 1, 1]}
              />
            ))}
            <Lightformer
              intensity={2}
              rotation-y={Math.PI / 2}
              position={[-5, 1, -1]}
              scale={[50, 2, 1]}
            />
            <Lightformer
              intensity={2}
              rotation-y={-Math.PI / 2}
              position={[10, 1, 0]}
              scale={[50, 2, 1]}
            />
          </group>
        </Environment>
      </Canvas>
    </div>
  );
}
