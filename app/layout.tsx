import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://lastline-release-gate.cinevault7.chatgpt.site'),
  title: 'LastLine — Hold for Sound',
  description: 'The actor-release gate that catches owed dialogue before the performer leaves set.',
  openGraph: {
    title: 'LastLine — Hold for Sound',
    description: "Don't send the actor home while dialogue is still owed.",
    images: [{ url: '/og.png', width: 1536, height: 1024, alt: 'LastLine actor-release sound gate' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LastLine — Hold for Sound',
    description: "Don't send the actor home while dialogue is still owed.",
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="dark"><body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body></html>;
}
