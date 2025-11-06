import React, { useEffect, useState } from 'react'
import { Activity, Cpu, Database, Zap, Users, TrendingUp } from 'lucide-react'

interface SystemStats {
  activePlayers: number
  totalActions: number
  avgResponseTime: number
  gpu0Utilization: number
  gpu1Utilization: number
  cacheHitRate: number
}

const Dashboard = () => {
  const [stats, setStats] = useState<SystemStats>({
    activePlayers: 0,
    totalActions: 0,
    avgResponseTime: 0,
    gpu0Utilization: 0,
    gpu1Utilization: 0,
    cacheHitRate: 0,
  })

  useEffect(() => {
    // TODO: Fetch real stats from API
    // Simulated data for now
    setStats({
      activePlayers: 42,
      totalActions: 1247,
      avgResponseTime: 2.3,
      gpu0Utilization: 67,
      gpu1Utilization: 54,
      cacheHitRate: 85,
    })
  }, [])

  const statCards = [
    {
      title: 'Active Players',
      value: stats.activePlayers,
      unit: 'players',
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Actions',
      value: stats.totalActions,
      unit: 'actions/sec',
      icon: Activity,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Avg Response Time',
      value: stats.avgResponseTime.toFixed(2),
      unit: 'seconds',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'GPU 0 Utilization',
      value: stats.gpu0Utilization,
      unit: '%',
      icon: Cpu,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'GPU 1 Utilization',
      value: stats.gpu1Utilization,
      unit: '%',
      icon: Cpu,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'Cache Hit Rate',
      value: stats.cacheHitRate,
      unit: '%',
      icon: Database,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">System Dashboard</h1>
        <p className="text-gray-400">Real-time monitoring of LangOmni Adventure server</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className={`${card.bgColor} border border-gray-700 rounded-lg p-6 transition-all hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400">{card.title}</h3>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{card.value}</span>
                <span className="text-sm text-gray-400">{card.unit}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <p className="font-medium">Player joined: DragonSlayer42</p>
                <p className="text-sm text-gray-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <p className="font-medium">Quest completed: The Lost Artifact</p>
                <p className="text-sm text-gray-400">5 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div>
                <p className="font-medium">NPC spawned: Mysterious Merchant</p>
                <p className="text-sm text-gray-400">8 minutes ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            System Health
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>GPU 0 Memory</span>
                <span className="text-gray-400">18.2 / 24 GB</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>GPU 1 Memory</span>
                <span className="text-gray-400">16.1 / 24 GB</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Redis Memory</span>
                <span className="text-gray-400">1.2 / 2 GB</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU Usage</span>
                <span className="text-gray-400">45%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
