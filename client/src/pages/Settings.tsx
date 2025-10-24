import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Key, Users, Settings2, Blocks } from "lucide-react";
import { CustomizationSettings } from "@/components/CustomizationSettings";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");

  const saveApiKeyMutation = trpc.settings.saveApiKey.useMutation({
    onSuccess: () => {
      toast.success("API key saved successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save API key");
    },
  });

  const handleSaveOpenAI = () => {
    if (!openaiKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    saveApiKeyMutation.mutate({
      provider: "openai",
      apiKey: openaiKey,
    });
  };

  const handleSaveAnthropic = () => {
    if (!anthropicKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }
    saveApiKeyMutation.mutate({
      provider: "anthropic",
      apiKey: anthropicKey,
    });
  };

  const handleSaveOllama = () => {
    if (!ollamaUrl.trim()) {
      toast.error("Please enter a server URL");
      return;
    }
    saveApiKeyMutation.mutate({
      provider: "ollama",
      serverUrl: ollamaUrl,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your API keys and user accounts
        </p>
      </div>

      <Tabs defaultValue="customization" className="w-full">
        <TabsList>
          <TabsTrigger value="customization">
            <Settings2 className="h-4 w-4 mr-2" />
            Customization
          </TabsTrigger>
          <TabsTrigger value="module-builder">
            <Blocks className="h-4 w-4 mr-2" />
            Module Builder
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customization">
          <CustomizationSettings />
        </TabsContent>

        <TabsContent value="module-builder">
          <Card>
            <CardHeader>
              <CardTitle>Module Builder</CardTitle>
              <CardDescription>
                Create custom data collection modules with dynamic forms and fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The Module Builder allows you to create custom forms for collecting structured data.
                  Build modules for client intake, project tracking, assessments, or any custom workflow.
                </p>
                <Button onClick={() => setLocation("/module-builder")}>
                  <Blocks className="mr-2 h-4 w-4" />
                  Open Module Builder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Provider API Keys</CardTitle>
              <CardDescription>
                Configure API keys for AI-powered document analysis. These keys are encrypted and stored securely.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OpenAI */}
              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="openai-key"
                      type={showOpenAI ? "text" : "password"}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenAI(!showOpenAI)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showOpenAI ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={handleSaveOpenAI}
                    disabled={saveApiKeyMutation.isPending}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              {/* Anthropic */}
              <div className="space-y-2">
                <Label htmlFor="anthropic-key">Anthropic (Claude) API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="anthropic-key"
                      type={showAnthropic ? "text" : "password"}
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      placeholder="sk-ant-..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnthropic(!showAnthropic)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showAnthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={handleSaveAnthropic}
                    disabled={saveApiKeyMutation.isPending}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://console.anthropic.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Anthropic Console
                  </a>
                </p>
              </div>

              {/* Ollama */}
              <div className="space-y-2">
                <Label htmlFor="ollama-url">Ollama Server URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="ollama-url"
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                  />
                  <Button
                    onClick={handleSaveOllama}
                    disabled={saveApiKeyMutation.isPending}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your Ollama server URL for local LLMs (Mistral, Llama, etc.). Default: http://localhost:11434
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                User management features coming soon. Currently, all users are authenticated via Manus OAuth.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

