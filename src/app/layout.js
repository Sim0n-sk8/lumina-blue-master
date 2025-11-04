import localFont from "next/font/local";
import "./globals.css";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { DynamicMetaUpdater } from "./components/DynamicMetaUpdater";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Lumina Blue",
  description: "Eye care reimagined.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen w-full`}
      >
        <SiteSettingsProvider>
          <DynamicMetaUpdater />
          <main className="flex-grow w-full relative">{children}</main>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}