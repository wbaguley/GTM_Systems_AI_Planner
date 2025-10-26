import React, { useState, useCallback, useRef, useEffect } from "react";
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
  BackgroundVariant,
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
  Lock,
  Link,
  ArrowUp,
  ArrowDown,
  Scissors,
  Clipboard,
  FileDown,
} from "lucide-react";
import { toPng, toJpeg, toSvg } from "html-to-image";

// Context Menu Component
interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: string) => void;
}

function ContextMenu({ x, y, onClose, onAction }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  // Adjust position to keep menu within viewport
  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      // Check if menu goes off right edge
      if (x + menuRect.width > viewportWidth) {
        adjustedX = viewportWidth - menuRect.width - 10;
      }

      // Check if menu goes off bottom edge
      if (y + menuRect.height > viewportHeight) {
        adjustedY = viewportHeight - menuRect.height - 10;
      }

      // Check if menu goes off left edge
      if (adjustedX < 10) {
        adjustedX = 10;
      }

      // Check if menu goes off top edge
      if (adjustedY < 10) {
        adjustedY = 10;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as HTMLElement)) {
        onClose();
      }
    };

    // Add slight delay to prevent immediate closing from the right-click that opened it
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  const menuItems = [
    { action: "lock", label: "Lock", icon: Lock },
    { action: "link", label: "Link to...", icon: Link },
    { action: "separator1", label: "---" },
    { action: "sendToFront", label: "Send to front", icon: ArrowUp },
    { action: "sendToBack", label: "Send to back", icon: ArrowDown },
    { action: "sendForward", label: "Send forward", shortcut: "Alt + ]", icon: ArrowUp },
    { action: "sendBackward", label: "Send backward", shortcut: "Alt + [", icon: ArrowDown },
    { action: "separator2", label: "---" },
    { action: "copy", label: "Copy", shortcut: "Ctrl + C", icon: Copy },
    { action: "paste", label: "Paste", shortcut: "Ctrl + V", icon: Clipboard },
    { action: "duplicate", label: "Duplicate", shortcut: "Ctrl + D", icon: Copy },
    { action: "cut", label: "Cut", shortcut: "Ctrl + X", icon: Scissors },
    { action: "delete", label: "Delete", icon: Trash2 },
    { action: "separator3", label: "---" },
    { action: "copyObject", label: "Copy object", shortcut: "Ctrl + Shift + L" },
    { action: "copyAs", label: "Copy as...", hasSubmenu: true },
    { action: "exportAs", label: "Export as...", hasSubmenu: true, icon: FileDown },
    { action: "separator4", label: "---" },
    { action: "selectAll", label: "Select all", shortcut: "Ctrl + A" },
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        backgroundColor: "#1f2937",
        borderRadius: "8px",
        padding: "4px",
        minWidth: "200px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
        zIndex: 10000,
        color: "#fff",
      }}
    >
      {menuItems.map((item, index) => {
        if (item.label === "---") {
          return (
            <div
              key={`separator-${index}`}
              style={{
                height: "1px",
                backgroundColor: "#374151",
                margin: "4px 0",
              }}
            />
          );
        }

        const Icon = item.icon;
        return (
          <button
            key={item.action}
            onClick={() => {
              onAction(item.action);
              onClose();
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              backgroundColor: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: "4px",
              fontSize: "14px",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#374151";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {Icon && <Icon size={16} />}
              <span>{item.label}</span>
            </div>
            {item.shortcut && (
              <span style={{ fontSize: "12px", color: "#9ca3af" }}>{item.shortcut}</span>
            )}
            {item.hasSubmenu && <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />}
          </button>
        );
      })}
    </div>
  );
}




// Custom Resizable Node Component with ClickUp-style features
function ResizableNode({ id, data, selected }: NodeProps) {
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
      position: "relative",
    };

    switch (data.shape) {
      case "circle":
        return { ...baseStyle, borderRadius: "50%" };
      case "diamond":
        return { ...baseStyle, clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" };
      case "hexagon":
        return { ...baseStyle, clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" };
      case "oval":
        return { ...baseStyle, borderRadius: "50%" };
      case "parallelogram":
        return { ...baseStyle, transform: "skewX(-20deg)" };
      case "trapezoid":
        return { ...baseStyle, clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" };
      default:
        return { ...baseStyle, borderRadius: "8px" };
    }
  };

  return (
    <div
      style={{ width: data.width || 200, height: data.height || 100 }}
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
              transform: data.shape === "parallelogram" ? "skewX(20deg)" : "none",
            }}
          />
        ) : (
          <span style={{ 
            transform: data.shape === "parallelogram" ? "skewX(20deg)" : "none" 
          }}>
            {label}
          </span>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />

      {/* Floating Toolbar - appears when node is selected */}
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
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            zIndex: 10000,
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
              {/* Show current shape icon */}
              {data.shape === "circle" && <Circle size={16} />}
              {data.shape === "diamond" && <Diamond size={16} />}
              {data.shape === "hexagon" && <Hexagon size={16} />}
              {data.shape === "oval" && <Circle size={16} />}
              {data.shape === "parallelogram" && <Square size={16} style={{ transform: "skewX(-20deg)" }} />}
              {data.shape === "trapezoid" && <Square size={16} />}
              {(!data.shape || data.shape === "rectangle") && <Square size={16} />}
              <ChevronDown size={12} />
            </button>
            {showShapePicker && (
              <div
                style={{
                  position: "absolute",
                  bottom: 45,
                  left: 0,
                  backgroundColor: "#1f2937",
                  borderRadius: "8px",
                  padding: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  minWidth: "150px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 10001,
                }}
              >
                {[
                  { shape: "rectangle", icon: Square, label: "Rectangle" },
                  { shape: "circle", icon: Circle, label: "Circle" },
                  { shape: "diamond", icon: Diamond, label: "Diamond" },
                  { shape: "hexagon", icon: Hexagon, label: "Hexagon" },
                  { shape: "oval", icon: Circle, label: "Oval" },
                  { shape: "parallelogram", icon: Square, label: "Parallelogram" },
                  { shape: "trapezoid", icon: Square, label: "Trapezoid" },
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
                  bottom: 45,
                  left: 0,
                  zIndex: 10001,
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
            title="Duplicate"
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
            title="Delete"
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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>("select"); // select, hand, rectangle, circle, line, arrow, text, sticky, draw, image
  
  // Drag-to-size state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [tempNodeId, setTempNodeId] = useState<string | null>(null);

  // Fetch playbook data
  const { data: playbookData } = trpc.playbook.getComplete.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );

  const updateNodeMutation = trpc.playbook.updateNode.useMutation();
  const createNodeMutation = trpc.playbook.createNode.useMutation();
  const deleteNodeMutation = trpc.playbook.deleteNode.useMutation();

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
      width,
      height,
    });
  }, []);

  const handleClone = useCallback((nodeId: string) => {
    const nodeToCopy = nodes.find((n) => n.id === nodeId);
    if (!nodeToCopy) return;

    const newNode = {
      ...nodeToCopy,
      id: `temp-${Date.now()}`,
      position: {
        x: nodeToCopy.position.x + 50,
        y: nodeToCopy.position.y + 50,
      },
    };

    setNodes((nds) => [...nds, newNode]);

      // Create in database
      createNodeMutation.mutate({
        playbookId: parseInt(id || "0"),
        title: nodeToCopy.data.label,
        nodeType: "step",
      position: newNode.position,
      color: nodeToCopy.data.color,
      shape: nodeToCopy.data.shape,
      width: nodeToCopy.data.width,
      height: nodeToCopy.data.height,
    });
  }, [nodes, id]);

  const handleDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    
    deleteNodeMutation.mutate({ id: parseInt(nodeId) });
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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

      const shapeColors: Record<string, string> = {
        start: "#10b981",
        end: "#ef4444",
        step: "#3b82f6",
        decision: "#f59e0b",
        delay: "#f97316",
        note: "#eab308",
      };

      const newNode = {
        id: `temp-${Date.now()}`,
        type: "resizable",
        position,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          color: shapeColors[type] || "#3b82f6",
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

      // Create in database
      createNodeMutation.mutate({
        playbookId: parseInt(id || "0"),
        title: newNode.data.label,
        nodeType: type as any,
        position,
        color: newNode.data.color,
        shape: newNode.data.shape,
        width: newNode.data.width,
        height: newNode.data.height,
      });
    },
    [reactFlowInstance, id]
  );

  // Handle mouse down to start drag-to-size
  const onPaneMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (!reactFlowInstance || activeTool === 'select' || activeTool === 'hand') return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setIsDragging(true);
      setDragStart(position);

      // Map tools to node types and shapes
      const toolConfig: Record<string, { label: string; color: string; shape: string; nodeType: string }> = {
        rectangle: { label: "Rectangle", color: "#3b82f6", shape: "rectangle", nodeType: "step" },
        circle: { label: "Circle", color: "#3b82f6", shape: "circle", nodeType: "step" },
        line: { label: "Line", color: "#3b82f6", shape: "rectangle", nodeType: "step" },
        arrow: { label: "Arrow", color: "#f59e0b", shape: "parallelogram", nodeType: "step" },
        text: { label: "Text", color: "#3b82f6", shape: "rectangle", nodeType: "step" },
        sticky: { label: "Note", color: "#eab308", shape: "rectangle", nodeType: "note" },
        draw: { label: "Drawing", color: "#8b5cf6", shape: "rectangle", nodeType: "step" },
        image: { label: "Image", color: "#3b82f6", shape: "rectangle", nodeType: "step" },
      };

      const config = toolConfig[activeTool];
      if (!config) return;

      // Create small initial node
      const tempId = `temp-${Date.now()}`;
      const newNode = {
        id: tempId,
        type: "resizable",
        position,
        data: {
          label: config.label,
          color: config.color,
          shape: config.shape,
          width: 50,
          height: 50,
          onLabelChange: handleLabelChange,
          onColorChange: handleColorChange,
          onShapeChange: handleShapeChange,
          onResize: handleResize,
          onClone: handleClone,
          onDelete: handleDelete,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      setTempNodeId(tempId);
    },
    [reactFlowInstance, activeTool, handleLabelChange, handleColorChange, handleShapeChange, handleResize, handleClone, handleDelete]
  );

  // Handle mouse move to resize temp node
  const onPaneMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || !dragStart || !tempNodeId || !reactFlowInstance) return;

      const currentPos = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const width = Math.max(50, Math.abs(currentPos.x - dragStart.x));
      const height = Math.max(50, Math.abs(currentPos.y - dragStart.y));

      setNodes((nds) =>
        nds.map((node) =>
          node.id === tempNodeId
            ? { ...node, data: { ...node.data, width, height } }
            : node
        )
      );
    },
    [isDragging, dragStart, tempNodeId, reactFlowInstance]
  );

  // Handle mouse up to finalize node
  const onPaneMouseUp = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || !tempNodeId) return;

      setIsDragging(false);
      setDragStart(null);

      // Find the temp node to get its final size
      const tempNode = nodes.find((n) => n.id === tempNodeId);
      if (!tempNode) return;

      // Map tools to node types
      const toolConfig: Record<string, { nodeType: string }> = {
        rectangle: { nodeType: "step" },
        circle: { nodeType: "step" },
        line: { nodeType: "step" },
        arrow: { nodeType: "step" },
        text: { nodeType: "step" },
        sticky: { nodeType: "note" },
        draw: { nodeType: "step" },
        image: { nodeType: "step" },
      };

      const config = toolConfig[activeTool];
      if (!config) return;

      // Create in database
      createNodeMutation.mutate({
        playbookId: parseInt(id || "0"),
        title: tempNode.data.label,
        nodeType: config.nodeType as any,
        position: tempNode.position,
        color: tempNode.data.color,
        shape: tempNode.data.shape,
        width: tempNode.data.width,
        height: tempNode.data.height,
      });

      setTempNodeId(null);
      // Reset to select tool after placing
      setActiveTool('select');
    },
    [isDragging, tempNodeId, nodes, activeTool, id]
  );

  // Handle right-click context menu
  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY });
      setSelectedNodeId(node.id);
    },
    []
  );

  const handleContextMenuAction = useCallback(
    (action: string) => {
      if (!selectedNodeId) return;

      switch (action) {
        case "copy":
        case "duplicate":
          handleClone(selectedNodeId);
          break;
        case "delete":
          handleDelete(selectedNodeId);
          break;
        case "sendToFront":
        case "sendToBack":
        case "sendForward":
        case "sendBackward":
          // TODO: Implement z-index management
          console.log(`${action} not yet implemented`);
          break;
        default:
          console.log(`Action ${action} not yet implemented`);
      }
    },
    [selectedNodeId, handleClone, handleDelete]
  );

  // Handle node position changes
  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      updateNodeMutation.mutate({
        id: parseInt(node.id),
        position: node.position,
      });
    },
    []
  );

  const exportFlow = useCallback(
    async (format: "png" | "jpeg" | "svg") => {
      if (!reactFlowWrapper.current || nodes.length === 0) return;

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
          backgroundColor: "#1a1a1a",
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

  //  // Add native DOM event listeners for drag-to-size
  useEffect(() => {
    const pane = document.querySelector('.react-flow__pane') as HTMLElement;
    if (!pane) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (!reactFlowInstance || activeTool === 'select' || activeTool === 'hand') return;
      
      const bounds = pane.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      setIsDragging(true);
      setDragStart(position);

      // Create temporary node
      const newNode = {
        id: `temp-${Date.now()}`,
        type: 'custom',
        position,
        data: {
          label: activeTool.charAt(0).toUpperCase() + activeTool.slice(1),
          shape: activeTool === 'rectangle' ? 'rectangle' : activeTool === 'circle' ? 'circle' : 'rectangle',
          color: '#3b82f6',
          width: 50,
          height: 50,
        },
      };

      setTempNodeId(newNode.id);
      setNodes((nds) => [...nds, newNode as Node]);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !tempNodeId || !dragStart || !reactFlowInstance) return;

      const bounds = pane.getBoundingClientRect();
      const currentPos = reactFlowInstance.project({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      const width = Math.max(50, Math.abs(currentPos.x - dragStart.x));
      const height = Math.max(50, Math.abs(currentPos.y - dragStart.y));

      setNodes((nds) =>
        nds.map((node) =>
          node.id === tempNodeId
            ? {
                ...node,
                data: { ...node.data, width, height },
              }
            : node
        )
      );
    };

    const handleMouseUp = async () => {
      if (!isDragging || !tempNodeId) return;

      const tempNode = nodes.find((n) => n.id === tempNodeId);
      if (!tempNode) return;

      try {
        const result = await createNodeMutation.mutateAsync({
          playbookId: parseInt(id!),
          label: tempNode.data.label,
          nodeType: tempNode.data.shape || 'rectangle',
          position: JSON.stringify(tempNode.position),
          width: tempNode.data.width || 200,
          height: tempNode.data.height || 100,
          color: tempNode.data.color || '#3b82f6',
          shape: tempNode.data.shape || 'rectangle',
        });

        setNodes((nds) =>
          nds.map((node) =>
            node.id === tempNodeId
              ? { ...node, id: result.id.toString() }
              : node
          )
        );
      } catch (error) {
        console.error('Failed to create node:', error);
        setNodes((nds) => nds.filter((n) => n.id !== tempNodeId));
      }

      setIsDragging(false);
      setTempNodeId(null);
      setDragStart(null);
      setActiveTool('select');
    };

    pane.addEventListener('mousedown', handleMouseDown);
    pane.addEventListener('mousemove', handleMouseMove);
    pane.addEventListener('mouseup', handleMouseUp);

    return () => {
      pane.removeEventListener('mousedown', handleMouseDown);
      pane.removeEventListener('mousemove', handleMouseMove);
      pane.removeEventListener('mouseup', handleMouseUp);
    };
  }, [reactFlowInstance, activeTool, isDragging, tempNodeId, dragStart, nodes, id, createNodeMutation]);

  // Force cursor change on ReactFlow pane
  useEffect(() => {
    const pane = document.querySelector('.react-flow__pane');
    if (pane) {
      const cursor = activeTool === 'select' ? 'default' : 
                     activeTool === 'hand' ? 'grab' : 
                     'crosshair';
      (pane as HTMLElement).style.cursor = cursor;
    }
  }, [activeTool]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setActiveTool('select');
          break;
        case 'h':
          setActiveTool('hand');
          break;
        case 'r':
          setActiveTool('rectangle');
          break;
        case 'c':
          setActiveTool('circle');
          break;
        case 'l':
          setActiveTool('line');
          break;
        case 'a':
          setActiveTool('arrow');
          break;
        case 't':
          setActiveTool('text');
          break;
        case 'n':
          setActiveTool('sticky');
          break;
        case 'd':
          setActiveTool('draw');
          break;
        case 'i':
          setActiveTool('image');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Helper function to get button style based on active state
  const getButtonStyle = (toolName: string) => ({
    background: activeTool === toolName ? "#3b82f6" : "transparent",
    border: "none",
    borderRadius: "6px",
    padding: "10px 12px",
    color: activeTool === toolName ? "#ffffff" : "#94a3b8",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  });

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, toolName: string, isEnter: boolean) => {
    if (activeTool !== toolName) {
      e.currentTarget.style.backgroundColor = isEnter ? "#334155" : "transparent";
    }
  };

  const shapeLibrary = [
    { type: "start", label: "Start", color: "#10b981" },
    { type: "end", label: "End", color: "#ef4444" },
    { type: "step", label: "Step", color: "#3b82f6" },
    { type: "decision", label: "Decision", color: "#f59e0b" },
    { type: "delay", label: "Delay/Wait", color: "#f97316" },
    { type: "note", label: "Note", color: "#eab308" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", backgroundColor: "#111827" }}>
      {/* Left Sidebar with Toolbar */}
      <div
        style={{
          width: "auto",
          backgroundColor: "#0f172a",
          borderRight: "none",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Toolbar - ClickUp Style */}
        <div
          style={{
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            padding: "8px 6px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Selection Tool */}
          <button
            onClick={() => setActiveTool('select')}
            style={getButtonStyle('select')}
            onMouseEnter={(e) => handleButtonHover(e, 'select', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'select', false)}
            title="Select (V)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>
          </button>

          {/* Hand/Pan Tool */}
          <button
            onClick={() => setActiveTool('hand')}
            style={getButtonStyle('hand')}
            onMouseEnter={(e) => handleButtonHover(e, 'hand', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'hand', false)}
            title="Hand (H)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
          </button>

          {/* Separator */}
          <div style={{ height: "1px", width: "100%", backgroundColor: "#334155", margin: "4px 0" }} />

          {/* Square Tool */}
          <button
            onClick={() => setActiveTool('rectangle')}
            style={getButtonStyle('rectangle')}
            onMouseEnter={(e) => handleButtonHover(e, 'rectangle', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'rectangle', false)}
            title="Rectangle (R)"
          >
            <Square size={20} />
          </button>

          {/* Circle Tool */}
          <button
            onClick={() => setActiveTool('circle')}
            style={getButtonStyle('circle')}
            onMouseEnter={(e) => handleButtonHover(e, 'circle', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'circle', false)}
            title="Circle (C)"
          >
            <Circle size={20} />
          </button>

          {/* Line Tool */}
          <button
            onClick={() => setActiveTool('line')}
            style={getButtonStyle('line')}
            onMouseEnter={(e) => handleButtonHover(e, 'line', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'line', false)}
            title="Line (L)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="19" x2="19" y2="5" />
            </svg>
          </button>

          {/* Arrow Tool */}
          <button
            onClick={() => setActiveTool('arrow')}
            style={getButtonStyle('arrow')}
            onMouseEnter={(e) => handleButtonHover(e, 'arrow', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'arrow', false)}
            title="Arrow (A)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>

          {/* Separator */}
          <div style={{ height: "1px", width: "100%", backgroundColor: "#334155", margin: "4px 0" }} />

          {/* Text Tool */}
          <button
            onClick={() => setActiveTool('text')}
            style={{
              ...getButtonStyle('text'),
              fontSize: "18px",
              fontWeight: "bold",
            }}
            onMouseEnter={(e) => handleButtonHover(e, 'text', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'text', false)}
            title="Text (T)"
          >
            T
          </button>

          {/* Sticky Note Tool */}
          <button
            onClick={() => setActiveTool('sticky')}
            style={getButtonStyle('sticky')}
            onMouseEnter={(e) => handleButtonHover(e, 'sticky', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'sticky', false)}
            title="Sticky Note (N)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l5 5V4c0-1.1-.9-2-2-2z" />
            </svg>
          </button>

          {/* Separator */}
          <div style={{ height: "1px", width: "100%", backgroundColor: "#334155", margin: "4px 0" }} />

          {/* Drawing Tool */}
          <button
            onClick={() => setActiveTool('draw')}
            style={getButtonStyle('draw')}
            onMouseEnter={(e) => handleButtonHover(e, 'draw', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'draw', false)}
            title="Draw (D)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
          </button>

          {/* Image Tool */}
          <button
            onClick={() => setActiveTool('image')}
            style={getButtonStyle('image')}
            onMouseEnter={(e) => handleButtonHover(e, 'image', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'image', false)}
            title="Image (I)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>

          {/* More Tools */}
          <button
            onClick={() => setActiveTool('more')}
            style={getButtonStyle('more')}
            onMouseEnter={(e) => handleButtonHover(e, 'more', true)}
            onMouseLeave={(e) => handleButtonHover(e, 'more', false)}
            title="More tools"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Flow Canvas */}
      <div 
        ref={reactFlowWrapper} 
        style={{ 
          flex: 1, 
          position: "relative",
          cursor: activeTool === 'select' ? 'default' : 
                  activeTool === 'hand' ? 'grab' : 
                  'crosshair'
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeContextMenu={onNodeContextMenu}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          panOnDrag={activeTool === 'hand' ? [0, 1] : [1]}
          panOnScroll={true}
          zoomOnScroll={true}

          style={{
            cursor: activeTool === 'select' ? 'default' : 
                    activeTool === 'hand' ? 'grab' : 
                    'crosshair'
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#374151" />
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

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
        />
      )}
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

