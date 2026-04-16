const Logo = ({ variant = 'light', size = 'md' }) => {
  const sizes = {
    sm: { icon: 28, fontSize: '18px' },
    md: { icon: 36, fontSize: '20px' },
    lg: { icon: 44, fontSize: '24px' },
  };
  const { icon, fontSize } = sizes[size];
  const textColor = variant === 'light' ? 'var(--color-white)' : 'var(--color-navy)';
  const iconColor = '#1A8A8A';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={icon} height={icon} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M25 85C25 85 25 45 25 35C25 25 32 18 42 18L55 18L55 18C60 18 65 18 70 14L78 8L74 16C72 20 68 24 63 26L55 28L42 28C38 28 35 31 35 35L35 48L55 48L55 58L35 58L35 85Z"
          fill={iconColor}
        />
        <path
          d="M72 6L82 4L78 14Z"
          fill={iconColor}
        />
      </svg>
      <span className="logo-text" style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize, color: textColor }}>
        FinControl
      </span>
    </div>
  );
};

export default Logo;
