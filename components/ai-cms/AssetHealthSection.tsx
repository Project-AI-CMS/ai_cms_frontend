'use client';
import { motion } from "framer-motion";
import { Activity, TrendingUp, Bell, Target, Brain, BarChart3 } from "lucide-react";

const insights = [
  {
    icon: Activity,
    title: "Asset Health Scoring",
    description: "Automated health assessments based on maintenance history, age, and operating conditions",
  },
  {
    icon: Bell,
    title: "Early Warning Indicators",
    description: "Get notified about potential issues before they become critical failures",
  },
  {
    icon: Target,
    title: "Maintenance Prioritization",
    description: "Intelligent recommendations help focus resources on the most critical assets",
  },
  {
    icon: TrendingUp,
    title: "Failure Risk Indication",
    description: "Data-driven insights highlight equipment at higher risk of breakdown",
  },
  {
    icon: Brain,
    title: "Smart Recommendations",
    description: "Suggested maintenance actions based on historical patterns and best practices",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track trends and identify opportunities to improve maintenance strategies",
  },
];

export function AssetHealthSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-background">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
            Smart Insights
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mt-4 mb-4">
            Intelligence That Supports Better Decisions
          </h2>
          <p className="text-lg text-muted-foreground">
            AI-CMS provides helpful insights to guide your maintenance team—not replace them
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Insights List */}
          <div className="space-y-6">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <insight.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{insight.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Visual Example */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-6">Asset Risk Analysis</h3>
              
              {/* Asset Health Items */}
              <div className="space-y-6">
                {[
                  { 
                    name: "Motor Bearing Assembly #12", 
                    health: 45, 
                    risk: "High",
                    recommendation: "Schedule replacement within 2 weeks",
                    color: "red"
                  },
                  { 
                    name: "Hydraulic Pump System", 
                    health: 72, 
                    risk: "Medium",
                    recommendation: "Inspect seals during next maintenance",
                    color: "yellow"
                  },
                  { 
                    name: "Conveyor Belt Drive", 
                    health: 91, 
                    risk: "Low",
                    recommendation: "Continue routine preventive maintenance",
                    color: "green"
                  },
                ].map((asset, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{asset.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          asset.risk === "High" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" :
                          asset.risk === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300" :
                          "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        }`}>
                          {asset.risk} Risk
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Health Score</p>
                        <p className="text-2xl font-semibold">{asset.health}%</p>
                      </div>
                    </div>
                    
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
                      <div 
                        className={`h-full rounded-full ${
                          asset.color === "red" ? "bg-red-600" :
                          asset.color === "yellow" ? "bg-yellow-600" :
                          "bg-green-600"
                        }`}
                        style={{ width: `${asset.health}%` }}
                      ></div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground italic">
                        {asset.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom callout */}
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100">
              AI as a Support Tool, Not a Replacement
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              AI-CMS uses intelligent algorithms to surface insights and patterns—but your maintenance 
              professionals make the final decisions. We help teams work smarter, not replace their expertise.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
