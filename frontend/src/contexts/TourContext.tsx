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

  const currentStep = isActive ? TOUR_STEPS[currentStepIndex] : null

  // Calculate popover fixed position
  const getPopoverStyle = (): React.CSSProperties => {
    const popoverStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      maxWidth: '380px',
      width: 'calc(100vw - 32px)',
    }

    if (targetRect) {
      const gap = 14
      const step = TOUR_STEPS[currentStepIndex]
      const placement = step?.placement || 'bottom'

      // Screen boundary constraints
      const leftBound = 16
      const rightBound = window.innerWidth - 396

      if (placement === 'bottom') {
        popoverStyle.top = `${targetRect.bottom + gap}px`
        popoverStyle.left = `${Math.max(leftBound, Math.min(rightBound, targetRect.left + targetRect.width / 2 - 190))}px`
      } else if (placement === 'top') {
        popoverStyle.bottom = `${window.innerHeight - targetRect.top + gap}px`
        popoverStyle.left = `${Math.max(leftBound, Math.min(rightBound, targetRect.left + targetRect.width / 2 - 190))}px`
      } else if (placement === 'right') {
        popoverStyle.top = `${Math.max(leftBound, Math.min(window.innerHeight - 250, targetRect.top + targetRect.height / 2 - 100))}px`
        popoverStyle.left = `${targetRect.right + gap}px`
      } else if (placement === 'left') {
        popoverStyle.top = `${Math.max(leftBound, Math.min(window.innerHeight - 250, targetRect.top + targetRect.height / 2 - 100))}px`
        popoverStyle.right = `${window.innerWidth - targetRect.left + gap}px`
      } else {
        // Fallback center
        popoverStyle.top = '50%'
        popoverStyle.left = '50%'
        popoverStyle.transform = 'translate(-50%, -50%)'
      }
    } else {
      // Viewport center
      popoverStyle.top = '50%'
      popoverStyle.left = '50%'
      popoverStyle.transform = 'translate(-50%, -50%)'
    }

    return popoverStyle
  }

  return (
    <TourContext.Provider value={{ isActive, currentStepIndex, startTour, stopTour, nextStep, prevStep, currentStep }}>
      {children}

      <AnimatePresence>
        {isActive && (
          <div className="fixed inset-0 z-[9990] overflow-hidden pointer-events-none">
            {/* Darkened backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={stopTour}
              className="absolute inset-0 bg-black pointer-events-auto cursor-pointer backdrop-blur-[1px]"
            />

            {/* Glowing target element highlight box */}
            {targetRect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  top: targetRect.top - 6,
                  left: targetRect.left - 6,
                  width: targetRect.width + 12,
                  height: targetRect.height + 12,
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute border border-primary/60 bg-primary/[0.03] rounded-md shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] z-[9991]"
              />
            )}

            {/* Glassmorphic Tour Popover */}
            <motion.div
              style={getPopoverStyle()}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="glass-panel border border-border shadow-2xl p-5 rounded-md pointer-events-auto flex flex-col space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div className="flex items-center gap-1.5 text-primary">
                  <Sparkles className="h-4.5 w-4.5" />
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
                  <span className="h-6 px-2 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary font-mono text-xs rounded font-bold">
                    {String(currentStepIndex + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-bold text-sm text-foreground tracking-tight">
                    {currentStep?.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                  {currentStep?.content}
                </p>
              </div>

              {/* Footer navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
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
                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:brightness-110 shadow-sm rounded-sm transition-all duration-200 glow-primary"
                  >
                    {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
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
