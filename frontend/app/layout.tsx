import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TicketApp - Gestión de Soporte",
  description: "Sistema de gestión de tickets con roles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* El Sidebar se encarga de no mostrarse si no hay usuario.
               Gracias al 'flex', el contenido de la derecha se ajustará automáticamente.
            */}
            <Sidebar />

            <main className="flex-grow">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}