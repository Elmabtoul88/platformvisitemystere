
"use client"

import * as React from "react";
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        let finalDescription = description;
        if (description && typeof description !== 'string' && !React.isValidElement(description)) {
            // This is a safeguard against rendering an object, like an Error object.
            console.error("Toast description is not a valid React child. This can happen if you pass an error object directly to the description. Pass error.message instead.", description);
            finalDescription = "An unexpected error occurred. See the console for more details.";
        }
        
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {finalDescription && (
                <ToastDescription>{finalDescription}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
