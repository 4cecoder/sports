import { ImageResponse } from 'next/og';
import { getPublicEvent } from '@/lib/actions/event-actions';

export const size = { width: 1200, height: 630 };
export const alt = 'Event details';
export const contentType = 'image/png';

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getPublicEvent(slug);

  if (!result.success) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1c2e 100%)',
            color: '#ffffff',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>Fastbreak</div>
            <div style={{ fontSize: 28, opacity: 0.7 }}>Event not found</div>
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const event = result.data;
  const venue = event.venues?.[0];

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const venueText = venue
    ? [venue.name, venue.city, venue.state].filter(Boolean).join(', ')
    : null;

  const priceText =
    event.priceCents != null && event.priceCents > 0
      ? `${(event.priceCents / 100).toLocaleString('en-US', { style: 'currency', currency: event.currency || 'USD' })}`
      : event.priceCents === 0
        ? 'Free'
        : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1a56db 0%, #1e3a5f 60%, #0f1c2e 100%)',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px 72px',
          position: 'relative',
        }}
      >
        {/* Top bar: branding + sport badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', opacity: 0.9 }}>
            Fastbreak
          </div>
          {event.sportType && (
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                background: 'rgba(255,255,255,0.15)',
                padding: '8px 20px',
                borderRadius: 999,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {event.sportType}
            </div>
          )}
        </div>

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: event.name.length > 50 ? 44 : 56,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              maxWidth: '90%',
            }}
          >
            {event.name}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginTop: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  opacity: 0.9,
                }}
              >
                {formattedDate} at {formattedTime}
              </div>
            </div>

            {venueText && (
              <div style={{ fontSize: 22, opacity: 0.75, fontWeight: 400 }}>{venueText}</div>
            )}
          </div>
        </div>

        {/* Bottom bar: price + capacity */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {priceText && (
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  background: 'rgba(255,255,255,0.15)',
                  padding: '8px 20px',
                  borderRadius: 12,
                }}
              >
                {priceText}
              </div>
            )}
            {event.capacity != null && event.capacity > 0 && (
              <div style={{ fontSize: 18, opacity: 0.6 }}>
                Capacity: {event.capacity.toLocaleString()}
              </div>
            )}
          </div>

          <div style={{ fontSize: 16, opacity: 0.4 }}>fastbreak.events</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
