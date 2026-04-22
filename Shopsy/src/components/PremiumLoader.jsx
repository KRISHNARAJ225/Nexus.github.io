import React from 'react';

/**
 * Premium Shimmer/Skeleton Loading Component
 * Variants: 'fullpage', 'table', 'card', 'receipt', 'inline'
 */

const shimmerStyle = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)',
  backgroundSize: '400% 100%',
  animation: 'shimmer 1.4s ease infinite',
};

const darkShimmerStyle = {
  background: 'linear-gradient(90deg, #1e1e2d 25%, #2a2a3d 37%, #1e1e2d 63%)',
  backgroundSize: '400% 100%',
  animation: 'shimmer 1.4s ease infinite',
};

// Inject keyframes into document head once
if (typeof document !== 'undefined') {
  const styleId = 'premium-loader-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse-glow {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
      @keyframes logo-breathe {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes logo-wave {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-4px) rotate(-2deg); }
        75% { transform: translateY(2px) rotate(1deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

const ShimmerBlock = ({ width = '100%', height = '16px', borderRadius = '8px', style: extra = {}, dark = false }) => (
  <div
    style={{
      ...(dark ? darkShimmerStyle : shimmerStyle),
      width,
      height,
      borderRadius,
      ...extra,
    }}
  />
);

// ───────────── Rocket Loader (Premium Launch Animation) ─────────────
const RocketLoader = ({ accentColor = '#6366f1' }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    gap: '32px',
    fontFamily: "'Inter', sans-serif",
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    overflow: 'hidden'
  }}>
    <style>{`
      @keyframes rocket-launch {
        0% { transform: translateY(0) rotate(0deg); }
        20% { transform: translateY(5px) rotate(-1deg); }
        100% { transform: translateY(-100vh) rotate(0deg); }
      }
      @keyframes flame-pulse {
        0%, 100% { transform: scaleY(1); opacity: 0.8; }
        50% { transform: scaleY(1.3); opacity: 1; }
      }
      @keyframes star-twinkle {
        0%, 100% { opacity: 0.2; transform: scale(0.8); }
        50% { opacity: 0.8; transform: scale(1.2); }
      }
      .star {
        position: absolute;
        background: white;
        border-radius: 50%;
        animation: star-twinkle 2s infinite;
      }
    `}</style>
    
    {/* Background Stars */}
    {[...Array(40)].map((_, i) => (
      <div 
        key={i} 
        className="star" 
        style={{
          width: Math.random() * 3 + 'px',
          height: Math.random() * 3 + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDelay: Math.random() * 2 + 's'
        }}
      />
    ))}

    <div style={{ position: 'relative', animation: 'rocket-launch 2.5s cubic-bezier(0.85, 0, 0.15, 1) forwards' }}>
      {/* Rocket Body */}
      <div style={{ fontSize: '80px', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}>🚀</div>
      {/* Flame */}
      <div style={{
        position: 'absolute',
        bottom: '-10px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '20px',
        height: '40px',
        background: 'linear-gradient(to bottom, #ff9d00, #ff4e00, transparent)',
        borderRadius: '50%',
        filter: 'blur(4px)',
        animation: 'flame-pulse 0.1s infinite alternate',
        zIndex: -1
      }} />
    </div>

    <div style={{ textAlign: 'center', zIndex: 10 }}>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: '900', 
        color: '#ffffff', 
        letterSpacing: '0.2em',
        margin: '0 0 8px 0',
        textTransform: 'uppercase'
      }}>
        Launching Dashboard
      </h3>
      <p style={{ 
        fontSize: '12px', 
        color: '#64748b', 
        fontWeight: '600',
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.1em'
      }}>
        Preparing premium environment
      </p>
    </div>
  </div>
);

// ───────────── Full Page Loader (Premium Spinning Wheel) ─────────────
const FullPageLoader = ({ accentColor = '#1b2559' }) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    gap: '32px',
    fontFamily: "'Inter', sans-serif",
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
  }}>
    <style>{`
      @keyframes premium-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes premium-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(0.95); opacity: 0.8; }
      }
      .premium-spinner {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        position: relative;
        padding: 4px;
        background: conic-gradient(from 0deg, transparent 0%, ${accentColor} 100%);
        animation: premium-spin 0.8s linear infinite;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .premium-spinner::before {
        content: '';
        position: absolute;
        inset: 4px;
        border-radius: 50%;
        background: white;
      }
      .spinner-dot {
        position: absolute;
        top: 0;
        left: 50%;
        width: 6px;
        height: 6px;
        background: ${accentColor};
        border-radius: 50%;
        transform: translateX(-50%);
        box-shadow: 0 0 12px ${accentColor};
      }
    `}</style>
    
    <div style={{ position: 'relative', animation: 'premium-pulse 2s ease-in-out infinite' }}>
      <div className="premium-spinner">
        <div className="spinner-dot"></div>
      </div>
    </div>

    <div style={{ textAlign: 'center' }}>
      <h3 style={{ 
        fontSize: '14px', 
        fontWeight: '800', 
        color: '#1e293b', 
        letterSpacing: '0.05em',
        margin: '0 0 4px 0',
        textTransform: 'uppercase'
      }}>
        Initializing Session
      </h3>
      <p style={{ 
        fontSize: '11px', 
        color: '#94a3b8', 
        fontWeight: '600',
        margin: 0
      }}>
        Securely connecting to StockFlow
      </p>
    </div>
  </div>
);

// ───────────── Table Skeleton ─────────────
const TableLoader = ({ rows = 6, cols = 5, dark = false }) => (
  <div style={{ padding: '24px', animation: 'fadeInUp 0.3s ease' }}>
    {/* Header shimmer */}
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
      <ShimmerBlock width="200px" height="36px" borderRadius="10px" dark={dark} />
      <div style={{ flex: 1 }} />
      <ShimmerBlock width="120px" height="36px" borderRadius="10px" dark={dark} />
    </div>

    {/* Stats cards shimmer */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          padding: '20px',
          borderRadius: '16px',
          backgroundColor: dark ? '#151521' : '#fff',
          border: `1px solid ${dark ? '#2a2a3d' : '#f1f5f9'}`,
        }}>
          <ShimmerBlock width="40px" height="40px" borderRadius="12px" style={{ marginBottom: '12px' }} dark={dark} />
          <ShimmerBlock width="80px" height="10px" style={{ marginBottom: '8px' }} dark={dark} />
          <ShimmerBlock width="60px" height="20px" dark={dark} />
        </div>
      ))}
    </div>

    {/* Table shimmer */}
    <div style={{
      borderRadius: '16px',
      backgroundColor: dark ? '#151521' : '#fff',
      border: `1px solid ${dark ? '#2a2a3d' : '#f1f5f9'}`,
      overflow: 'hidden',
    }}>
      {/* Search bar */}
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${dark ? '#2a2a3d' : '#f8fafc'}` }}>
        <ShimmerBlock width="300px" height="36px" borderRadius="10px" dark={dark} />
      </div>

      {/* Header row */}
      <div style={{ display: 'flex', gap: '16px', padding: '12px 24px', borderBottom: `1px solid ${dark ? '#2a2a3d' : '#f8fafc'}` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <ShimmerBlock key={i} width={`${100 / cols}%`} height="12px" dark={dark} />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{
          display: 'flex', gap: '16px', padding: '16px 24px',
          borderBottom: `1px solid ${dark ? '#2a2a3d22' : '#f8fafc'}`,
          animation: `fadeInUp ${0.1 + r * 0.05}s ease`,
        }}>
          {Array.from({ length: cols }).map((_, c) => (
            <ShimmerBlock key={c} width={`${100 / cols}%`} height="14px" borderRadius="6px" dark={dark} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ───────────── Card Skeleton ─────────────
const CardLoader = ({ count = 3, dark = false }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${Math.min(count, 3)}, 1fr)`,
    gap: '20px',
    animation: 'fadeInUp 0.3s ease',
  }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        padding: '24px',
        borderRadius: '16px',
        backgroundColor: dark ? '#151521' : '#fff',
        border: `1px solid ${dark ? '#2a2a3d' : '#f1f5f9'}`,
        animation: `fadeInUp ${0.1 + i * 0.08}s ease`,
      }}>
        <ShimmerBlock width="48px" height="48px" borderRadius="12px" style={{ marginBottom: '16px' }} dark={dark} />
        <ShimmerBlock width="70%" height="14px" style={{ marginBottom: '10px' }} dark={dark} />
        <ShimmerBlock width="50%" height="10px" style={{ marginBottom: '8px' }} dark={dark} />
        <ShimmerBlock width="90%" height="10px" dark={dark} />
      </div>
    ))}
  </div>
);

// ───────────── Receipt Skeleton ─────────────
const ReceiptLoader = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 16px',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  }}>
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '20px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      padding: '32px',
      width: '100%',
      maxWidth: '640px',
      border: '1px solid #f1f5f9',
      animation: 'fadeInUp 0.4s ease',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <ShimmerBlock width="64px" height="64px" borderRadius="50%" style={{ margin: '0 auto 16px' }} />
        <ShimmerBlock width="200px" height="24px" style={{ margin: '0 auto 8px' }} />
        <ShimmerBlock width="160px" height="14px" style={{ margin: '0 auto' }} />
      </div>

      {/* Order info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
        {[1, 2, 3].map(i => (
          <div key={i}>
            <ShimmerBlock width="60px" height="8px" style={{ marginBottom: '6px' }} />
            <ShimmerBlock width="100px" height="14px" />
          </div>
        ))}
      </div>

      {/* Customer section */}
      <div style={{ marginBottom: '24px', border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          <ShimmerBlock width="150px" height="14px" />
        </div>
        <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[1, 2].map(i => (
            <div key={i}>
              <ShimmerBlock width="50px" height="8px" style={{ marginBottom: '6px' }} />
              <ShimmerBlock width="120px" height="14px" />
            </div>
          ))}
        </div>
      </div>

      {/* Products section */}
      <div style={{ marginBottom: '24px', border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          <ShimmerBlock width="100px" height="14px" />
        </div>
        <div style={{ padding: '16px' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <ShimmerBlock width="120px" height="14px" style={{ marginBottom: '4px' }} />
                <ShimmerBlock width="80px" height="10px" />
              </div>
              <ShimmerBlock width="60px" height="14px" />
            </div>
          ))}
        </div>
      </div>

      {/* Total section */}
      <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <ShimmerBlock width="80px" height="12px" />
            <ShimmerBlock width="60px" height="12px" />
          </div>
        ))}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <ShimmerBlock width="100px" height="18px" />
          <ShimmerBlock width="80px" height="22px" />
        </div>
      </div>
    </div>
  </div>
);

// ───────────── Inline Loader ─────────────
const InlineLoader = ({ dark = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
    <ShimmerBlock width="100%" height="14px" borderRadius="6px" dark={dark} />
  </div>
);

// ───────────── Main Export ─────────────
const PremiumLoader = ({ variant = 'fullpage', accentColor, ...props }) => {
  switch (variant) {
    case 'fullpage':
      return <FullPageLoader accentColor={accentColor} {...props} />;
    case 'table':
      return <TableLoader {...props} />;
    case 'card':
      return <CardLoader {...props} />;
    case 'receipt':
      return <ReceiptLoader {...props} />;
    case 'inline':
      return <InlineLoader {...props} />;
    case 'rocket':
      return <RocketLoader accentColor={accentColor} {...props} />;
    default:
      return <FullPageLoader accentColor={accentColor} {...props} />;
  }
};

export default PremiumLoader;
