import { ImageResponse } from 'next/og';
import { getManifest, MANIFESTS } from '@/lib/registry.generated';
import { CATEGORIES } from '@pegbox/tool-kit';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export async function generateStaticParams() {
  return MANIFESTS.map((m) => ({ id: m.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const manifest = getManifest(id);

  const title = manifest ? manifest.name : 'Pegbox';
  const tagline = manifest ? manifest.tagline : 'Browser-native file tools. Private & Free.';
  const categoryLabel = manifest ? CATEGORIES[manifest.category]?.label || manifest.category : 'Tool';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          padding: '80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#6D4AFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  backgroundColor: '#FFFFFF',
                }}
              />
            </div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 'bold' }}>
              <span style={{ color: '#0F1222' }}>Peg</span>
              <span style={{ color: '#6D4AFF' }}>box</span>
            </div>
          </div>

          {/* Category Chip */}
          <div
            style={{
              padding: '8px 24px',
              borderRadius: '999px',
              backgroundColor: '#F1EDFF',
              color: '#5B3BE8',
              fontSize: '18px',
              fontWeight: 600,
            }}
          >
            {categoryLabel}
          </div>
        </div>

        {/* Center content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: '#0F1222',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#5B6078',
              lineHeight: 1.4,
              maxWidth: '900px',
            }}
          >
            {tagline}
          </div>
        </div>

        {/* Footer trust line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '2px solid #E4E6F0',
            paddingTop: '32px',
          }}
        >
          <div style={{ fontSize: '20px', color: '#0F1222', fontWeight: 600 }}>
            Runs in your browser · Files never leave your device · Free
          </div>
          <div style={{ fontSize: '18px', color: '#6D4AFF', fontWeight: 600 }}>
            pegbox.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
