"use client"

import { useMemo, useState, type MouseEvent } from "react"
import { Play, XIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"
import { useCookiePreferences } from "@/hooks/useCookiePreferences"
import {
  extractYoutubeData,
  getYoutubeEmbedUrl,
  getYoutubeThumbnail,
  getYoutubeWatchUrl,
} from "@/utils/youtube"

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out"

interface HeroVideoProps {
  animationStyle?: AnimationStyle
  videoUrl: string
  thumbnailSrc?: string
  thumbnailAlt?: string
  title?: string
  playLabel?: string
  className?: string
}

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
}

function PlayGlyph() {
  return (
    <div className="bg-primary/10 flex size-28 items-center justify-center rounded-full backdrop-blur-md">
      <div className="from-primary/30 to-primary relative flex size-20 scale-100 items-center justify-center rounded-full bg-linear-to-b shadow-md transition-all duration-200 ease-out group-hover:scale-[1.2]">
        <Play
          className="size-8 scale-100 fill-white text-white transition-transform duration-200 ease-out group-hover:scale-105"
          style={{
            filter:
              "drop-shadow(0 4px 3px rgb(0 0 0 / 0.07)) drop-shadow(0 2px 2px rgb(0 0 0 / 0.06))",
          }}
        />
      </div>
    </div>
  )
}

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoUrl,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  title = "Video player",
  playLabel = "Play video",
  className,
}: HeroVideoProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const selectedAnimation = animationVariants[animationStyle]
  const cookiePreferences = useCookiePreferences()
  const canLoadVideo = Boolean(cookiePreferences?.marketing)

  const youtubeData = useMemo(() => extractYoutubeData(videoUrl), [videoUrl])
  const resolvedThumbnail = thumbnailSrc ?? (youtubeData ? getYoutubeThumbnail(youtubeData) : undefined)

  if (!youtubeData || !resolvedThumbnail) return null

  const embedSrc = `${getYoutubeEmbedUrl(youtubeData)}?autoplay=1&rel=0`
  const watchUrl = getYoutubeWatchUrl(youtubeData)

  const closeModal = () => setIsVideoOpen(false)

  const handleOpenOnYoutube = (event: MouseEvent) => {
    event.stopPropagation()
    window.open(watchUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label={playLabel}
        className="group relative flex w-full cursor-pointer border-0 bg-transparent p-0"
        onClick={() => setIsVideoOpen(true)}
      >
        <img
          src={resolvedThumbnail}
          alt={thumbnailAlt}
          width={1920}
          height={1080}
          className="w-full rounded-md border shadow-lg transition-all duration-200 ease-out group-hover:brightness-[0.8]"
        />
        <div className="absolute inset-0 flex scale-[0.9] items-center justify-center rounded-2xl transition-all duration-200 ease-out group-hover:scale-100">
          <PlayGlyph />
        </div>
      </button>
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
                closeModal()
              }
            }}
            onClick={closeModal}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative mx-4 aspect-video w-full max-w-6xl md:mx-0"
            >
              <motion.button className="absolute -top-16 right-0 rounded-full bg-neutral-900/50 p-2 text-xl text-white ring-1 backdrop-blur-md dark:bg-neutral-100/50 dark:text-black">
                <XIcon className="size-5" />
              </motion.button>
              <div className="relative isolate z-1 size-full overflow-hidden rounded-2xl border-2 border-white">
                {canLoadVideo ? (
                  <iframe
                    src={embedSrc}
                    title={title}
                    className="mt-0 size-full rounded-2xl"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  ></iframe>
                ) : (
                  <button
                    type="button"
                    aria-label={playLabel}
                    onClick={handleOpenOnYoutube}
                    className="group relative flex size-full items-center justify-center border-0 bg-black p-0"
                  >
                    <img
                      src={resolvedThumbnail}
                      alt={thumbnailAlt}
                      className="absolute inset-0 size-full object-cover transition-all duration-200 ease-out group-hover:brightness-[0.8]"
                    />
                    <div className="absolute inset-0 flex scale-[0.9] items-center justify-center transition-all duration-200 ease-out group-hover:scale-100">
                      <PlayGlyph />
                    </div>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
