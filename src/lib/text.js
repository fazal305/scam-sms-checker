const URDU_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

// Urdu keyboards and some SMS gateways send Eastern Arabic digits.
export function toAsciiDigits(value) {
  return String(value).replace(/[۰-۹٠-٩]/g, (ch) => {
    const i = URDU_DIGITS.indexOf(ch)
    return String(i >= 0 ? i : ARABIC_DIGITS.indexOf(ch))
  })
}

// Diacritics, tatweel and invisible direction marks are stripped, and Arabic
// letter forms are folded into their Urdu equivalents, so "بینظیر" matches
// however the sender's keyboard typed it.
const NOISE = /[ً-ٰٟۖ-ۭـ​-‏‪-‮⁦-⁩﻿]/g

export function normalize(text) {
  return toAsciiDigits(String(text).normalize('NFKC'))
    .replace(NOISE, '')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[هۀ]/g, 'ہ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export const MESSAGE_MAX = 5000
export const SENDER_MAX = 20
