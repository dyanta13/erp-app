import { Outfit } from 'next/font/google';
import '../globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import GridShape from '@/components/common/GridShape';
import Link from 'next/link';
import Image from 'next/image';
import ThemeTogglerTwo from '@/components/common/ThemeTogglerTwo';
import type { Metadata } from "next";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Erp System",
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml", // Opsional, tapi disarankan untuk SVG
      },
    ],
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${outfit.className} dark:bg-gray-900`}>
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center  flex z-1">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/" className="block mb-3">
                  <Image 
                    width={180}
                    height={40}
                    src="/images/logo/erp-logo.svg"
                    alt="Logo"
                  />
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Erp Applications, One System, All Data
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
    </div>
  );
}
