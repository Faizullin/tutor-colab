"use client"

import Footer from "@/components/layout/footer"
import Header from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { motion, Variants } from "framer-motion"
import {
  ArrowRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  Code,
  Code2,
  Code2Icon,
  FileCode,
  GitBranch,
  Languages,
  Lightbulb,
  MessageSquareCode,
  Palette,
  Pause,
  Play,
  Sparkles,
  Star,
  Terminal,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useRef } from "react"

function Home() {
  return (
    <>
      <Header />
      <div className="flex flex-1 bg-[#1e1e1e] text-white min-h-screen overflow-hidden">
        {/* Animated gradient orbs */}
        {/* <motion.div
        className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-500/10 rounded-full z-0"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{ filter: "blur(100px)" }}
      /> */}

        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection />
          <AboutSection />
          <FeatureSection />
          <AIFeaturesSection />
          <CTASection />
        </main>
      </div>
      <Footer />
    </>
  )
}

function VideoPlayer({ src, fallbackImage, className }: { src: string; fallbackImage: string; className: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isHovering, setIsHovering] = React.useState(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => {
      setIsPlaying(false)
    }

    video.addEventListener("ended", handleEnded)
    return () => {
      video.removeEventListener("ended", handleEnded)
    }
  }, [])

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <video ref={videoRef} className="w-full h-full object-cover rounded-lg" poster={fallbackImage} muted playsInline>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {(isHovering || !isPlaying) && (
        <motion.button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg transition-opacity hover:bg-black/40"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="p-3 bg-emerald-500 rounded-full text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </motion.div>
        </motion.button>
      )}
    </motion.div>
  )
}

function HeroSection() {
  const router = useRouter()

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  return (
    <motion.div
      className="py-12 md:py-20 flex flex-col md:flex-row items-center"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div className="flex-1 text-left md:pr-12 mb-8 md:mb-0" variants={container}>
        <motion.div
          className="inline-flex items-center px-3 py-1 mb-6 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm"
          variants={item}
          whileHover={{ scale: 1.05 }}
        >
          <Star size={14} className="mr-1" /> Feature-Rich Code Playground
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight"
          variants={item}
        >
          <span className="relative">
            Modern Code{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Editor</span>
          </span>
        </motion.h1>

        <motion.p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl" variants={item}>
          CodeX is a code editor with smart suggestions to help you write code more efficiently.
        </motion.p>

        <motion.div className="flex flex-col sm:flex-row gap-4 mb-8" variants={item}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => router.push("/editor/demo")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-5 text-lg rounded-md flex items-center group transition-all"
            >
              Try CodeX
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "mirror",
                  duration: 1.5,
                  ease: "easeInOut",
                }}
              >
                <ArrowRight className="ml-2" size={20} />
              </motion.span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => router.push("/editor/demo")}
              variant="outline"
              className="border-gray-700 text-gray-950 hover:bg-gray-800 hover:text-white hover:border-gray-600  px-6 py-5 text-lg rounded-md"
            >
              View Demo
            </Button>
          </motion.div>
        </motion.div>

        <motion.div className="flex flex-col sm:flex-row sm:items-center text-gray-400 text-sm gap-y-2" variants={item}>
          <span className="flex items-center">
            <Check size={16} className="text-emerald-400 mr-1 flex-shrink-0" /> AI-powered assistant
          </span>
          <span className="hidden sm:block mx-2">•</span>
          <span className="flex items-center">
            <Check size={16} className="text-emerald-400 mr-1 flex-shrink-0" /> Secure code execution environment
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        className="flex-1 w-full max-w-2xl mx-auto md:max-w-3xl relative"
        variants={item}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 0.5,
          type: "spring",
          stiffness: 100,
        }}
      >
        <motion.div
          className="absolute -inset-6 bg-emerald-500/20 rounded-2xl z-0"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{ filter: "blur(20px)" }}
        />
        <motion.div
          className="relative overflow-hidden rounded-xl border border-gray-800 shadow-2xl"
          whileHover={{
            boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-10 bg-[#252525] flex items-center px-4 z-10">
            <div className="flex space-x-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
            </div>
          </div>
          <div className="pt-10">
            <VideoPlayer
              src="https://res.cloudinary.com/dnih6mdkd/video/upload/v1744716480/editorMain_compressed_nbg8p4.mp4"
              fallbackImage="https://res.cloudinary.com/dnih6mdkd/image/upload/v1744920802/hero_vmklzl.png"
              className="relative z-20 rounded-xl w-full h-full object-contain"
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function AboutSection() {
  const scrollReveal: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <motion.div
      id="about"
      className="w-full py-12 sm:py-16 md:py-20 lg:py-24 flex flex-col items-center scroll-mt-16 px-4 sm:px-6 md:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={scrollReveal}
    >
      <motion.div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 w-full max-w-4xl mx-auto">
        <motion.div
          className="inline-flex items-center px-3 py-1 mb-3 sm:mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-xs sm:text-sm"
          whileHover={{ scale: 1.05 }}
        >
          ABOUT CODEX
        </motion.div>
        <motion.h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
          A Better Way to <span className="text-emerald-400">Code</span>
        </motion.h2>
        <motion.p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-xs sm:max-w-lg md:max-w-2xl mx-auto">
          I&apos;m building tools to make coding more intuitive and efficient
        </motion.p>
      </motion.div>

      <motion.div className="relative w-full max-w-7xl">
        <motion.div className="relative w-full">
          {/* Background gradient effect - responsive sizing */}
          <motion.div
            className="absolute -inset-4 sm:-inset-6 md:-inset-8 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl z-0"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ filter: "blur(30px)" }}
          />
          <div className="absolute rounded-xl bg-gradient-to-r from-emerald-500/30 to-transparent z-10"></div>

          {/* Increased video size for mobile */}
          <motion.div
            className="w-full h-auto"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <VideoPlayer
              src="https://res.cloudinary.com/dnih6mdkd/video/upload/v1744716480/editorMain_compressed_nbg8p4.mp4"
              fallbackImage="https://res.cloudinary.com/dnih6mdkd/image/upload/v1744920802/hero_vmklzl.png"
              className="relative z-20 rounded-xl w-full h-full object-cover"
            />
          </motion.div>

          {/* Feature cards - hidden on mobile and tablets, visible on desktop (lg) */}
          <div className="hidden lg:flex absolute bottom-8 right-8 flex-col gap-4 z-30">
            {/* Code Suggestions */}
            <motion.div
              className="bg-[#252525] border border-gray-800 p-4 rounded-lg shadow-xl max-w-xs"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)",
              }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.2,
              }}
              viewport={{ once: true }}
            >
              <div className="flex items-start">
                <div className="text-emerald-400 bg-emerald-400/10 p-2 rounded-lg mr-3 flex-shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Code Suggestions</h4>
                  <p className="text-gray-400 text-sm">Get helpful completion suggestions as you type</p>
                </div>
              </div>
            </motion.div>

            {/* Code Converter */}
            <motion.div
              className="bg-[#252525] border border-gray-800 p-4 rounded-lg shadow-xl max-w-xs"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)",
              }}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.4,
              }}
              viewport={{ once: true }}
            >
              <div className="flex items-start">
                <div className="text-emerald-400 bg-emerald-400/10 p-2 rounded-lg mr-3 flex-shrink-0">
                  <Code size={20} />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Code Converter</h4>
                  <p className="text-gray-400 text-sm">Seamlessly translate your code between languages</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function FeatureSection() {
  const features = [
    {
      title: "Multi-Language Support",
      description: "Write and collaborate in multiple programming languages with seamless integration.",
      icon: <GitBranch size={24} />,
    },
    {
      title: "Syntax Highlighting",
      description: "Enhanced readability with clear visual distinction between code elements.",
      icon: <Palette size={24} />,
    },
    {
      title: "Code Converter",
      description: "Convert your code into any language using AI within seconds.",
      icon: <Code2Icon size={24} />,
    },
    {
      title: "Smart Code Assistance",
      description: "AI-powered suggestions to speed up coding and reduce errors.",
      icon: <BrainCircuit size={24} />,
    },
    {
      title: "Intelligent Code Completion",
      description: "Predictive suggestions based on common patterns for faster development.",
      icon: <Zap size={24} />,
    },
    {
      title: "Optimized Performance",
      description: "Designed for speed and efficiency, even with large projects.",
      icon: <Sparkles size={24} />,
    },
  ]

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  return (
    <motion.div
      id="features"
      className="py-16 md:py-20 scroll-mt-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={container}
    >
      <motion.div className="text-center mb-12 md:mb-16" variants={item}>
        <motion.div
          className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm"
          whileHover={{ scale: 1.05 }}
        >
          FEATURES
        </motion.div>
        <motion.h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          Tools to Help You <span className="text-emerald-400">Code Better</span>
        </motion.h2>
        <motion.p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Designed to make your coding workflow smoother and more productive
        </motion.p>
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" variants={container}>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="group p-6 md:p-8 rounded-xl border border-gray-800/50 bg-gray-900/20 backdrop-blur-sm transition-all duration-300"
            variants={item}
            whileHover={{
              y: -8,
              boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)",
              borderColor: "rgba(16, 185, 129, 0.3)",
            }}
          >
            <motion.div
              className="flex items-center mb-4"
              initial={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div
                className="p-3 rounded-lg bg-emerald-400/10 text-emerald-400 mr-4 flex-shrink-0"
                whileHover={{
                  backgroundColor: "rgba(16, 185, 129, 0.2)",
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 0.5 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
            </motion.div>
            <p className="text-gray-400 group-hover:text-gray-300 transition-colors mt-4">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

function AIFeaturesSection() {
  return (
    <div id="ai-features" className="py-16 md:py-24 scroll-mt-16">
      <motion.div
        className="text-center mb-12 md:mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
      >
        <motion.div
          className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm"
          whileHover={{ scale: 1.05 }}
        >
          AI-POWERED FEATURES
        </motion.div>
        <motion.h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
          Supercharge Your Workflow with <span className="text-emerald-400">AI</span>
        </motion.h2>
        <motion.p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          CodeX integrates powerful AI capabilities to make you more productive
        </motion.p>
      </motion.div>

      <div className="space-y-52">
        <CodeConverterFeature />
        <AICodeAssistantFeature />
        <CodeSuggestionFeature />
      </div>
    </div>
  )
}

function CodeConverterFeature() {
  return (
    <motion.div
      className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full lg:w-3/4 xl:w-2/3 order-2 lg:order-1"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.2,
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-6 bg-emerald-500/20 rounded-2xl z-0"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ filter: "blur(20px)" }}
          />
          <motion.div
            className="relative overflow-hidden rounded-xl border border-gray-800 shadow-2xl"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <VideoPlayer
              src="https://res.cloudinary.com/dnih6mdkd/video/upload/v1744716374/codeConverterNewVideo664654656_tkk4cj.mp4"
              fallbackImage="https://res.cloudinary.com/dnih6mdkd/image/upload/v1744920802/converter_hp9ox2.png"
              className="bg-emerald-500 w-full h-auto object-cover"
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="w-full lg:w-1/2 order-1 lg:order-2"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.3,
        }}
      >
        <motion.div
          className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm"
          whileHover={{ scale: 1.05 }}
        >
          <Code2 size={16} className="mr-2" /> CODE CONVERTER
        </motion.div>
        <motion.h3 className="text-2xl md:text-3xl font-bold mb-4">
          Translate Your Code Between Languages Instantly
        </motion.h3>
        <motion.p className="text-gray-300 mb-6">
          Need your JavaScript in Python? PHP in Go? Our AI-powered code converter seamlessly translates your code
          between languages while preserving functionality and following best practices.
        </motion.p>

        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4,
              },
            },
          }}
        >
          <motion.div
            className="flex items-start"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
          >
            <motion.div
              className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0"
              whileHover={{
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <Zap size={18} />
            </motion.div>
            <div>
              <h4 className="font-semibold">Lightning Fast</h4>
              <p className="text-gray-400 text-sm">Convert entire files or code snippets in seconds</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
          >
            <motion.div
              className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0"
              whileHover={{
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <Languages size={18} />
            </motion.div>
            <div>
              <h4 className="font-semibold">Multiple Language Support</h4>
              <p className="text-gray-400 text-sm">Python, JavaScript, TypeScript, Java, C#, PHP, Go, and more</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
          >
            <motion.div
              className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0"
              whileHover={{
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle2 size={18} />
            </motion.div>
            <div>
              <h4 className="font-semibold">Maintains Functionality</h4>
              <p className="text-gray-400 text-sm">Preserves logic and behavior across languages</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function AICodeAssistantFeature() {
  return (
    <motion.div
      className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full lg:w-1/2"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.2,
        }}
      >
        <motion.div
          className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm"
          whileHover={{ scale: 1.05 }}
        >
          <BrainCircuit size={16} className="mr-2" /> AI CODE ASSISTANT
        </motion.div>
        <motion.h3 className="text-2xl md:text-3xl font-bold mb-4">Your Intelligent Coding Partner</motion.h3>
        <motion.p className="text-gray-300 mb-6">
          Get help with bugs, optimizations, and code reviews from an AI assistant that understands your current file.
          Ask questions in natural language and receive contextually relevant solutions.
        </motion.p>

        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4,
              },
            },
          }}
        >
          <motion.div
            className="flex items-start"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
          >
            <motion.div
              className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0"
              whileHover={{
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <MessageSquareCode size={18} />
            </motion.div>
            <div>
              <h4 className="font-semibold">Context-Aware</h4>
              <p className="text-gray-400 text-sm">Gets insights from your entire file or project</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
          >
            <motion.div
              className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0"
              whileHover={{
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <Terminal size={18} />
            </motion.div>
            <div>
              <h4 className="font-semibold">Natural Language Interface</h4>
              <p className="text-gray-400 text-sm">Ask questions or request help in plain English</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
          >
            <motion.div
              className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0"
              whileHover={{
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <FileCode size={18} />
            </motion.div>
            <div>
              <h4 className="font-semibold">Code Explanations</h4>
              <p className="text-gray-400 text-sm">Get complex code explained in simple terms</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="w-full lg:w-3/4 xl:w-2/3"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.3,
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-6 bg-emerald-500/20 rounded-2xl z-0"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ filter: "blur(20px)" }}
          />
          <motion.div
            className="relative overflow-hidden rounded-xl border border-gray-800 shadow-2xl"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <VideoPlayer
              src="https://res.cloudinary.com/dnih6mdkd/video/upload/v1744716110/AIassistant_esvuq9.mp4"
              fallbackImage="https://res.cloudinary.com/dnih6mdkd/image/upload/v1744920802/ai-assiant_cfeqp1.png"
              className="bg-emerald-500 w-full h-auto aspect-video"
            />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function CodeSuggestionFeature() {
  return (
    <motion.div
      className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full lg:w-3/4 xl:w-2/3 order-2 lg:order-1"
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.2,
        }}
      >
        <div className="relative">
          <motion.div
            className="absolute -inset-6 bg-emerald-500/20 rounded-2xl z-0"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ filter: "blur(20px)" }}
          />
          <motion.div
            className="relative overflow-hidden rounded-xl border border-gray-800 shadow-2xl"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.1), 0 10px 10px -5px rgba(16, 185, 129, 0.04)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <VideoPlayer
              src="https://res.cloudinary.com/dnih6mdkd/video/upload/v1744716284/aiSuggestion_tm1lrq.mp4"
              fallbackImage="https://res.cloudinary.com/dnih6mdkd/image/upload/v1744920803/suggestion_olhkce.png"
              className="bg-emerald-500 w-full h-auto aspect-video object-cover"
            />
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="w-full lg:w-1/2 order-1 lg:order-2"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: 0.3,
        }}
      >
        <motion.div
          className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm"
          whileHover={{ scale: 1.05 }}
        >
          <Sparkles size={16} className="mr-2" /> CODE SUGGESTIONS
        </motion.div>
        <motion.h3 className="text-2xl md:text-3xl font-bold mb-4">
          Smart Completion That Understands Your Code
        </motion.h3>
        <motion.p className="text-gray-300 mb-6">
          Get intelligent code suggestions as you type. Our AI analyzes your current file to suggest relevant functions,
          methods, and code blocks that fit your specific context.
        </motion.p>

        <motion.div
          className="space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4,
              },
            },
          }}
        >
          <motion.div
            className="flex items-start"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
          >
            <motion.div
              className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0"
              whileHover={{
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <Lightbulb size={18} />
            </motion.div>
            <div>
              <h4 className="font-semibold">Context-Aware Suggestions</h4>
              <p className="text-gray-400 text-sm">Gets smarter the more you code in your project</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
          >
            <motion.div
              className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0"
              whileHover={{
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <Zap size={18} />
            </motion.div>
            <div>
              <h4 className="font-semibold">Complete Functions & Blocks</h4>
              <p className="text-gray-400 text-sm">Suggests entire functions, not just single lines</p>
            </div>
          </motion.div>

          <motion.div
            className="flex items-start"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                },
              },
            }}
          >
            <motion.div
              className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400 mr-3 flex-shrink-0"
              whileHover={{
                backgroundColor: "rgba(16, 185, 129, 0.2)",
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 0.5 }}
            >
              <Code2 size={18} />
            </motion.div>
            <div>
              <h4 className="font-semibold">Best Practice Recommendations</h4>
              <p className="text-gray-400 text-sm">Follows coding standards and patterns in your current file</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function CTASection() {
  const router = useRouter()
  return (
    <motion.section
      id="cta"
      className="w-full py-16 md:py-24 px-4 sm:px-6 md:px-8"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-gray-800 p-8 md:p-12"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
        >
          <motion.div
            className="absolute -inset-40 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 z-0"
            animate={{
              rotate: [0, 360],
              opacity: [0.1, 0.15, 0.1],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            style={{ filter: "blur(100px)" }}
          />
          <div className="relative flex flex-col items-center text-center z-10">
            {/* Simple Tagline */}
            <motion.div
              className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              A better way to write code
            </motion.div>

            {/* Headline */}
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Try <span className="text-emerald-400">CodeX</span> and see for yourself
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-lg text-gray-300 mb-8 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              CodeX helps you write code with smart suggestions and a built-in code converter. Give it a shot and let me
              know what you think!
            </motion.p>

            {/* CTA Button */}
            <motion.div
              onClick={() => router.push("/editor/demo")}
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition duration-300 shadow-lg hover:shadow-emerald-500/20"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.2), 0 10px 10px -5px rgba(16, 185, 129, 0.1)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Try CodeX
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Home