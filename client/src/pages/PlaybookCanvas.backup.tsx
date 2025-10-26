// This file will contain the enhanced Flow Builder
// Due to the complexity, I'll implement this incrementally
// Starting with the basic structure and adding features one by one

import { useState, useCallback, useEffect, useRef } from "react";
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
  Handle,
  Position,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
  getRectOfNodes,
  getTransformForBounds,
} from "reactflow";
import { toPng, toJpeg, toSvg } from "html-to-image";
import "reactflow/dist/style.css";
import "./playbook-canvas-styles.css";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  ArrowLeft,
  Save,
  FileDown,
  Square,
  Circle,
  Diamond,
  StickyNote,
  Sparkles,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../components/ui/context-menu";
import { toast } from "sonner";
import { ScrollArea } from "../components/ui/scroll-area";

// Editable Node Component with double-click to edit
const EditableNode = ({ data, type: nodeType }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onLabelChange) {
      data.onLabelChange(label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setLabel(data.label);
      setIsEditing(false);
    }
  };

  const getNodeStyle = () => {
    switch (nodeType) {
      case "start":
        return "px-4 py-2 shadow-md rounded-full bg-green-500 text-white border-2 border-green-600";
      case "end":
        return "px-4 py-2 shadow-md rounded-full bg-red-500 text-white border-2 border-red-600";
      case "step":
        return "px-4 py-3 shadow-md rounded-lg bg-blue-500 text-white border-2 border-blue-600 min-w-[200px]";
      case "decision":
        return "w-32 h-32 flex items-center justify-center";
      case "delay":
        return "px-4 py-2 shadow-md rounded-full bg-orange-500 text-white border-2 border-orange-600";
      case "note":
        return "px-4 py-3 shadow-md rounded-lg bg-yellow-100 text-gray-800 border-2 border-yellow-300 min-w-[200px]";
      default:
        return "px-4 py-3 shadow-md rounded-lg bg-blue-500 text-white border-2 border-blue-600 min-w-[200px]";
    }
  };

  if (nodeType === "decision") {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center" onDoubleClick={handleDoubleClick}>
        <Handle type="target" position={Position.Top} id="top" />
        <Handle type="source" position={Position.Right} id="right" />
        <Handle type="source" position={Position.Bottom} id="bottom" />
        <Handle type="target" position={Position.Left} id="left" />
        <div className="absolute inset-0 bg-yellow-500 border-2 border-yellow-600 shadow-md transform rotate-45"></div>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="relative z-10 text-center bg-transparent border-none outline-none text-white font-bold w-20"
          />
        ) : (
          <div className="relative z-10 font-bold text-white text-center px-2">{data.label}</div>
        )}
      </div>
    );
  }

  return (
    <div className={getNodeStyle()} onDoubleClick={handleDoubleClick}>
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="target" position={Position.Left} id="left" />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none outline-none font-bold w-full"
        />
      ) : (
        <div className="font-bold">{data.label}</div>
      )}
      {data.description && <div className="text-xs mt-1">{data.description}</div>}
      {data.duration && <div className="text-xs mt-1 opacity-75">⏱ {data.duration}</div>}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  start: (props) => <EditableNode {...props} type="start" />,
  step: (props) => <EditableNode {...props} type="step" />,
  decision: (props) => <EditableNode {...props} type="decision" />,
  end: (props) => <EditableNode {...props} type="end" />,
  note: (props) => <EditableNode {...props} type="note" />,
  delay: (props) => <EditableNode {...props} type="delay" />,
};

const defaultEdgeOptions = {
  type: "default",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: "#64748b",
  },
  style: {
    strokeWidth: 2,
    stroke: "#64748b",
  },
  animated: false,
};

const shapeLibrary = [
  { type: "start", icon: Circle, label: "Start", color: "bg-green-500" },
  { type: "end", icon: Circle, label: "End", color: "bg-red-500" },
  { type: "step", icon: Square, label: "Step", color: "bg-blue-500" },
  { type: "decision", icon: Diamond, label: "Decision", color: "bg-yellow-500" },
  { type: "delay", icon: Circle, label: "Delay/Wait", color: "bg-orange-500" },
  { type: "note", icon: StickyNote, label: "Note", color: "bg-yellow-100" },
];

function FlowCanvas() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const playbookId = parseInt(id || "0");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project, getNodes } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showShapeLibrary, setShowShapeLibrary] = useState(true);

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
          onLabelChange: (newLabel: string) => handleNodeLabelChange(node.id.toString(), newLabel),
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
  }, [playbookData]);

  const handleNodeLabelChange = async (nodeId: string, newLabel: string) => {
    try {
      await updateNodeMutation.mutateAsync({
        id: parseInt(nodeId),
        title: newLabel,
      });
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label: newLabel } }
            : node
        )
      );
      toast.success("Node updated");
    } catch (error) {
      toast.error("Failed to update node");
    }
  };

  // Drag and drop from shape library
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type || !reactFlowBounds) {
        return;
      }

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      try {
        const result = await createNodeMutation.mutateAsync({
          playbookId,
          nodeType: type as any,
          title: `New ${type}`,
          description: "",
          duration: "",
          position,
        });

        const newNode: Node = {
          id: result.id.toString(),
          type: type as any,
          position,
          data: {
            label: `New ${type}`,
            onLabelChange: (newLabel: string) => handleNodeLabelChange(result.id.toString(), newLabel),
          },
        };

        setNodes((nds) => [...nds, newNode]);
        toast.success("Node added - double-click to edit");
      } catch (error) {
        toast.error("Failed to add node");
      }
    },
    [project, playbookId, createNodeMutation, setNodes]
  );

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

        setEdges((eds) =>
          eds.map((e) => (e.id === newEdge.id ? { ...e, id: result.id.toString() } : e))
        );
        toast.success("Connection created");
      } catch (error) {
        toast.error("Failed to create connection");
        setEdges((eds) => eds.filter((e) => e.id !== newEdge.id));
      }
    },
    [playbookId, createConnectionMutation, setEdges]
  );

  // Clone node
  const handleCloneNode = async (node: Node) => {
    try {
      const result = await createNodeMutation.mutateAsync({
        playbookId,
        nodeType: node.type as any,
        title: `${node.data.label} (copy)`,
        description: node.data.description || "",
        duration: node.data.duration || "",
        position: { x: node.position.x + 50, y: node.position.y + 50 },
      });

      const newNode: Node = {
        id: result.id.toString(),
        type: node.type as any,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
        data: {
          ...node.data,
          label: `${node.data.label} (copy)`,
          onLabelChange: (newLabel: string) => handleNodeLabelChange(result.id.toString(), newLabel),
        },
      };

      setNodes((nds) => [...nds, newNode]);
      toast.success("Node cloned");
    } catch (error) {
      toast.error("Failed to clone node");
    }
  };

  // Delete node
  const handleDeleteNode = async (nodeId: string) => {
    try {
      await deleteNodeMutation.mutateAsync({ id: parseInt(nodeId) });
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      toast.success("Node deleted");
    } catch (error) {
      toast.error("Failed to delete node");
    }
  };

  // Export functions
  const downloadImage = (dataUrl: string, extension: string) => {
    const a = document.createElement("a");
    a.setAttribute("download", `flow-${playbookId}.${extension}`);
    a.setAttribute("href", dataUrl);
    a.click();
  };

  const handleExport = async (format: "png" | "jpeg" | "svg") => {
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(nodesBounds, nodesBounds.width, nodesBounds.height, 0.5, 2);

    const viewport = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (!viewport) return;

    try {
      let dataUrl: string;
      if (format === "png") {
        dataUrl = await toPng(viewport, {
          backgroundColor: "#ffffff",
          width: nodesBounds.width,
          height: nodesBounds.height,
          style: {
            width: `${nodesBounds.width}px`,
            height: `${nodesBounds.height}px`,
            transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
          },
        });
        downloadImage(dataUrl, "png");
      } else if (format === "jpeg") {
        dataUrl = await toJpeg(viewport, {
          backgroundColor: "#ffffff",
          quality: 0.95,
        });
        downloadImage(dataUrl, "jpeg");
      } else if (format === "svg") {
        dataUrl = await toSvg(viewport);
        downloadImage(dataUrl, "svg");
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading flow...</p>
        </div>
      </div>
    );
  }

  if (!playbookData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Flow not found</h2>
          <Button onClick={() => setLocation("/playbook-builder")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Flows
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
          <Button variant="ghost" size="sm" onClick={() => setLocation("/playbook-builder")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{playbookData.playbook.title}</h1>
            <p className="text-sm text-muted-foreground">{playbookData.playbook.description}</p>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("png")}>
                <Download className="mr-2 h-4 w-4" />
                PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("jpeg")}>
                <Download className="mr-2 h-4 w-4" />
                JPEG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("svg")}>
                <Download className="mr-2 h-4 w-4" />
                SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <p className="text-xs text-muted-foreground mb-4">Drag shapes onto the canvas</p>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-2">
                {shapeLibrary.map((shape) => {
                  const Icon = shape.icon;
                  return (
                    <div
                      key={shape.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, shape.type)}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent hover:border-primary transition-colors cursor-grab active:cursor-grabbing"
                    >
                      <div className={`w-8 h-8 rounded flex items-center justify-center ${shape.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{shape.label}</span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* ReactFlow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionMode={ConnectionMode.Loose}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
            {/* Context Menu for Nodes */}
            {nodes.map((node) => (
              <ContextMenu key={node.id}>
                <ContextMenuTrigger />
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => handleCloneNode(node)}>
                    Clone
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => handleDeleteNode(node.id)}
                    className="text-destructive"
                  >
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function PlaybookCanvas() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}

