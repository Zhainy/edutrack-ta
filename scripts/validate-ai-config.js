#!/usr/bin/env node

/**
 * validate-ai-config.js
 *
 * Validates that if VITE_ENABLE_AI=true, VITE_GROQ_API_KEY is also set.
 * Run manually or via the .kiro/hooks/validate-ai-config hook.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const cwd = process.cwd();

/**
 * Minimal .env parser — handles KEY=VALUE and KEY="VALUE" lines.
 * Does not support multi-line values.
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  const vars = {};
  const lines = readFileSync(filePath, 'utf-8').split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const rawValue = trimmed.slice(eqIndex + 1).trim();
    // Strip surrounding quotes if present
    const value = rawValue.replace(/^["']|["']$/g, '');
    vars[key] = value;
  }

  return vars;
}

// Load variables from .env then .env.local (local overrides base)
const baseEnv = parseEnvFile(resolve(cwd, '.env'));
const localEnv = parseEnvFile(resolve(cwd, '.env.local'));
const env = { ...baseEnv, ...localEnv };

const enableAI = env['VITE_ENABLE_AI'] === 'true';
const groqKey = env['VITE_GROQ_API_KEY'];

console.log('🔍 Validating AI configuration...\n');

if (!enableAI) {
  console.log('✅ AI feature disabled (VITE_ENABLE_AI is not "true")');
  console.log('   The app will work without AI.\n');
  process.exit(0);
}

if (!groqKey) {
  console.error('❌ Error: VITE_ENABLE_AI=true but VITE_GROQ_API_KEY is not set');
  console.error('');
  console.error('   To enable the AI feature:');
  console.error('   1. Register for free at: https://console.groq.com');
  console.error('   2. Create an API key (no credit card required)');
  console.error('   3. Add it to .env.local:');
  console.error('      VITE_GROQ_API_KEY=your_key_here');
  console.error('');
  process.exit(1);
}

const maskedKey = `${groqKey.substring(0, 8)}...${groqKey.substring(groqKey.length - 4)}`;
console.log('✅ AI configuration is valid');
console.log(`   Provider : Groq`);
console.log(`   API key  : ${maskedKey}`);
console.log('');
