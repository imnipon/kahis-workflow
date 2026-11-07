import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAHIS Clinical Workflow Explorer v1.0 | Veterinary Clinical & EMR Process",
  description:
    "Interactive animated 3D blueprint workflow explorer for KAHIS Exam Card and Veterinary Outpatient Care Process",
  icons: {
    icon: [
      { url: "/images/logo_icon/logo_favicon.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    apple: "/images/logo_icon/logo_favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-[#b4531a] selection:text-[#fcf8ee]">
        {children}
      </body>
    </html>
  );
}
