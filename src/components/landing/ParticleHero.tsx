'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  cluster: number;
}

interface Connection {
  from: number;
  to: number;
  progress: number;
  speed: number;
  active: boolean;
}

const COLORS = [
  'rgba(16, 185, 129, ', // emerald
  'rgba(6, 182, 212, ',  // cyan
  'rgba(139, 92, 246, ', // violet
];

export function ParticleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Create particles in clusters (representing agent nodes)
    const clusterCenters = [
      { x: 0.15, y: 0.4 },  // User
      { x: 0.4, y: 0.25 },  // Scanner
      { x: 0.65, y: 0.35 }, // Optimizer
      { x: 0.4, y: 0.65 },  // Executor
      { x: 0.85, y: 0.5 },  // Protocols
    ];

    const particles: Particle[] = [];
    const totalParticles = 80;

    for (let i = 0; i < totalParticles; i++) {
      const cluster = Math.floor(Math.random() * clusterCenters.length);
      const center = clusterCenters[cluster];
      const spread = 0.08;

      particles.push({
        x: (center.x + (Math.random() - 0.5) * spread) * width,
        y: (center.y + (Math.random() - 0.5) * spread) * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: COLORS[cluster % COLORS.length],
        cluster,
      });
    }

    // Connections between clusters (value flows)
    const connections: Connection[] = [];
    for (let i = 0; i < 12; i++) {
      connections.push({
        from: Math.floor(Math.random() * totalParticles),
        to: Math.floor(Math.random() * totalParticles),
        progress: Math.random(),
        speed: 0.002 + Math.random() * 0.003,
        active: Math.random() > 0.3,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      for (const p of particles) {
        const center = clusterCenters[p.cluster];
        const cx = center.x * width;
        const cy = center.y * height;

        // Gentle drift toward cluster center
        p.vx += (cx - p.x) * 0.0003;
        p.vy += (cy - p.y) * 0.0003;

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.opacity})`;
        ctx.fill();
      }

      // Draw connections with traveling dots
      for (const conn of connections) {
        if (!conn.active) continue;

        const from = particles[conn.from];
        const to = particles[conn.to];
        if (!from || !to) continue;

        // Line
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Traveling dot
        conn.progress += conn.speed;
        if (conn.progress > 1) {
          conn.progress = 0;
          // Randomly reassign
          conn.from = Math.floor(Math.random() * totalParticles);
          conn.to = Math.floor(Math.random() * totalParticles);
        }

        const dotX = from.x + (to.x - from.x) * conn.progress;
        const dotY = from.y + (to.y - from.y) * conn.progress;

        ctx.beginPath();
        ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.6 * Math.sin(conn.progress * Math.PI)})`;
        ctx.fill();
      }

      // Draw faint connections within clusters
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[i].cluster !== particles[j].cluster) continue;
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 60) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 * (1 - dist / 60)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="particle-canvas"
      aria-hidden="true"
    />
  );
}
