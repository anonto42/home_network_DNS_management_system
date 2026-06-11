import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react'

export interface TourStep {
  title: string
  content: string
  target?: string
  route?: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to NetShield',
    content: 'NetShield is a high-performance DNS management server for your home network. This interactive guide will walk you through the core modules, detailing how our Go-based resolver and SQLite database function under the hood to secure and optimize your local queries.',
    placement: 'center',
    route: '/',
  },
  {
    title: 'DNS Queries Analytics',
    content: 'This area chart plots real-time traffic statistics. Cached queries are answered from local memory in sub-milliseconds. Blocked queries are intercepted by blocklists and sinkholed. Allowed queries are forwarded to upstream resolvers and cached.',
    target: '[data-tour="chart-queries"]',
    placement: 'bottom',
    route: '/',
  },
  {
    title: 'System Health Diagnostics',
    content: 'Monitors real-time resource utilization, server uptime, and active resolver status. Under the hood, the Go server coordinates system metrics and responds to settings changes instantly, eliminating the need to manually restart the DNS daemon.',
    target: '[data-tour="system-health"]',
    placement: 'bottom',
    route: '/',
  },
  {
    title: 'Navigation Menu',
    content: 'This navigation panel lets you configure local DNS records, routing rules, domain blocklists, and system preferences. Let\'s move to the DNS Records page next.',
    target: '[data-tour="sidebar-navigation"]',
    placement: 'right',
    route: '/',
  },
  {
    title: 'Local DNS Records',
    content: 'This table houses local DNS records (like A, AAAA, CNAME) which map custom domains (e.g. "nas.home") directly to local IPs. The NetShield resolver evaluates these rules first, serving local queries authoritatively and overriding upstream responses.',
    target: '[data-tour="dns-records-list"]',
    placement: 'top',
    route: '/records',
  },
  {
    title: 'Traffic Steering Policies',
    content: 'Traffic steering dynamically intercepts queries matching specific domains or client IPs. Steered queries can be forwarded to alternate DNS upstreams (e.g., secure DoH/DoT endpoints) or redirected to alternate IP destinations in priority order.',
    target: '[data-tour="traffic-steering-list"]',
    placement: 'top',
    route: '/steering',
  },
  {
    title: 'Security Blocklists',
    content: 'Enforce domain blocking policies here. Added wildcards or domains match queries instantly. When a block is active, the resolver returns 0.0.0.0 or NXDOMAIN, saving local bandwidth and shielding clients from malicious tracking domains.',
    target: '[data-tour="blocklist-list"]',
    placement: 'top',
    route: '/blocklist',
  },
  {
    title: 'Real-Time Activity Logs',
    content: 'Inspect every DNS query made by local clients. You can search by domain, filter by status (allowed, blocked, cached), and review resolution times to detect network latency bottlenecks or suspicious device activity.',
    target: '[data-tour="query-logs-list"]',
    placement: 'top',
    route: '/logs',
  },
  {
    title: 'Upstream Resolver Settings',
    content: 'Define primary DNS resolvers, minimum/maximum cache TTL limits, and toggle blocked response behavior. Returning NXDOMAIN triggers name error warnings on clients, whereas 0.0.0.0 acts as a faster, silent sinkhole.',
    target: '[data-tour="settings-card"]',
    placement: 'top',
    route: '/settings',
  },
  {
    title: 'Admin Profile Settings',
    content: 'Manage your administrator credentials. Updating your display name or email pushes changes directly to the persistent SQLite "users" table. Updates are immediately reflected across the system (such as in the top header).',
    target: '[data-tour="profile-card"]',
    placement: 'top',
    route: '/profile',
  },
  {
    title: 'Alert Notification Center',
    content: 'Alerts you of significant system events, such as blocking configuration toggles, rule updates, or password changes. Notifications are stored in the server SQLite database and polled dynamically to maintain real-time status visibility.',
    target: '[data-tour="notification-bell"]',
    placement: 'bottom',
    route: '/',
  },
  {
    title: 'NetShield Tour Completed!',
    content: 'You are now ready to operate NetShield like a pro! If you need to re-run this guide or review technical descriptions in the future, you can restart the tour at any time from the sidebar menu.',
    placement: 'center',
    route: '/',
  },
]

interface TourContextType {
  isActive: boolean
  currentStepIndex: number
  startTour: () => void
  stopTour: () => void
  nextStep: () => void
  prevStep: () => void
  currentStep: TourStep | null
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const navigate = useNavigate()

  const startTour = useCallback(() => {
    setCurrentStepIndex(0)
    setIsActive(true)
    navigate('/')
  }, [navigate])

  const stopTour = useCallback(() => {
    setIsActive(false)
    setTargetRect(null)
  }, [])

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1
      const nextStepObj = TOUR_STEPS[nextIndex]
      if (nextStepObj.route && window.location.pathname !== nextStepObj.route) {
        navigate(nextStepObj.route)
        // Give transition some time
        setTimeout(() => {
          setCurrentStepIndex(nextIndex)
        }, 300)
      } else {
        setCurrentStepIndex(nextIndex)
      }
    } else {
      stopTour()
    }
  }, [currentStepIndex, navigate, stopTour])

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1
      const prevStepObj = TOUR_STEPS[prevIndex]
      if (prevStepObj.route && window.location.pathname !== prevStepObj.route) {
        navigate(prevStepObj.route)
        setTimeout(() => {
          setCurrentStepIndex(prevIndex)
        }, 300)
      } else {
        setCurrentStepIndex(prevIndex)
      }
    }
  }, [currentStepIndex, navigate])

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
        // Take a small delay to let smooth scroll settle before bounding box calculation
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
  }, [isActive, currentStepIndex])

  // ─── Clamp popover to viewport in every direction ────────────────────
  const getPopoverStyle = (): React.CSSProperties => {
    const POPOVER_W = Math.min(380, window.innerWidth - 32) // never wider than screen
    const POPOVER_H = 300 // conservative estimate
    const GAP = 14
    const EDGE = 16 // min gap from any viewport edge

    // Mobile: always dock to bottom of screen
    if (window.innerWidth < 600) {
      return {
        position: 'fixed',
        bottom: `${EDGE}px`,
        left: `${EDGE}px`,
        right: `${EDGE}px`,
        zIndex: 9999,
      }
    }

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      width: `${POPOVER_W}px`,
    }

    if (!targetRect) {
      // Centered in viewport
      style.top = '50%'
      style.left = '50%'
      style.transform = 'translate(-50%, -50%)'
      return style
    }

    const step = TOUR_STEPS[currentStepIndex]
    let placement = step?.placement ?? 'bottom'

    // Clamp X: center on element, but stay within screen edges
    const elementCenterX = targetRect.left + targetRect.width / 2
    const rawLeft = elementCenterX - POPOVER_W / 2
    const clampedLeft = Math.max(EDGE, Math.min(window.innerWidth - POPOVER_W - EDGE, rawLeft))

    // Auto-flip placement if insufficient space
    const spaceBelow = window.innerHeight - targetRect.bottom
    const spaceAbove = targetRect.top
    const spaceRight = window.innerWidth - targetRect.right
    const spaceLeft = targetRect.left

    if (placement === 'bottom' && spaceBelow < POPOVER_H + GAP && spaceAbove > spaceBelow) {
      placement = 'top'
    } else if (placement === 'top' && spaceAbove < POPOVER_H + GAP && spaceBelow > spaceAbove) {
      placement = 'bottom'
    } else if (placement === 'right' && spaceRight < POPOVER_W + GAP && spaceLeft > spaceRight) {
      placement = 'left'
    } else if (placement === 'left' && spaceLeft < POPOVER_W + GAP && spaceRight > spaceLeft) {
      placement = 'right'
    }

    if (placement === 'bottom') {
      const rawTop = targetRect.bottom + GAP
      style.top = `${Math.min(rawTop, window.innerHeight - POPOVER_H - EDGE)}px`
      style.left = `${clampedLeft}px`
    } else if (placement === 'top') {
      const rawBottom = window.innerHeight - targetRect.top + GAP
      // Clamp so box doesn't go above viewport
      const clampedTop = Math.max(EDGE, targetRect.top - GAP - POPOVER_H)
      style.top = `${clampedTop}px`
      style.left = `${clampedLeft}px`
      void rawBottom // silence unused warning
    } else if (placement === 'right') {
      const rawLeft2 = targetRect.right + GAP
      style.left = `${Math.min(rawLeft2, window.innerWidth - POPOVER_W - EDGE)}px`
      style.top = `${Math.max(EDGE, Math.min(window.innerHeight - POPOVER_H - EDGE, targetRect.top + targetRect.height / 2 - POPOVER_H / 2))}px`
    } else if (placement === 'left') {
      const rawRight = window.innerWidth - targetRect.left + GAP
      style.right = `${Math.min(rawRight, window.innerWidth - POPOVER_W - EDGE)}px`
      style.top = `${Math.max(EDGE, Math.min(window.innerHeight - POPOVER_H - EDGE, targetRect.top + targetRect.height / 2 - POPOVER_H / 2))}px`
    } else {
      style.top = '50%'
      style.left = '50%'
      style.transform = 'translate(-50%, -50%)'
    }

    return style
  }

  // ─── Spotlight highlight style (box-shadow replaces backdrop) ────────
  const getSpotlightStyle = (): React.CSSProperties | null => {
    if (!targetRect) return null
    const pad = 6
    return {
      position: 'fixed',
      top: targetRect.top - pad,
      left: targetRect.left - pad,
      width: targetRect.width + pad * 2,
      height: targetRect.height + pad * 2,
      borderRadius: '4px',
      zIndex: 9991,
      // The giant spread shadow is the "backdrop" — the element itself stays lit
      boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)',
      border: '2px solid oklch(0.68 0.16 200)',
      outline: '2px solid oklch(0.68 0.16 200 / 0.3)',
      outlineOffset: '3px',
    }
  }

  const currentStep = isActive ? TOUR_STEPS[currentStepIndex] : null

  return (
    <TourContext.Provider value={{ isActive, currentStepIndex, startTour, stopTour, nextStep, prevStep, currentStep }}>
      {children}

      <AnimatePresence>
        {isActive && (
          <>
            {/* ── Clickable dismiss layer behind spotlight ── */}
            <motion.div
              key="tour-dismiss"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={stopTour}
              className="fixed inset-0 z-[9990] cursor-pointer"
              style={{ background: 'transparent' }}
            />

            {/* ── Spotlight highlight (box-shadow creates the dark surround) ── */}
            <AnimatePresence mode="wait">
              {targetRect && (
                <motion.div
                  key={`spotlight-${currentStepIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={getSpotlightStyle()!}
                />
              )}
            </AnimatePresence>

            {/* ── Dark overlay for center/no-target steps ── */}
            {!targetRect && (
              <motion.div
                key="tour-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.65 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-[9990]"
              />
            )}

            {/* ── Tour Popover ── */}
            <motion.div
              key={`popover-${currentStepIndex}`}
              style={{ ...getPopoverStyle(), backgroundColor: 'var(--card)', backdropFilter: 'blur(16px)' }}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="border border-border shadow-2xl p-5 rounded-md pointer-events-auto flex flex-col space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-1.5 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">System Guide</span>
                </div>
                <button
                  onClick={stopTour}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Body */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="h-6 px-2 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary font-mono text-xs rounded-sm font-bold shrink-0">
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
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentStepIndex ? 'w-4 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <button
                      onClick={prevStep}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border rounded-sm transition-all duration-200"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" /> Back
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:brightness-110 shadow-sm rounded-sm transition-all duration-200"
                  >
                    {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) throw new Error('useTour must be used within TourProvider')
  return context
}
