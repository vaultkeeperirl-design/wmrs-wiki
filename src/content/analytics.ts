/**
 * Cookieless page-view counting through GoatCounter (https://www.goatcounter.com).
 * Set this to the site code chosen at sign-up, e.g. 'wmrs-wiki' for
 * wmrs-wiki.goatcounter.com. Empty disables counting and the visitor display.
 * The on-page total needs "Allow adding visitor counts on your website" enabled
 * in the GoatCounter site settings.
 */
export const goatCounterCode = 'vaultkeeper';
export const goatCounterUrl = goatCounterCode ? `https://${goatCounterCode}.goatcounter.com` : '';
