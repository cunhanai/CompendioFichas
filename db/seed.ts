import { db } from './client.js';
import { sharedLibraries, systems } from './schema.js';
import { SEED_SYSTEMS } from '../src/entities/system/model/seed.js';
import { SEED_LIBRARY } from '../src/entities/library-item/model/seed.js';

async function main() {
  for (const system of SEED_SYSTEMS) {
    await db.insert(systems).values(system).onConflictDoUpdate({ target: systems.id, set: system });
  }

  await db
    .insert(sharedLibraries)
    .values({ systemId: SEED_LIBRARY.systemId, data: SEED_LIBRARY })
    .onConflictDoUpdate({ target: sharedLibraries.systemId, set: { data: SEED_LIBRARY } });

  console.log(`Seeded ${SEED_SYSTEMS.length} systems and 1 shared library.`);
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
