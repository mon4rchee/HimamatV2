const BANNED_WORDS: string[] = [
  // Tagalog
  "putangina", "putang ina", "puta", "gago", "gaga", "tangina",
  "tarantado", "tanga", "bobo", "boba", "ulol", "lintik", "leche",
  "pakyu", "shet", "bwisit", "hayop", "peste", "hindot", "kantot",
  "jakol", "tite", "puke", "puki", "pekpek", "etits", "bayag",
  // Bisaya
  "yawa", "pisti", "buang", "bilat", "oten",
  // English
  "fuck", "shit", "bitch", "asshole", "bastard", "crap",
  "dick", "cock", "pussy", "cunt", "whore", "slut",
  // Leetspeak/hybrids
  "p*ta", "g*go", "t*nga", "b*bo", "f*ck", "sh*t",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[*@#$0]/g, (c) => ({ "*": "i", "@": "a", "#": "h", "$": "s", "0": "o" }[c] || c))
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, "");
}

export function containsProfanity(text: string): boolean {
  const normalized = normalize(text);
  return BANNED_WORDS.some((word) => normalized.includes(normalize(word)));
}
