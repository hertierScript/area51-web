import { Suspense } from "react";
import CheckoutSuccessContent from "./checkout-success-content";

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin text-primary mx-auto mb-4 border-4 border-primary/20 border-t-primary rounded-full" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
