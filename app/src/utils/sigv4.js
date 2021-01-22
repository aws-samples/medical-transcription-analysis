// Copied from https://github.com/department-stockholm/aws-signature-v4
// and fixed the sorting of query parameters by using 'query-string' package instead of 'querystring'


var crypto = require('crypto');
var querystring = require('query-string');

function createCanonicalRequest(method, pathname, query, headers, payload) {
  return [
    method.toUpperCase(),
    pathname,
    createCanonicalQueryString(query),
    createCanonicalHeaders(headers),
    createSignedHeaders(headers),
    payload
  ].join('\n');
};

function createCanonicalQueryString(params) {
  return Object.keys(params).sort().map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
  }).join('&');
};

function createCanonicalHeaders(headers) {
  return Object.keys(headers).sort().map(function(name) {
    return name.toLowerCase().trim() + ':' + headers[name].toString().trim() + '\n';
  }).join('');
};

function createSignedHeaders(headers) {
  return Object.keys(headers).sort().map(function(name) {
    return name.toLowerCase().trim();
  }).join(';');
};

function createCredentialScope(time, region, service) {
  return [toDate(time), region, service, 'aws4_request'].join('/');
};

function createStringToSign(time, region, service, request) {
  return [
    'AWS4-HMAC-SHA256',
    toTime(time),
    createCredentialScope(time, region, service),
    hash(request, 'hex')
  ].join('\n');
};

function createSignature(secret, time, region, service, stringToSign) {
  var h1 = hmac('AWS4' + secret, toDate(time)); // date-key
  var h2 = hmac(h1, region); // region-key
  var h3 = hmac(h2, service); // service-key
  var h4 = hmac(h3, 'aws4_request'); // signing-key
  return hmac(h4, stringToSign, 'hex');
};

export function createPresignedURL(method, host, path, service, payload, options) {
  options = options || {};
  options.key = options.key || process.env.AWS_ACCESS_KEY_ID;
  options.secret = options.secret || process.env.AWS_SECRET_ACCESS_KEY;
  options.protocol = options.protocol || 'https';
  options.headers = options.headers || {};
  options.timestamp = options.timestamp || Date.now();
  options.region = options.region || process.env.AWS_REGION || 'us-east-1';
  options.expires = options.expires || 86400; // 24 hours
  options.headers = options.headers || {};

  // host is required
  options.headers.Host = host;

  var query = options.query ? querystring.parse(options.query) : {};
  query['X-Amz-Algorithm'] = 'AWS4-HMAC-SHA256';
  query['X-Amz-Credential'] = options.key + '/' + createCredentialScope(options.timestamp, options.region, service);
  query['X-Amz-Date'] = toTime(options.timestamp);
  query['X-Amz-Expires'] = options.expires;
  query['X-Amz-SignedHeaders'] = createSignedHeaders(options.headers);
  if (options.sessionToken) {
    query['X-Amz-Security-Token'] = options.sessionToken;
  }

  var canonicalRequest = createCanonicalRequest(method, path, query, options.headers, payload);
  var stringToSign = createStringToSign(options.timestamp, options.region, service, canonicalRequest);
  var signature = createSignature(options.secret, options.timestamp, options.region, service, stringToSign);
  query['X-Amz-Signature'] = signature;
  return options.protocol + '://' + host + path + '?' + querystring.stringify(query);
};

function toTime(time) {
  return new Date(time).toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function toDate(time) {
  return toTime(time).substring(0, 8);
}

function hmac(key, string, encoding) {
  return crypto.createHmac('sha256', key)
    .update(string, 'utf8')
    .digest(encoding);
}

function hash(string, encoding) {
  return crypto.createHash('sha256')
    .update(string, 'utf8')
    .digest(encoding);
}
