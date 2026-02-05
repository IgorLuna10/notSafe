/**
 * Calculates the entropy of a password and estimates time to crack.
 * Based on standard entropy formulas: E = L * log2(R)
 */
export function calculateCrackTime(password) {
  if (!password) return null;

  // 1. Calculate Pool Size (R)
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26; // Lowercase
  if (/[A-Z]/.test(password)) poolSize += 26; // Uppercase
  if (/[0-9]/.test(password)) poolSize += 10; // Numbers
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32; // Special Chars

  // 2. Calculate Entropy (Bits)
  const entropy = password.length * Math.log2(poolSize);

  // 3. Estimate Crack Time (Assuming 100 Billion guesses/sec - RTX 4090 Cluster)
  const guessesPerSecond = 100_000_000_000; 
  const seconds = Math.pow(2, entropy) / guessesPerSecond;

  // 4. Return formatted object
  return formatTime(seconds, entropy);
}

function formatTime(seconds, entropy) {
  let timeString = "";
  let color = "";
  let label = "";
  let score = 0; // 0 to 6

  if (seconds < 1e-6) {
    timeString = "Instantly";
    color = "text-red-600";
    label = "Critical";
    score = 0;
  } else if (seconds < 60) {
    timeString = "Seconds";
    color = "text-red-500";
    label = "Very Weak";
    score = 1;
  } else if (seconds < 3600) {
    timeString = `${Math.round(seconds / 60)} Minutes`;
    color = "text-orange-500";
    label = "Weak";
    score = 2;
  } else if (seconds < 86400) {
    timeString = `${Math.round(seconds / 3600)} Hours`;
    color = "text-yellow-500";
    label = "Moderate";
    score = 3;
  } else if (seconds < 31536000) {
    timeString = `${Math.round(seconds / 86400)} Days`;
    color = "text-yellow-400";
    label = "Strong";
    score = 4;
  } else if (seconds < 3153600000) {
    timeString = `${Math.round(seconds / 31536000)} Years`;
    color = "text-green-400";
    label = "Very Strong";
    score = 5;
  } else {
    timeString = "Centuries";
    color = "text-emerald-400";
    label = "Unbreakable";
    score = 6;
  }

  return { time: timeString, color, label, score, entropy: Math.round(entropy) };
}