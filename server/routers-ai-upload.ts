import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getApiKey } from "./db-apikeys";
import { createPlatform } from "./db";
import { invokeLLM } from "./_core/llm";
import * as XLSX from "xlsx";

interface ExtractedPlatform {
  platform: string;
  useCase?: string;
  website?: string;
  costOwner: "Client" | "GTM Planetary" | "Both";
  status: "Active" | "Inactive" | "Cancelled";
  billingType?: "Monthly" | "Yearly" | "OneTime" | "Usage" | "Free Plan" | "Pay as you go";
  licenses?: string;
  monthlyAmount: number;
  yearlyAmount: number;
  oneTimeAmount: number;
  balanceUsage: number;
  renewalDate?: string;
  renewalDay?: number;
  isMyToolbelt: boolean;
  isInternalBusiness: boolean;
  isSolutionPartner: boolean;
  notesForManus?: string;
  notesForStaff?: string;
}

async function callAI(
  userId: number,
  provider: "openai" | "anthropic" | "ollama",
  prompt: string
): Promise<string> {
  const apiKeyData = await getApiKey(userId, provider);

  if (provider === "openai") {
    if (!apiKeyData?.apiKey) {
      throw new Error("OpenAI API key not configured. Please add it in Settings.");
    }
    
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts platform/subscription data from spreadsheets and returns structured JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0].message.content;
    return typeof content === "string" ? content : "";
  } else if (provider === "anthropic") {
    if (!apiKeyData?.apiKey) {
      throw new Error("Anthropic API key not configured. Please add it in Settings.");
    }

    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKeyData.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } else if (provider === "ollama") {
    const serverUrl = apiKeyData?.serverUrl || "http://localhost:11434";

    const response = await fetch(`${serverUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  throw new Error("Invalid AI provider");
}

export const aiUploadRouter = router({
  analyzeDocument: protectedProcedure
    .input(
      z.object({
        fileContent: z.string(), // Base64 encoded file
        fileName: z.string(),
        provider: z.enum(["openai", "anthropic", "ollama"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 and parse the file
        const buffer = Buffer.from(input.fileContent, "base64");
        let csvText = "";

        if (input.fileName.endsWith(".csv")) {
          csvText = buffer.toString("utf-8");
        } else if (
          input.fileName.endsWith(".xlsx") ||
          input.fileName.endsWith(".xls")
        ) {
          const workbook = XLSX.read(buffer, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          csvText = XLSX.utils.sheet_to_csv(worksheet);
        } else {
          throw new Error("Unsupported file format. Please upload CSV or Excel files.");
        }

        // Prepare AI prompt
        const prompt = `You are analyzing a spreadsheet containing technology platform/subscription data. Extract all platforms and return them as a JSON array.

Each platform should have these fields:
- platform (string, required): Name of the platform/tool
- useCase (string, optional): What the platform is used for
- website (string, optional): Website URL
- costOwner (string): "Client", "GTM Planetary", or "Both"
- status (string): "Active", "Inactive", or "Cancelled"
- billingType (string, optional): "Monthly", "Yearly", "OneTime", "Usage", "Free Plan", or "Pay as you go"
- licenses (string, optional): Number of licenses or user seats
- monthlyAmount (number): Monthly cost in cents (e.g., $10.50 = 1050)
- yearlyAmount (number): Yearly cost in cents
- oneTimeAmount (number): One-time cost in cents
- balanceUsage (number): Balance or usage cost in cents
- renewalDate (string, optional): ISO date format (YYYY-MM-DD)
- renewalDay (number, optional): Day of month for renewal (1-31)
- isMyToolbelt (boolean): Whether it's in "My Toolbelt"
- isInternalBusiness (boolean): Whether it's an internal business platform
- isSolutionPartner (boolean): Whether GTM Planetary is a solution partner
- notesForManus (string, optional): Notes for Manus
- notesForStaff (string, optional): Notes for GTM Planetary staff

Here's the spreadsheet data:
${csvText}

Return ONLY a valid JSON array of platforms. Do not include any markdown formatting or explanations.`;

        // Call AI to extract data
        const aiResponse = await callAI(ctx.user.id, input.provider, prompt);

        // Parse AI response
        let platforms: ExtractedPlatform[];
        try {
          // Remove markdown code blocks if present
          const jsonText = aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          platforms = JSON.parse(jsonText);
        } catch (e) {
          throw new Error("Failed to parse AI response. Please try again or use a different AI provider.");
        }

        // Insert platforms into database
        let imported = 0;
        let errors = 0;

        for (const platform of platforms) {
          try {
            await createPlatform({
              userId: ctx.user.id,
              platform: platform.platform,
              useCase: platform.useCase,
              website: platform.website,
              costOwner: platform.costOwner,
              status: platform.status,
              billingType: platform.billingType,
              licenses: platform.licenses,
              monthlyAmount: platform.monthlyAmount,
              yearlyAmount: platform.yearlyAmount,
              oneTimeAmount: platform.oneTimeAmount,
              balanceUsage: platform.balanceUsage,
              renewalDate: platform.renewalDate ? new Date(platform.renewalDate) : undefined,
              renewalDay: platform.renewalDay,
              isMyToolbelt: platform.isMyToolbelt,
              isInternalBusiness: platform.isInternalBusiness,
              isSolutionPartner: platform.isSolutionPartner,
              notesForManus: platform.notesForManus,
              notesForStaff: platform.notesForStaff,
            });
            imported++;
          } catch (error) {
            console.error(`Failed to import platform ${platform.platform}:`, error);
            errors++;
          }
        }

        return {
          success: true,
          imported,
          errors,
          total: platforms.length,
        };
      } catch (error: any) {
        throw new Error(error.message || "Failed to analyze document");
      }
    }),
});

