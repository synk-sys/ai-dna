import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-[transform,background-color,box-shadow,opacity] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_0_1px_rgb(255_255_255/0.2),0_10px_40px_-10px_rgb(138_180_248/0.7)] hover:bg-white",
        secondary: "glass text-foreground hover:bg-white/10",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-white/5",
        outline: "border border-white/20 text-foreground hover:bg-white/5",
      },
      size: {
        default: "h-12 px-6 text-base",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-8 text-lg",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
