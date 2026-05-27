# Character Encodings

This page documents the character encodings supported by the `tailor.iconv` API in the Function service. Understanding these encodings is essential for handling text data conversion between different character sets, especially when working with Japanese, Chinese, and Korean text.

## Overview

The Function service provides comprehensive character encoding conversion capabilities through the `tailor.iconv` API. This includes support for over 100 character encodings, with special focus on Japanese business systems and enterprise environments.

## Unicode

| Encoding Name | Aliases | Description                    | Character Types                                          |
| ------------- | ------- | ------------------------------ | -------------------------------------------------------- |
| UTF-8         | UTF8    | Unicode (UTF-8)                | Full-width/half-width alphanumeric, kana, kanji, symbols |
| UTF-16        | UTF16   | Unicode (UTF-16)               | Full-width/half-width alphanumeric, kana, kanji, symbols |
| UTF-16BE      | -       | Unicode (UTF-16 Big Endian)    | Full-width/half-width alphanumeric, kana, kanji, symbols |
| UTF-16LE      | -       | Unicode (UTF-16 Little Endian) | Full-width/half-width alphanumeric, kana, kanji, symbols |

## Japanese Character Encodings

### Shift_JIS Family Encodings

| Encoding Name | Aliases            | Description                  | Character Types                                                                                                                       |
| ------------- | ------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Shift_JIS     | SHIFT_JIS, SJIS    | Shift JIS code               | Half-width alphanumeric, half-width katakana, full-width kana, JIS Level 1 & 2 kanji                                                  |
| SJIS          | -                  | Shift_JIS alias              | Half-width alphanumeric, half-width katakana, full-width kana, JIS Level 1 & 2 kanji                                                  |
| CP932         | Windows-31J, MS932 | Microsoft extended Shift_JIS | Half-width alphanumeric, half-width katakana, full-width kana, JIS Level 1 & 2 kanji, NEC special characters, IBM extended characters |

### EUC-JP Family Encodings

| Encoding Name | Aliases      | Description               | Character Types                                                                                                  |
| ------------- | ------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| EUC-JP        | EUCJP, eucJP | Japanese EUC code         | Half-width alphanumeric, full-width kana, JIS Level 1 & 2 kanji                                                  |
| EUC-JP-MS     | eucJP-ms     | Microsoft extended EUC-JP | Half-width alphanumeric, full-width kana, JIS Level 1 & 2 kanji, NEC special characters, IBM extended characters |

### ISO-2022 Family Encodings

| Encoding Name | Aliases        | Description      | Character Types                                              |
| ------------- | -------------- | ---------------- | ------------------------------------------------------------ |
| ISO-2022-JP   | ISO2022JP, JIS | JIS code (7-bit) | ASCII, JIS Roman, half-width katakana, JIS Level 1 & 2 kanji |

## Enterprise System Encodings

### IBM EBCDIC Japanese Encodings

| Encoding Name  | Aliases               | Description                           | Character Types                                                                      |
| -------------- | --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------ |
| IBM037         | EBCDIC-CP-US, CP037   | EBCDIC US/Canada                      | Alphanumeric                                                                         |
| IBM290         | EBCDIC-JP-KANA, CP290 | Japanese EBCDIC katakana              | Alphanumeric, katakana                                                               |
| IBM930         | CP930                 | Japanese EBCDIC (kanji)               | Alphanumeric, katakana, hiragana, JIS Level 1 & 2 kanji                              |
| IBM939         | CP939                 | Japanese EBCDIC extended              | Alphanumeric, katakana, hiragana, JIS Level 1 & 2 kanji, extended characters         |
| IBM943         | CP943                 | Japanese PC code                      | Half-width alphanumeric, half-width katakana, full-width kana, JIS Level 1 & 2 kanji |
| EBCDIC-JP-E    | -                     | Japanese EBCDIC alphanumeric katakana | Alphanumeric, katakana                                                               |
| EBCDIC-JP-KANA | -                     | Japanese EBCDIC katakana              | Alphanumeric, katakana                                                               |

### Enterprise System Aliases

| Alias Name    | Actual Encoding | Description               | Character Types        |
| ------------- | --------------- | ------------------------- | ---------------------- |
| HitachiKEIS83 | IBM290          | Hitachi KEIS83 compatible | Alphanumeric, katakana |
| HitachiKEIS90 | IBM290          | Hitachi KEIS90 compatible | Alphanumeric, katakana |
| NECJIPS       | IBM290          | NEC JIPS compatible       | Alphanumeric, katakana |
| NECJIS        | IBM290          | NEC JIS compatible        | Alphanumeric, katakana |

Suffix characters are ignored in enterprise system aliases.

## Chinese Encodings

| Encoding Name | Aliases    | Description                            | Character Types                                             |
| ------------- | ---------- | -------------------------------------- | ----------------------------------------------------------- |
| GB2312        | EUC-CN     | Simplified Chinese (basic)             | ASCII, simplified Chinese                                   |
| GBK           | CP936      | Simplified Chinese (extended)          | ASCII, simplified Chinese (extended)                        |
| GB18030       | -          | Simplified Chinese (complete)          | ASCII, simplified Chinese (all characters)                  |
| Big5          | BIG5       | Traditional Chinese                    | ASCII, traditional Chinese                                  |
| BIG5HKSCS     | Big5-HKSCS | Hong Kong extended traditional Chinese | ASCII, traditional Chinese, Hong Kong additional characters |

## Korean Encodings

| Encoding Name | Aliases   | Description          | Character Types               |
| ------------- | --------- | -------------------- | ----------------------------- |
| EUC-KR        | EUCKR     | Korean EUC           | ASCII, Korean                 |
| UHC           | CP949     | Unified Hangul Code  | ASCII, Korean (extended)      |
| JOHAB         | -         | Combinatorial Hangul | ASCII, Korean (combinatorial) |
| ISO-2022-KR   | ISO2022KR | Korean ISO-2022      | ASCII, Korean characters      |

## Other Languages

| Encoding Name | Aliases  | Description            | Character Types                    |
| ------------- | -------- | ---------------------- | ---------------------------------- |
| ISO-8859-1    | Latin-1  | Western European       | ASCII, Western European characters |
| ASCII         | US-ASCII | American Standard Code | Basic ASCII characters (0-127)     |

## API Usage Examples

### Basic Conversion

```javascript
// UTF-8 to Shift_JIS conversion
const sjisData = tailor.iconv.convert("日本語テキスト", "UTF-8", "Shift_JIS");

// EUC-JP to UTF-8 conversion
const utf8Text = tailor.iconv.convert(eucjpData, "EUC-JP", "UTF-8");
```

### Using Enterprise Aliases

```javascript
// HitachiKEIS83 (actually IBM290) conversion
const keisData = tailor.iconv.convert("カタカナ", "UTF-8", "HitachiKEIS83");
```

### Custom Replacement Characters

```javascript
// Replace unconvertible characters with asterisk
const asciiText = tailor.iconv.convert("Hello 世界!", "UTF-8", "ASCII//TRANSLIT:*");
// Result: "Hello **!"

// Custom string replacement
const asciiText2 = tailor.iconv.convert("Test 日本語", "UTF-8", "ASCII//TRANSLIT:[?]");
// Result: "Test [?][?][?]"

// Underscore replacement
const asciiText3 = tailor.iconv.convert("abc世界xyz", "UTF-8", "ASCII//TRANSLIT:_");
// Result: "abc__xyz"
```

### TRANSLIT with Special Characters

```javascript
// Convert special characters using TRANSLIT
const specialText = "abc ß α € àḃç";

// Default TRANSLIT (uses ? for unconvertible characters)
const result1 = tailor.iconv.convert(specialText, "UTF-8", "ASCII//TRANSLIT");
// Result: "abc ? ? ? ???"

// Custom replacement with asterisk
const result2 = tailor.iconv.convert(specialText, "UTF-8", "ASCII//TRANSLIT:*");
// Result: "abc * * * ***"

// Custom replacement with underscore
const result3 = tailor.iconv.convert(specialText, "UTF-8", "ASCII//TRANSLIT:_");
// Result: "abc _ _ _ ___"
```

### Checking Available Encodings

```javascript
// Get all Japanese-related encodings
const allEncodings = tailor.iconv.encodings();
const jpEncodings = allEncodings.filter((enc) =>
  enc.match(/JP|JIS|Shift|KEIS|93[029]|94[39]|EBCDIC.*JP/i),
);
```

## Error Handling

The `tailor.iconv` API supports special flags for handling characters that cannot be converted:

- **//IGNORE**: Silently ignores characters that cannot be converted
- **//TRANSLIT**: Attempts to transliterate characters to similar ones in target encoding (default replacement: `?`)
- **//TRANSLIT:char**: Custom replacement character extension
  - Example: `ASCII//TRANSLIT:*` replaces unconvertible characters with `*`
  - Example: `ASCII//TRANSLIT:[?]` replaces unconvertible characters with `[?]`

## Best Practices

1. **Encoding Selection**
   - For text with kanji: Use UTF-8, Shift_JIS, EUC-JP, or IBM930/939
   - For katakana-only text: IBM290 is also available
   - For email transmission: ISO-2022-JP is recommended

1. **Preventing Character Corruption**
   - Use the same encoding for both sender and receiver
   - Specify the source encoding accurately

1. **Error Handling**
   - Use `//IGNORE` to skip unconvertible characters
   - Use `//TRANSLIT` for character substitution
   - Use custom replacement characters for specific requirements

## Related Resources

- [Unicode Consortium](https://www.unicode.org/)
- [IBM Code Pages](https://www.ibm.com/docs/en/aix/7.1?topic=reference-code-page-names-numbers)
- [IANA Character Sets](https://www.iana.org/assignments/character-sets/character-sets.xhtml)
- [Function Service Examples](/guides/function/examples)
