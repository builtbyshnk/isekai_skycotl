import { Toaster as Sonner, type ToasterProps } from "sonner";
import { cn } from "@/lib/utils";

function Toaster({ toastOptions, style, ...props }: ToasterProps) {
  return (
    <Sonner
      richColors
      closeButton
      position="top-right"
      className="toaster group font-sans"
      style={{ fontFamily: "var(--font-sans)", ...style }}
      toastOptions={{
        ...toastOptions,
        style: {
          fontFamily: "var(--font-sans)",
          ...toastOptions?.style,
        },
        actionButtonStyle: {
          fontFamily: "var(--font-sans)",
          ...toastOptions?.actionButtonStyle,
        },
        cancelButtonStyle: {
          fontFamily: "var(--font-sans)",
          ...toastOptions?.cancelButtonStyle,
        },
        classNames: {
          ...toastOptions?.classNames,
          toast:
            cn(
              "group toast border-border bg-popover font-sans text-popover-foreground shadow-lg",
              toastOptions?.classNames?.toast,
            ),
          title: cn(
            "font-sans text-popover-foreground",
            toastOptions?.classNames?.title,
          ),
          description: cn(
            "font-sans text-muted-foreground",
            toastOptions?.classNames?.description,
          ),
          actionButton: cn(
            "bg-primary font-sans text-primary-foreground",
            toastOptions?.classNames?.actionButton,
          ),
          cancelButton: cn(
            "bg-muted font-sans text-muted-foreground",
            toastOptions?.classNames?.cancelButton,
          ),
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
