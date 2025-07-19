// Modern Professional SVG Icons for HermesAI Swap
// Dark theme optimized with golden accents

export const ReferralIcon = ({ size = 64, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="referralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#FFA500" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="rgba(15, 23, 42, 0.9)" stroke="url(#referralGrad)" strokeWidth="2"/>
    
    {/* Two user figures connected */}
    <circle cx="20" cy="26" r="6" fill="url(#referralGrad)" />
    <circle cx="44" cy="26" r="6" fill="url(#referralGrad)" />
    
    {/* Bodies */}
    <path d="M12 42 Q12 36 20 36 Q28 36 28 42 L12 42 Z" fill="url(#referralGrad)" />
    <path d="M36 42 Q36 36 44 36 Q52 36 52 42 L36 42 Z" fill="url(#referralGrad)" />
    
    {/* Connection link */}
    <path d="M28 32 Q32 28 36 32" stroke="url(#referralGrad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <circle cx="28" cy="32" r="2" fill="#FFD700" />
    <circle cx="36" cy="32" r="2" fill="#FFD700" />
  </svg>
);

export const SwapIcon = ({ size = 64, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="swapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="rgba(15, 23, 42, 0.9)" stroke="url(#swapGrad)" strokeWidth="2"/>
    
    {/* Rotating arrows */}
    <path d="M20 24 L38 24 L34 20 M38 24 L34 28" stroke="url(#swapGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M44 40 L26 40 L30 44 M26 40 L30 36" stroke="url(#swapGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Coins */}
    <circle cx="18" cy="24" r="4" fill="#FFD700" />
    <text x="18" y="28" textAnchor="middle" fontSize="6" fill="#000">B</text>
    <circle cx="46" cy="40" r="4" fill="#FFD700" />
    <text x="46" y="44" textAnchor="middle" fontSize="6" fill="#000">H</text>
  </svg>
);

export const ClaimIcon = ({ size = 64, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="claimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="rgba(15, 23, 42, 0.9)" stroke="url(#claimGrad)" strokeWidth="2"/>
    
    {/* Gift box */}
    <rect x="24" y="28" width="16" height="16" fill="url(#claimGrad)" rx="2"/>
    <rect x="22" y="24" width="20" height="4" fill="#FFD700" rx="2"/>
    
    {/* Ribbon */}
    <rect x="31" y="20" width="2" height="12" fill="#FFD700"/>
    <path d="M31 20 Q28 18 32 16 Q36 18 33 20" fill="#FFD700"/>
    
    {/* Coins floating */}
    <circle cx="20" cy="18" r="3" fill="#FFD700" opacity="0.8"/>
    <circle cx="44" cy="20" r="2.5" fill="#FFD700" opacity="0.6"/>
    <circle cx="48" cy="32" r="2" fill="#FFD700" opacity="0.4"/>
    
    {/* Sparkles */}
    <path d="M16 32 L18 30 L16 28 L14 30 Z" fill="#FFD700"/>
    <path d="M48 44 L50 42 L48 40 L46 42 Z" fill="#FFD700"/>
  </svg>
);

export const EarningsIcon = ({ size = 64, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="earningsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="rgba(15, 23, 42, 0.9)" stroke="url(#earningsGrad)" strokeWidth="2"/>
    
    {/* Stack of coins */}
    <ellipse cx="32" cy="44" rx="12" ry="3" fill="url(#earningsGrad)"/>
    <ellipse cx="32" cy="40" rx="12" ry="3" fill="#FFD700"/>
    <ellipse cx="32" cy="36" rx="12" ry="3" fill="url(#earningsGrad)"/>
    <ellipse cx="32" cy="32" rx="12" ry="3" fill="#FFD700"/>
    
    {/* Rising arrow */}
    <path d="M46 28 L52 16 L48 20 M52 16 L44 20" stroke="#10B981" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Dollar signs */}
    <text x="32" y="24" textAnchor="middle" fontSize="8" fill="#10B981" fontWeight="bold">$</text>
    <text x="48" y="12" textAnchor="middle" fontSize="6" fill="#10B981" fontWeight="bold">$</text>
  </svg>
);

export const WalletIcon = ({ size = 64, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="walletGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="rgba(15, 23, 42, 0.9)" stroke="url(#walletGrad)" strokeWidth="2"/>
    
    {/* Wallet body */}
    <rect x="16" y="24" width="28" height="20" fill="url(#walletGrad)" rx="4"/>
    <rect x="18" y="20" width="24" height="4" fill="#FFD700" rx="2"/>
    
    {/* Wallet flap */}
    <path d="M38 32 Q42 32 42 36 Q42 40 38 40" fill="rgba(15, 23, 42, 0.8)"/>
    <circle cx="40" cy="36" r="2" fill="#FFD700"/>
    
    {/* Plus sign for adding tokens */}
    <circle cx="46" cy="18" r="6" fill="#10B981"/>
    <path d="M43 18 L49 18 M46 15 L46 21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    
    {/* Token symbol */}
    <text x="30" y="38" textAnchor="middle" fontSize="8" fill="#FFD700" fontWeight="bold">H</text>
  </svg>
);

export const SecurityIcon = ({ size = 64, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="securityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#DC2626" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="rgba(15, 23, 42, 0.9)" stroke="url(#securityGrad)" strokeWidth="2"/>
    
    {/* Shield */}
    <path d="M32 14 Q38 16 42 20 Q42 32 32 46 Q22 32 22 20 Q26 16 32 14 Z" fill="url(#securityGrad)"/>
    
    {/* Checkmark */}
    <path d="M26 30 L30 34 L38 26" stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Lock in center */}
    <rect x="29" y="28" width="6" height="8" fill="rgba(15, 23, 42, 0.6)" rx="1"/>
    <path d="M30 28 Q30 26 32 26 Q34 26 34 28" stroke="#FFD700" strokeWidth="1.5" fill="none"/>
  </svg>
);

export const OptimizationIcon = ({ size = 64, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="optimizationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="100%" stopColor="#0891B2" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="rgba(15, 23, 42, 0.9)" stroke="url(#optimizationGrad)" strokeWidth="2"/>
    
    {/* BNB logo style */}
    <polygon points="32,18 38,25 45,32 38,39 32,46 26,39 19,32 26,25" fill="#F3BA2F"/>
    
    {/* Percentage symbol */}
    <circle cx="46" cy="18" r="8" fill="#10B981"/>
    <text x="46" y="22" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">%</text>
    
    {/* Savings indicator */}
    <path d="M48 48 Q44 44 40 48" stroke="#10B981" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <text x="44" y="52" textAnchor="middle" fontSize="6" fill="#10B981">SAVE</text>
  </svg>
);

export const ScanningIcon = ({ size = 64, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="scanningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="rgba(15, 23, 42, 0.9)" stroke="url(#scanningGrad)" strokeWidth="2"/>
    
    {/* Central AI chip */}
    <rect x="26" y="26" width="12" height="12" fill="url(#scanningGrad)" rx="2"/>
    <rect x="28" y="28" width="8" height="8" fill="#FFD700" rx="1"/>
    
    {/* Scanning waves */}
    <circle cx="32" cy="32" r="18" stroke="url(#scanningGrad)" strokeWidth="2" fill="none" opacity="0.6"/>
    <circle cx="32" cy="32" r="22" stroke="url(#scanningGrad)" strokeWidth="1" fill="none" opacity="0.4"/>
    
    {/* Connection points */}
    <circle cx="16" cy="20" r="3" fill="#FFD700"/>
    <circle cx="48" cy="20" r="3" fill="#FFD700"/>
    <circle cx="16" cy="44" r="3" fill="#FFD700"/>
    <circle cx="48" cy="44" r="3" fill="#FFD700"/>
    
    {/* Connecting lines */}
    <path d="M19 22 L26 28" stroke="url(#scanningGrad)" strokeWidth="1" opacity="0.6"/>
    <path d="M45 22 L38 28" stroke="url(#scanningGrad)" strokeWidth="1" opacity="0.6"/>
    <path d="M19 42 L26 36" stroke="url(#scanningGrad)" strokeWidth="1" opacity="0.6"/>
    <path d="M45 42 L38 36" stroke="url(#scanningGrad)" strokeWidth="1" opacity="0.6"/>
  </svg>
);

export const SmartContractIcon = ({ size = 64, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" className={className}>
    <defs>
      <linearGradient id="contractGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="rgba(15, 23, 42, 0.9)" stroke="url(#contractGrad)" strokeWidth="2"/>
    
    {/* Document */}
    <rect x="20" y="16" width="20" height="28" fill="url(#contractGrad)" rx="2"/>
    <rect x="22" y="18" width="16" height="24" fill="rgba(15, 23, 42, 0.8)" rx="1"/>
    
    {/* Code lines */}
    <rect x="24" y="22" width="8" height="2" fill="#FFD700" rx="1"/>
    <rect x="24" y="26" width="12" height="2" fill="#FFD700" rx="1"/>
    <rect x="24" y="30" width="6" height="2" fill="#FFD700" rx="1"/>
    <rect x="24" y="34" width="10" height="2" fill="#FFD700" rx="1"/>
    
    {/* Checkmark verification */}
    <circle cx="44" cy="20" r="6" fill="#10B981"/>
    <path d="M41 20 L43 22 L47 18" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    
    {/* Blockchain cubes */}
    <rect x="16" y="46" width="4" height="4" fill="#FFD700" rx="0.5"/>
    <rect x="21" y="46" width="4" height="4" fill="#FFD700" rx="0.5"/>
    <rect x="26" y="46" width="4" height="4" fill="#FFD700" rx="0.5"/>
    <path d="M20 48 L21 48 M25 48 L26 48" stroke="url(#contractGrad)" strokeWidth="1"/>
  </svg>
);