'use client';

import { toast } from "sonner";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";

export default function NotificationTrigger() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="flex"
      aria-label="Open Notifications Menu"
      onClick={() => {
        toast.info("Notifications are still under development");
      }}
    >
      <Icon icon='Bell' className="text-foreground stroke-0 size-5" aria-hidden="true" />
    </Button>
  )
}