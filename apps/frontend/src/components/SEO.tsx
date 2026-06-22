import { Helmet } from "react-helmet-async";

const BASE = "Evalio";
const DEFAULT_DESCRIPTION =
  "Practice interviews with AI that thinks like real interviewers. Get scored across 6 dimensions with actionable feedback tailored to your dream company.";
const DEFAULT_OG_IMAGE = "https://evalio.app/og.png";
const SITE_URL = "https://evalio.app";

interface SEOProps {
  title: string;
  description?: string;
  ogImage?: string;
  noindex?: boolean;
  canonical?: string;
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  ogImage = DEFAULT_OG_IMAGE,
  noindex,
  canonical,
}: SEOProps) {
  const fullTitle = `${BASE} — ${title}`;
  const url = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={BASE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={url} />}
    </Helmet>
  );
}
