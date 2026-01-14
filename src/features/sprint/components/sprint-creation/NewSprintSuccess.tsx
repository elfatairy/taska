import { CheckCircle2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { useCountDown } from "@/common/hooks/useCountDown";

export function NewSprintSuccess({ onClose }: { onClose: () => void }) {
  const { countdown } = useCountDown(5, onClose);

  return (
    <div className="flex flex-col items-center text-center py-6 gap-4">
      <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Sprint Created Successfully!</h3>
        <p className="text-sm text-muted-foreground">
          Closing in {countdown} second{countdown !== 1 ? 's' : ''}...
        </p>
      </div>
      <Button onClick={onClose} variant="outline" className="mt-2">
        Close Now
      </Button>
    </div>
  )
}
