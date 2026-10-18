import { system, world } from '@minecraft/server';
import { setupBehaviours, setupDefences } from './behaviours.js';
import { setupFieldGuide } from './fieldguide.js';
import { setupOstrichEggs } from './eggs.js';
import { setupThorns } from './thorns.js';
import { setupChimps } from './chimps.js';
import { setupMigration } from './migration.js';
import { setupSpears } from './spears.js';
import { selfTest } from './selftest.js';

world.afterEvents.worldLoad.subscribe(() => {
  setupBehaviours();
  setupDefences();
  setupFieldGuide();
  setupOstrichEggs();
  setupThorns();
  setupChimps();
  setupMigration();
  setupSpears();
  console.log('[Safari Animals] loaded');
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === 'safari:selftest') selfTest(event.message);
});
