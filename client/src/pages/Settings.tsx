import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Key, Users, Settings2, Blocks, CreditCard, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSubscription } from "@/hooks/useSubscription";
import { CustomizationSettings } from "@/components/CustomizationSettings";
import { BillingSettings } from "@/components/BillingSettings";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [showOpenAI, setShowOpenAI] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  
  const [openaiKey, setOpenaiKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  
  // LLM Settings
  const [useCustomLLM, setUseCustomLLM] = useState(false);
  const [llmProvider, setLlmProvider] = useState<"openai" | "anthropic" | "ollama">("openai");
  const [llmModel, setLlmModel] = useState("");
  
  const { data: llmSettings } = trpc.settings.getLLMSettings.useQuery();
  
  // Load LLM settings when available
  useEffect(() => {
    if (llmSettings) {
      setUseCustomLLM(llmSettings.useCustomLLM);
      if (llmSettings.provider) setLlmProvider(llmSettings.provider as any);
      if (llmSettings.model) setLlmModel(llmSettings.model);
    }
  }, [llmSettings]);

  const saveLLMSettingsMutation = trpc.settings.saveLLMSettings.useMutation({
    onSuccess: () => {
      toast.success("LLM settings saved successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save LLM settings");
    },
  });
  
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
  
  const handleSaveLLMSettings = () => {
    saveLLMSettingsMutation.mutate({
      useCustomLLM,
      provider: useCustomLLM ? llmProvider : undefined,
      model: useCustomLLM && llmModel.trim() ? llmModel : undefined,
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
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
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

        <TabsContent value="billing">
          <BillingSettings />
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
          {/* Advanced LLM Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                LLM Configuration
              </CardTitle>
              <CardDescription>
                By default, all AI features use the built-in Manus Forge API. Enable custom LLM to use your own API keys.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Use Custom LLM Toggle */}
              <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="use-custom-llm" className="text-base font-medium">
                    Use Custom LLM
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to use your own OpenAI, Anthropic, or Ollama API keys instead of the built-in Forge API
                  </p>
                </div>
                <Switch
                  id="use-custom-llm"
                  checked={useCustomLLM}
                  onCheckedChange={setUseCustomLLM}
                />
              </div>
              
              {/* Custom LLM Settings (only show when enabled) */}
              {useCustomLLM && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <Label htmlFor="llm-provider">Provider</Label>
                    <Select value={llmProvider} onValueChange={(v: any) => setLlmProvider(v)}>
                      <SelectTrigger id="llm-provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="ollama">Ollama (Local)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="llm-model">Model</Label>
                    <Input
                      id="llm-model"
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      placeholder={
                        llmProvider === "openai" ? "gpt-4o, gpt-4-turbo, gpt-3.5-turbo" :
                        llmProvider === "anthropic" ? "claude-3-5-sonnet-20241022, claude-3-opus-20240229" :
                        "llama2, mistral, codellama"
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {llmProvider === "openai" && "Enter the OpenAI model name (e.g., gpt-4o)"}
                      {llmProvider === "anthropic" && "Enter the Anthropic model name (e.g., claude-3-5-sonnet-20241022)"}
                      {llmProvider === "ollama" && "Enter the Ollama model name (e.g., llama2)"}
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleSaveLLMSettings}
                    disabled={saveLLMSettingsMutation.isPending}
                    className="w-full"
                  >
                    {saveLLMSettingsMutation.isPending ? "Saving..." : "Save LLM Configuration"}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Make sure to configure your API keys below before using custom LLM
                  </p>
                </div>
              )}
              
              {!useCustomLLM && (
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✓ Using built-in Manus Forge API (Gemini 2.5 Flash) - No setup required
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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

