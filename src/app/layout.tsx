import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "IQAC Portal | St. Joseph's College (Autonomous)",
  description: 'Internal Quality Assurance Cell (IQAC) Academic Management Portal',
  icons: {
    icon: '/sjc-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Official Academic & Collegiate Typography (Google Fonts matching AAA) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-[#4F8FC0]/20 selection:text-[#26648E]">
        {children}
      </body>
    </html>
  );
}
