import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Loader } from "@/components/ui/Loader";
import { getPersonalInfo, getDesignSettings } from "@/lib/data";
import { PasswordGate } from "@/components/gate/PasswordGate";
import { hashGateToken, GATE_COOKIE } from "@/lib/gate";
import { cookies } from "next/headers";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const personalInfo = await getPersonalInfo();
  const design = await getDesignSettings();

  const primaryArtist = personalInfo.artists[0];

  // Password gate check (production only)
  if (
    process.env.NODE_ENV === "production" &&
    personalInfo.sitePasswordEnabled &&
    personalInfo.sitePassword
  ) {
    const cookieStore = await cookies();
    const gateCookie = cookieStore.get(GATE_COOKIE);
    const expectedToken = hashGateToken(personalInfo.sitePassword);

    if (gateCookie?.value !== expectedToken) {
      return <PasswordGate />;
    }
  }

  // System/local fonts that don't need Google Fonts loading
  const systemFonts = new Set([
    "SF Pro Display", "SF Pro Text", "New York", "Georgia", "Baskerville",
    "Didot", "Palatino", "Helvetica Neue", "Arial", "Avenir", "Gill Sans",
    "Acumin Pro", "Freight Display Pro", "Neue Haas Grotesk Display Pro",
    "Neue Haas Grotesk Text Pro", "Canela", "Reckless Neue", "Proxima Nova",
    "Brandon Grotesque", "system-ui",
  ]);

  const googleFontFamilies = [design.fontDisplay, design.fontBody]
    .filter((f) => !systemFonts.has(f))
    .map((f) => f.replace(/ /g, "+"));

  const googleFontsUrl = googleFontFamilies.length > 0
    ? `https://fonts.googleapis.com/css2?family=${googleFontFamilies.join("&family=")}:wght@400;500;700&display=swap`
    : null;

  // Build @font-face rules for custom uploaded fonts
  const customFontFaces = [
    { name: design.fontDisplay, file: design.customFontDisplayFile },
    { name: design.fontBody, file: design.customFontBodyFile },
  ]
    .filter((f) => f.file)
    .map((f) => `@font-face { font-family: "${f.name}"; src: url("${f.file}") format("woff2"); font-weight: 400; font-style: normal; font-display: swap; }`)
    .join("\n");

  const cssVars = `
    ${customFontFaces}
    :root {
      --color-offwhite: ${design.colorOffwhite};
      --color-noir: ${design.colorNoir};
      --color-gris: ${design.colorGris};
      --color-gris-clair: ${design.colorGrisClair};
      --font-display: "${design.fontDisplay}", Georgia, serif;
      --font-body: "${design.fontBody}", system-ui, sans-serif;
      --grid-columns: ${design.gridColumns ?? 5};
    }
  `;

  return (
    <html lang={locale}>
      <head>
        {googleFontsUrl && (
          <link rel="stylesheet" href={googleFontsUrl} />
        )}
        {design.adobeFontsUrl && (
          <link rel="stylesheet" href={design.adobeFontsUrl} />
        )}
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="flex flex-col min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <Loader name={primaryArtist?.name ?? ""} />
          <CustomCursor />
          <Header artists={personalInfo.artists} />
          <PageTransition>
            <main className="flex-1 flex flex-col">{children}</main>
          </PageTransition>
          <Footer socials={(primaryArtist?.socials ?? []).filter((s) => s.visible !== false)} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
