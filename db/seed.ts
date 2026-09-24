import { db } from './client.js';
import { systems } from './schema.js';
import { SEED_SYSTEMS } from '../src/entities/system/model/seed.js';

async function main() {
  for (const system of SEED_SYSTEMS) {
    await db.insert(systems).values(system).onConflictDoUpdate({ target: systems.id, set: system });
  }

  console.log(`Seeded ${SEED_SYSTEMS.length} systems.`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
