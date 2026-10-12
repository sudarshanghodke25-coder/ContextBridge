/**
 * ContextBridge JSON Exporter & Importer Validator
 * Exports conversation and brief data in versioned, portable JSON format.
 */

export function exportToJSON(conversation, brief = null) {
  const exportPayload = {
    schemaVersion: 1,
    app: 'ContextBridge',
    exportedAt: new Date().toISOString(),
    conversation: {
      id: conversation.id,
      title: conversation.title,
      provider: conversation.provider,
      sourceUrl: conversation.sourceUrl || '',
      captureMethod: conversation.captureMethod || 'manual',
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messageCount: conversation.messages?.length || 0,
      messages: conversation.messages || []
    },
    brief: brief ? {
      id: brief.id,
      title: brief.title,
      mode: brief.mode,
      sections: brief.sections,
      milestones: brief.milestones || [],
      sizeEstimate: brief.sizeEstimate
    } : null
  };

  return JSON.stringify(exportPayload, null, 2);
}

export function validateAndParseJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'JSON payload is not an object.' };
    }

    // Check if it's a ContextBridge export
    if (data.app === 'ContextBridge' && data.conversation) {
      return {
        valid: true,
        type: 'contextbridge',
        conversation: data.conversation,
        brief: data.brief
      };
    }

    // Check if it's an array of messages
    if (Array.isArray(data)) {
      return {
        valid: true,
        type: 'messages_array',
        rawMessages: data
      };
    }

    // Check if it has a messages field
    if (Array.isArray(data.messages)) {
      return {
        valid: true,
        type: 'messages_wrapper',
        rawMessages: data.messages,
        title: data.title || 'Imported Chat'
      };
    }

    return { valid: false, error: 'Unrecognized JSON structure for conversation data.' };
  } catch (err) {
    return { valid: false, error: `Invalid JSON syntax: ${err.message}` };
  }
}
