/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

// UNUSED EXPORTS: Progress, splash, splashForced

;// ./node_modules/ulid/dist/browser/index.js
// These values should NEVER change. The values are precisely for
// generating ULIDs.
const B32_CHARACTERS = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford's Base32
const ENCODING_LEN = 32; // from ENCODING.length;
const MAX_ULID = "7ZZZZZZZZZZZZZZZZZZZZZZZZZ";
const MIN_ULID = "00000000000000000000000000";
const RANDOM_LEN = 16;
const TIME_LEN = 10;
const TIME_MAX = 281474976710655; // from Math.pow(2, 48) - 1;
const ULID_REGEX = /^[0-7][0-9a-hjkmnp-tv-zA-HJKMNP-TV-Z]{25}$/;
const UUID_REGEX = /^[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/;
var ULIDErrorCode;
(function (ULIDErrorCode) {
  ULIDErrorCode["Base32IncorrectEncoding"] = "B32_ENC_INVALID";
  ULIDErrorCode["DecodeTimeInvalidCharacter"] = "DEC_TIME_CHAR";
  ULIDErrorCode["DecodeTimeValueMalformed"] = "DEC_TIME_MALFORMED";
  ULIDErrorCode["EncodeTimeNegative"] = "ENC_TIME_NEG";
  ULIDErrorCode["EncodeTimeSizeExceeded"] = "ENC_TIME_SIZE_EXCEED";
  ULIDErrorCode["EncodeTimeValueMalformed"] = "ENC_TIME_MALFORMED";
  ULIDErrorCode["PRNGDetectFailure"] = "PRNG_DETECT";
  ULIDErrorCode["ULIDInvalid"] = "ULID_INVALID";
  ULIDErrorCode["Unexpected"] = "UNEXPECTED";
  ULIDErrorCode["UUIDInvalid"] = "UUID_INVALID";
})(ULIDErrorCode || (ULIDErrorCode = {}));
class ULIDError extends Error {
  constructor(errorCode, message) {
    super(`${message} (${errorCode})`);
    this.name = "ULIDError";
    this.code = errorCode;
  }
}
function randomChar(prng) {
  // Currently PRNGs generate fractions from 0 to _less than_ 1, so no "%" is necessary.
  // However, just in case a future PRNG can generate 1,
  // we are applying "% ENCODING LEN" to wrap back to the first character
  const randomPosition = Math.floor(prng() * ENCODING_LEN) % ENCODING_LEN;
  return ENCODING.charAt(randomPosition);
}
function replaceCharAt(str, index, char) {
  if (index > str.length - 1) {
    return str;
  }
  return str.substr(0, index) + char + str.substr(index + 1);
}

// Code from https://github.com/devbanana/crockford-base32/blob/develop/src/index.ts
function crockfordEncode(input) {
  const output = [];
  let bitsRead = 0;
  let buffer = 0;
  const reversedInput = new Uint8Array(input.slice().reverse());
  for (const byte of reversedInput) {
    buffer |= byte << bitsRead;
    bitsRead += 8;
    while (bitsRead >= 5) {
      output.unshift(buffer & 0x1f);
      buffer >>>= 5;
      bitsRead -= 5;
    }
  }
  if (bitsRead > 0) {
    output.unshift(buffer & 0x1f);
  }
  return output.map(byte => B32_CHARACTERS.charAt(byte)).join("");
}
function crockfordDecode(input) {
  const sanitizedInput = input.toUpperCase().split("").reverse().join("");
  const output = [];
  let bitsRead = 0;
  let buffer = 0;
  for (const character of sanitizedInput) {
    const byte = B32_CHARACTERS.indexOf(character);
    if (byte === -1) {
      throw new Error(`Invalid base 32 character found in string: ${character}`);
    }
    buffer |= byte << bitsRead;
    bitsRead += 5;
    while (bitsRead >= 8) {
      output.unshift(buffer & 0xff);
      buffer >>>= 8;
      bitsRead -= 8;
    }
  }
  if (bitsRead >= 5 || buffer > 0) {
    output.unshift(buffer & 0xff);
  }
  return new Uint8Array(output);
}
/**
 * Fix a ULID's Base32 encoding -
 * i and l (case-insensitive) will be treated as 1 and o (case-insensitive) will be treated as 0.
 * hyphens are ignored during decoding.
 * @param id The ULID
 * @returns The cleaned up ULID
 */
function fixULIDBase32(id) {
  return id.replace(/i/gi, "1").replace(/l/gi, "1").replace(/o/gi, "0").replace(/-/g, "");
}
function incrementBase32(str) {
  let done = undefined,
    index = str.length,
    char,
    charIndex,
    output = str;
  const maxCharIndex = ENCODING_LEN - 1;
  while (!done && index-- >= 0) {
    char = output[index];
    charIndex = ENCODING.indexOf(char);
    if (charIndex === -1) {
      throw new ULIDError(ULIDErrorCode.Base32IncorrectEncoding, "Incorrectly encoded string");
    }
    if (charIndex === maxCharIndex) {
      output = replaceCharAt(output, index, ENCODING[0]);
      continue;
    }
    done = replaceCharAt(output, index, ENCODING[charIndex + 1]);
  }
  if (typeof done === "string") {
    return done;
  }
  throw new ULIDError(ULIDErrorCode.Base32IncorrectEncoding, "Failed incrementing string");
}

/**
 * Decode time from a ULID
 * @param id The ULID
 * @returns The decoded timestamp
 */
function decodeTime(id) {
  if (id.length !== TIME_LEN + RANDOM_LEN) {
    throw new ULIDError(ULIDErrorCode.DecodeTimeValueMalformed, "Malformed ULID");
  }
  const time = id.substr(0, TIME_LEN).toUpperCase().split("").reverse().reduce((carry, char, index) => {
    const encodingIndex = ENCODING.indexOf(char);
    if (encodingIndex === -1) {
      throw new ULIDError(ULIDErrorCode.DecodeTimeInvalidCharacter, `Time decode error: Invalid character: ${char}`);
    }
    return carry += encodingIndex * Math.pow(ENCODING_LEN, index);
  }, 0);
  if (time > TIME_MAX) {
    throw new ULIDError(ULIDErrorCode.DecodeTimeValueMalformed, `Malformed ULID: timestamp too large: ${time}`);
  }
  return time;
}
/**
 * Detect the best PRNG (pseudo-random number generator)
 * @param root The root to check from (global/window)
 * @returns The PRNG function
 */
function detectPRNG(root) {
  const rootLookup = detectRoot();
  const globalCrypto = rootLookup && (rootLookup.crypto || rootLookup.msCrypto) || null;
  if (typeof (globalCrypto === null || globalCrypto === void 0 ? void 0 : globalCrypto.getRandomValues) === "function") {
    return () => {
      const buffer = new Uint8Array(1);
      globalCrypto.getRandomValues(buffer);
      return buffer[0] / 256;
    };
  } else if (typeof (globalCrypto === null || globalCrypto === void 0 ? void 0 : globalCrypto.randomBytes) === "function") {
    return () => globalCrypto.randomBytes(1).readUInt8() / 256;
  } else ;
  throw new ULIDError(ULIDErrorCode.PRNGDetectFailure, "Failed to find a reliable PRNG");
}
function detectRoot() {
  if (inWebWorker()) return self;
  if (typeof window !== "undefined") {
    return window;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  return null;
}
function encodeRandom(len, prng) {
  let str = "";
  for (; len > 0; len--) {
    str = randomChar(prng) + str;
  }
  return str;
}
/**
 * Encode the time portion of a ULID
 * @param now The current timestamp
 * @param len Length to generate
 * @returns The encoded time
 */
function encodeTime(now) {
  let len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TIME_LEN;
  if (isNaN(now)) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeValueMalformed, `Time must be a number: ${now}`);
  } else if (now > TIME_MAX) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeSizeExceeded, `Cannot encode a time larger than ${TIME_MAX}: ${now}`);
  } else if (now < 0) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeNegative, `Time must be positive: ${now}`);
  } else if (Number.isInteger(now) === false) {
    throw new ULIDError(ULIDErrorCode.EncodeTimeValueMalformed, `Time must be an integer: ${now}`);
  }
  let mod,
    str = "";
  for (let currentLen = len; currentLen > 0; currentLen--) {
    mod = now % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return str;
}
function inWebWorker() {
  // @ts-ignore
  return typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
}
/**
 * Check if a ULID is valid
 * @param id The ULID to test
 * @returns True if valid, false otherwise
 * @example
 *   isValid("01HNZX8JGFACFA36RBXDHEQN6E"); // true
 *   isValid(""); // false
 */
function isValid(id) {
  return typeof id === "string" && id.length === TIME_LEN + RANDOM_LEN && id.toUpperCase().split("").every(char => ENCODING.indexOf(char) !== -1);
}
/**
 * Create a ULID factory to generate monotonically-increasing
 *  ULIDs
 * @param prng The PRNG to use
 * @returns A ulid factory
 * @example
 *  const ulid = monotonicFactory();
 *  ulid(); // "01HNZXD07M5CEN5XA66EMZSRZW"
 */
function monotonicFactory(prng) {
  const currentPRNG = prng || detectPRNG();
  let lastTime = 0,
    lastRandom;
  return function _ulid(seedTime) {
    const seed = !seedTime || isNaN(seedTime) ? Date.now() : seedTime;
    if (seed <= lastTime) {
      const incrementedRandom = lastRandom = incrementBase32(lastRandom);
      return encodeTime(lastTime, TIME_LEN) + incrementedRandom;
    }
    lastTime = seed;
    const newRandom = lastRandom = encodeRandom(RANDOM_LEN, currentPRNG);
    return encodeTime(seed, TIME_LEN) + newRandom;
  };
}
/**
 * Generate a ULID
 * @param seedTime Optional time seed
 * @param prng Optional PRNG function
 * @returns A ULID string
 * @example
 *  ulid(); // "01HNZXD07M5CEN5XA66EMZSRZW"
 */
function ulid(seedTime, prng) {
  const currentPRNG = prng || detectPRNG();
  const seed = !seedTime || isNaN(seedTime) ? Date.now() : seedTime;
  return encodeTime(seed, TIME_LEN) + encodeRandom(RANDOM_LEN, currentPRNG);
}

/**
 * Convert a ULID to a UUID
 * @param ulid The ULID to convert
 * @returns A UUID string
 */
function ulidToUUID(ulid) {
  const isValid = ULID_REGEX.test(ulid);
  if (!isValid) {
    throw new ULIDError(ULIDErrorCode.ULIDInvalid, `Invalid ULID: ${ulid}`);
  }
  const uint8Array = crockfordDecode(ulid);
  let uuid = Array.from(uint8Array).map(byte => byte.toString(16).padStart(2, "0")).join("");
  uuid = uuid.substring(0, 8) + "-" + uuid.substring(8, 12) + "-" + uuid.substring(12, 16) + "-" + uuid.substring(16, 20) + "-" + uuid.substring(20);
  return uuid.toUpperCase();
}
/**
 * Convert a UUID to a ULID
 * @param uuid The UUID to convert
 * @returns A ULID string
 */
function uuidToULID(uuid) {
  const isValid = UUID_REGEX.test(uuid);
  if (!isValid) {
    throw new ULIDError(ULIDErrorCode.UUIDInvalid, `Invalid UUID: ${uuid}`);
  }
  const bytes = uuid.replace(/-/g, "").match(/.{1,2}/g);
  if (!bytes) {
    throw new ULIDError(ULIDErrorCode.Unexpected, `Failed parsing UUID bytes: ${uuid}`);
  }
  const uint8Array = new Uint8Array(bytes.map(byte => parseInt(byte, 16)));
  return crockfordEncode(uint8Array);
}

;// ./svg/ui_loading_pattern.svg?raw
const ui_loading_patternraw_namespaceObject = "<svg version=\"1.1\"\n     xmlns=\"http://www.w3.org/2000/svg\"\n     xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n     width=\"1600\" height=\"1600\" viewBox=\"0 0 1600 1600\">\n\n    <defs>\n        <style>\n            .cls-1{\n                opacity:0.65;\n                fill:#86b74f;\n            }\n\n            .cls-2{\n                opacity:0.65;\n                fill:#82ac51\n            }\n        </style>\n    </defs>\n\n    <symbol id=\"dot0\" viewBox=\"0 0 24 24\">\n        <path class=\"cls-1\" d=\"M24,11.94a11.48,11.48,0,0,0-3.54-8.41A11.48,11.48,0,0,0,12.06,0,11.61,11.61,0,0,0,3.54,3.54,11.48,11.48,0,0,0,0,11.94a11.61,11.61,0,0,0,3.54,8.52A11.61,11.61,0,0,0,12.06,24a11.48,11.48,0,0,0,8.41-3.54A11.61,11.61,0,0,0,24,11.94Z\"/>\n    </symbol>\n\n    <symbol id=\"dot1\" viewBox=\"0 0 32 32\">\n        <path class=\"cls-1\" d=\"M0,16A15.5,15.5,0,0,0,4.74,27.36,15.33,15.33,0,0,0,16,32a15.45,15.45,0,0,0,11.36-4.64A15.45,15.45,0,0,0,32,16,15.33,15.33,0,0,0,27.36,4.74,15.49,15.49,0,0,0,16,0,15.17,15.17,0,0,0,4.74,4.74,15.17,15.17,0,0,0,0,16Z\"/>\n    </symbol>\n\n    <symbol id=\"dot2\" viewBox=\"0 0 44 44\">\n        <path class=\"cls-1\" d=\"M37.57,6.43A21.19,21.19,0,0,0,22,0,21,21,0,0,0,6.53,6.43l-.1.1A21,21,0,0,0,0,22,21.19,21.19,0,0,0,6.43,37.57,21.25,21.25,0,0,0,22,44a21.47,21.47,0,0,0,15.57-6.33l.1-.1A21.47,21.47,0,0,0,44,22,21.25,21.25,0,0,0,37.57,6.43M29,15a9.54,9.54,0,0,1,2.91,7,9.83,9.83,0,0,1-2.81,7l-.1.1a9.83,9.83,0,0,1-7,2.81A9.54,9.54,0,0,1,15,29a9.6,9.6,0,0,1-2.91-7A9.31,9.31,0,0,1,15,15.07l.1-.1A9.31,9.31,0,0,1,22,12.05,9.6,9.6,0,0,1,29,15Z\"/>\n    </symbol>\n\n    <symbol id=\"dot3\" viewBox=\"0 0 60 60\">\n        <path class=\"cls-1\" d=\"M51.14,8.77h0A28.68,28.68,0,0,0,30.05,0,29.18,29.18,0,0,0,8.75,8.77h.11A28.81,28.81,0,0,0,0,30,28.94,28.94,0,0,0,8.22,50.7l.53.53.11.11A29.07,29.07,0,0,0,30.05,60a28.91,28.91,0,0,0,21.09-8.66v-.11h0A28.77,28.77,0,0,0,60,30,28.81,28.81,0,0,0,51.14,8.77m-9,9,.11.11A16.38,16.38,0,0,1,47.35,30a16.54,16.54,0,0,1-5.17,12.25h.11a16.72,16.72,0,0,1-12.23,5.07,16.81,16.81,0,0,1-12.34-5.07h0A16.71,16.71,0,0,1,12.65,30a16.38,16.38,0,0,1,5.06-12.15v-.11a17,17,0,0,1,12.34-5.07A16.56,16.56,0,0,1,42.18,17.75Z\"/>\n    </symbol>\n\n    <symbol id=\"dot4\" viewBox=\"0 0 84 84\">\n        <path class=\"cls-1\" d=\"M71.72,12.19h0A40.77,40.77,0,0,0,42,0,40.63,40.63,0,0,0,12.38,12.19h-.1A40.76,40.76,0,0,0,0,41.95,40.56,40.56,0,0,0,12.28,71.7h.1A40.46,40.46,0,0,0,42,84,40.6,40.6,0,0,0,71.72,71.7h0A40.69,40.69,0,0,0,84,41.95,40.56,40.56,0,0,0,71.72,12.29v-.1M62.95,21h.1a29,29,0,0,1,8.57,21,28.71,28.71,0,0,1-8.57,21l-.1.1A28.64,28.64,0,0,1,42,71.6a28.62,28.62,0,0,1-20.95-8.68h0a28.59,28.59,0,0,1-8.67-21,28.83,28.83,0,0,1,8.67-21h0A28.8,28.8,0,0,1,42,12.4,28.63,28.63,0,0,1,62.95,21Z\"/>\n    </symbol>\n\n    <symbol id=\"bottle\" viewBox=\"0 0 160 160\">\n        <path class=\"cls-2\" d=\"M4.5,94.8a15.69,15.69,0,0,0,0,22l38,37.85a15.45,15.45,0,0,0,22,0L116.1,103a36.68,36.68,0,0,0,8.65-38.15L139,50.5a14.94,14.94,0,0,0,6.65-4l7.9-8a15.24,15.24,0,0,0,4.5-11,15.6,15.6,0,0,0-4.6-11.05L141.65,4.6A15.13,15.13,0,0,0,130.55,0,14.82,14.82,0,0,0,119.4,4.7l-7.9,7.9a14.74,14.74,0,0,0-3.8,7.05L93.25,34.1A34.42,34.42,0,0,0,82.2,32.35a35.84,35.84,0,0,0-14,2.8,37,37,0,0,0-11.9,8L4.5,94.8m9.35,12.7a2.55,2.55,0,0,1,0-3.4L65.6,52.45A23.36,23.36,0,0,1,95.2,49.6L96,50l24.8-24.7-.2-.6a2.5,2.5,0,0,1,.4-2.8L129,14a2,2,0,0,1,1.6-.75,2.29,2.29,0,0,1,1.75.75L144.1,25.7a2.66,2.66,0,0,1,0,3.6l-7.9,8a2.35,2.35,0,0,1-1.4.7l-1.65-.3L108.85,62v.8l.2.3a23,23,0,0,1,4.5,15.7,22.55,22.55,0,0,1-6.75,14.85L55.15,145.3a2.48,2.48,0,0,1-1.75.7,2.26,2.26,0,0,1-1.65-.7Z\"/>\n    </symbol>\n\n    <symbol id=\"crown\" viewBox=\"0 0 156 148\">\n        <path class=\"cls-2\" d=\"M.59,79.76a21.24,21.24,0,0,0,3,16.84,22.35,22.35,0,0,0,10.55,8.75,21.69,21.69,0,0,0,12.73,1.16l30.53,25.82,6,9.31a11.9,11.9,0,0,0,16.44,3.66l70.6-45a11.76,11.76,0,0,0,5.18-7.2,11.2,11.2,0,0,0-1.3-8.78h-.1l-4.62-7.89L138.29,35.31a21.37,21.37,0,0,0,4.13-11.87,22,22,0,0,0-3.57-13A21.59,21.59,0,0,0,124.91.58a21.22,21.22,0,0,0-16.89,3,21.53,21.53,0,0,0-9.8,14,20.85,20.85,0,0,0,2.89,16.79l.09.15,1.7,2.18L100,46.06,80.58,32.32a22.33,22.33,0,0,0-3.5-11.63A21.85,21.85,0,0,0,63.13,10.9a21.3,21.3,0,0,0-16.94,3,21.59,21.59,0,0,0-9.75,14,20.44,20.44,0,0,0,2.9,16.69,22,22,0,0,0,9.19,8.22l4.13,23.29-10.15-1.4a13.19,13.19,0,0,0-1.25-2.2,21.85,21.85,0,0,0-13.94-9.84,21,21,0,0,0-16.84,3,21.65,21.65,0,0,0-9.89,14m13.84,9.88a9.48,9.48,0,0,1-1.15-7.09,9,9,0,0,1,4.07-6,9.54,9.54,0,0,1,7.19-1.2,9.17,9.17,0,0,1,5.89,4.06,9.41,9.41,0,0,1,1.43,5.82l-.05.89,36.7,5.43L59.72,42l-.89,0A8.74,8.74,0,0,1,54,41.15a8.42,8.42,0,0,1-3.7-3.44,9.26,9.26,0,0,1,2.86-12.93,9.14,9.14,0,0,1,7.1-1.3,9,9,0,0,1,5.88,4.16,11.17,11.17,0,0,1,1.54,4.79,9.19,9.19,0,0,1-1.23,4.77L66,38l41.26,29,10.58-35.31L117,31.4a9.76,9.76,0,0,1-4.91-3.91,9,9,0,0,1-1.25-7.1A9.19,9.19,0,0,1,115,14.47a9.54,9.54,0,0,1,7.19-1.2A8.77,8.77,0,0,1,128,17.33a9.54,9.54,0,0,1,1.2,7.19,9.12,9.12,0,0,1-4.06,5.89l-1.33.71,13.58,50.27.09.1,5.22,8.57L73.76,133.82l-6.42-10-.19-.21L29.11,91.32l-1.6,1.19a9.14,9.14,0,0,1-7.1,1.3A9.07,9.07,0,0,1,14.43,89.65Z\"/>\n    </symbol>\n\n    <symbol id=\"gift\" viewBox=\"0 0 136 149\">\n        <path class=\"cls-2\" d=\"M133.25,67.07a17,17,0,0,0-10.68-8.2l-5.11-1.37a25.48,25.48,0,0,0,8.7-13.56,25.24,25.24,0,0,0-2.62-19.88,26.2,26.2,0,0,0-35.79-9.59l-3.18,2.16-1.68-3.46A25.24,25.24,0,0,0,67,1,25.24,25.24,0,0,0,47.1,3.58,25.31,25.31,0,0,0,34.77,19.45a25.4,25.4,0,0,0,.88,16.13l-5.11-1.37A17,17,0,0,0,17.19,36,17,17,0,0,0,9,46.65L4.77,62.37a11.61,11.61,0,0,0,.45,7.52,12.41,12.41,0,0,0,4.66,5.63L.43,110.8a10.92,10.92,0,0,0,1.2,8.81,10.92,10.92,0,0,0,7,5.45l87.43,23.42a11.75,11.75,0,0,0,14.26-8.23L119.8,105a12,12,0,0,0,11-8.83L135,80.42a17,17,0,0,0-1.77-13.35M119,72a4.07,4.07,0,0,1,2.81,4.86l-3.7,13.8L74.82,79.09l4.73-17.64L119,72M104.1,25a12.25,12.25,0,0,1,7.73,5.91,12.1,12.1,0,0,1,1.28,9.52,12.25,12.25,0,0,1-5.91,7.73,22,22,0,0,1-5.88,2q-7.42,2.12-25.06-2.6t-23-10.27a22,22,0,0,1-4.09-4.66A12.25,12.25,0,0,1,47.93,23a12.1,12.1,0,0,1,5.87-7.6,12.25,12.25,0,0,1,9.65-1.25A12.1,12.1,0,0,1,71.06,20a20.11,20.11,0,0,1,2.49,10.12,6.93,6.93,0,0,0,1.56,4.39,7.68,7.68,0,0,0,8.69,2.33,6.93,6.93,0,0,0,3.55-3,20.11,20.11,0,0,1,7.22-7.52A12.1,12.1,0,0,1,104.1,25m-82,25.17A3.54,3.54,0,0,1,24,47.8a3.54,3.54,0,0,1,3-.43L66.51,58,61.78,75.59,18.45,64l3.7-13.8m-8,62.23L23,79.31l35.28,9.45-8.87,33.1-35.28-9.45m92.46-10.71-8.87,33.1-35.28-9.45,8.87-33.1Z\"/>\n    </symbol>\n\n    <symbol id=\"heart\" viewBox=\"0 0 125 116\">\n        <path class=\"cls-2\" d=\"M124,43.78q-.37-16.63-8.59-27.49A40,40,0,0,0,94.74,1.49Q80.62-2.71,67,4.91A37.87,37.87,0,0,0,51.11,21.19a52.6,52.6,0,0,0-2.7,6.8,48.88,48.88,0,0,0-7.19-1.31A37.52,37.52,0,0,0,19,31.38v0Q5.3,39,1.44,53.16a39.39,39.39,0,0,0,1.48,25.4q4.87,12.78,18.62,22t33.22,12.62h0q25.93,4.58,37.91,1.59h0a9.87,9.87,0,0,0,3-1.12l.05,0,.22-.27a10.6,10.6,0,0,0,2.36-1.53v0q8.94-8.45,18.73-33v0q7.31-18.4,6.94-34.92m-12.27.83q.33,13.7-6.1,29.5Q97.05,95.5,89.9,102.7l-.3.07-.11.14Q79.41,105.11,57,101h0q-16.71-2.9-28.23-10.4Q17.9,83.43,14.28,74.09q-4.09-10.71-.44-19.65a24.11,24.11,0,0,1,11-12.21,25.35,25.35,0,0,1,15.07-3.3,35.18,35.18,0,0,1,18.37,7.84l1,.73-.17-1.2a33.83,33.83,0,0,1,3.1-19.68,26,26,0,0,1,10.73-11,24.25,24.25,0,0,1,16.25-2.89h0q9.54,1.64,16.4,10.88v0Q111.63,31.67,111.74,44.61Z\"/>\n    </symbol>\n\n    <symbol id=\"lips\" viewBox=\"0 0 144 115\">\n        <path class=\"cls-2\" d=\"M13.94,16Q4,20.66,1.42,26.61q-4.36,9.39,4.65,33,9.47,24.91,24.8,38,6.1,5.37,22,11.3,13.48,5,21.44,5.43,20.38,1.33,44.14-12.28a108.23,108.23,0,0,0,12.44-8.39v.1q10.24-8,12.08-14t-2.4-16.17q-4-9.06-18.26-33.52l-1.12-1.92q-7-12.14-18.61-16.28a33.54,33.54,0,0,0-14.43-2A33.85,33.85,0,0,0,75.88,2q-11.21-4.16-24,.18l-2.19.7Q22.51,11.93,13.94,16m4.26,39q-7-18.52-5.06-23,1.35-2.69,14.75-7.84Q35.12,21.24,56,14.37q8.54-2.9,15.51-.29a21.93,21.93,0,0,1,8.4,5.77,17.81,17.81,0,0,1,2.71,3.52l.54,1,1-.73,4.35-.87a20.3,20.3,0,0,1,9.69,1.15q7.26,2.69,11.86,10.66,11,18.69,14.69,25.78Q131.2,73.1,130.54,76q-1.7,5.13-18.56,14.87-20.2,11.53-36.84,10.57H75q-6.12-.48-17.76-4.62-13.58-5-18-8.91Q26.42,76.77,18.19,55m39.64-7.15a97.9,97.9,0,0,0-10.38-3.19,8.78,8.78,0,0,0-3.31-.44q-2,.11-2.24,1.43v-.1q-1.43,3,7.17,9.71A75.85,75.85,0,0,0,69.25,66.16a70.73,70.73,0,0,0,22.61,4.74q10.81.51,11.65-2.63,1-2-3.68-4.39a81.09,81.09,0,0,0-9.9-4.14Z\"/>\n    </symbol>\n\n    <symbol id=\"sound\" viewBox=\"0 0 136 151\">\n        <path class=\"cls-2\" d=\"M136,20.05q.44-9-5.07-14.73A17.46,17.46,0,0,0,117.73,0l-4,.3h-.2l-.1.1L51,15.67v-.1A23.43,23.43,0,0,0,38.86,22a20.21,20.21,0,0,0-6.4,13.7V84A31.89,31.89,0,0,0,9.7,93.8a33.36,33.36,0,0,0,.1,47.15,32.06,32.06,0,0,0,23.55,9.7,32.48,32.48,0,0,0,22.86-9,31.36,31.36,0,0,0,10.44-21.87l.1-58.62,35-7.93V67.84a32,32,0,0,0-22.66,9.85,33.07,33.07,0,0,0,0,47.1,33.57,33.57,0,0,0,46.5.69,31.19,31.19,0,0,0,10.29-22l.1-83.4m-14.24-5.52v.1A7.24,7.24,0,0,1,123,19.85l-.1,83a19,19,0,0,1-6.3,13.15,20.4,20.4,0,0,1-34.48-14.73,20.35,20.35,0,0,1,20.34-20.44q6.8,0,10.49,3.1l1.63,1.28V37.1L53.79,50.84l-.1,68.23a18.7,18.7,0,0,1-6.3,13.05,20,20,0,0,1-14,5.57,19.63,19.63,0,0,1-14.43-5.91,20.46,20.46,0,0,1-.1-28.87,19.83,19.83,0,0,1,20.24-5.07A13.74,13.74,0,0,1,43.79,100l1.58,1.23V36.41a7.93,7.93,0,0,1,4.24-6.55,13.45,13.45,0,0,1,4.09-1.58h.1L115.9,13.15a7.19,7.19,0,0,1,1.82-.2,4.84,4.84,0,0,1,4,1.58M39.95,110.84a9.14,9.14,0,0,0-6.7-2.81,9.43,9.43,0,0,0,0,18.87,9.14,9.14,0,0,0,6.7-2.81,9.46,9.46,0,0,0,0-13.25m69-16.21a9.39,9.39,0,0,0-13.35,13.2,9.58,9.58,0,0,0,13.35,0,9.4,9.4,0,0,0,0-13.2Z\"/>\n    </symbol>\n\n    <use xlink:href=\"#sound\" x=\"136\" y=\"997\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"118\" y=\"1332\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#gift\" x=\"3\" y=\"1099\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#crown\" x=\"-152\" y=\"1177\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"145\" y=\"1186\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#heart\" x=\"-118\" y=\"1395\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#sound\" x=\"-140\" y=\"1049\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"-17\" y=\"934\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#crown\" x=\"65\" y=\"832\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"-24\" y=\"1267\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"136\" y=\"369\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"118\" y=\"704\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#gift\" x=\"3\" y=\"471\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#crown\" x=\"-152\" y=\"549\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"145\" y=\"558\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#heart\" x=\"-118\" y=\"767\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#sound\" x=\"-140\" y=\"421\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"-17\" y=\"306\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#crown\" x=\"65\" y=\"204\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"-24\" y=\"639\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"118\" y=\"80\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#gift\" x=\"3\" y=\"-153\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#crown\" x=\"-152\" y=\"-75\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"145\" y=\"-66\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#heart\" x=\"-118\" y=\"142\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#bottle\" x=\"-24\" y=\"14\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"810\" y=\"1219\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"852\" y=\"1475\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"532\" y=\"1485\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"326\" y=\"1142\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"1305\" y=\"1315\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"378\" y=\"1456\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"649\" y=\"1255\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"1287\" y=\"1651\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#lips\" x=\"762\" y=\"1610\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#lips\" x=\"429\" y=\"1621\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#gift\" x=\"234\" y=\"1423\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"922\" y=\"1600\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"594\" y=\"1632\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"1172\" y=\"1418\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"418\" y=\"1291\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#crown\" x=\"511\" y=\"1143\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"675\" y=\"1491\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"1016\" y=\"1496\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"1314\" y=\"1504\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#heart\" x=\"254\" y=\"1580\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#heart\" x=\"257\" y=\"1280\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#heart\" x=\"875\" y=\"1343\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#gift\" x=\"740\" y=\"1350\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#sound\" x=\"1028\" y=\"1367\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"564\" y=\"1360\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#lips\" x=\"1151\" y=\"1252\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#crown\" x=\"1234\" y=\"1151\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"962\" y=\"1249\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"1144\" y=\"1585\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#heart\" x=\"681\" y=\"1112\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#bottle\" x=\"810\" y=\"591\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"852\" y=\"847\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"532\" y=\"857\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"326\" y=\"514\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"1305\" y=\"687\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"888\" y=\"1109\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"378\" y=\"828\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"649\" y=\"627\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"1287\" y=\"1023\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#lips\" x=\"762\" y=\"982\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#lips\" x=\"429\" y=\"993\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#gift\" x=\"234\" y=\"795\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"922\" y=\"972\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"594\" y=\"1004\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"1172\" y=\"790\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"418\" y=\"663\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#crown\" x=\"511\" y=\"515\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"675\" y=\"863\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"1016\" y=\"868\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"1314\" y=\"876\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#heart\" x=\"254\" y=\"952\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#heart\" x=\"1050\" y=\"1085\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#heart\" x=\"257\" y=\"652\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#heart\" x=\"875\" y=\"715\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#gift\" x=\"740\" y=\"722\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#sound\" x=\"1028\" y=\"739\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"564\" y=\"732\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#lips\" x=\"1151\" y=\"624\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#crown\" x=\"1234\" y=\"523\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"962\" y=\"621\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"1144\" y=\"957\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#heart\" x=\"681\" y=\"484\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#bottle\" x=\"810\" y=\"-33\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"852\" y=\"222\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"532\" y=\"232\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"326\" y=\"-110\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"1305\" y=\"62\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"888\" y=\"484\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"378\" y=\"203\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"649\" y=\"2\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"1287\" y=\"398\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#lips\" x=\"762\" y=\"357\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#lips\" x=\"429\" y=\"368\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#gift\" x=\"234\" y=\"170\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"922\" y=\"347\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"594\" y=\"380\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"1172\" y=\"165\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"418\" y=\"38\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#crown\" x=\"511\" y=\"-109\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"675\" y=\"238\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"1016\" y=\"243\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"1314\" y=\"252\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#heart\" x=\"254\" y=\"327\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#heart\" x=\"1050\" y=\"461\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#heart\" x=\"257\" y=\"27\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#heart\" x=\"875\" y=\"90\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#gift\" x=\"740\" y=\"97\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#sound\" x=\"1028\" y=\"114\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"564\" y=\"107\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#lips\" x=\"1151\" y=\"0\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#crown\" x=\"1234\" y=\"-101\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#crown\" x=\"962\" y=\"-2\" width=\"80\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"1144\" y=\"332\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#heart\" x=\"681\" y=\"-139\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#sound\" x=\"888\" y=\"-143\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#bottle\" x=\"1494\" y=\"1460\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#gift\" x=\"1587\" y=\"1609\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#heart\" x=\"1425\" y=\"1599\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#bottle\" x=\"1494\" y=\"832\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"1547\" y=\"1146\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"1597\" y=\"1311\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#gift\" x=\"1403\" y=\"1113\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"1587\" y=\"981\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#heart\" x=\"1423\" y=\"1270\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#heart\" x=\"1425\" y=\"971\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#bottle\" x=\"1494\" y=\"207\" width=\"76\" height=\"76\"/>\n    <use xlink:href=\"#sound\" x=\"1547\" y=\"521\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"1597\" y=\"686\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#gift\" x=\"1403\" y=\"488\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#gift\" x=\"1587\" y=\"357\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#heart\" x=\"1423\" y=\"645\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#heart\" x=\"1425\" y=\"346\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#sound\" x=\"1547\" y=\"-106\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"1597\" y=\"58\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#gift\" x=\"1403\" y=\"-139\" width=\"70\" height=\"75\"/>\n    <use xlink:href=\"#heart\" x=\"1423\" y=\"17\" width=\"62\" height=\"57\"/>\n    <use xlink:href=\"#sound\" x=\"136\" y=\"1627\" width=\"69\" height=\"76\"/>\n    <use xlink:href=\"#lips\" x=\"-17\" y=\"1564\" width=\"72\" height=\"59\"/>\n    <use xlink:href=\"#crown\" x=\"65\" y=\"1463\" width=\"80\" height=\"76\"/>\n\n    <use xlink:href=\"#dot0\" x=\"-15\" y=\"856\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"68\" y=\"959\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"-4\" y=\"1028\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"90\" y=\"1096\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"-64\" y=\"1212\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"-123\" y=\"1318\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"192\" y=\"1278\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"144\" y=\"1402\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"-154\" y=\"1289\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"-41\" y=\"1399\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"161\" y=\"826\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"-177\" y=\"859\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"63\" y=\"1166\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"87\" y=\"1254\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot3\" x=\"182\" y=\"1084\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"-108\" y=\"924\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"7\" y=\"1354\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot0\" x=\"-15\" y=\"228\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"68\" y=\"331\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"-4\" y=\"400\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"90\" y=\"468\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"-64\" y=\"584\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"-123\" y=\"690\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"192\" y=\"650\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"144\" y=\"774\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"-154\" y=\"661\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"-41\" y=\"771\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"161\" y=\"198\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"-177\" y=\"231\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"63\" y=\"538\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"87\" y=\"626\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot3\" x=\"182\" y=\"456\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"-108\" y=\"296\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"7\" y=\"726\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot0\" x=\"90\" y=\"-156\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"-64\" y=\"-39\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"-123\" y=\"65\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"192\" y=\"25\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"144\" y=\"149\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"-154\" y=\"36\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"-41\" y=\"147\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"63\" y=\"-86\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"87\" y=\"1\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot3\" x=\"182\" y=\"-168\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"7\" y=\"101\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot0\" x=\"250\" y=\"1145\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"413\" y=\"1174\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"605\" y=\"1147\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"482\" y=\"1434\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"500\" y=\"1277\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"388\" y=\"1369\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"309\" y=\"1463\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"453\" y=\"1501\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"575\" y=\"1550\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"743\" y=\"1174\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"875\" y=\"1257\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1153\" y=\"1174\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1237\" y=\"1277\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1164\" y=\"1347\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1259\" y=\"1414\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1104\" y=\"1531\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"947\" y=\"1434\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"839\" y=\"1605\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1045\" y=\"1636\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1361\" y=\"1596\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"656\" y=\"1341\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"344\" y=\"1647\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"350\" y=\"1234\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"592\" y=\"1427\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"508\" y=\"1618\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"323\" y=\"1560\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"1014\" y=\"1607\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"1330\" y=\"1144\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"991\" y=\"1177\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1232\" y=\"1484\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1256\" y=\"1573\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"666\" y=\"1590\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"770\" y=\"1457\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"460\" y=\"1380\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"749\" y=\"1272\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"947\" y=\"1335\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"419\" y=\"1536\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot3\" x=\"563\" y=\"1220\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"1351\" y=\"1402\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"1060\" y=\"1242\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot4\" x=\"303\" y=\"1361\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot0\" x=\"250\" y=\"517\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"413\" y=\"546\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"605\" y=\"519\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"482\" y=\"806\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"500\" y=\"649\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"388\" y=\"741\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"309\" y=\"835\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"453\" y=\"873\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"575\" y=\"922\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"743\" y=\"546\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"875\" y=\"629\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1153\" y=\"546\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1237\" y=\"649\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1164\" y=\"719\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1259\" y=\"786\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1104\" y=\"903\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"947\" y=\"806\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"839\" y=\"977\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"963\" y=\"1064\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1045\" y=\"1008\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1361\" y=\"968\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1313\" y=\"1092\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"656\" y=\"713\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"583\" y=\"1088\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"344\" y=\"1019\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"350\" y=\"606\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"592\" y=\"799\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"508\" y=\"990\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"323\" y=\"932\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"1014\" y=\"979\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"1127\" y=\"1090\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"1330\" y=\"516\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"991\" y=\"549\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1232\" y=\"856\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1256\" y=\"945\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"666\" y=\"962\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"770\" y=\"829\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"460\" y=\"752\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"749\" y=\"644\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"297\" y=\"1049\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"947\" y=\"707\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"419\" y=\"908\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot3\" x=\"563\" y=\"592\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"1351\" y=\"774\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"1060\" y=\"614\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"1176\" y=\"1044\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot4\" x=\"303\" y=\"733\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot4\" x=\"418\" y=\"1102\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot4\" x=\"791\" y=\"1106\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot0\" x=\"250\" y=\"-107\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"413\" y=\"-78\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"605\" y=\"-105\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"482\" y=\"181\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"500\" y=\"24\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"388\" y=\"116\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"309\" y=\"210\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"453\" y=\"248\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"575\" y=\"298\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"743\" y=\"-78\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"875\" y=\"4\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1153\" y=\"-78\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1237\" y=\"24\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1164\" y=\"94\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1259\" y=\"161\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1104\" y=\"278\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"947\" y=\"181\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"839\" y=\"352\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"963\" y=\"439\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1045\" y=\"383\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1361\" y=\"343\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1313\" y=\"467\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"656\" y=\"88\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"583\" y=\"463\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"344\" y=\"394\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"350\" y=\"-17\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"592\" y=\"174\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"508\" y=\"365\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"323\" y=\"307\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"1014\" y=\"354\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"1127\" y=\"465\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"1330\" y=\"-107\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"991\" y=\"-75\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1232\" y=\"231\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1256\" y=\"320\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"666\" y=\"337\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"770\" y=\"204\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"460\" y=\"127\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"749\" y=\"20\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"297\" y=\"424\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"947\" y=\"82\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"419\" y=\"283\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot3\" x=\"563\" y=\"-31\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"1351\" y=\"150\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"1060\" y=\"-10\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot3\" x=\"1176\" y=\"419\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot4\" x=\"303\" y=\"108\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot4\" x=\"418\" y=\"477\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot4\" x=\"791\" y=\"481\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot0\" x=\"1313\" y=\"-160\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"583\" y=\"-164\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"1127\" y=\"-162\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot4\" x=\"418\" y=\"-150\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot4\" x=\"791\" y=\"-146\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot0\" x=\"1419\" y=\"1463\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1582\" y=\"1492\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"1519\" y=\"1553\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot0\" x=\"1419\" y=\"835\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1582\" y=\"864\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1651\" y=\"1124\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1556\" y=\"1059\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1478\" y=\"1153\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1602\" y=\"1191\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1513\" y=\"1337\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"1519\" y=\"925\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"1491\" y=\"1250\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1628\" y=\"1070\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1466\" y=\"1367\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1587\" y=\"1226\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot4\" x=\"1471\" y=\"1051\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot4\" x=\"1587\" y=\"1420\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot0\" x=\"1419\" y=\"210\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1582\" y=\"239\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1651\" y=\"499\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1556\" y=\"435\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1478\" y=\"528\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1602\" y=\"567\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1513\" y=\"713\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"1519\" y=\"300\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot1\" x=\"1491\" y=\"626\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1628\" y=\"446\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1466\" y=\"742\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1587\" y=\"601\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot4\" x=\"1471\" y=\"426\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot4\" x=\"1587\" y=\"795\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot0\" x=\"1651\" y=\"-128\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1478\" y=\"-99\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1602\" y=\"-60\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"1513\" y=\"85\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"1491\" y=\"-2\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1466\" y=\"114\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot2\" x=\"1587\" y=\"-26\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot4\" x=\"1587\" y=\"167\" width=\"35\" height=\"35\"/>\n    <use xlink:href=\"#dot0\" x=\"-15\" y=\"1486\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot0\" x=\"68\" y=\"1589\" width=\"11\" height=\"11\"/>\n    <use xlink:href=\"#dot1\" x=\"-177\" y=\"1489\" width=\"16\" height=\"16\"/>\n    <use xlink:href=\"#dot3\" x=\"-108\" y=\"1554\" width=\"23\" height=\"23\"/>\n    <use xlink:href=\"#dot1\" x=\"167\" y=\"1453\" width=\"16\" height=\"16\"/>\n</svg>\n";
;// ./js/html/utils/createGreenPattern.ts

function createGreenPattern() {
  const base64 = btoa(ui_loading_patternraw_namespaceObject);
  const bg = document.createElement('div');
  bg.style.backgroundImage = `url('data:image/svg+xml;base64,${base64}')`;
  bg.style.backgroundRepeat = 'no-repeat';
  bg.style.backgroundSize = 'cover';
  bg.style.overflow = 'hidden';
  bg.style.position = 'absolute';
  bg.style.width = '100%';
  bg.style.height = '100%';
  return bg;
}
;// ./js/http.ts

function createXHR() {
  try {
    return new XMLHttpRequest();
  } catch (_a) {
    try {
      return new ActiveXObject('Msxml2.XMLHTTP');
    } catch (_b) {
      return new ActiveXObject('Microsoft.XMLHTTP');
    }
  }
  throw new Error('No xhr object');
}
function loadXHR(url) {
  let responseType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  let onprogress = arguments.length > 2 ? arguments[2] : undefined;
  return new Promise((resolve, reject) => {
    const xhr = createXHR();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200) {
        reject(new Error(`Wrong response: ${xhr.status} ${url}`));
        return;
      }
      onprogress === null || onprogress === void 0 ? void 0 : onprogress(1.0);
      resolve(xhr);
    };
    xhr.onerror = e => {
      reject(new Error(`XHR error: ${url}`));
    };
    xhr.onprogress = e => {
      const progress = e.total > 0 && e.loaded > 0 ? e.loaded / e.total : 0;
      onprogress === null || onprogress === void 0 ? void 0 : onprogress(progress);
    };
    xhr.open('GET', url, true);
    xhr.responseType = responseType;
    try {
      xhr.send();
    } catch (e) {
      reject(e);
    }
  });
}
function loadArrayBuffer(url) {
  return loadXHR(url, 'arraybuffer').then(xhr => xhr.response);
}
function loadJSON(url, onprogress) {
  return loadXHR(url, '', onprogress).then(xhr => JSON.parse(xhr.responseText));
}
function loadBase64(url) {
  return loadArrayBuffer(url).then(buffer => buffer2base64(buffer));
}
function buffer2base64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function loadJS(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.onerror = event => {
      reject(new Error(`Failed to loadJS: ${url}`));
    };
    script.onload = resolve;
    script.src = url;
    script.type = 'text/javascript';
    document.head.appendChild(script);
  });
}
function loadCSS(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('link');
    script.href = url;
    script.onerror = event => {
      console.error(`Failed to loadCSS ${url}`);
      reject(new Error(`Failed to loadCSS`));
    };
    script.onload = resolve;
    script.rel = 'stylesheet';
    script.type = 'text/css';
    document.head.appendChild(script);
  });
}
function postFormData(url_1, data_1) {
  return __awaiter(this, arguments, void 0, function (url, data) {
    let responseType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
    return function* () {
      const fd = new FormData();
      for (const k in data) fd.append(k, data[k]);
      return yield postBlob(url, fd, responseType);
    }();
  });
}
function postBlob(url, blob) {
  let responseType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  return new Promise((resolve, reject) => {
    const xhr = createXHR();
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      if (xhr.status !== 200) {
        reject(new Error(`Wrong response: ${xhr.status} ${url}`));
        return;
      }
      resolve(xhr);
    };
    xhr.onload = () => {
      if (xhr.status !== 200) {
        reject(new Error(`Wrong response: ${xhr.status} ${url}`));
        return;
      }
      resolve(xhr);
    };
    xhr.onerror = reject;
    xhr.open('POST', url, true);
    xhr.responseType = responseType;
    xhr.send(blob);
  });
}
;// ./js/utils/randomId.ts
function randomId() {
  return `${Date.now()}x${1000000000 * Math.random() | 0}`;
}
;// ./splash.ts




if (typeof globalThis === 'undefined') window.globalThis = window;
function splashForced(oldFiles) {
  let htmlRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;
  let socialId = arguments.length > 2 ? arguments[2] : undefined;
  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/[^/]*$/, 'splash.json');
  url.search = '?' + randomId();
  url.hash = '';
  return loadJSON(url.href).then(files => {
    const jsP = oldFiles.js[0] === files.js[0] ? Promise.resolve() : loadJS(files.js[0]);
    return jsP.then(() => {
      const newSplash = window.splash;
      return newSplash && newSplash(files, htmlRoot, socialId);
    });
  });
}
function splash(files) {
  let htmlRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document.body;
  let socialId = arguments.length > 2 ? arguments[2] : undefined;
  var _a;
  const startDate = new Date();
  const trace_id = ulid();
  const scope = (_a = window.Sentry) === null || _a === void 0 ? void 0 : _a.getCurrentScope();
  scope === null || scope === void 0 ? void 0 : scope.setTag('trace_id', trace_id);
  const bg = createGreenPattern();
  bg.style.backgroundColor = '#759951';
  htmlRoot.appendChild(bg);
  if (navigator.userAgent.indexOf('Opera Mini') >= 0 && !window.requestAnimationFrame) {
    throw new Error(`[ciliz.splash]: unsupported_browser`);
  }
  Progress.injectCSS();
  const p = new Progress();
  bg.appendChild(p.el);
  const prepareUrl = url => {
    if (url.indexOf('splash') >= 0) throw new Error('splash in preloading urls');
    if (socialId === 'fb') {
      return `//cdn.ciliz.com/html/${url}`;
    }
    return url;
  };
  const serverUrl = `https://butilochka.cdnvideo.ru/mobile/server.json?${randomId()}`;
  const tasks = [].concat([loadJSON(serverUrl, p.num('server')).then(serverJSON => loadJSON(window.location.origin + '/api/assets-proxy', p.num('assets')).then(assetsJSON => ({
    assets: assetsJSON,
    server: serverJSON
  }))).catch(() => undefined)], files.css.map(prepareUrl).map(css => {
    if (css.indexOf('preloader') >= 0) return loadCSS(css).then(p.bool('css'));
    return loadCSS(css);
  }), files.js.slice(1).map(prepareUrl).map(js => {
    if (js.indexOf('preloader') >= 0) return loadJS(js).then(p.bool('js'));
    return loadJS(js);
  }));
  return Promise.all(tasks).then(result => {
    if (!window.preload) {
      return;
    }
    const splash = result[0];
    if (splash) {
      splash.startDate = startDate;
      splash.trace_id = trace_id;
      splash.onprogress = p.num('preloader');
      splash.oncomplete = () => {
        htmlRoot.removeChild(bg);
      };
    }
    window.preload(htmlRoot, splash);
  }).catch(e => {
    throw new Error(`[ciliz.splash]: ${e}`);
  });
}
class Progress {
  static injectCSS() {
    const css = document.createElement('style');
    css.innerText = `
.splash__bg {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    -webkit-transform: translate(-50%, -50%);

    width: 50%;
    max-width: 400px;
    padding: 4px;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.25), 0 1px rgba(255, 255, 255, 0.08);
}

.splash__bar {
    height: 12px;
    width: 0%;
    border-radius: 20px;
    background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));
    transition: 0.4s linear;
    background-color: #97ca31;
    transition-property: width, background-color;
}
        `;
    document.head.appendChild(css);
  }
  constructor() {
    this.p = {
      assets: 0,
      css: false,
      js: false,
      preloader: 0,
      server: 0
    };
    this.el = document.createElement('div');
    this.el.classList.add('splash__bg');
    this.barEl = document.createElement('div');
    this.barEl.classList.add('splash__bar');
    this.el.appendChild(this.barEl);
    this.update();
  }
  bool(k) {
    return () => {
      this.p[k] = true;
      this.update();
    };
  }
  num(k) {
    return p => {
      this.p[k] = p;
      this.update();
    };
  }
  update() {
    const p = this.p;
    const progress = 0.1 + 0.15 * p.assets + (p.css ? 0.25 : 0) + (p.js ? 0.25 : 0) + 0.1 * p.preloader + 0.1 * p.server;
    this.barEl.style.width = `${progress * 100}%`;
  }
}
window.splash = splash;
window.splashForced = splashForced;
/******/ })()
;
//# sourceMappingURL=splash.03db6fd04b15.js.map