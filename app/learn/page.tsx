"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TopBar } from "@/components/layout/top-bar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { SkillNode } from "@/components/ui/skill-node"
import { useGame } from "@/contexts/game-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Award, Target, Users, Apple, Home, Cloud } from "lucide-react"

// Mock lesson data structure
const stages = Array.from({ length: 20 }, (_, i) => ({
  stage: i + 1,
  title: `Stage ${i + 1}`,
  subStages: Array.from({ length: 5 }, (_, j) => ({
    subStage: j + 1,
    title: `${i + 1}-${j + 1}`,
    id: `${i + 1}-${j + 1}`,
  })),
}))

export default function LearnPage() {
  const router = useRouter()
  const { state, dispatch } = useGame()
  const [dailyGoalProgress, setDailyGoalProgress] = useState(0)

  useEffect(() => {
    // Update streak on daily visit
    dispatch({ type: "UPDATE_STREAK" })

    // Calculate daily goal progress
    const dailyGoal = Number.parseInt(localStorage.getItem("owllearn-daily-goal") || "10")
    const todaysXP = state.xp // This would be today's XP in a real app
    setDailyGoalProgress(Math.min((todaysXP / (dailyGoal * 10)) * 100, 100))
  }, [dispatch, state.xp])

  const getNodeStatus = (stage: number, subStage: number) => {
    const lessonId = `${stage}-${subStage}`

    if (state.completedLessons.has(lessonId)) {
      return "completed"
    }

    if (stage === state.currentStage && subStage === state.currentSubStage) {
      return "current"
    }

    // Allow access to any lesson in current stage or previous stages
    if (stage < state.currentStage || 
        (stage === state.currentStage && subStage < state.currentSubStage)) {
      return "available"
    }

    // Allow access to the next lesson only
    if (stage === state.currentStage && subStage === state.currentSubStage + 1) {
      return "available"
    }

    // Allow access to first lesson of next stage if current stage is completed
    const currentStageCompleted = Array.from({ length: 5 }, (_, i) => i + 1)
      .every(subStageIndex => state.completedLessons.has(`${state.currentStage}-${subStageIndex}`))
    
    if (currentStageCompleted && stage === state.currentStage + 1 && subStage === 1) {
      return "available"
    }

    return "locked"
  }

  const handleNodeClick = (stage: number, subStage: number) => {
    const status = getNodeStatus(stage, subStage)
    if (status === "locked") return

    if (state.hearts <= 0) {
      // Show hearts modal or redirect to shop
      router.push("/shop")
      return
    }

    router.push(`/lesson/${stage}/${subStage}`)
  }

  const getStageInfo = (stage: number) => {
    const stageInfo = {
      1: { theme: "学校", icon: BookOpen, color: "bg-blue-500", lightColor: "bg-blue-100" },
      2: { theme: "家族", icon: Users, color: "bg-purple-500", lightColor: "bg-purple-100" },
      3: { theme: "食べ物", icon: Apple, color: "bg-red-500", lightColor: "bg-red-100" },
      4: { theme: "家", icon: Home, color: "bg-orange-500", lightColor: "bg-orange-100" },
      5: { theme: "天気", icon: Cloud, color: "bg-cyan-500", lightColor: "bg-cyan-100" },
    }
    return stageInfo[stage as keyof typeof stageInfo] || stageInfo[1]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <div className="p-4 pb-20">
        {/* Daily Progress Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-green-400 to-green-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">デイリーゴール</h2>
              <p className="text-green-100">ストリークを継続しよう！</p>
            </div>
            <Target className="w-8 h-8 text-green-200" />
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>{Math.round(dailyGoalProgress)}% 完了</span>
              <span>{state.streak} 日間ストリーク 🔥</span>
            </div>
            <div className="w-full bg-green-300/30 rounded-full h-3">
              <div
                className="bg-white rounded-full h-3 transition-all duration-500"
                style={{ width: `${dailyGoalProgress}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Current Progress Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-400 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">現在の進行状況</h2>
              <p className="text-blue-100">ステージ {state.currentStage} - レッスン {state.currentSubStage}</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Array.from(state.completedLessons).length}</div>
              <div className="text-xs text-blue-100">完了レッスン</div>
            </div>
          </div>

          {/* Stage Progress */}
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span>ステージ {state.currentStage} の進行状況</span>
              <span>{Array.from({ length: 5 }, (_, i) => i + 1)
                .filter(subStage => state.completedLessons.has(`${state.currentStage}-${subStage}`))
                .length}/5 完了</span>
            </div>
            <div className="w-full bg-blue-300/30 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ 
                  width: `${(Array.from({ length: 5 }, (_, i) => i + 1)
                    .filter(subStage => state.completedLessons.has(`${state.currentStage}-${subStage}`))
                    .length / 5) * 100}%` 
                }}
              />
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <BookOpen className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{Array.from(state.completedLessons).length}</div>
            <div className="text-xs text-gray-500">レッスン</div>
          </Card>

          <Card className="p-4 text-center">
            <Award className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">{state.totalXp}</div>
            <div className="text-xs text-gray-500">総XP</div>
          </Card>

          <Card className="p-4 text-center">
            <div className="text-2xl">🏆</div>
            <div className="text-2xl font-bold text-purple-600">{Math.floor(state.totalXp / 100)}</div>
            <div className="text-xs text-gray-500">レベル</div>
          </Card>
        </div>

        {/* Skill Tree */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-center text-gray-800">あなたの学習パス</h2>

          {stages.map((stage, stageIndex) => (
            <div key={stage.stage} className="relative">
              {/* Stage title */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-700">{stage.title}</h3>
                <p className="text-sm text-gray-500">
                  {stage.stage <= 4 ? "初級レベル" : stage.stage <= 12 ? "中級レベル" : "上級レベル"}
                </p>
              </div>

              {/* Lessons in this stage */}
              <div className="space-y-4">
                {stage.subStages.map((subStage) => {
                  const status = getNodeStatus(stage.stage, subStage.subStage)
                  const isClickable = status === "current" || status === "available"
                  const stageInfo = getStageInfo(stage.stage)
                  const StageIcon = stageInfo.icon

                  return (
                    <div key={subStage.id} className="relative">
                      <button
                        onClick={() => isClickable && handleNodeClick(stage.stage, subStage.subStage)}
                        disabled={!isClickable}
                        className={`skill-node ${status} transition-all duration-300 transform hover:scale-105`}
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
                          status === "completed" 
                            ? `${stageInfo.color} border-gray-300 text-white` 
                            : status === "current" 
                              ? `${stageInfo.lightColor} border-blue-400 ${stageInfo.color.replace('bg-', 'text-')}` 
                              : status === "available"
                                ? `bg-white border-gray-300 hover:${stageInfo.lightColor} ${stageInfo.color.replace('bg-', 'text-')}`
                                : "bg-gray-200 border-gray-300 text-gray-400"
                        }`}>
                          <StageIcon className="w-6 h-6" />
                        </div>
                      </button>

                      {/* Lesson info */}
                      <div className="text-center mt-2">
                        <p className="text-sm font-medium text-gray-700">
                          レッスン {subStage.subStage}: {stageInfo.theme}
                        </p>
                        {status === "completed" && (
                          <div className="text-xs text-green-600 flex items-center justify-center mt-1">
                            ✓ 完了
                          </div>
                        )}
                        {status === "current" && (
                          <div className="text-xs text-blue-600 flex items-center justify-center mt-1">
                            → 現在
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Connection line to next stage */}
              {stageIndex < stages.length - 1 && (
                <div className="flex justify-center mt-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-gray-300 to-transparent rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Continue Learning Button */}
        {state.hearts > 0 && (
          <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-[390px] px-4">
            <Button
              onClick={() => handleNodeClick(state.currentStage, state.currentSubStage)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg animate-pulse-green"
            >
              学習を続ける
            </Button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
