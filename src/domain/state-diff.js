/**
 * ContextBridge State Diff & Evidence Review Engine
 * Signature interaction: Compares previously approved project state against
 * new incoming conversation facts to detect New, Changed, Conflicting, or Outdated facts.
 */

import { DiffKinds, ReviewStatuses } from './types.js';
import { generateId } from './normalize.js';

/**
 * Calculates similarity between two text strings using Jaccard token overlap
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = new Set(str1.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));
  const s2 = new Set(str2.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean));
  if (s1.size === 0 || s2.size === 0) return 0;

  const intersection = new Set([...s1].filter(x => s2.has(x)));
  const union = new Set([...s1, ...s2]);
  return intersection.size / union.size;
}

/**
 * Checks for direct conflict or contradiction indicators
 */
function areInConflict(statement1, statement2) {
  const s1 = statement1.toLowerCase();
  const s2 = statement2.toLowerCase();

  // If one says "use X" and other says "do not use X" or "replace X"
  const conflictPairs = [
    { pos: /use\s+(\w+)/i, neg: /(?:don't use|do not use|avoid|replace)\s+(\w+)/i },
    { pos: /(?:enable|support)\s+(\w+)/i, neg: /(?:disable|remove)\s+(\w+)/i },
    { pos: /client-side|frontend/i, neg: /server-side|backend/i },
    { pos: /sqlite/i, neg: /postgres|mysql|mongodb/i }
  ];

  for (const pair of conflictPairs) {
    if ((pair.pos.test(s1) && pair.neg.test(s2)) || (pair.pos.test(s2) && pair.neg.test(s1))) {
      return true;
    }
  }

  return false;
}

/**
 * Computes state diff between previous project facts and proposed incoming facts
 * @param {Array<ProjectFact>} previousFacts 
 * @param {Array<ProjectFact>} proposedFacts 
 * @returns {Array<StateDiffItem>} List of diff items with evidence
 */
export function computeStateDiff(previousFacts = [], proposedFacts = []) {
  const diffItems = [];
  const matchedPreviousIds = new Set();

  for (const proposed of proposedFacts) {
    let bestMatch = null;
    let highestSim = 0;

    for (const prev of previousFacts) {
      if (prev.category === proposed.category) {
        const sim = calculateSimilarity(prev.statement, proposed.statement);
        if (sim > highestSim) {
          highestSim = sim;
          bestMatch = prev;
        }
      }
    }

    if (bestMatch && highestSim > 0.85) {
      // Virtually identical: already established fact
      matchedPreviousIds.add(bestMatch.id);
      // If pinned, preserve pinned status
      if (bestMatch.reviewStatus === ReviewStatuses.PINNED) {
        proposed.reviewStatus = ReviewStatuses.PINNED;
      }
    } else if (bestMatch && (areInConflict(bestMatch.statement, proposed.statement) || highestSim > 0.4)) {
      matchedPreviousIds.add(bestMatch.id);
      const isConflict = areInConflict(bestMatch.statement, proposed.statement);
      diffItems.push({
        id: generateId('diff'),
        kind: isConflict ? DiffKinds.POSSIBLE_CONFLICT : DiffKinds.CHANGED,
        previousFact: bestMatch,
        proposedFact: proposed,
        reviewStatus: proposed.reviewStatus || ReviewStatuses.NEEDS_REVIEW,
        reason: isConflict 
          ? 'Potential conflict detected between previously accepted statement and new statement.' 
          : 'Refinement or modification to existing project fact.'
      });
    } else {
      // Brand new fact
      diffItems.push({
        id: generateId('diff'),
        kind: DiffKinds.NEW,
        previousFact: null,
        proposedFact: proposed,
        reviewStatus: proposed.reviewStatus || ReviewStatuses.NEEDS_REVIEW,
        reason: 'New fact discovered in conversation.'
      });
    }
  }

  // Check for previous facts that were not matched at all and might be outdated
  for (const prev of previousFacts) {
    if (!matchedPreviousIds.has(prev.id)) {
      if (prev.category === 'next-action') {
        diffItems.push({
          id: generateId('diff'),
          kind: DiffKinds.POSSIBLY_OUTDATED,
          previousFact: prev,
          proposedFact: null,
          reviewStatus: ReviewStatuses.NEEDS_REVIEW,
          reason: 'Previous task was not mentioned in the latest discussion and may be completed or replaced.'
        });
      }
    }
  }

  return diffItems;
}
