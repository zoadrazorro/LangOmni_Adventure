import React, { useState, useEffect } from 'react'
import { Bot, MapPin, MessageSquare, Brain } from 'lucide-react'

interface NPC {
  id: string
  name: string
  type: string
  location: string
  personality: string
  conversationCount: number
  memoryVectors: number
  status: 'active' | 'idle' | 'sleeping'
}

const NPCs = () => {
  const [npcs, setNpcs] = useState<NPC[]>([])

  useEffect(() => {
    // TODO: Fetch real NPC data from API
    // Simulated data for now
    setNpcs([
      {
        id: '1',
        name: 'Elder Mystic Zorathian',
        type: 'Quest Giver',
        location: 'Ancient Temple',
        personality: 'Wise, mysterious, cryptic',
        conversationCount: 127,
        memoryVectors: 12453,
        status: 'active',
      },
      {
        id: '2',
        name: 'Blacksmith Gornak',
        type: 'Merchant',
        location: 'Town Square',
        personality: 'Gruff, honest, skilled',
        conversationCount: 89,
        memoryVectors: 8921,
        status: 'active',
      },
      {
        id: '3',
        name: 'Mysterious Merchant',
        type: 'Rare Trader',
        location: 'Wandering',
        personality: 'Enigmatic, fair, knowledgeable',
        conversationCount: 45,
        memoryVectors: 5234,
        status: 'idle',
      },
    ])
  }, [])

  const getStatusColor = (status: NPC['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'sleeping':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Quest Giver':
        return 'text-purple-400 bg-purple-500/20'
      case 'Merchant':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'Rare Trader':
        return 'text-pink-400 bg-pink-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">NPC Management</h1>
          <p className="text-gray-400">Monitor AI-powered non-player characters</p>
        </div>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <span className="text-2xl font-bold">{npcs.length}</span>
          <span className="text-gray-400">NPCs</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {npcs.map((npc) => (
          <div
            key={npc.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                    <Bot className="w-8 h-8" />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(
                      npc.status
                    )} rounded-full border-2 border-gray-800`}
                  ></div>
                </div>
                <div>
                  <h3 className="font-bold text-xl">{npc.name}</h3>
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${getTypeColor(npc.type)}`}>
                    {npc.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-400">Status</span>
                <p className="font-semibold capitalize">{npc.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Location:</span>
                  <span className="text-gray-200">{npc.location}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Brain className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-gray-400">Personality:</span>
                    <p className="text-gray-200">{npc.personality}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Conversations:</span>
                  <span className="text-gray-200">{npc.conversationCount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Brain className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">Memory Vectors:</span>
                  <span className="text-gray-200">{npc.memoryVectors.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn-secondary text-sm py-1 px-3">View Memory</button>
              <button className="btn-secondary text-sm py-1 px-3">Edit Personality</button>
              <button className="btn-secondary text-sm py-1 px-3">Conversation Log</button>
            </div>
          </div>
        ))}
      </div>

      {npcs.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No NPCs found</p>
        </div>
      )}
    </div>
  )
}

export default NPCs
