import React from 'react';
import { WeaponSkin } from '../types';

interface WeaponGraphicProps {
  skin: WeaponSkin;
  className?: string;
  size?: number;
}

export const WeaponGraphic: React.FC<WeaponGraphicProps> = ({
  skin,
  className = '',
  size = 64,
}) => {
  const { theme, barrelColor, secondaryColor, glowColor, bulletColor, laserColor } = skin;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
        style={{ filter: `drop-shadow(0 0 6px ${glowColor}aa)` }}
      >
        <defs>
          {/* Glow Filters */}
          <filter id={`glow-${skin.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Gradients */}
          <linearGradient id={`grad-barrel-${skin.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={barrelColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </linearGradient>

          <linearGradient id={`grad-glow-${skin.id}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* --- TACTICAL VANGUARD --- */}
        {theme === 'tactical' && (
          <g>
            {/* Base Stock & Grip */}
            <path d="M42 80 L58 80 L56 62 L44 62 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            {/* Tactical Receiver Body */}
            <rect x="38" y="42" width="24" height="24" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <rect x="42" y="46" width="16" height="16" fill="#0f172a" />
            {/* Side Picatinny Rail */}
            <line x1="36" y1="46" x2="36" y2="62" stroke="#64748b" strokeWidth="2" strokeDasharray="2,2" />
            <line x1="64" y1="46" x2="64" y2="62" stroke="#64748b" strokeWidth="2" strokeDasharray="2,2" />
            {/* Main Cannon Barrel */}
            <rect x="43" y="18" width="14" height="26" fill="url(#grad-barrel-wp_default)" stroke="#475569" strokeWidth="1.5" />
            {/* Muzzle Suppressor / Brake */}
            <rect x="41" y="8" width="18" height="11" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Heat Dissipation Slots */}
            <line x1="44" y1="11" x2="56" y2="11" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="44" y1="15" x2="56" y2="15" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Holographic Red Dot Sight */}
            <rect x="45" y="36" width="10" height="6" rx="1" fill="#334155" stroke="#38bdf8" strokeWidth="1" />
            <circle cx="50" cy="39" r="2" fill="#38bdf8" filter={`url(#glow-${skin.id})`} />
            {/* Laser Pointer Guide Beam */}
            <line x1="50" y1="8" x2="50" y2="0" stroke={laserColor} strokeWidth="1.5" strokeDasharray="3,2" />
          </g>
        )}

        {/* --- PRIME PRISMA LUXURY --- */}
        {theme === 'prime' && (
          <g>
            {/* Gold Geometric Base Frame */}
            <polygon points="50,85 34,68 40,55 60,55 66,68" fill="#ca8a04" stroke="#fef08a" strokeWidth="1.5" />
            {/* Sharp Angled White Body Armour */}
            <polygon points="50,12 36,35 38,58 62,58 64,35" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
            <polygon points="50,18 42,35 44,52 56,52 58,35" fill="#0f172a" />
            {/* Side Angular Wings */}
            <polygon points="36,35 24,42 38,52" fill="#e2e8f0" stroke="#ca8a04" strokeWidth="1" />
            <polygon points="64,35 76,42 62,52" fill="#e2e8f0" stroke="#ca8a04" strokeWidth="1" />
            {/* Floating Energy Crystal Core */}
            <polygon points="50,28 43,38 50,48 57,38" fill="#fde047" filter={`url(#glow-${skin.id})`} />
            <circle cx="50" cy="38" r="4" fill="#38bdf8" />
            {/* Crown Muzzle Port */}
            <polygon points="50,5 42,14 58,14" fill="#ca8a04" stroke="#fde047" strokeWidth="1" />
            <rect x="46" y="10" width="8" height="6" fill="#38bdf8" filter={`url(#glow-${skin.id})`} />
          </g>
        )}

        {/* --- GLITCHPOP NEON TECH --- */}
        {theme === 'glitch' && (
          <g>
            {/* Cyber Chassis */}
            <rect x="36" y="50" width="28" height="30" rx="4" fill="#0f172a" stroke="#ec4899" strokeWidth="2" />
            <path d="M32 40 L68 40 L62 18 L38 18 Z" fill="#1e1b4b" stroke="#22d3ee" strokeWidth="2" />
            {/* Neon Power Wires */}
            <path d="M34 56 C28 50 28 32 38 24" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="4,2" />
            <path d="M66 56 C72 50 72 32 62 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4,2" />
            {/* Floating Holographic Ring Scope */}
            <ellipse cx="50" cy="28" rx="16" ry="6" fill="none" stroke="#22d3ee" strokeWidth="2" filter={`url(#glow-${skin.id})`} />
            <ellipse cx="50" cy="28" rx="8" ry="3" fill="#ec4899" opacity="0.6" />
            {/* Multi-pronged Muzzle Brake */}
            <polygon points="44,18 42,6 48,12 50,4 52,12 58,6 56,18" fill="#ec4899" stroke="#22d3ee" strokeWidth="1.5" />
            {/* High-frequency Core Pulse */}
            <rect x="44" y="34" width="12" height="12" rx="2" fill="#22d3ee" filter={`url(#glow-${skin.id})`} />
          </g>
        )}

        {/* --- ELDER DRAGON REGALIA --- */}
        {theme === 'dragon' && (
          <g>
            {/* Obsidian Dragon Spine Base */}
            <path d="M45 82 L55 82 L58 60 L42 60 Z" fill="#1c1917" stroke="#78350f" strokeWidth="2" />
            {/* Dragon Head Shell */}
            <path d="M35 60 C32 40 38 25 50 12 C62 25 68 40 65 60 Z" fill="#27272a" stroke="#ca8a04" strokeWidth="2" />
            {/* Dragon Scale Patterns */}
            <path d="M42 48 L50 38 L58 48" fill="none" stroke="#ca8a04" strokeWidth="1.5" />
            <path d="M40 36 L50 26 L60 36" fill="none" stroke="#ca8a04" strokeWidth="1.5" />
            {/* Fangs & Horns at Muzzle */}
            <path d="M34 25 L24 10 L38 20" fill="#ca8a04" stroke="#f59e0b" strokeWidth="1.5" />
            <path d="M66 25 L76 10 L62 20" fill="#ca8a04" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Magma Flame Core Orb */}
            <circle cx="50" cy="20" r="9" fill="#f59e0b" filter={`url(#glow-${skin.id})`} />
            <circle cx="50" cy="20" r="5" fill="#fef08a" />
            {/* Heat Exhaust Vents */}
            <line x1="38" y1="42" x2="32" y2="44" stroke="#f97316" strokeWidth="2" />
            <line x1="62" y1="42" x2="68" y2="44" stroke="#f97316" strokeWidth="2" />
          </g>
        )}

        {/* --- PROTOCOL ABYSSAL OMEGA --- */}
        {theme === 'protocol' && (
          <g>
            {/* Protocol Heavy Chassis */}
            <polygon points="50,85 36,65 38,40 62,40 64,65" fill="#090d16" stroke="#581c87" strokeWidth="2" />
            {/* Floating Orbit Rings */}
            <ellipse cx="50" cy="30" rx="22" ry="7" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="8,4" filter={`url(#glow-${skin.id})`} />
            <ellipse cx="50" cy="18" rx="16" ry="5" fill="none" stroke="#c084fc" strokeWidth="2" />
            {/* Antimatter Barrel Core */}
            <rect x="43" y="10" width="14" height="35" rx="4" fill="#3b0764" stroke="#a855f7" strokeWidth="1.5" />
            <circle cx="50" cy="28" r="6" fill="#e879f9" filter={`url(#glow-${skin.id})`} />
            <circle cx="50" cy="28" r="2" fill="#ffffff" />
            {/* Dual Hologram Laser Sights */}
            <line x1="38" y1="12" x2="38" y2="0" stroke="#e879f9" strokeWidth="1.5" strokeDasharray="2,2" />
            <line x1="62" y1="12" x2="62" y2="0" stroke="#e879f9" strokeWidth="1.5" strokeDasharray="2,2" />
          </g>
        )}

        {/* --- ION HYPERCANON --- */}
        {theme === 'ion' && (
          <g>
            {/* Sleek Aerodynamic Curved Body */}
            <path d="M50 8 C38 25 36 50 42 80 L58 80 C64 50 62 25 50 8 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            {/* Inner Sci-fi Plasma Channel */}
            <path d="M50 14 L45 42 L55 42 Z" fill="#7dd3fc" filter={`url(#glow-${skin.id})`} />
            <rect x="46" y="42" width="8" height="28" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            {/* Floating Energy Fins */}
            <polygon points="34,35 22,48 36,55" fill="#38bdf8" stroke="#7dd3fc" strokeWidth="1" />
            <polygon points="66,35 78,48 64,55" fill="#38bdf8" stroke="#7dd3fc" strokeWidth="1" />
            <circle cx="50" cy="28" r="5" fill="#ffffff" filter={`url(#glow-${skin.id})`} />
          </g>
        )}

        {/* --- SOUL REAVER (REBIRTH) --- */}
        {theme === 'rebirth' && (
          <g>
            {/* Spectral Chain Body */}
            <rect x="42" y="45" width="16" height="35" rx="3" fill="#022c22" stroke="#0d9488" strokeWidth="2" />
            {/* Soul Flame Horns */}
            <path d="M36 45 C30 25 32 10 40 5 C42 18 42 32 44 45 Z" fill="#0d9488" stroke="#2dd4bf" strokeWidth="1.5" />
            <path d="M64 45 C70 25 68 10 60 5 C58 18 58 32 56 45 Z" fill="#0d9488" stroke="#2dd4bf" strokeWidth="1.5" />
            {/* Spectral Skull Core */}
            <circle cx="50" cy="26" r="10" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2" />
            <circle cx="46" cy="24" r="2.5" fill="#5eead4" filter={`url(#glow-${skin.id})`} />
            <circle cx="54" cy="24" r="2.5" fill="#5eead4" filter={`url(#glow-${skin.id})`} />
            <path d="M46 31 L54 31" stroke="#2dd4bf" strokeWidth="1.5" />
            {/* Floating Ghost Flames */}
            <circle cx="50" cy="10" r="6" fill="#2dd4bf" opacity="0.8" filter={`url(#glow-${skin.id})`} />
          </g>
        )}

        {/* --- KURONAMI WATER BLADE --- */}
        {theme === 'kuronami' && (
          <g>
            {/* Dark Ninja Katana Barrel Frame */}
            <path d="M50 4 L43 28 L46 78 L54 78 L57 28 Z" fill="#0b1329" stroke="#1e3a8a" strokeWidth="2" />
            {/* Twisting Water Vortex Streams */}
            <path d="M42 60 C32 45 68 35 58 20" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" filter={`url(#glow-${skin.id})`} />
            <path d="M58 60 C68 45 32 35 42 20" fill="none" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" />
            {/* Katana Guard Tsuba */}
            <polygon points="50,42 32,48 50,54 68,48" fill="#1e3a8a" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Hydro Orb Core */}
            <circle cx="50" cy="28" r="7" fill="#38bdf8" filter={`url(#glow-${skin.id})`} />
            <circle cx="50" cy="28" r="3" fill="#ffffff" />
          </g>
        )}

        {/* --- SPIRAL PHANTOM (MYSTIC DRAGON) --- */}
        {theme === 'spiral_phantom' && (
          <g>
            {/* Phantom Suppressed Frame */}
            <path d="M42 82 L58 82 L56 60 L44 60 Z" fill="#09131f" stroke="#0891b2" strokeWidth="1.5" />
            <rect x="38" y="40" width="24" height="24" rx="4" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            
            {/* Dragon Head Emblem on Receiver */}
            <path d="M44 48 C44 44 47 42 50 42 C53 42 56 44 56 48 L54 58 L46 58 Z" fill="#083344" stroke="#22d3ee" strokeWidth="1.2" />
            {/* Glowing Dragon Eyes */}
            <circle cx="47.5" cy="48" r="1.5" fill="#67e8f9" filter={`url(#glow-${skin.id})`} />
            <circle cx="52.5" cy="48" r="1.5" fill="#67e8f9" filter={`url(#glow-${skin.id})`} />
            
            {/* Long Tactical Phantom Barrel */}
            <rect x="44" y="14" width="12" height="28" rx="2" fill="#09131f" stroke="#0e7490" strokeWidth="1.5" />
            {/* Phantom Muzzle Silencer */}
            <rect x="42" y="5" width="16" height="12" rx="3" fill="#042f2e" stroke="#22d3ee" strokeWidth="1.5" />

            {/* Coiling Double-Helix Spiral Energy Rings (나선 나선형 에너지) */}
            <path d="M36 34 Q50 38 64 34 Q50 30 36 34" fill="none" stroke="#22d3ee" strokeWidth="2.5" filter={`url(#glow-${skin.id})`} />
            <path d="M38 24 Q50 28 62 24 Q50 20 38 24" fill="none" stroke="#67e8f9" strokeWidth="2.5" filter={`url(#glow-${skin.id})`} />
            <path d="M40 14 Q50 18 60 14 Q50 10 40 14" fill="none" stroke="#38bdf8" strokeWidth="2" filter={`url(#glow-${skin.id})`} />
            
            {/* Dragon Whiskers / Mystical Aura Flares */}
            <path d="M43 45 Q32 38 28 46" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M57 45 Q68 38 72 46" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />
            
            {/* Mystic Dragon Pearl Core */}
            <circle cx="50" cy="24" r="5" fill="#22d3ee" filter={`url(#glow-${skin.id})`} />
            <circle cx="50" cy="24" r="2.5" fill="#ffffff" />

            {/* Laser Sight Guide */}
            <line x1="50" y1="5" x2="50" y2="0" stroke="#67e8f9" strokeWidth="2" strokeDasharray="3,2" />
          </g>
        )}

        {/* --- SINGULARITY (NEOCHRONOS) --- */}
        {theme === 'neochronos' && (
          <g>
            {/* Galactic Black Hole Armature */}
            <rect x="42" y="45" width="16" height="38" rx="4" fill="#05030a" stroke="#4c1d95" strokeWidth="2" />
            {/* Cosmic Accretion Disk Rings */}
            <ellipse cx="50" cy="28" rx="26" ry="9" fill="none" stroke="#c084fc" strokeWidth="2.5" filter={`url(#glow-${skin.id})`} />
            <ellipse cx="50" cy="28" rx="18" ry="6" fill="none" stroke="#f472b6" strokeWidth="2" />
            {/* Floating Antimatter Prisms */}
            <polygon points="28,28 20,18 24,38" fill="#a855f7" stroke="#c084fc" strokeWidth="1" />
            <polygon points="72,28 80,18 76,38" fill="#a855f7" stroke="#c084fc" strokeWidth="1" />
            {/* Black Hole Singularity Core */}
            <circle cx="50" cy="28" r="8" fill="#000000" stroke="#f472b6" strokeWidth="2" />
            <circle cx="50" cy="28" r="4" fill="#ffffff" filter={`url(#glow-${skin.id})`} />
          </g>
        )}
      </svg>
    </div>
  );
};
