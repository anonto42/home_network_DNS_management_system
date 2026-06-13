import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react'
import { create } from 'zustand'
import { TOUR_STEPS, type TourStep } from './tourSteps'
import { getPopoverStyle, getSpotlightStyle } from './tourLayout'

interface TourStore {
  isActive: boolean
  currentStepIndex: number
  targetRect: DOMRect | null
  startTour: (navigate: (path: string) => void) => void
  stopTour: () => void
  nextStep: (navigate: (path: string) => void) => void
  prevStep: (navigate: (path: string) => void) => void
  setTargetRect: (rect: DOMRect | null) => void
}

export const useTourStore = create<TourStore>((set, get) => ({
  isActive: false,
  currentStepIndex: 0,
  targetRect: null,
  startTour: (navigate) => {
    set({ currentStepIndex: 0, isActive: true })
    navigate('/')
  },
  stopTour: () => {
    set({ isActive: false, targetRect: null })
  },
  nextStep: (navigate) => {
    const { currentStepIndex, stopTour } = get()
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1
      const nextStepObj = TOUR_STEPS[nextIndex]
      if (nextStepObj.route && window.location.pathname !== nextStepObj.route) {
        navigate(nextStepObj.route)
        setTimeout(() => {
          set({ currentStepIndex: nextIndex })
        }, 300)
      } else {
        set({ currentStepIndex: nextIndex })
      }
    } else {
      stopTour()
    }
  },
  prevStep: (navigate) => {
    const { currentStepIndex } = get()
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1
      const prevStepObj = TOUR_STEPS[prevIndex]
      if (prevStepObj.route && window.location.pathname !== prevStepObj.route) {
        navigate(prevStepObj.route)
        setTimeout(() => {
          set({ currentStepIndex: prevIndex })
        }, 300)
      } else {
        set({ currentStepIndex: prevIndex })
      }
    }
  },
  setTargetRect: (rect) => {
    set({ targetRect: rect })
  },
}))

export function useTour() {
  const navigate = useNavigate()
  const isActive = useTourStore(state => state.isActive)
  const currentStepIndex = useTourStore(state => state.currentStepIndex)
  const startTour = useTourStore(state => state.startTour)
  const stopTour = useTourStore(state => state.stopTour)
  const nextStep = useTourStore(state => state.nextStep)
  const prevStep = useTourStore(state => state.prevStep)

  return {
    isActive,
    currentStepIndex,
    startTour: () => startTour(navigate),
    stopTour,
    nextStep: () => nextStep(navigate),
    prevStep: () => prevStep(navigate),
    currentStep: isActive ? TOUR_STEPS[currentStepIndex] : null,
  }
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const isActive = useTourStore(state => state.isActive)
  const currentStepIndex = useTourStore(state => state.currentStepIndex)
  const targetRect = useTourStore(state => state.targetRect)
  const setTargetRect = useTourStore(state => state.setTargetRect)
  const stopTour = useTourStore(state => state.stopTour)

  const { nextStep, prevStep } = useTour()

  // Track target bounding rect
  useEffect(() => {
    if (!isActive) return

    let attempts = 0
    const checkElement = () => {
      const step = TOUR_STEPS[currentStepIndex]
      if (!step) return

      if (!step.target || step.target === 'viewport') {
        setTargetRect(null)
        return
      }

      const el = document.querySelector(step.target)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          setTargetRect(el.getBoundingClientRect())
        }, 150)
      } else {
        attempts++
        if (attempts < 20) {
          setTimeout(checkElement, 100)
        } else {
          setTargetRect(null)
        }
      }
    }

    checkElement()
    window.addEventListener('resize', checkElement)
    window.addEventListener('scroll', checkElement)

    return () => {
      window.removeEventListener('resize', checkElement)
      window.removeEventListener('scroll', checkElement)
    }
  }, [isActive, currentStepIndex, setTargetRect])

  const currentStep = isActive ? TOUR_STEPS[currentStepIndex] : null

  return (
    <>
      {children}

      <AnimatePresence>
        {isActive && (
          <>
            {/* Clickable dismiss layer */}
            <motion.div
              key="tour-dismiss"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={stopTour}
              className="fixed inset-0 z-[9990] cursor-pointer"
              style={{ background: 'transparent' }}
            />

            {/* Spotlight highlight */}
            <AnimatePresence mode="wait">
              {targetRect && (
                <motion.div
                  key={`spotlight-${currentStepIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={getSpotlightStyle(targetRect)!}
                />
              )}
            </AnimatePresence>

            {/* Dark overlay for center/no-target steps */}
            {!targetRect && (
              <motion.div
                key="tour-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-[9990]"
              />
            )}

            {/* Tour Popover */}
            <motion.div
              key={`popover-${currentStepIndex}`}
              style={{ ...getPopoverStyle(targetRect, currentStep), backgroundColor: 'var(--card)', backdropFilter: 'blur(16px)' }}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="border border-border shadow-2xl p-5 rounded-none pointer-events-auto flex flex-col space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-1.5 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">System Guide</span>
                </div>
                <button
                  onClick={stopTour}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-none hover:bg-muted/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-6 px-2 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary font-mono text-xs rounded-none font-bold shrink-0">
                    {String(currentStepIndex + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-bold text-sm text-foreground tracking-tight leading-tight">
                    {currentStep?.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentStep?.content}
                </p>
              </div>

              {/* Footer navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                {/* Progress dots */}
                <div className="flex items-center gap-1">
                  {TOUR_STEPS.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-none transition-all duration-300 ${
                        idx === currentStepIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <button
                      onClick={prevStep}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border rounded-none transition-all duration-200"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:brightness-110 shadow-sm rounded-none transition-all duration-200"
                  >
                    {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
