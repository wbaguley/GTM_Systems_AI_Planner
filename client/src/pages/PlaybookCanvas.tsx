import { useCallback, useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  MarkerType,
  EdgeTypes,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import "./playbook-canvas-styles.css";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  ArrowLeft,
  Save,
  Plus,
  FileDown,
  Trash2,
  Square,
  Circle,
  Diamond,
  Hexagon,
  Triangle,
  Star,
  Sparkles,
  StickyNote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { toast } from "sonner";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";

// Custom node components with (+) connection handles
const StartNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-full bg-green-500 text-white border-2 border-green-600 relative">
    <Handle type="source" position={Position.Top} />
    <Handle type="source" position={Position.Right} />
    <Handle type="source" position={Position.Bottom} />
    <Handle type="source" position={Position.Left} />
    <div className="font-bold">Start</div>
    <div className="text-xs">{data.label}</div>
  </div>
);

const StepNode = ({ data }: any) => (
  <div className="px-4 py-3 shadow-md rounded-lg bg-blue-500 text-white border-2 border-blue-600 min-w-[200px] relative">
    <Handle type="target" position={Position.Top} />
    <Handle type="target" position={Position.Right} />
    <Handle type="target" position={Position.Bottom} />
    <Handle type="target" position={Position.Left} />
    <div className="font-bold">{data.label}</div>
    {data.description && <div className="text-xs mt-1">{data.description}</div>}
    {data.duration && (
      <div className="text-xs mt-1 opacity-75">⏱ {data.duration}</div>
    )}
  </div>
);

const DecisionNode = ({ data }: any) => (
  <div className="relative w-32 h-32 flex items-center justify-center">
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Right} />
    <Handle type="source" position={Position.Bottom} />
    <Handle type="target" position={Position.Left} />
    <div className="absolute inset-0 bg-yellow-500 border-2 border-yellow-600 shadow-md transform rotate-45"></div>
    <div className="relative z-10 font-bold text-white text-center px-2">{data.label}</div>
  </div>
);

const EndNode = ({ data }: any) => (
  <div className="px-4 py-2 shadow-md rounded-full bg-red-500 text-white border-2 border-red-600 relative">
    <Handle type="target" position={Position.Top} />
    <Handle type="target" position={Position.Right} />
    <Handle type="target" position={Position.Bottom} />
    <Handle type="target" position={Position.Left} />
    <div className="font-bold">End</div>
    <div className="text-xs">{data.label}</div>
  </div>
);

const NoteNode = ({ data }: any) => (
  <div className="px-4 py-3 shadow-md rounded-lg bg-yellow-100 text-gray-800 border-2 border-yellow-300 border-dashed min-w-[200px] relative">
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Right} />
    <Handle type="target" position={Position.Bottom} />
    <Handle type="target" position={Position.Left} />
    <div className="font-bold text-sm">{data.label}</div>
    {data.description && <div className="text-xs mt-1">{data.description}</div>}
  </div>
);

const DelayNode = ({ data }: any) => (
  <div className="px-4 py-3 shadow-md rounded bg-orange-500 text-white border-2 border-orange-600 min-w-[180px] relative">
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Right} />
    <Handle type="target" position={Position.Bottom} />
    <Handle type="target" position={Position.Left} />
    <div className="font-bold">⏱ {data.label}</div>
    {data.duration && <div className="text-xs mt-1">{data.duration}</div>}
    {data.description && <div className="text-xs mt-1">{data.description}</div>}
  </div>
);

const nodeTypes: NodeTypes = {
  start: StartNode,
  step: StepNode,
  decision: DecisionNode,
  end: EndNode,
  note: NoteNode,
  delay: DelayNode,
};

// Default edge style with arrows
const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
  },
  style: {
    strokeWidth: 2,
    stroke: '#64748b',
  },
};

// Shape library items
const shapeLibrary = [
  { type: 'start', icon: Circle, label: 'Start', color: 'bg-green-500' },
  { type: 'end', icon: Circle, label: 'End', color: 'bg-red-500' },
  { type: 'step', icon: Square, label: 'Step', color: 'bg-blue-500' },
  { type: 'decision', icon: Diamond, label: 'Decision', color: 'bg-yellow-500' },
  { type: 'delay', icon: Circle, label: 'Delay/Wait', color: 'bg-orange-500' },
  { type: 'note', icon: StickyNote, label: 'Note', color: 'bg-yellow-100' },
];

export default function PlaybookCanvas() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const playbookId = parseInt(id || "0");

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isAddNodeDialogOpen, setIsAddNodeDialogOpen] = useState(false);
  const [showShapeLibrary, setShowShapeLibrary] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [newNode, setNewNode] = useState({
    type: "step" as "start" | "step" | "decision" | "end" | "note" | "delay",
    label: "",
    description: "",
    duration: "",
  });

  const { data: playbookData, isLoading } = trpc.playbook.getComplete.useQuery(
    { id: playbookId },
    { enabled: playbookId > 0 }
  );

  const createNodeMutation = trpc.playbook.createNode.useMutation();
  const updateNodeMutation = trpc.playbook.updateNode.useMutation();
  const deleteNodeMutation = trpc.playbook.deleteNode.useMutation();
  const createConnectionMutation = trpc.playbook.createConnection.useMutation();
  const deleteConnectionMutation = trpc.playbook.deleteConnection.useMutation();

  // Load playbook data
  useEffect(() => {
    if (playbookData) {
      const loadedNodes = playbookData.nodes.map((node: any) => ({
        id: node.id.toString(),
        type: node.nodeType,
        position: JSON.parse(node.position as string),
        data: {
          label: node.title,
          description: node.description,
          duration: node.duration,
          ...JSON.parse((node.data as string) || "{}"),
        },
      }));

      const loadedEdges = playbookData.connections.map((conn: any) => ({
        id: conn.id.toString(),
        source: conn.sourceNodeId.toString(),
        target: conn.targetNodeId.toString(),
        label: conn.label,
        ...defaultEdgeOptions,
      }));

      setNodes(loadedNodes);
      setEdges(loadedEdges);
    }
  }, [playbookData, setNodes, setEdges]);

  const onConnect = useCallback(
    async (params: Connection) => {
      const newEdge = {
        ...params,
        id: `temp-${Date.now()}`,
        ...defaultEdgeOptions,
      } as Edge;
      setEdges((eds) => addEdge(newEdge, eds));

      try {
        const result = await createConnectionMutation.mutateAsync({
          playbookId,
          sourceNodeId: parseInt(params.source!),
          targetNodeId: parseInt(params.target!),
          label: params.sourceHandle || undefined,
        });
        
        // Update edge with real ID
        setEdges((eds) =>
          eds.map((e) =>
            e.id === newEdge.id ? { ...e, id: result.id.toString() } : e
          )
        );
        toast.success("Connection created");
      } catch (error) {
        toast.error("Failed to create connection");
        setEdges((eds) => eds.filter((e) => e.id !== newEdge.id));
      }
    },
    [playbookId, createConnectionMutation, setEdges]
  );

  const handleAddNodeFromLibrary = (nodeType: string) => {
    setNewNode({ ...newNode, type: nodeType as any });
    setIsAddNodeDialogOpen(true);
  };

  const handleAddNode = async () => {
    if (!newNode.label.trim()) {
      toast.error("Please enter a node title");
      return;
    }

    try {
      const position = {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      };

      const result = await createNodeMutation.mutateAsync({
        playbookId,
        nodeType: newNode.type,
        title: newNode.label,
        description: newNode.description,
        duration: newNode.duration,
        position,
      });

      const reactFlowNode: Node = {
        id: result.id.toString(),
        type: newNode.type,
        position,
        data: {
          label: newNode.label,
          description: newNode.description,
          duration: newNode.duration,
        },
      };

      setNodes((nds) => [...nds, reactFlowNode]);
      setIsAddNodeDialogOpen(false);
      setNewNode({ type: "step", label: "", description: "", duration: "" });
      toast.success("Node added");
    } catch (error) {
      toast.error("Failed to add node");
    }
  };

  const handleDeleteNode = async () => {
    if (!selectedNode) return;

    try {
      await deleteNodeMutation.mutateAsync({ id: parseInt(selectedNode.id) });
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
      toast.success("Node deleted");
    } catch (error) {
      toast.error("Failed to delete node");
    }
  };

  const handleNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleGenerateAISuggestion = async () => {
    setAiSuggestion("Analyzing your workflow...");
    // TODO: Implement AI suggestion generation
    setTimeout(() => {
      setAiSuggestion(
        "Based on your workflow, consider adding:\n\n" +
        "1. A decision point after 'Define Objectives' to check if stakeholders are aligned\n" +
        "2. A parallel process for documentation while development is ongoing\n" +
        "3. A quality check step before the final deployment"
      );
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading playbook...</p>
        </div>
      </div>
    );
  }

  if (!playbookData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Playbook not found</h2>
          <Button onClick={() => setLocation("/playbook-builder")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Playbooks
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/playbook-builder")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{playbookData.playbook.title}</h1>
            <p className="text-sm text-muted-foreground">
              {playbookData.playbook.description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShapeLibrary(!showShapeLibrary)}
          >
            {showShapeLibrary ? "Hide" : "Show"} Shapes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIAssistant(!showAIAssistant)}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative flex">
        {/* Shape Library Panel */}
        {showShapeLibrary && (
          <div className="w-64 border-r bg-background p-4 overflow-y-auto">
            <h3 className="font-semibold mb-3 flex items-center">
              <Square className="mr-2 h-4 w-4" />
              Shape Library
            </h3>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2">
                {shapeLibrary.map((shape) => {
                  const Icon = shape.icon;
                  return (
                    <button
                      key={shape.type}
                      onClick={() => handleAddNodeFromLibrary(shape.type)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent hover:border-primary transition-colors"
                    >
                      <div className={`p-2 rounded ${shape.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">{shape.label}</span>
                    </button>
                  );
                })}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Click a shape to add it to your workflow
                </p>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* React Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>

          {/* Node Details Panel (when node selected) */}
          {selectedNode && !showAIAssistant && (
            <div className="absolute top-4 right-4 w-80">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Node Details</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteNode}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Type: {selectedNode.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Title</Label>
                    <p className="font-medium">{selectedNode.data.label}</p>
                  </div>
                  {selectedNode.data.description && (
                    <div>
                      <Label className="text-xs">Description</Label>
                      <p className="text-sm text-muted-foreground">
                        {selectedNode.data.description}
                      </p>
                    </div>
                  )}
                  {selectedNode.data.duration && (
                    <div>
                      <Label className="text-xs">Duration</Label>
                      <p className="text-sm">{selectedNode.data.duration}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        {showAIAssistant && (
          <div className="w-80 border-l bg-background p-4 overflow-y-auto">
            <h3 className="font-semibold mb-3 flex items-center">
              <Sparkles className="mr-2 h-4 w-4 text-primary" />
              AI Assistant
            </h3>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-4">
                <Button
                  onClick={handleGenerateAISuggestion}
                  className="w-full"
                  variant="outline"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Workflow
                </Button>
                
                {aiSuggestion && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-line">{aiSuggestion}</p>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Quick Actions</h4>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Generate from description
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Optimize workflow
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Add best practices
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {/* Add Node Dialog */}
      <Dialog open={isAddNodeDialogOpen} onOpenChange={setIsAddNodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Node</DialogTitle>
            <DialogDescription>
              Create a new step in your playbook workflow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="node-type">Node Type</Label>
              <Select
                value={newNode.type}
                onValueChange={(value: any) =>
                  setNewNode({ ...newNode, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="step">Step</SelectItem>
                  <SelectItem value="decision">Decision</SelectItem>
                  <SelectItem value="delay">Delay/Wait</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="node-label">Title</Label>
              <Input
                id="node-label"
                value={newNode.label}
                onChange={(e) =>
                  setNewNode({ ...newNode, label: e.target.value })
                }
                placeholder="e.g., Send welcome email"
              />
            </div>
            <div>
              <Label htmlFor="node-description">Description (Optional)</Label>
              <Textarea
                id="node-description"
                value={newNode.description}
                onChange={(e) =>
                  setNewNode({ ...newNode, description: e.target.value })
                }
                placeholder="Additional details..."
                rows={3}
              />
            </div>
            {(newNode.type === "step" || newNode.type === "delay") && (
              <div>
                <Label htmlFor="node-duration">Duration (Optional)</Label>
                <Input
                  id="node-duration"
                  value={newNode.duration}
                  onChange={(e) =>
                    setNewNode({ ...newNode, duration: e.target.value })
                  }
                  placeholder="e.g., 2 hours, 3 days"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddNodeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNode}
              disabled={createNodeMutation.isPending}
            >
              {createNodeMutation.isPending ? "Adding..." : "Add Node"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

