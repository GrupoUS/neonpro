import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient: "relative text-white bg-black/80 hover:bg-black/70 border border-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      borderAnimation: {
        none: "",
        hover: "relative overflow-hidden",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      borderAnimation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  enableHoverBorder?: boolean
  borderDuration?: number
  clockwise?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    borderAnimation, 
    enableHoverBorder = false,
    borderDuration = 1,
    clockwise = true,
    asChild = false, 
    children,
    ...props 
  }, ref) => {
    const [hovered, setHovered] = React.useState<boolean>(false)
    const [direction, setDirection] = React.useState<Direction>("TOP")
    
    const Comp = asChild ? Slot : "button"
    
    // Apply hover border animation if enabled
    const shouldShowHoverBorder = enableHoverBorder || borderAnimation === "hover"
    
    const rotateDirection = (currentDirection: Direction): Direction => {
      const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"]
      const currentIndex = directions.indexOf(currentDirection)
      const nextIndex = clockwise
        ? (currentIndex - 1 + directions.length) % directions.length
        : (currentIndex + 1) % directions.length
      return directions[nextIndex]
    }

    const movingMap: Record<Direction, string> = {
      TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
      LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
      BOTTOM:
        "radial-gradient(20.7% 50% at 50% 100%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
      RIGHT:
        "radial-gradient(16.2% 41.199999999999996% at 100% 50%, hsl(0, 0%, 100%) 0%, rgba(255, 255, 255, 0) 100%)",
    }

    const highlight =
      "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)"

    React.useEffect(() => {
      if (!hovered && shouldShowHoverBorder) {
        const interval = setInterval(() => {
          setDirection((prevState) => rotateDirection(prevState))
        }, borderDuration * 1000)
        return () => clearInterval(interval)
      }
      return undefined
    }, [hovered, shouldShowHoverBorder, borderDuration, clockwise])
    
    if (shouldShowHoverBorder) {
      return (
        <Comp
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            "relative flex rounded-md border content-center bg-transparent hover:bg-transparent transition duration-500 items-center flex-col flex-nowrap h-min justify-center overflow-visible p-px decoration-clone w-fit",
            className
          )}
          ref={ref}
          {...props}
        >
          <div
            className={cn(
              buttonVariants({ 
                variant: variant === "gradient" ? "gradient" : variant, 
                size,
                className: "w-auto z-10 rounded-[inherit]" 
              })
            )}
          >
            {children}
          </div>
          <motion.div
            className={cn(
              "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
            )}
            style={{
              filter: "blur(2px)",
              position: "absolute",
              width: "100%",
              height: "100%",
            }}
            initial={{ background: movingMap[direction] }}
            animate={{
              background: hovered
                ? [movingMap[direction], highlight]
                : movingMap[direction],
            }}
            transition={{ ease: "linear", duration: borderDuration ?? 1 }}
          />
          <div className="bg-background absolute z-1 flex-none inset-[2px] rounded-[inherit]" />
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }