import { useEffect } from 'react'
import { SITE_NAME } from '../siteConfig.js'

// Sets the browser tab title to "<page> | SheBuilds Tamil Nadu" (or just the site name when page
// is empty) while the component is on screen, and puts the previous title back afterwards.
export default function usePageTitle(page) {
  useEffect(() => {
    const previous = document.title
    document.title = page ? `${page} | ${SITE_NAME}` : SITE_NAME
    return () => {
      document.title = previous
    }
  }, [page])
}
