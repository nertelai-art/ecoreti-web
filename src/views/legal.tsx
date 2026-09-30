import { readFileSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import { PageHero } from "@/components/sections/PageHero";
import { Container } from "@/components/ui";
import { getDictionary } from "@/content";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

type LegalKey = "legal" | "privacy" | "cookies";

const titles = (locale: Locale) => {
  const f = getDictionary(locale).footer;
  return { legal: f.legal, privacy: f.privacy, cookies: f.cookies } satisfies Record<LegalKey, string>;
};

export const legalMetadata = (key: LegalKey, locale: Locale) => ({
  ...pageMetadata(key, locale, { title: `${titles(locale)[key]} | ${site.name}`, description: `${titles(locale)[key]} — ${site.legalName}.` }),
  robots: { index: true, follow: true },
});

// Els textos legals són Markdown molt senzill (## títols, - llistes, paràgrafs): no cal cap llibreria.
function renderMarkdown(source: string) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {list.map((item) => <li key={item}>{item}</li>)}
      </ul>,
    );
    list = [];
  };
  for (const line of source.split("\n").map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }
    flush();
    if (line.startsWith("## ")) blocks.push(<h2 key={blocks.length}>{line.slice(3)}</h2>);
    else blocks.push(<p key={blocks.length}>{line}</p>);
  }
  flush();
  return blocks;
}

export function LegalPage({ locale, page }: { locale: Locale; page: LegalKey }) {
  const source = readFileSync(path.join(process.cwd(), "src/content/legal", `${locale}-${page}.md`), "utf8");
  return (
    <>
      <PageHero locale={locale} page={page} title={titles(locale)[page]} image={null} />
      <Container className="max-w-3xl py-16 sm:py-24">
        <article className="space-y-5 text-[17px] leading-relaxed text-ink-700 [&_h2]:pt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink-900 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.7em] [&_li]:before:size-2 [&_li]:before:rounded-full [&_li]:before:bg-leaf-500 [&_ul]:space-y-2">
          {renderMarkdown(source)}
        </article>
      </Container>
    </>
  );
}
