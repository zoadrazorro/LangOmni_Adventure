import React from 'react'
import { BarChart3, Activity, TrendingUp, Zap } from 'lucide-react'

const Metrics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Performance Metrics</h1>
        <p className="text-gray-400">Detailed system analytics and monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            GPU Inference Metrics
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>GPU 0: World Simulator</span>
                <span className="text-blue-400">67% utilized</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                  <p>Tokens/sec: 18.4</p>
                  <p>Batch size: 6</p>
                </div>
                <div>
                  <p>Queue depth: 2</p>
                  <p>Avg latency: 2.1s</p>
                </div>
              </div>
            </div>
            <div className="w-full h-px bg-gray-700"></div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>GPU 1: NPC Engine</span>
                <span className="text-purple-400">54% utilized</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                  <p>Tokens/sec: 142</p>
                  <p>Instances: 4</p>
                </div>
                <div>
                  <p>Queue depth: 8</p>
                  <p>Avg latency: 1.4s</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Response Time Distribution
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>P50 (Median)</span>
                <span className="text-green-400">1.8s</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '36%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>P95</span>
                <span className="text-yellow-400">3.2s</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '64%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>P99</span>
                <span className="text-red-400">4.7s</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Cache Performance
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Hit Rate</span>
              <span className="text-2xl font-bold text-green-400">85%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Miss Rate</span>
              <span className="text-2xl font-bold text-red-400">15%</span>
            </div>
            <div className="w-full h-px bg-gray-700"></div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Total Requests</p>
                <p className="text-xl font-bold">12,847</p>
              </div>
              <div>
                <p className="text-gray-400">Cache Size</p>
                <p className="text-xl font-bold">1.2 GB</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-400" />
            Database Operations
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>PostgreSQL Queries/sec</span>
                <span className="text-blue-400">47</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Avg Query Time</span>
                <span className="text-green-400">12ms</span>
              </div>
            </div>
            <div className="w-full h-px bg-gray-700"></div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Qdrant Vector Searches/sec</span>
                <span className="text-purple-400">23</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span>Avg Search Time</span>
                <span className="text-green-400">8ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Live Monitoring Dashboards</h2>
        <p className="text-gray-300 mb-4">
          For detailed real-time metrics and historical data, access the monitoring dashboards:
        </p>
        <div className="flex gap-4">
          <a
            href="http://localhost:9090"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Open Prometheus
          </a>
          <a
            href="http://localhost:3001"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Open Grafana
          </a>
        </div>
      </div>
    </div>
  )
}

export default Metrics
