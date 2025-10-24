import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GeneratedNode {
  type: "start" | "end" | "step" | "decision" | "delay" | "note";
  title: string;
  description?: string;
  duration?: string;
  position: { x: number; y: number };
}

interface GeneratedConnection {
  from: number; // index in nodes array
  to: number;
  label?: string;
}

interface GeneratedPlaybook {
  nodes: GeneratedNode[];
  connections: GeneratedConnection[];
}

export async function generatePlaybookWithAI(
  description: string,
  category?: string
): Promise<GeneratedPlaybook> {
  const systemPrompt = `You are an expert workflow designer for GTM Planetary LLC, specializing in creating implementation playbooks for trade and skill-based businesses.

Your task is to generate a complete workflow/playbook based on the user's description. The playbook should be practical, actionable, and tailored to small business operations.

Node Types Available:
- start: Beginning of the workflow (green circle)
- end: Completion point (red circle)
- step: Action item or task (blue rectangle)
- decision: Yes/No or conditional branch (yellow diamond)
- delay: Wait period or scheduled pause (orange circle)
- note: Important information or reminder (yellow sticky note)

Guidelines:
1. Always start with ONE "start" node
2. Always end with ONE "end" node
3. Use "step" nodes for actionable tasks
4. Use "decision" nodes for branching logic (e.g., "Approved?" → Yes/No paths)
5. Use "delay" nodes for waiting periods (e.g., "Wait 24 hours")
6. Use "note" nodes for important reminders or context
7. Keep workflows between 5-15 nodes for clarity
8. Position nodes in a top-to-bottom flow with 150px vertical spacing
9. For decision nodes, branch horizontally (±200px) then continue vertically

Return ONLY valid JSON in this exact format:
{
  "nodes": [
    {
      "type": "start",
      "title": "Start Title",
      "description": "Optional description",
      "duration": "Optional duration (e.g., '2 hours', '1 day')",
      "position": { "x": 400, "y": 100 }
    }
  ],
  "connections": [
    {
      "from": 0,
      "to": 1,
      "label": "Optional label for decision branches"
    }
  ]
}`;

  const userPrompt = `Create a ${category || "business"} workflow playbook for: ${description}

Make it practical and actionable for a small business owner. Include specific steps they can follow.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from AI");
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonText = content.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
    }

    const generated: GeneratedPlaybook = JSON.parse(jsonText);

    // Validate the structure
    if (!generated.nodes || !Array.isArray(generated.nodes)) {
      throw new Error("Invalid nodes structure");
    }
    if (!generated.connections || !Array.isArray(generated.connections)) {
      throw new Error("Invalid connections structure");
    }

    // Ensure we have start and end nodes
    const hasStart = generated.nodes.some((n) => n.type === "start");
    const hasEnd = generated.nodes.some((n) => n.type === "end");
    if (!hasStart || !hasEnd) {
      throw new Error("Workflow must have start and end nodes");
    }

    return generated;
  } catch (error) {
    console.error("AI Playbook Generation Error:", error);
    throw new Error(
      `Failed to generate playbook: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

