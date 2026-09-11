// Sir Charles's locked tutorial cards (design.md §8.3, "the House deck").
// Canonical definition lives in src/cards/data/ (plan step 1.5); re-exported
// here since the engine tests use these to replay design.md §13.2's
// scripted round 1.

export {
  apprenticeFitter,
  boilerHand,
  riveter,
  brassCog,
  steamHammer,
  foremanGudgeon,
  differenceEngine,
  sabotage,
} from "../../../../src/cards/data/families/foundry.ts";
export { theConcertinaWorks } from "../../../../src/cards/data/locations.ts";
