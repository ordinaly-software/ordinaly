"use client"

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { AnimatePresence, motion } from "framer-motion"

interface LogoRendererProps {
  className?: string
}

export interface LogoCarouselLogo {
  name: string
  id: number
  img: React.ComponentType<LogoRendererProps>
}

interface LogoColumnProps {
  logos: LogoCarouselLogo[]
  index: number
  currentTime: number
  colClassName?: string
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const distributeLogos = (allLogos: LogoCarouselLogo[], columnCount: number): LogoCarouselLogo[][] => {
  const shuffled = shuffleArray(allLogos)
  const columns: LogoCarouselLogo[][] = Array.from({ length: columnCount }, () => [])

  shuffled.forEach((logo, index) => {
    columns[index % columnCount].push(logo)
  })

  const maxLength = Math.max(...columns.map((col) => col.length))
  columns.forEach((col) => {
    while (col.length < maxLength) {
      col.push(shuffled[Math.floor(Math.random() * shuffled.length)])
    }
  })

  return columns
}

const LogoColumn: React.FC<LogoColumnProps> = React.memo(
  ({ logos, index, currentTime, colClassName }) => {
    if (logos.length === 0) return null

    const cycleInterval = 2000
    const columnDelay = index * 200
    const adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length)
    const currentIndex = Math.floor(adjustedTime / cycleInterval)
    const CurrentLogo = useMemo(() => logos[currentIndex].img, [logos, currentIndex])

    return (
      <motion.div
        className={`relative overflow-hidden ${colClassName ?? "h-28 w-36 md:h-36 md:w-52"}`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.1,
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${logos[currentIndex].id}-${currentIndex}`}
            className="absolute inset-0 flex items-center justify-center"
            initial={{ y: "10%", opacity: 0, filter: "blur(8px)" }}
            animate={{
              y: "0%",
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                mass: 1,
                bounce: 0.2,
                duration: 0.5,
              },
            }}
            exit={{
              y: "-20%",
              opacity: 0,
              filter: "blur(6px)",
              transition: {
                type: "tween",
                ease: "easeIn",
                duration: 0.3,
              },
            }}
          >
            <CurrentLogo className="h-24 w-24 max-h-[80%] max-w-[80%] object-contain md:h-36 md:w-36" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }
)

interface LogoCarouselProps {
  columnCount?: number
  /** How many columns to show on screens narrower than md. Defaults to columnCount. */
  mobileColumnCount?: number
  logos: LogoCarouselLogo[]
  colClassName?: string
}

export function LogoCarousel({ columnCount = 2, mobileColumnCount, logos, colClassName }: LogoCarouselProps) {
  const [logoSets, setLogoSets] = useState<LogoCarouselLogo[][]>([])
  const [currentTime, setCurrentTime] = useState(0)

  const updateTime = useCallback(() => {
    setCurrentTime((prevTime) => prevTime + 100)
  }, [])

  useEffect(() => {
    const intervalId = setInterval(updateTime, 100)
    return () => clearInterval(intervalId)
  }, [updateTime])

  useEffect(() => {
    if (logos.length === 0) {
      setLogoSets([])
      return
    }

    const distributedLogos = distributeLogos(logos, columnCount)
    setLogoSets(distributedLogos)
  }, [logos, columnCount])

  if (logos.length === 0) return null

  const hideAbove = mobileColumnCount ?? columnCount

  return (
    <div className="flex space-x-4">
      {logoSets.map((logos, index) => (
        <div key={index} className={index >= hideAbove ? "hidden md:block" : undefined}>
          <LogoColumn
            logos={logos}
            index={index}
            currentTime={currentTime}
            colClassName={colClassName}
          />
        </div>
      ))}
    </div>
  )
}

export { LogoColumn };
