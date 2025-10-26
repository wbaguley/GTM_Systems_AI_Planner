import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserSops, getSopById, createSop, updateSop, deleteSop } from "../db";
import { storagePut } from "../storage";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

// Helper to generate random suffix for file keys
function randomSuffix() {
  return Math.random().toString(36).substring(2, 15);
}

// Helper to extract text from PDF using LLM vision
async function extractTextFromFile(fileUrl: string, fileName: string): Promise<string> {
  const fileExt = fileName.toLowerCase().split('.').pop();
  
  // For PDFs and images, use LLM with file_url content type
  if (fileExt === 'pdf' || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
    const mimeType = fileExt === 'pdf' ? 'application/pdf' : 
                     fileExt === 'png' ? 'image/png' :
                     fileExt === 'gif' ? 'image/gif' :
                     fileExt === 'webp' ? 'image/webp' : 'image/jpeg';
    
      const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a document analysis assistant. Extract all text content from the provided document. Preserve structure, headings, and formatting as much as possible. If it's a mind map or diagram, describe the structure and relationships."
        },
        {
          role: "user",
          content: [
            {
              type: "file_url" as const,
              file_url: {
                url: fileUrl,
                mime_type: mimeType as any
              }
            },
            {
              type: "text" as const,
              text: "Please extract all text and content from this document."
            }
          ]
        }
      ]
    });
    
    const content = response.choices[0]?.message?.content;
    if (typeof content === 'string') {
      return content;
    } else if (Array.isArray(content)) {
      // Extract text from content array
      return content.map(part => {
        if ('text' in part) return part.text;
        return '';
      }).join('\n');
    }
    return "";
  }
  
  // For text files, we'd need to fetch and read them
  // For now, return a message indicating manual processing needed
  return `Document uploaded: ${fileName}. Please provide the content you'd like to convert to an SOP.`;
}

// Helper to generate SOP from extracted content
async function generateSopFromContent(content: string, fileName: string): Promise<{ title: string; sop: string }> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an expert at creating Standard Operating Procedures (SOPs). Convert the provided content into a well-structured SOP with:
1. A clear title
2. Purpose/Overview section
3. Scope
4. Step-by-step procedures with numbered steps
5. Roles and responsibilities (if applicable)
6. Required materials/tools (if applicable)
7. Quality checks or success criteria

Format the SOP in clean Markdown.`
      },
      {
        role: "user",
        content: `Source document: ${fileName}\n\nContent:\n${content}\n\nPlease create a comprehensive SOP from this content.`
      }
    ]
  });
  
  const rawContent = response.choices[0]?.message?.content;
  let sopContent = "";
  if (typeof rawContent === 'string') {
    sopContent = rawContent;
  } else if (Array.isArray(rawContent)) {
    sopContent = rawContent.map(part => {
      if ('text' in part) return part.text;
      return '';
    }).join('\n');
  }
  
  // Extract title from the SOP (first # heading)
  const titleMatch = sopContent.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : `SOP: ${fileName.replace(/\.[^/.]+$/, "")}`;
  
  return { title, sop: sopContent };
}

export const sopRouter = router({
  // List all SOPs for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserSops(ctx.user.id);
  }),
  
  // Get a specific SOP
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const sop = await getSopById(input.id, ctx.user.id);
      if (!sop) {
        throw new TRPCError({ code: "NOT_FOUND", message: "SOP not found" });
      }
      return sop;
    }),
  
  // Generate SOP from text description
  generateFromDescription: protectedProcedure
    .input(z.object({
      description: z.string(),
      title: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Generate SOP from description
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are an expert at creating Standard Operating Procedures (SOPs). Create a well-structured SOP based on the user's description with:
1. A clear title (if not provided)
2. Purpose/Overview section
3. Scope
4. Step-by-step procedures with numbered steps
5. Roles and responsibilities (if applicable)
6. Required materials/tools (if applicable)
7. Quality checks or success criteria

Format the SOP in clean Markdown.`
          },
          {
            role: "user",
            content: `Create an SOP for: ${input.description}`
          }
        ]
      });
      
      const rawContent = response.choices[0]?.message?.content;
      let sopContent = "";
      if (typeof rawContent === 'string') {
        sopContent = rawContent;
      } else if (Array.isArray(rawContent)) {
        sopContent = rawContent.map(part => {
          if ('text' in part) return part.text;
          return '';
        }).join('\n');
      }
      
      // Extract title from the SOP or use provided title
      const titleMatch = sopContent.match(/^#\s+(.+)$/m);
      const finalTitle = input.title || (titleMatch ? titleMatch[1] : "New SOP");
      
      // Save to database
      await createSop({
        userId: ctx.user.id,
        title: finalTitle,
        content: sopContent,
        chatHistory: JSON.stringify([
          { role: "system", content: "SOP generated from user description." },
          { role: "user", content: input.description },
          { role: "assistant", content: sopContent }
        ])
      });
      
      // Get the newly created SOP
      const sops = await getUserSops(ctx.user.id);
      const newSop = sops[0]; // Most recent one
      
      return {
        success: true,
        sopId: newSop?.id || 0,
        title: finalTitle,
        content: sopContent
      };
    }),
  
  // Upload file and generate initial SOP
  uploadAndGenerate: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileData: z.string(), // base64 encoded file data
      mimeType: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Upload file to S3
      const fileKey = `sop-sources/${ctx.user.id}/${input.fileName}-${randomSuffix()}`;
      const buffer = Buffer.from(input.fileData, 'base64');
      
      const { url: fileUrl } = await storagePut(fileKey, buffer, input.mimeType);
      
      // Extract text from file
      const extractedContent = await extractTextFromFile(fileUrl, input.fileName);
      
      // Generate SOP from extracted content
      const { title, sop } = await generateSopFromContent(extractedContent, input.fileName);
      
      // Save to database
      await createSop({
        userId: ctx.user.id,
        title,
        content: sop,
        sourceFileName: input.fileName,
        sourceFileUrl: fileUrl,
        sourceFileKey: fileKey,
        chatHistory: JSON.stringify([
          { role: "system", content: "SOP generated from uploaded document." },
          { role: "assistant", content: sop }
        ])
      });
      
      // Get the newly created SOP
      const sops = await getUserSops(ctx.user.id);
      const newSop = sops[0]; // Most recent one
      
      return {
        success: true,
        sopId: newSop?.id || 0,
        title,
        content: sop
      };
    }),
  
  // Chat to refine SOP
  chat: protectedProcedure
    .input(z.object({
      sopId: z.number(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const sop = await getSopById(input.sopId, ctx.user.id);
      if (!sop) {
        throw new TRPCError({ code: "NOT_FOUND", message: "SOP not found" });
      }
      
      // Parse existing chat history
      const chatHistory = sop.chatHistory ? JSON.parse(sop.chatHistory) : [];
      
      // Add user message
      chatHistory.push({ role: "user", content: input.message });
      
      // Get AI response
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are an expert SOP editor. Help refine and improve the SOP based on user feedback. Always return the complete updated SOP in Markdown format."
          },
          {
            role: "user",
            content: `Current SOP:\n\n${sop.content}\n\nUser request: ${input.message}\n\nPlease provide the updated SOP.`
          }
        ]
      });
      
      const rawResponse = response.choices[0]?.message?.content;
      let updatedContent = sop.content;
      if (typeof rawResponse === 'string') {
        updatedContent = rawResponse;
      } else if (Array.isArray(rawResponse)) {
        updatedContent = rawResponse.map(part => {
          if ('text' in part) return part.text;
          return '';
        }).join('\n');
      }
      
      // Add assistant response to history
      chatHistory.push({ role: "assistant", content: updatedContent });
      
      // Update SOP
      await updateSop(input.sopId, ctx.user.id, {
        content: updatedContent,
        chatHistory: JSON.stringify(chatHistory)
      });
      
      return {
        success: true,
        content: updatedContent,
        message: "SOP updated successfully"
      };
    }),
  
  // Update SOP manually
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateSop(id, ctx.user.id, data);
      return { success: true };
    }),
  
  // Delete SOP
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteSop(input.id, ctx.user.id);
      return { success: true };
    }),
});

