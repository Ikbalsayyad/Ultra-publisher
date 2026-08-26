/**
 * UltraMinds Publishing Compiler — AI Role Boundaries Engine
 * 
 * CORE ARCHITECTURAL PRINCIPLE:
 * The AI is NOT an AI writer. The AI is a PUBLISHING COMPILER ASSISTANT.
 * 
 * Strict Role Boundaries:
 * ROLE A — CONTENT ANALYSIS: Generates structural metadata, section classification, visual hints.
 * ROLE B — DESIGN PLANNING: Generates layout plans (grid columns, cards, image placement). Output is JSON layout plan referencing element IDs.
 * ROLE C — QUALITY INSPECTION: Inspects visual page render, returns structured diagnostic issue reports.
 * 
 * RULE: AI is prohibited from modifying, paraphrasing, summarizing, or generating curriculum source text.
 */

(function() {
  'use strict';

  window.AIRoleBoundary = {

    /**
     * Role A: Content Analysis Prompt Construction
     */
    buildRoleAPrompt(manifest) {
      return `
You are operating strictly in ROLE A: CONTENT STRUCTURE ANALYSIS.
Analyze this Content Manifest and output STRUCTURAL METADATA ONLY.

RULES:
1. Do NOT rewrite, summarize, or modify any curriculum text.
2. Return a JSON object with section classifications, diagram opportunities, and suggested column layouts.
3. Every suggestion must reference existing element IDs.

MANIFEST:
${JSON.stringify(manifest, null, 2)}
`;
    },

    /**
     * Role B: Design Planning Prompt Construction
     */
    buildRoleBPrompt(manifest, availableLayouts) {
      return `
You are operating strictly in ROLE B: DESIGN & LAYOUT PLANNING.
Your goal is to map Content Manifest element IDs into a visually stunning, multi-page print layout plan.

RULES:
1. Do NOT generate or rewrite any curriculum prose or technical values.
2. Return a JSON object containing page allocations and card container types.
3. If content height exceeds page budget, CREATE MORE PAGES. Never remove or truncate content.
4. Output must be a pure LAYOUT PLAN referencing element IDs.

MANIFEST & ELEMENT IDS:
${JSON.stringify(manifest.elements, null, 2)}
`;
    },

    /**
     * Role C: Visual Quality Inspection Prompt Construction
     */
    buildRoleCPrompt(visualQAReport) {
      return `
You are operating strictly in ROLE C: VISUAL QUALITY INSPECTION.
Analyze the rendered page geometry and visual QA metrics.

RULES:
1. Identify clipping, overflow, overlapping elements, or orphan headings.
2. Return a structured array of issues:
   [
     {
       "page": 2,
       "elementId": "M01.STEP.005",
       "issue": "Text clipping at bottom boundary",
       "severity": "CRITICAL",
       "recommendedLayoutAction": "Push element M01.STEP.005 to next page"
     }
   ]
3. NEVER suggest rewriting or shortening curriculum text.

VISUAL QA METRICS:
${JSON.stringify(visualQAReport, null, 2)}
`;
    },

    /**
     * Enforces Role Boundaries on AI Response Payload
     */
    validateAIOutput(role, responseData, canonicalSource) {
      if (!responseData || typeof responseData !== 'object') {
        return { valid: false, reason: "AI response is not a valid JSON object." };
      }

      // Check if AI attempted to rewrite curriculum text
      if (responseData.rewrittenText || responseData.summarizedContent) {
        return {
          valid: false,
          reason: "VIOLATION OF ROLE BOUNDARY: AI attempted to rewrite or summarize curriculum source content."
        };
      }

      return { valid: true };
    }
  };

  console.log("✅ AIRoleBoundary Engine Loaded.");
})();
