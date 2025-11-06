import React, { useState, useEffect } from 'react'
import { Users, Search, MapPin, Heart, Sword } from 'lucide-react'

interface Player {
  id: string
  username: string
  level: number
  hp: number
  maxHp: number
  location: string
  status: 'online' | 'idle' | 'in-combat'
  lastAction: string
}

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    // TODO: Fetch real player data from API
    // Simulated data for now
    setPlayers([
      {
        id: '1',
        username: 'DragonSlayer42',
        level: 15,
        hp: 85,
        maxHp: 100,
        location: 'Crystal Caverns',
        status: 'in-combat',
        lastAction: 'Fighting Shadow Beast',
      },
      {
        id: '2',
        username: 'MysticWizard',
        level: 12,
        hp: 60,
        maxHp: 80,
        location: 'Enchanted Forest',
        status: 'online',
        lastAction: 'Casting healing spell',
      },
      {
        id: '3',
        username: 'ShadowRogue',
        level: 18,
        hp: 70,
        maxHp: 90,
        location: 'Dark Alley',
        status: 'idle',
        lastAction: 'Checking inventory',
      },
    ])
  }, [])

  const filteredPlayers = players.filter((player) =>
    player.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: Player['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'idle':
        return 'bg-yellow-500'
      case 'in-combat':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Active Players</h1>
          <p className="text-gray-400">Monitor and manage connected players</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <span className="text-2xl font-bold">{players.length}</span>
          <span className="text-gray-400">online</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl font-bold">
                    {player.username.charAt(0)}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(
                      player.status
                    )} rounded-full border-2 border-gray-800`}
                  ></div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{player.username}</h3>
                  <p className="text-sm text-gray-400">Level {player.level}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-500/20 text-blue-400 rounded">
                  {player.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{player.location}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Sword className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300">{player.lastAction}</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span>HP</span>
                  </div>
                  <span className="text-gray-400">
                    {player.hp} / {player.maxHp}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No players found</p>
        </div>
      )}
    </div>
  )
}

export default Players
