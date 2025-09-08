'use client'

import { LoadingWithMessage, } from '@/components/ui/loading-skeleton'
import dynamic from 'next/dynamic'
import { Suspense, useCallback, useState, } from 'react'

// Dynamic imports for Framer Motion
const MotionDiv = dynamic(
  () => import('framer-motion').then((mod,) => ({ default: mod.motion.div, })),
  {
    loading: () => <div className="animate-pulse bg-gray-200 rounded" />,
    ssr: false, // Animations são client-side only
  },
)

const AnimatePresence = dynamic(
  () => import('framer-motion').then((mod,) => ({ default: mod.AnimatePresence, })),
  {
    loading: () => <div className="opacity-0" />,
    ssr: false,
  },
)

const _MotionSpring = dynamic(
  () => import('framer-motion').then((mod,) => ({ default: mod.motion, })),
  {
    loading: () => <div className="animate-pulse" />,
    ssr: false,
  },
)

// Healthcare-specific animated components
const PatientCardAnimated = dynamic(
  () => import('../PatientCard').then((mod,) => mod.PatientCardAnimated),
  {
    loading: () => (
      <LoadingWithMessage variant="animation" message="Carregando animação do cartão..." />
    ),
    ssr: false,
  },
)

const AppointmentTransitions = dynamic(
  () => import('../animations/appointment-transitions').then((mod,) => mod.AppointmentTransitions),
  {
    loading: () => <LoadingWithMessage variant="animation" message="Carregando transições..." />,
    ssr: false,
  },
)

const DashboardAnimations = dynamic(
  () => import('../animations/dashboard-animations').then((mod,) => mod.DashboardAnimations),
  {
    loading: () => (
      <LoadingWithMessage variant="animation" message="Carregando animações do dashboard..." />
    ),
    ssr: false,
  },
)

// Animation configurations para healthcare
const HealthcareAnimations = {
  // Gentle animations for patient comfort
  gentle: {
    duration: 0.6,
    ease: [0.23, 1, 0.32, 1,], // easeOutQuint - smooth and calming
  },

  // Quick feedback animations
  feedback: {
    duration: 0.2,
    ease: 'easeOut',
  },

  // Emergency mode - minimal animations
  emergency: {
    duration: 0.1,
    ease: 'linear',
  },

  // Accessibility-friendly (respects prefers-reduced-motion)
  accessible: {
    duration: 0,
    ease: 'linear',
  },
}

// Interfaces
interface AnimatedContainerProps {
  children: React.ReactNode
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scale' | 'gentle' | 'none'
  duration?: number
  delay?: number
  className?: string
  respectMotionPreference?: boolean
}

interface PageTransitionProps {
  children: React.ReactNode
  pageKey: string
  direction?: 'left' | 'right' | 'up' | 'down'
  duration?: number
}

interface LoadingAnimationProps {
  type: 'spinner' | 'pulse' | 'dots' | 'medical'
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

// Dynamic Animated Container
export function DynamicAnimatedContainer({
  children,
  animation = 'fadeIn',
  duration = 0.6,
  delay = 0,
  className = '',
  respectMotionPreference = true,
}: AnimatedContainerProps,) {
  return (
    <Suspense fallback={<div className={className}>{children}</div>}>
      <MotionDiv
        initial={getInitialState(animation,)}
        animate={getAnimateState(animation,)}
        transition={{
          duration: respectMotionPreference ? undefined : duration,
          delay,
          ...HealthcareAnimations.gentle,
        }}
        className={className}
      >
        {children}
      </MotionDiv>
    </Suspense>
  )
}

// Dynamic Page Transitions
export function DynamicPageTransition({
  children,
  pageKey,
  direction = 'right',
  duration = 0.4,
}: PageTransitionProps,) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <AnimatePresence mode="wait">
        <MotionDiv
          key={pageKey}
          initial={getPageInitial(direction,)}
          animate={{ opacity: 1, x: 0, y: 0, }}
          exit={getPageExit(direction,)}
          transition={{ duration, ...HealthcareAnimations.gentle, }}
        >
          {children}
        </MotionDiv>
      </AnimatePresence>
    </Suspense>
  )
}

// Dynamic Loading Animation
export function DynamicLoadingAnimation({
  type,
  size = 'md',
  color = '#3b82f6',
}: LoadingAnimationProps,) {
  return (
    <Suspense fallback={<div className="animate-pulse w-8 h-8 bg-gray-200 rounded" />}>
      <MotionDiv
        animate={getLoadingAnimation(type,)}
        transition={{
          duration: getLoadingDuration(type,),
          repeat: Infinity,
          ease: 'linear',
        }}
        className={getLoadingClasses(size,)}
        style={{ color, }}
      >
        {getLoadingContent(type,)}
      </MotionDiv>
    </Suspense>
  )
}

// Define proper prop types for healthcare components
type PatientCardProps = React.ComponentProps<typeof PatientCardAnimated>
type AppointmentTransitionsProps = React.ComponentProps<typeof AppointmentTransitions>
type DashboardAnimationsProps = React.ComponentProps<typeof DashboardAnimations>

// Healthcare-specific animated components exports
export function DynamicPatientCard(props: PatientCardProps,) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="animation" />}>
      <PatientCardAnimated {...props} />
    </Suspense>
  )
}

export function DynamicAppointmentTransitions(props: AppointmentTransitionsProps,) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="animation" />}>
      <AppointmentTransitions {...props} />
    </Suspense>
  )
}

export function DynamicDashboardAnimations(props: DashboardAnimationsProps,) {
  return (
    <Suspense fallback={<LoadingWithMessage variant="animation" />}>
      <DashboardAnimations {...props} />
    </Suspense>
  )
}

// Hook para animation management
export function useHealthcareAnimations() {
  const [reducedMotion, setReducedMotion,] = useState(false,)
  const [animationMode, setAnimationMode,] = useState<'normal' | 'gentle' | 'emergency' | 'off'>(
    'normal',
  )

  // Check user preference for reduced motion
  const checkMotionPreference = useCallback(() => {
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)',).matches
      setReducedMotion(prefersReduced,)

      if (prefersReduced) {
        setAnimationMode('off',)
      }
    }
  }, [],)

  // Get animation config based on current mode
  const getAnimationConfig = useCallback(
    (override?: Partial<typeof HealthcareAnimations.gentle>,) => {
      const base = HealthcareAnimations[animationMode as keyof typeof HealthcareAnimations]
        || HealthcareAnimations.gentle

      if (reducedMotion || animationMode === 'off') {
        return { duration: 0, ease: 'linear', }
      }

      return { ...base, ...override, }
    },
    [animationMode, reducedMotion,],
  )

  return {
    reducedMotion,
    animationMode,
    setAnimationMode,
    checkMotionPreference,
    getAnimationConfig,
  }
}

// Utility functions
function getInitialState(animation: string,) {
  switch (animation) {
    case 'fadeIn':
      return { opacity: 0, }
    case 'slideUp':
      return { opacity: 0, y: 20, }
    case 'slideDown':
      return { opacity: 0, y: -20, }
    case 'scale':
      return { opacity: 0, scale: 0.95, }
    case 'gentle':
      return { opacity: 0, y: 10, }
    default:
      return { opacity: 1, }
  }
}

function getAnimateState(animation: string,) {
  switch (animation) {
    case 'none':
      return {}
    default:
      return { opacity: 1, y: 0, scale: 1, }
  }
}

function getPageInitial(direction: string,) {
  const offset = 20
  switch (direction) {
    case 'left':
      return { opacity: 0, x: -offset, }
    case 'right':
      return { opacity: 0, x: offset, }
    case 'up':
      return { opacity: 0, y: -offset, }
    case 'down':
      return { opacity: 0, y: offset, }
    default:
      return { opacity: 0, x: offset, }
  }
}

function getPageExit(direction: string,) {
  const offset = 20
  switch (direction) {
    case 'left':
      return { opacity: 0, x: offset, }
    case 'right':
      return { opacity: 0, x: -offset, }
    case 'up':
      return { opacity: 0, y: offset, }
    case 'down':
      return { opacity: 0, y: -offset, }
    default:
      return { opacity: 0, x: -offset, }
  }
}

function getLoadingAnimation(type: string,) {
  switch (type) {
    case 'spinner':
      return { rotate: 360, }
    case 'pulse':
      return { scale: [1, 1.1, 1,], }
    case 'dots':
      return { y: [0, -10, 0,], }
    case 'medical':
      return { rotate: [0, 90, 180, 270, 360,], }
    default:
      return { rotate: 360, }
  }
}

function getLoadingDuration(type: string,) {
  switch (type) {
    case 'pulse':
      return 1.5
    case 'dots':
      return 0.8
    case 'medical':
      return 2
    default:
      return 1
  }
}

function getLoadingClasses(size: string,) {
  switch (size) {
    case 'sm':
      return 'w-4 h-4'
    case 'lg':
      return 'w-12 h-12'
    default:
      return 'w-8 h-8'
  }
}

function getLoadingContent(type: string,) {
  switch (type) {
    case 'dots':
      return '●'
    case 'medical':
      return '⚕'
    default:
      return '○'
  }
}
