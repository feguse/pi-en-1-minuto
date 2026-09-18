import type { Metadata, Viewport } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--pi-font-dm",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--pi-font-sora",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pien1minuto.com"),
  title: "PI en 1 Minuto | Descubre cómo proteger tu idea en México",
  description:
    "Describe tu creación y recibe una orientación preliminar sobre marcas, patentes, diseños, derechos de autor y otras figuras de propiedad intelectual en México.",
  openGraph: {
    title: "PI en 1 Minuto | Descubre cómo proteger tu idea en México",
    description:
      "Describe tu creación y recibe una orientación preliminar sobre marcas, patentes, diseños, derechos de autor y otras figuras de propiedad intelectual en México.",
    url: "https://pien1minuto.com",
    siteName: "PI en 1 Minuto",
    locale: "es_MX",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#042c52",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={`${dmSans.variable} ${sora.variable}`}>
      <body>
        {children}
        {/* Analitica de Vercel: cuenta visitas, sin cookies y sin tocar lo que
            la persona escribe en el formulario. El interruptor del panel no
            sirve solo; este componente es el que emite. */}
        <Analytics />
      </body>
    </html>
  );
}
