import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-secondary">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-secondary-light mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <Link href="/">
            <a className="text-primary hover:text-primary-dark">
              Return to homepage
            </a>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
