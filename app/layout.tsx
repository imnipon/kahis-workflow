import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAHIS Clinical Workflow Explorer | Veterinary Clinical & EMR Process",
  description: "Interactive animated 3D blueprint workflow explorer for KAHIS Exam Card and Veterinary Outpatient Care Process",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="antialiased selection:bg-[#00238a] selection:text-white">
        {children}
      </body>
    </html>
  );
}
