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

  // collect the standard payload
  function collect() {
    return {
      url:             window.location.href || 'no url',
      referrer:        document.referrer || 'no referrer',
      title:           document.title || 'no title',
      userAgent:       navigator.userAgent || 'no user agent',
      language:        navigator.language || 'no language',
      screenWidth:     window.screen.width || 'no screen width',
      screenHeight:    window.screen.height || 'no screen height',
      viewportWidth:   window.innerWidth || 'no viewport width',
      viewportHeight:  window.innerHeight || 'no viewport height',
      timestamp:       new Date().toISOString(),
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
  console.log('collecting pageview event', collect());
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
