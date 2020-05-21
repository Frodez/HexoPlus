'use strict';
/*
  origin source:https://github.com/hexojs/hexo-util/blob/1.9.1/lib/encode_url.js
 */
const punycode = require('punycode.js');
const { parse, URL } = require('url');

const safeDecodeURI = str => {
  try {
    return decodeURI(str);
  } catch (err) {
    return str;
  }
};

const encodeURL = str => {
  if (parse(str).protocol) {
    const parsed = new URL(str);

    // Exit if input is a data url
    if (parsed.origin === 'null') return str;

    parsed.search = encodeURI(safeDecodeURI(parsed.search));
    // preserve IDN
    // TODO: refactor to url.format() once Node 8 EOL
    return parsed.toString().replace(parsed.hostname, punycode.default.toUnicode((parsed.hostname)));
  }

  return encodeURI(safeDecodeURI(str));
};

module.exports = encodeURL;
