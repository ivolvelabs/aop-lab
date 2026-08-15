import DOMPurify from "dompurify";

export const sanitizeHtml = (html) =>
  DOMPurify.sanitize(html || "", { USE_PROFILES: { html: true } });
