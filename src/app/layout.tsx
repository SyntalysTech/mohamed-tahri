import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asesoria MRT – Regularizacion Extraordinaria",
  description:
    "Asistente legal automatizado para la regularizacion extraordinaria en Espana – Asesoria MRT",
  icons: { icon: "/logo.png" },
};

export const viewport: import("next").Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  );
}
