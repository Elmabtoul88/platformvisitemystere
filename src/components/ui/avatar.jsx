"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    data-slot="avatar" // Add data-slot
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef(({ className, alt, ...props }, ref) => ( // Added alt prop
  <AvatarPrimitive.Image
    ref={ref}
    data-slot="avatar-image" // Add data-slot
    className={cn("aspect-square h-full w-full object-cover", className)} // Added object-cover
    alt={alt || ""} // Pass alt text
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef(({ className, children, ...props }, ref) => ( // Added children prop
  <AvatarPrimitive.Fallback
    ref={ref}
    data-slot="avatar-fallback" // Add data-slot
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground", // Added font styles
      className
    )}
    {...props}
  >
    {/* Allow passing custom fallback content or initials */}
    {children}
  </AvatarPrimitive.Fallback>
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
