import { useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { getMetaForPath } from '../seo/routeMeta'

/**
 * Updates document title and meta description per route for SEO.
 * Renders inside Router so useLocation() is available.
 */
export function RouteMeta() {
  const { pathname } = useLocation()
  const meta = getMetaForPath(pathname)
  if (!meta) return null

  const canonicalUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${meta.path}`
      : undefined

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
    </Helmet>
  )
}
