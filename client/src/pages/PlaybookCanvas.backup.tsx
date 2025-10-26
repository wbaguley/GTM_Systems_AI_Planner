import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Node,
  NodeProps,
  Handle,
  Position,
  Panel,
} from "reactflow";
import { NodeResizer } from "@reactflow/node-resizer";
import { HexColorPicker } from "react-colorful";
import "reactflow/dist/style.css";
import "@reactflow/node-resizer/dist/style.css";
import { trpc } from "../lib/trpc";
import { useParams } from "wouter";
import {
  Download,
  Circle,
  Square,
  Diamond,
  Hexagon,
  Copy,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { toPng, toJpeg, toSvg } from "html-to-image";

// Custom Resizable Node Component
function ResizableNode({ id, data, selected }: NodeProps) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShapePicker, setShowShapePicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (data.onLabelChange) {
      data.onLabelChange(id, label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const getShapeStyle = () => {
    const baseStyle: React.CSSProperties = {
      width: "100%",
      height: "100%",
      backgroundColor: data.color || "#3b82f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "12px",
      fontSize: "14px",
      fontWeight: 500,
      color: "#fff",
      cursor: "pointer",
    };

    switch (data.shape) {
      case "circle":
        return { ...baseStyle, borderRadius: "50%" };
      case "diamond":
        return { ...baseStyle, transform: "rotate(45deg)" };
      case "hexagon":
        return { ...baseStyle, clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" };
      default:
        return { ...baseStyle, borderRadius: "8px" };
    }
  };

  return (
    <div
      style={{ width: data.width || 200, height: data.height || 100 }}
      onClick={() => setShowToolbar(!showToolbar)}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={60}
        onResize={(event, params) => {
          if (data.onResize) {
            data.onResize(id, params.width, params.height);
          }
        }}
      />
      <Handle type="target" position={Position.Top} />
      <div style={getShapeStyle()}>
        {isEditing ? (
          <input
            ref={inputRef}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 500,
              textAlign: "center",
              width: "100%",
            }}
          />
        ) : (
          <span style={{ transform: data.shape === "diamond" ? "rotate(-45deg)" : "none" }}>
            {label}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />

      {/* Floating Toolbar */}
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1f2937",
            borderRadius: "8px",
            padding: "8px",
            display: "flex",
            gap: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Shape Picker */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowShapePicker(!showShapePicker)}
              style={{
                background: "#374151",
                border: "none",
                borderRadius: "4px",
                padding: "6px 8px",
                color: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Square size={16} />
              <ChevronDown size={12} />
            </button>
            {showShapePicker && (
              <div
                style={{
                  position: "absolute",
                  top: 40,
                  left: 0,
                  backgroundColor: "#1f2937",
                  borderRadius: "8px",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  minWidth: "120px",
                }}
              >
                {[
                  { shape: "rectangle", icon: Square, label: "Rectangle" },
                  { shape: "circle", icon: Circle, label: "Circle" },
                  { shape: "diamond", icon: Diamond, label: "Diamond" },
                  { shape: "hexagon", icon: Hexagon, label: "Hexagon" },
                ].map(({ shape, icon: Icon, label: shapeLabel }) => (
                  <button
                    key={shape}
                    onClick={() => {
                      if (data.onShapeChange) {
                        data.onShapeChange(id, shape);
                      }
                      setShowShapePicker(false);
                    }}
                    style={{
                      background: data.shape === shape ? "#4b5563" : "transparent",
                      border: "none",
                      borderRadius: "4px",
                      padding: "8px",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      textAlign: "left",
                    }}
                  >
                    <Icon size={16} />
                    <span style={{ fontSize: "14px" }}>{shapeLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{
                background: data.color || "#3b82f6",
                border: "2px solid #fff",
                borderRadius: "4px",
                width: "32px",
                height: "32px",
                cursor: "pointer",
              }}
            />
            {showColorPicker && (
              <div
                style={{
                  position: "absolute",
                  top: 40,
                  left: 0,
                  zIndex: 1001,
                }}
              >
                <HexColorPicker
                  color={data.color || "#3b82f6"}
                  onChange={(color) => {
                    if (data.onColorChange) {
                      data.onColorChange(id, color);
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Clone Button */}
          <button
            onClick={() => {
              if (data.onClone) {
                data.onClone(id);
              }
            }}
            style={{
              background: "#374151",
              border: "none",
              borderRadius: "4px",
              padding: "6px 8px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <Copy size={16} />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => {
              if (data.onDelete) {
                data.onDelete(id);
              }
            }}
            style={{
              background: "#dc2626",
              border: "none",
              borderRadius: "4px",
              padding: "6px 8px",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  resizable: ResizableNode,
};

function FlowCanvas() {
  const params = useParams();
  const id = params.id;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Fetch playbook data
  const { data: playbookData } = trpc.playbook.getComplete.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );

  const updateNodeMutation = trpc.playbook.updateNode.useMutation();

  // Load playbook data
  React.useEffect(() => {
    if (playbookData) {
      const loadedNodes = playbookData.nodes.map((node: any) => {
        // Parse position if it's a JSON string
        let position = { x: 0, y: 0 };
        if (node.position) {
          position = typeof node.position === 'string' ? JSON.parse(node.position) : node.position;
        }
        
        return {
          id: node.id.toString(),
          type: "resizable",
          position,
          data: {
            label: node.title,
            color: node.color || "#3b82f6",
            shape: node.shape || "rectangle",
            width: node.width || 200,
            height: node.height || 100,
            onLabelChange: handleLabelChange,
            onColorChange: handleColorChange,
            onShapeChange: handleShapeChange,
            onResize: handleResize,
            onClone: handleClone,
            onDelete: handleDelete,
          },
        };
      });

      const loadedEdges = playbookData.connections.map((conn: any) => ({
        id: `e${conn.sourceNodeId}-${conn.targetNodeId}`,
        source: conn.sourceNodeId.toString(),
        target: conn.targetNodeId.toString(),
        label: conn.label,
      }));

      setNodes(loadedNodes);
      setEdges(loadedEdges);
    }
  }, [playbookData]);

  const handleLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    );
    updateNodeMutation.mutate({
      id: parseInt(nodeId),
      title: newLabel,
    });
  }, []);

  const handleColorChange = useCallback((nodeId: string, newColor: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, color: newColor } }
          : node
      )
    );
    updateNodeMutation.mutate({
      id: parseInt(nodeId),
      color: newColor,
    });
  }, []);

  const handleShapeChange = useCallback((nodeId: string, newShape: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, shape: newShape } }
          : node
      )
    );
    updateNodeMutation.mutate({
      id: parseInt(nodeId),
      shape: newShape,
    });
  }, []);

  const handleResize = useCallback((nodeId: string, width: number, height: number) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, width, height } }
          : node
      )
    );
    updateNodeMutation.mutate({
      id: parseInt(nodeId),
      width: Math.round(width),
      height: Math.round(height),
    });
  }, []);

  const handleClone = useCallback((nodeId: string) => {
    const nodeToClone = nodes.find((n) => n.id === nodeId);
    if (!nodeToClone) return;

    const newNode = {
      ...nodeToClone,
      id: `temp-${Date.now()}`,
      position: {
        x: nodeToClone.position.x + 50,
        y: nodeToClone.position.y + 50,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  }, [nodes]);

  const handleDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `temp-${Date.now()}`,
        type: "resizable",
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          color: getColorForType(type),
          shape: "rectangle",
          width: 200,
          height: 100,
          onLabelChange: handleLabelChange,
          onColorChange: handleColorChange,
          onShapeChange: handleShapeChange,
          onResize: handleResize,
          onClone: handleClone,
          onDelete: handleDelete,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, handleLabelChange, handleColorChange, handleShapeChange, handleResize, handleClone, handleDelete]
  );

  const getColorForType = (type: string) => {
    const colors: Record<string, string> = {
      start: "#10b981",
      end: "#ef4444",
      step: "#3b82f6",
      decision: "#f59e0b",
      delay: "#f97316",
      note: "#eab308",
    };
    return colors[type] || "#3b82f6";
  };

  const exportFlow = useCallback(
    async (format: "png" | "jpeg" | "svg") => {
      if (!reactFlowWrapper.current) return;

      // Calculate bounds of all nodes
      const nodesBounds = nodes.reduce(
        (acc, node) => {
          const width = node.data.width || 200;
          const height = node.data.height || 100;
          return {
            minX: Math.min(acc.minX, node.position.x),
            minY: Math.min(acc.minY, node.position.y),
            maxX: Math.max(acc.maxX, node.position.x + width),
            maxY: Math.max(acc.maxY, node.position.y + height),
          };
        },
        { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      );

      const padding = 50;
      const width = nodesBounds.maxX - nodesBounds.minX + padding * 2;
      const height = nodesBounds.maxY - nodesBounds.minY + padding * 2;

      const exportFunc = format === "png" ? toPng : format === "jpeg" ? toJpeg : toSvg;

      try {
        const dataUrl = await exportFunc(reactFlowWrapper.current, {
          backgroundColor: "#ffffff",
          width,
          height,
          style: {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translate(${-nodesBounds.minX + padding}px, ${-nodesBounds.minY + padding}px)`,
          },
        });

        const link = document.createElement("a");
        link.download = `flow.${format}`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Export failed:", error);
      }
    },
    [nodes]
  );

  const shapeLibrary = [
    { type: "start", label: "Start", color: "#10b981" },
    { type: "end", label: "End", color: "#ef4444" },
    { type: "step", label: "Step", color: "#3b82f6" },
    { type: "decision", label: "Decision", color: "#f59e0b" },
    { type: "delay", label: "Delay/Wait", color: "#f97316" },
    { type: "note", label: "Note", color: "#eab308" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Shape Library Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#f9fafb",
          borderRight: "1px solid #e5e7eb",
          padding: "16px",
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
          Shape Library
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {shapeLibrary.map((shape) => (
            <div
              key={shape.type}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData("application/reactflow", shape.type);
                event.dataTransfer.effectAllowed = "move";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                cursor: "grab",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: shape.color,
                  borderRadius: "6px",
                }}
              />
              <span style={{ fontSize: "14px", fontWeight: 500 }}>{shape.label}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "16px" }}>
          Drag a shape to add it to your flow
        </p>
      </div>

      {/* Flow Canvas */}
      <div ref={reactFlowWrapper} style={{ flex: 1, position: "relative" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <Panel position="top-right">
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => exportFlow("png")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Download size={16} />
                Export PNG
              </button>
              <button
                onClick={() => exportFlow("jpeg")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Download size={16} />
                Export JPEG
              </button>
              <button
                onClick={() => exportFlow("svg")}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Download size={16} />
                Export SVG
              </button>
            </div>
          </Panel>
        </ReactFlow>
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

