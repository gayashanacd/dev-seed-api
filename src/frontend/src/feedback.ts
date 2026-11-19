import { useSyncExternalStore } from "react"
import { useLocation } from "react-router-dom"

// Tally feedback form. `page` is a hidden field on the form, so each answer shows
// which page it came from. Opened as a plain link (no embed) to keep pages light.
const FEEDBACK_FORM_URL = "https://tally.so/r/Z9OMa0"

const noopSubscribe = () => () => {}

/**
 * Feedback form URL for the current page. The server render (and hydration) uses the
 * router path; the browser then switches to the real path. They differ on 404.html,
 * which is prerendered once but served for every unknown URL.
 */
export const useFeedbackUrl = () => {
    const { pathname } = useLocation()
    const page = useSyncExternalStore(
        noopSubscribe,
        () => window.location.pathname,
        () => pathname,
    )
    return `${FEEDBACK_FORM_URL}?page=${encodeURIComponent(page)}`
}
