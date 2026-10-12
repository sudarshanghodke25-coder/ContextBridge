/**
 * ContextBridge Deterministic Extraction Engine
 * Extracts structured facts, code blocks, errors, decisions, requirements,
 * technical context, next actions, and timeline milestones from normalized messages.
 */

import { FactCategories, ReviewStatuses } from './types.js';
import { generateId } from './normalize.js';

/**
 * Extract fenced code blocks with language and message provenance
 */
export function extractCodeBlocks(messages) {
  const codeBlocks = [];
  const codeFenceRegex = /```([a-zA-Z0-9_\-+]*)\n([\s\S]*?)```/g;

  messages.forEach(msg => {
    let match;
    while ((match = codeFenceRegex.exec(msg.content)) !== null) {
      const language = match[1].trim() || 'plaintext';
      const code = match[2].trim();
      if (code) {
        codeBlocks.push({
          id: generateId('code'),
          language,
          code,
          lineCount: code.split('\n').length,
          sourceMessageId: msg.id,
          sequence: msg.sequence,
          role: msg.role
        });
      }
    }
  });

  return codeBlocks;
}

/**
 * Extract error logs and stack traces
 */
export function extractErrors(messages) {
  const errors = [];
  const errorIndicators = [
    /(?:error|exception|traceback|failed|fatal|uncaught|typeerror|referenceerror|syntaxerror):\s*([^\n]+)/i,
    /(?:Status code|HTTP)\s*([45]\d\d[^\n]*)/i,
    /(?:Unhandled rejection|Panic):\s*([^\n]+)/i
  ];

  messages.forEach(msg => {
    const lines = msg.content.split('\n');
    lines.forEach((line, index) => {
      for (const regex of errorIndicators) {
        const match = line.match(regex);
        if (match) {
          const contextLines = lines.slice(Math.max(0, index - 1), Math.min(lines.length, index + 3)).join('\n');
          errors.push({
            id: generateId('err'),
            snippet: match[0].trim(),
            context: contextLines.trim(),
            sourceMessageId: msg.id,
            sequence: msg.sequence
          });
          break;
        }
      }
    });
  });

  return errors;
}

/**
 * Extract project goal from conversation
 */
export function extractGoal(messages) {
  const userMessages = messages.filter(m => m.role === 'user');
  if (userMessages.length === 0) return { text: '', sourceMessageId: null };

  const goalPatterns = [
    /(?:i want to|i need to|we need to|building|goal is|objective is|project is to|trying to)\s+([^.\n]+)/i,
    /^(?:goal|objective|aim):\s*([^\n]+)/im
  ];

  for (const msg of userMessages) {
    for (const pattern of goalPatterns) {
      const match = msg.content.match(pattern);
      if (match) {
        return {
          text: match[0].trim(),
          sourceMessageId: msg.id
        };
      }
    }
  }

  // Fallback to the first line or first 140 chars of the very first user message
  const firstMsg = userMessages[0];
  const firstLine = firstMsg.content.split('\n')[0].replace(/^[#\-*\s]+/, '').trim();
  const summary = firstLine.length > 140 ? firstLine.substring(0, 137) + '...' : firstLine;
  
  return {
    text: summary,
    sourceMessageId: firstMsg.id
  };
}

/**
 * Extract key architectural and technical decisions
 */
export function extractDecisions(messages) {
  const decisions = [];
  const decisionRegex = /(?:decided to|choose|chosen|settled on|using\s+[\w\s]+\s+instead of|architecture:|decision:)\s*([^\n.]+)/gi;

  messages.forEach(msg => {
    let match;
    while ((match = decisionRegex.exec(msg.content)) !== null) {
      const text = match[0].trim();
      if (text.length > 10 && !decisions.some(d => d.text.toLowerCase() === text.toLowerCase())) {
        decisions.push({
          id: generateId('dec'),
          text: text.charAt(0).toUpperCase() + text.slice(1),
          sourceMessageId: msg.id,
          sequence: msg.sequence
        });
      }
    }
  });

  return decisions;
}

/**
 * Extract requirements and constraints
 */
export function extractRequirements(messages) {
  const requirements = [];
  const reqRegex = /(?:must\s+(?:have|be|support|allow|ensure)|should\s+(?:have|be|support)|requirement:\s*|must not|required to)\s*([^\n.]+)/gi;

  messages.forEach(msg => {
    let match;
    while ((match = reqRegex.exec(msg.content)) !== null) {
      const text = match[0].trim();
      if (text.length > 8 && !requirements.some(r => r.text.toLowerCase() === text.toLowerCase())) {
        requirements.push({
          id: generateId('req'),
          text: text.charAt(0).toUpperCase() + text.slice(1),
          sourceMessageId: msg.id,
          sequence: msg.sequence
        });
      }
    }
  });

  return requirements;
}

/**
 * Extract technical context (technologies, frameworks, databases, tools)
 */
export function extractTechnicalContext(messages) {
  const knownTech = [
    'JavaScript', 'TypeScript', 'Node.js', 'React', 'Vue', 'Vite', 'Next.js',
    'Python', 'FastAPI', 'Flask', 'Django', 'PostgreSQL', 'SQLite', 'MongoDB',
    'Redis', 'IndexedDB', 'Docker', 'Kubernetes', 'Chrome Extension', 'Manifest V3',
    'HTML5', 'CSS3', 'TailwindCSS', 'REST API', 'GraphQL', 'WebSockets', 'WebWorkers'
  ];

  const foundTech = new Set();
  const allContent = messages.map(m => m.content).join(' ');

  knownTech.forEach(tech => {
    const regex = new RegExp(`\\b${tech.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(allContent)) {
      foundTech.add(tech);
    }
  });

  return Array.from(foundTech);
}

/**
 * Extract open questions and risks
 */
export function extractOpenQuestions(messages) {
  const questions = [];
  const questionRegex = /(?:how (?:do|can|should) we|is it possible to|need to decide|unclear if|question:)\s*([^\n?]+)\?/gi;

  messages.forEach(msg => {
    let match;
    while ((match = questionRegex.exec(msg.content)) !== null) {
      const text = match[0].trim();
      if (text.length > 12 && !questions.some(q => q.text.toLowerCase() === text.toLowerCase())) {
        questions.push({
          id: generateId('q'),
          text: text.charAt(0).toUpperCase() + text.slice(1),
          sourceMessageId: msg.id,
          sequence: msg.sequence
        });
      }
    }
  });

  return questions;
}

/**
 * Extract concrete next actions / tasks
 */
export function extractNextActions(messages) {
  const actions = [];
  const actionRegex = /(?:next steps?:?|todo:?|action items?:?|let's now|we should now|proceed with)\s*([^\n.]+)/gi;

  // Look in the last 4 messages especially
  const recentMessages = messages.slice(-5);
  recentMessages.forEach(msg => {
    let match;
    while ((match = actionRegex.exec(msg.content)) !== null) {
      const text = match[0].trim();
      if (text.length > 8 && !actions.some(a => a.text.toLowerCase() === text.toLowerCase())) {
        actions.push({
          id: generateId('act'),
          text: text.charAt(0).toUpperCase() + text.slice(1),
          sourceMessageId: msg.id,
          sequence: msg.sequence
        });
      }
    }

    // Also look for numbered lists in the final message
    const numberedListRegex = /^\s*(?:\d+\.|\-|\*)\s+(.+)$/gm;
    let listMatch;
    while ((listMatch = numberedListRegex.exec(msg.content)) !== null) {
      const line = listMatch[1].trim();
      if (line.length > 10 && line.length < 120 && /^(?:implement|create|build|test|verify|fix|update|add|write)/i.test(line)) {
        if (!actions.some(a => a.text.toLowerCase() === line.toLowerCase())) {
          actions.push({
            id: generateId('act'),
            text: line,
            sourceMessageId: msg.id,
            sequence: msg.sequence
          });
        }
      }
    }
  });

  return actions;
}

/**
 * Extract Project State Timeline Milestones
 * Signature feature: extracts chronologically ordered milestones with provenance
 */
export function extractMilestones(messages) {
  const milestones = [];

  // 1. Goal milestone
  const goal = extractGoal(messages);
  if (goal.text) {
    milestones.push({
      id: generateId('m_goal'),
      title: 'Project Goal Defined',
      summary: goal.text,
      category: FactCategories.GOAL,
      sourceMessageId: goal.sourceMessageId,
      sequence: 1,
      pinned: true,
      reviewStatus: ReviewStatuses.ACCEPTED
    });
  }

  // 2. Decisions milestones
  const decisions = extractDecisions(messages);
  decisions.forEach((dec, idx) => {
    milestones.push({
      id: generateId(`m_dec_${idx}`),
      title: 'Architecture & Choice',
      summary: dec.text,
      category: FactCategories.DECISION,
      sourceMessageId: dec.sourceMessageId,
      sequence: dec.sequence,
      pinned: false,
      reviewStatus: ReviewStatuses.NEEDS_REVIEW
    });
  });

  // 3. Key errors & solutions
  const errors = extractErrors(messages);
  if (errors.length > 0) {
    const firstErr = errors[0];
    milestones.push({
      id: generateId('m_err'),
      title: 'Error Encountered / Debugged',
      summary: firstErr.snippet,
      category: FactCategories.ERROR,
      sourceMessageId: firstErr.sourceMessageId,
      sequence: firstErr.sequence,
      pinned: false,
      reviewStatus: ReviewStatuses.NEEDS_REVIEW
    });
  }

  // 4. Requirements milestone
  const requirements = extractRequirements(messages);
  if (requirements.length > 0) {
    milestones.push({
      id: generateId('m_req'),
      title: 'Key Requirement Specified',
      summary: requirements[0].text,
      category: FactCategories.REQUIREMENT,
      sourceMessageId: requirements[0].sourceMessageId,
      sequence: requirements[0].sequence,
      pinned: false,
      reviewStatus: ReviewStatuses.NEEDS_REVIEW
    });
  }

  // 5. Next task milestone
  const nextActions = extractNextActions(messages);
  if (nextActions.length > 0) {
    milestones.push({
      id: generateId('m_act'),
      title: 'Current / Next Task',
      summary: nextActions[0].text,
      category: FactCategories.NEXT_ACTION,
      sourceMessageId: nextActions[0].sourceMessageId,
      sequence: nextActions[0].sequence,
      pinned: true,
      reviewStatus: ReviewStatuses.ACCEPTED
    });
  }

  // Sort milestones by message sequence
  milestones.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

  return milestones;
}
