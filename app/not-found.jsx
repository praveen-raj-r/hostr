import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4 px-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground max-w-md">
        We couldn&apos;t find what you were looking for.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
