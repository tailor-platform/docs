#!/usr/bin/env node

/**
 * Merge narratives.json into data.json without duplicates
 *
 * Usage: node scripts/merge-narratives.js
 */

import fs from 'fs/promises';
import path from 'path';

async function main() {
  const dataPath = path.join(process.cwd(), 'docs/reference/changelog/data.json');
  const narrativesPath = path.join(process.cwd(), 'docs/reference/changelog/narratives.json');

  // Load data.json
  const dataContent = await fs.readFile(dataPath, 'utf-8');
  const data = JSON.parse(dataContent);
  console.log(`📊 Loaded ${data.entries.length} entries from data.json`);

  // Load narratives.json
  const narrativesContent = await fs.readFile(narrativesPath, 'utf-8');
  const narratives = JSON.parse(narrativesContent);
  console.log(`📝 Loaded ${narratives.releases.length} narratives from narratives.json`);

  // Create ID map for quick lookup
  const narrativeMap = new Map(
    narratives.releases.map(r => [r.id, r.narrative])
  );

  // Merge narratives into data.json entries
  let updatedCount = 0;
  data.entries.forEach(entry => {
    if (narrativeMap.has(entry.id)) {
      entry.narrative = narrativeMap.get(entry.id);
      updatedCount++;
    }
  });

  // Update metadata
  data.lastUpdated = new Date().toISOString();

  // Write back
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));

  const withNarratives = data.entries.filter(e => e.narrative).length;

  console.log('\n✅ Merge complete!');
  console.log(`   Updated: ${updatedCount} entries`);
  console.log(`   Total entries: ${data.entries.length}`);
  console.log(`   With narratives: ${withNarratives}`);
}

main().catch(error => {
  console.error('❌ Merge failed:', error);
  process.exit(1);
});
