import React from 'react'

interface IconProps {
  size?: number
  className?: string
}

export function FacebookIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="5" fill="#1877F2" />
      <path
        fill="white"
        d="M15.5 4H13c-2.76 0-5 2.24-5 5v2H6v3.5h2V21h3.5v-6.5H14l.5-3.5H11.5V9c0-.55.45-1 1-1H15.5V4z"
      />
    </svg>
  )
}

export function InstagramIcon({ size = 20, className }: IconProps) {
  const gradId = `ig-grad-${Math.random().toString(36).slice(2, 7)}`
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FCAF45" />
          <stop offset="40%" stopColor="#FD1D1D" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill={`url(#${gradId})`} />
      <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" fill="none" stroke="white" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="white" strokeWidth="1.5" />
      <circle cx="17" cy="7" r="1.1" fill="white" />
    </svg>
  )
}

export function GoogleAdsIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="5" fill="white" />
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.38-.18-2.04H12v3.85h5.47a4.67 4.67 0 01-2.02 3.06v2.54h3.27C20.78 17.74 21.6 15.14 21.6 12.2z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.27-2.54c-.9.6-2.05.96-3.35.96-2.58 0-4.77-1.74-5.55-4.08H3.08v2.63A10 10 0 0012 22z" />
      <path fill="#FBBC04" d="M6.45 13.91a5.99 5.99 0 010-3.82V7.46H3.08a10.02 10.02 0 000 9.08l3.37-2.63z" />
      <path fill="#EA4335" d="M12 5.9c1.45 0 2.76.5 3.79 1.48l2.84-2.84C16.95 2.9 14.69 2 12 2A10 10 0 003.08 7.46l3.37 2.63C7.23 7.64 9.42 5.9 12 5.9z" />
    </svg>
  )
}

export function LinkedInIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <path
        fill="white"
        d="M6.5 9h-2v9h2V9zm-1-1.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4zm3.5 1.5h2v1.2c.5-.8 1.5-1.4 2.5-1.4 2.2 0 3.5 1.3 3.5 3.6V18h-2v-5.3c0-1.2-.5-2-1.7-2s-2.3.8-2.3 2.1V18h-2V9z"
      />
    </svg>
  )
}

export function MetaIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="5" fill="#0867FF" />
      <path
        fill="white"
        d="M4 13.5C4 16 5.4 17.5 7.2 17.5c.9 0 1.7-.4 2.6-1.5l.8-1 .2.3c1.2 1.7 2 2.2 3.2 2.2 1.8 0 3-1.5 3-3.9 0-1.6-.5-3-1.5-4.4C14.5 8 13.3 7 12 7c-1.2 0-2 .8-3 2.3C8.2 8 7.2 7 6 7 4.8 7 4 8.8 4 10.8v2.7zm8.6-3.4c.8 1.2 1.4 2.5 1.4 3.6 0 1.2-.5 1.8-1.2 1.8-.6 0-1-.4-2-1.8l-.5-.8-.5.9c-.9 1.5-1.4 1.7-2.1 1.7-.8 0-1.2-.8-1.2-2.1 0-1.4.6-2.8 1.3-2.8.6 0 1 .5 1.8 1.8l.6 1 .7-1c.9-1.4 1.4-1.8 1.7-2.3z"
      />
    </svg>
  )
}

export function TikTokIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="5" fill="#010101" />
      <path
        fill="#69C9D0"
        d="M16.5 4h-2.2v10.9c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2h.4V10.7H12c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2 4.2-1.9 4.2-4.2V9.2h.5c.7.9 1.8 1.5 3 1.5V8.4c-1.7 0-3-1.4-3-4.4z"
      />
      <path
        fill="#EE1D52"
        d="M17.5 4h-1v4.4c1.3 0 2.3-.6 3-1.5V5.5c-.7.3-1.4.5-2 .5z"
        opacity=".9"
      />
    </svg>
  )
}

export function WhatsAppIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect width="24" height="24" rx="5" fill="#25D366" />
      <path
        fill="white"
        d="M12 3C7 3 3 7 3 12c0 1.6.4 3.1 1.2 4.4L3 21l4.7-1.2C9 20.6 10.5 21 12 21c5 0 9-4 9-9s-4-9-9-9zm4.5 12.9c-.2.5-1 1-1.5 1-.4 0-.9.1-3-1.2-2-1.3-3.3-3.5-3.4-3.7-.1-.2-1-1.3-1-2.5s.6-1.7.8-2c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .5.4l.6 1.5c.1.2.1.4 0 .5l-.5.6.5.8c.6.9 1.4 1.5 2 1.8l.7-.8c.1-.1.3-.2.5-.1l1.5.6c.2.1.4.3.4.5v.5c0 .4-.1.9-.1 1z"
      />
    </svg>
  )
}

/** Return the right icon component for a given platform key */
export function PlatformIcon({
  platform,
  size = 20,
  className,
}: {
  platform: string
  size?: number
  className?: string
}) {
  switch (platform.toLowerCase()) {
    case 'facebook':
    case 'meta_facebook':
      return <FacebookIcon size={size} className={className} />
    case 'instagram':
    case 'instagram_ads':
      return <InstagramIcon size={size} className={className} />
    case 'google':
    case 'google_ads':
      return <GoogleAdsIcon size={size} className={className} />
    case 'linkedin':
    case 'linkedin_ads':
      return <LinkedInIcon size={size} className={className} />
    case 'meta':
      return <MetaIcon size={size} className={className} />
    case 'tiktok':
    case 'tiktok_ads':
      return <TikTokIcon size={size} className={className} />
    case 'whatsapp':
      return <WhatsAppIcon size={size} className={className} />
    default:
      return (
        <div
          className="rounded flex items-center justify-center text-[9px] font-bold"
          style={{ width: size, height: size, background: '#1E2532', color: '#4A6680' }}
        >
          {platform.slice(0, 2).toUpperCase()}
        </div>
      )
  }
}
