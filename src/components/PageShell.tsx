import Link from "next/link";
import { Backdrop } from "@/components/brand/Backdrop";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

/** Mobile-first column layout shared by attendee pages. */
export function PageShell({
  children,
  tint,
  className,
  header = true,
}: {
  children: React.ReactNode;
  tint?: string;
  className?: string;
  header?: boolean;
}) {
  return (
    <>
      <Backdrop tint={tint} />
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 sm:max-w-lg">
        {header ? (
          <header className="flex items-center justify-between pt-[max(1rem,env(safe-area-inset-top))] pb-2">
            <Link href="/" className="rounded-lg text-lg" aria-label="AI DNA home">
              <Logo />
            </Link>
          </header>
        ) : null}
        <main className={cn("flex flex-1 flex-col", className)}>{children}</main>
      </div>
    </>
  );
}
