import React, { useState } from 'react';
import { Server, Database, Cpu, Zap, Users, MessageSquare, Globe, Brain, Layers, GitBranch, Clock, Shield } from 'lucide-react';

const ArchitectureDiagram = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const components = {
    gpu0: {
      title: "GPU 0: World Simulator",
      icon: Globe,
      details: [
        "Model: Llama 3.1 70B (4-bit quantized)",
        "VRAM Usage: ~18GB",
        "Inference: 15-25 tokens/sec",
        "Batch Size: 4-8 concurrent requests",
        "Framework: vLLM with continuous batching",
        "Responsibilities: Physics, environment, consequences, procedural generation"
      ],
      color: "bg-blue-500"
    },
    gpu1: {
      title: "GPU 1: NPC Engine",
      icon: Users,
      details: [
        "Multi-instance setup:",
        "• 4x Llama 3.1 8B instances (4GB each)",
        "• Specialized character models",
        "Total VRAM: ~16GB",
        "Aggregate: 120-160 tokens/sec",
        "Round-robin load balancing",
        "Character memory & personality injection"
      ],
      color: "bg-purple-500"
    },
    orchestrator: {
      title: "Central Orchestrator",
      icon: Brain,
      details: [
        "Async Python (FastAPI + asyncio)",
        "Request routing & prioritization",
        "GPU load balancing",
        "Timeout handling (5s limit)",
        "Fallback to rule-based systems",
        "Player session management",
        "Coordinated multi-GPU queries"
      ],
      color: "bg-green-500"
    },
    redis: {
      title: "Redis Cluster",
      icon: Zap,
      details: [
        "Hot state cache (player positions, HP, inventory)",
        "GPU result queue (pub/sub)",
        "Rate limiting (per-player action throttle)",
        "Session store (WebSocket connections)",
        "Real-time event broadcasting",
        "Sub-second response times"
      ],
      color: "bg-red-500"
    },
    postgres: {
      title: "PostgreSQL + TimescaleDB",
      icon: Database,
      details: [
        "World state persistence",
        "Player profiles & progression",
        "NPC memory & relationship graphs",
        "Quest chains & completion tracking",
        "Conversation history (vector embeddings)",
        "Time-series event logging",
        "Full-text search for world content"
      ],
      color: "bg-indigo-500"
    },
    vectordb: {
      title: "Qdrant Vector DB",
      icon: Layers,
      details: [
        "Semantic memory for NPCs",
        "Player action history embeddings",
        "Context retrieval for LLMs",
        "Similar situation lookup",
        "Dynamic prompt augmentation",
        "10k+ vectors per NPC"
      ],
      color: "bg-pink-500"
    },
    websocket: {
      title: "WebSocket Gateway",
      icon: MessageSquare,
      details: [
        "Nginx + FastAPI WebSockets",
        "5000+ concurrent connections",
        "Sub-100ms player input latency",
        "Server-sent events for broadcasts",
        "Automatic reconnection",
        "Message compression"
      ],
      color: "bg-yellow-500"
    },
    cpu: {
      title: "CPU Workers (16 cores)",
      icon: Cpu,
      details: [
        "Core 0-3: WebSocket handling",
        "Core 4-7: Database queries & caching",
        "Core 8-11: Game logic & validation",
        "Core 12-15: Monitoring & logging",
        "Deterministic game rules",
        "Dice rolls, collision detection",
        "Inventory management"
      ],
      color: "bg-orange-500"
    }
  };

  const architectureFlow = [
    {
      from: "Player Action",
      to: "WebSocket Gateway",
      description: "JSON command over WS"
    },
    {
      from: "WebSocket Gateway",
      to: "Orchestrator",
      description: "Parsed & validated"
    },
    {
      from: "Orchestrator",
      to: "Redis",
      description: "Check rate limits & cache"
    },
    {
      from: "Orchestrator",
      to: "GPU 0 + GPU 1",
      description: "Parallel inference requests"
    },
    {
      from: "GPU 0",
      to: "Redis",
      description: "World state updates"
    },
    {
      from: "GPU 1",
      to: "Redis",
      description: "NPC responses"
    },
    {
      from: "Redis",
      to: "Orchestrator",
      description: "Combined results"
    },
    {
      from: "Orchestrator",
      to: "PostgreSQL",
      description: "Persist important state"
    },
    {
      from: "Orchestrator",
      to: "WebSocket Gateway",
      description: "Formatted response"
    },
    {
      from: "WebSocket Gateway",
      to: "Player",
      description: "Real-time update"
    }
  ];

  const optimizations = [
    {
      category: "Inference Optimization",
      techniques: [
        "Speculative decoding for common actions",
        "KV-cache persistence across requests",
        "Prompt compression (reduce tokens by 40%)",
        "Pre-computed embeddings for locations",
        "Dynamic batch sizing based on load"
      ]
    },
    {
      category: "Concurrency Strategy",
      techniques: [
        "60 players: ~4 actions/sec average",
        "Priority queue: combat > dialogue > exploration",
        "Async everything: no blocking I/O",
        "Connection pooling to databases",
        "Background tasks for non-critical updates"
      ]
    },
    {
      category: "Smart Caching",
      techniques: [
        "Location descriptions cached 5 min",
        "Common NPC greetings pre-generated",
        "World rules in-memory lookup tables",
        "Player last 10 actions in Redis",
        "Probabilistic cache invalidation"
      ]
    },
    {
      category: "Fallback Systems",
      techniques: [
        "If GPU queue >3s: use template responses",
        "Critical actions bypass queue",
        "Graceful degradation: simpler models",
        "Pre-written emergency scenarios",
        "Health checks every 10s"
      ]
    }
  ];

  const performanceMetrics = {
    playerCapacity: "50-80 concurrent players",
    avgResponseTime: "1.5-3 seconds",
    p95ResponseTime: "5 seconds",
    actionsPerSecond: "25-40 total",
    uptimeTarget: "99.9%",
    dataIngestion: "~1GB/day logs & state"
  };

  return (
    <div className="w-full bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Maximum Performance LLM Adventure Server
        </h1>
        <p className="text-center text-gray-400 mb-8">Dual 7900 XT Architecture - Pushing Every Limit</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Object.entries(components).map(([key, component]) => {
            const Icon = component.icon;
            return (
              <div
                key={key}
                onClick={() => setSelectedComponent(key)}
                className={`${component.color} bg-opacity-10 border-2 ${component.color.replace('bg-', 'border-')} rounded-lg p-4 cursor-pointer hover:bg-opacity-20 transition-all ${
                  selectedComponent === key ? 'ring-4 ring-white ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-6 h-6" />
                  <h3 className="font-bold text-sm">{component.title}</h3>
                </div>
                {selectedComponent === key && (
                  <ul className="text-xs space-y-1 text-gray-300">
                    {component.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <GitBranch className="w-6 h-6" />
            Request Flow Pipeline
          </h2>
          <div className="space-y-2">
            {architectureFlow.map((step, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-mono">
                  {step.from}
                </div>
                <div className="text-gray-400">→</div>
                <div className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-mono">
                  {step.to}
                </div>
                <div className="text-gray-400 text-sm flex-1">
                  {step.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {optimizations.map((opt, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3 text-green-400">{opt.category}</h3>
              <ul className="space-y-2">
                {opt.techniques.map((technique, tidx) => (
                  <li key={tidx} className="text-sm text-gray-300 flex items-start gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>{technique}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-green-900 to-blue-900 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Expected Performance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(performanceMetrics).map(([key, value]) => (
              <div key={key} className="bg-black bg-opacity-30 rounded p-3">
                <div className="text-gray-400 text-xs mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-white font-bold">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Advanced Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-bold text-blue-400 mb-2">Dynamic World Generation</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Procedural dungeon generation with GPU 0</li>
                <li>• Weather systems affect gameplay</li>
                <li>• Day/night cycles with NPC behavior changes</li>
                <li>• Economy simulation based on player actions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-purple-400 mb-2">NPC Intelligence</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Long-term memory via vector embeddings</li>
                <li>• Relationship tracking between NPCs</li>
                <li>• Personality consistency across sessions</li>
                <li>• NPCs remember player reputation</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-green-400 mb-2">Multiplayer Features</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Real-time collaborative quests</li>
                <li>• Player-to-player trading system</li>
                <li>• Guild creation with shared resources</li>
                <li>• PvP combat zones with rankings</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-red-400 mb-2">Monitoring & Scaling</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Prometheus metrics export</li>
                <li>• Grafana dashboards for GPU utilization</li>
                <li>• Auto-scaling inference batch sizes</li>
                <li>• Player analytics & engagement tracking</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4 text-sm">
          <h3 className="font-bold text-yellow-400 mb-2">Peak Capacity Analysis</h3>
          <p className="text-gray-300">
            With this architecture, your system can theoretically handle <strong>50-80 concurrent players</strong> with
            rich, contextual LLM responses. The dual-GPU separation allows parallel world simulation and NPC interaction,
            while Redis caching and smart batching minimize latency. The 7950X's 16 cores handle all the orchestration,
            database work, and deterministic game logic without breaking a sweat. Your gigabit connection can serve
            ~1000 text responses per second, so network isn't the bottleneck—inference speed is, which we've maximized
            through quantization, batching, and multi-instance deployment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagram;
