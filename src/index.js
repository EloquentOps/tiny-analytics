// tinybird-analytics.js
const DEFAULT_ENDPOINT = 'https://api.europe-west2.gcp.tinybird.co/v0/events';


/**
 * Create a Tinybird analytics instance.
 *
 * @param {Object} config
 * @param {string} [config.endpoint] – Tinybird events API URL
 * @param {string} config.tableName – Your Tinybird table name
 * @param {string} config.token – Your Tinybird ingestion token
 * @returns {{ collect: () => Object, send: (Object) => void }}
 */
function createTinybirdAnalytics({
  endpoint = DEFAULT_ENDPOINT,
  tableName,
  token,
}) {
  if (!tableName) {
    throw new Error('Missing `tableName` in Tinybird Analytics config');
  }
  if (!token) {
    throw new Error('Missing `token` in Tinybird Analytics config');
  }

  // Helper to parse user agent
  function parseUserAgent(ua) {
    // Very basic UA parsing (for more accuracy, use a library like UAParser.js)
    let os = 'Unknown', osVersion = '', browser = 'Unknown', browserVersion = '';
    // OS
    if (/Windows NT/.test(ua)) {
      os = 'Windows';
      const match = ua.match(/Windows NT ([0-9.]+)/);
      osVersion = match ? match[1] : '';
    } else if (/Mac OS X/.test(ua)) {
      os = 'macOS';
      const match = ua.match(/Mac OS X ([0-9_]+)/);
      osVersion = match ? match[1].replace(/_/g, '.') : '';
    } else if (/Android/.test(ua)) {
      os = 'Android';
      const match = ua.match(/Android ([0-9.]+)/);
      osVersion = match ? match[1] : '';
    } else if (/iPhone OS/.test(ua)) {
      os = 'iOS';
      const match = ua.match(/iPhone OS ([0-9_]+)/);
      osVersion = match ? match[1].replace(/_/g, '.') : '';
    } else if (/iPad; CPU OS/.test(ua)) {
      os = 'iOS';
      const match = ua.match(/CPU OS ([0-9_]+)/);
      osVersion = match ? match[1].replace(/_/g, '.') : '';
    } else if (/Linux/.test(ua)) {
      os = 'Linux';
      // Optionally, try to extract architecture (e.g., x86_64)
      const match = ua.match(/Linux ([^;\)]+)/);
      osVersion = match ? match[1] : '';
    }
    // Browser
    if (/HeadlessChrome\//.test(ua)) {
      browser = 'HeadlessChrome';
      const match = ua.match(/HeadlessChrome\/([0-9.]+)/);
      browserVersion = match ? match[1] : '';
    } else if (/Chrome\//.test(ua) && !/Edge\//.test(ua) && !/OPR\//.test(ua)) {
      browser = 'Chrome';
      const match = ua.match(/Chrome\/([0-9.]+)/);
      browserVersion = match ? match[1] : '';
    } else if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) {
      browser = 'Safari';
      const match = ua.match(/Version\/([0-9.]+)/);
      browserVersion = match ? match[1] : '';
    } else if (/Firefox\//.test(ua)) {
      browser = 'Firefox';
      const match = ua.match(/Firefox\/([0-9.]+)/);
      browserVersion = match ? match[1] : '';
    } else if (/Edg\//.test(ua)) {
      browser = 'Edge';
      const match = ua.match(/Edg\/([0-9.]+)/);
      browserVersion = match ? match[1] : '';
    } else if (/OPR\//.test(ua)) {
      browser = 'Opera';
      const match = ua.match(/OPR\/([0-9.]+)/);
      browserVersion = match ? match[1] : '';
    }
    return { os, osVersion, browser, browserVersion };
  }

  // collect the standard payload
  function collect() {
    const userAgent = navigator.userAgent || 'no user agent';
    const uaParsed = parseUserAgent(userAgent);
    return {
      url:             window.location.href || 'no url',
      referrer:        document.referrer || 'no referrer',
      title:           document.title || 'no title',
      userAgent,
      language:        navigator.language || 'no language',
      screenWidth:     window.screen.width || 'no screen width',
      screenHeight:    window.screen.height || 'no screen height',
      viewportWidth:   window.innerWidth || 'no viewport width',
      viewportHeight:  window.innerHeight || 'no viewport height',
      timestamp:       new Date().toISOString(),
      os:              uaParsed.os || 'no os',
      osVersion:       uaParsed.osVersion || 'no os version',
      browser:         uaParsed.browser || 'no browser',
      browserVersion:  uaParsed.browserVersion || 'no browser version',
    };
  }

  // send a single event (wraps tinybird REST API)
  function send(payload) {
    fetch(
      `${endpoint}?name=${encodeURIComponent(tableName)}&token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    ).catch((err) => {
      // optionally handle/log errors
      // console.error('Tinybird analytics error:', err);
    });
  }

  // auto-fire pageview event
  send(collect());

  return { collect, send };
}

const currentScript = document.currentScript;
const TABLE_NAME   = currentScript.dataset.tableName;
const TINYBIRD_TOKEN = currentScript.dataset.token;

createTinybirdAnalytics({
  tableName: TABLE_NAME,
  token: TINYBIRD_TOKEN
})

export default createTinybirdAnalytics;
