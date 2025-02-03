"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Play, Pause, RotateCcw, Music, Music2 } from "lucide-react"

type TimerPhase = "work" | "break"
type ColorScheme = "black" | "pink" | "blue" | "green"

const colorSchemes: Record<ColorScheme, { bg: string; text: string }> = {
  black: { bg: "from-gray-700 via-gray-900 to-black", text: "text-white" },
  pink: { bg: "from-pink-400 via-pink-500 to-pink-600", text: "text-white" },
  blue: { bg: "from-blue-400 via-blue-500 to-blue-600", text: "text-white" },
  green: { bg: "from-green-400 via-green-500 to-green-600", text: "text-white" },
}

export default function PomodoroTimer() {
  const [workInterval, setWorkInterval] = useState(25)
  const [breakInterval, setBreakInterval] = useState(5)
  const [timeLeft, setTimeLeft] = useState(workInterval * 60)
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<TimerPhase>("work")
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const [colorScheme, setColorScheme] = useState<ColorScheme>("pink")
  const [isRinging, setIsRinging] = useState(false)

  const timerRef = useRef<NodeJS.Timeout>()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      if (isMusicEnabled) {
        setIsRinging(true)
        audioRef.current?.play()
      }
      setPhase(phase === "work" ? "break" : "work")
      setTimeLeft(phase === "work" ? breakInterval * 60 : workInterval * 60)
      setColorScheme(getRandomColorScheme())
    }

    return () => clearTimeout(timerRef.current)
  }, [isActive, timeLeft, phase, workInterval, breakInterval, isMusicEnabled])

  useEffect(() => {
    document.body.className = `bg-gradient-to-br ${colorSchemes[colorScheme].bg}`
  }, [colorScheme])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = true
    }
  }, [])

  const toggleTimer = () => {
    setIsActive(!isActive)
    if (isRinging) {
      stopRingtone()
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setPhase("work")
    setTimeLeft(workInterval * 60)
    setColorScheme("pink")
    stopRingtone()
  }

  const stopRingtone = () => {
    setIsRinging(false)
    audioRef.current?.pause()
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getRandomColorScheme = (): ColorScheme => {
    const schemes = Object.keys(colorSchemes) as ColorScheme[]
    const filteredSchemes = schemes.filter((scheme) => scheme !== colorScheme)
    return filteredSchemes[Math.floor(Math.random() * filteredSchemes.length)]
  }

  const getTimerColor = () => {
    if (timeLeft <= 10) {
      return "text-red-500"
    } else if (timeLeft <= 30) {
      return "text-yellow-500"
    } else {
      return "text-white"
    }
  }

  const buttonClass = "bg-white bg-opacity-20 text-white transition-colors duration-300"

  return (
    <div className="space-y-8">
      <Card
        className={`w-full max-w-md mx-auto bg-gradient-to-br ${colorSchemes[colorScheme].bg} ${colorSchemes[colorScheme].text} shadow-lg transition-all duration-300`}
      >
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Pomodoro Timer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-8">
            <div
              className={`text-7xl font-bold tabular-nums bg-white bg-opacity-20 rounded-full p-8 shadow-inner ${getTimerColor()} transition-colors duration-300`}
            >
              {formatTime(timeLeft)}
            </div>
            <div className="text-2xl font-semibold bg-white bg-opacity-20 px-4 py-2 rounded-full">
              {phase === "work" ? "Work Phase" : "Break Phase"}
            </div>
            <div className="flex space-x-4">
              <Button onClick={toggleTimer} className={buttonClass}>
                {isActive ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                {isActive ? "Pause" : "Start"}
              </Button>
              <Button onClick={resetTimer} className={buttonClass}>
                <RotateCcw className="mr-2" />
                Reset
              </Button>
              <Button onClick={() => setIsMusicEnabled(!isMusicEnabled)} className={buttonClass}>
                {isMusicEnabled ? <Music2 className="mr-2" /> : <Music className="mr-2" />}
                {isMusicEnabled ? "Mute" : "Unmute"}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div>
                <Label htmlFor="workInterval" className="text-white">
                  Work (minutes)
                </Label>
                <Input
                  id="workInterval"
                  type="number"
                  value={workInterval}
                  onChange={(e) => setWorkInterval(Number(e.target.value))}
                  min={1}
                  className="bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border-white border-opacity-50 focus:border-white focus:ring-white"
                />
              </div>
              <div>
                <Label htmlFor="breakInterval" className="text-white">
                  Break (minutes)
                </Label>
                <Input
                  id="breakInterval"
                  type="number"
                  value={breakInterval}
                  onChange={(e) => setBreakInterval(Number(e.target.value))}
                  min={1}
                  className="bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border-white border-opacity-50 focus:border-white focus:ring-white"
                />
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {(Object.keys(colorSchemes) as ColorScheme[]).map((color) => (
                <Button
                  key={color}
                  onClick={() => setColorScheme(color)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorSchemes[color].bg} ${colorScheme === color ? "ring-2 ring-white" : ""}`}
                  aria-label={`Set ${color} theme`}
                />
              ))}
            </div>
          </div>
        </CardContent>
        <Bell className="absolute top-4 right-4 text-white opacity-70" size={24} />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {[
          { title: "Set Timer", content: "Choose your work and break intervals using the input fields." },
          {
            title: "Start/Pause",
            content: "Use the Start button to begin the timer, and Pause to temporarily stop it.",
          },
          { title: "Stay Focused", content: "Work during the work phase, and take a break during the break phase." },
        ].map((step, index) => (
          <Card
            key={index}
            className="overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
          >
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500">
              <CardTitle className="text-white text-xl">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p>{step.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <audio ref={audioRef} src="/notification.mp3" />
    </div>
  )
}

