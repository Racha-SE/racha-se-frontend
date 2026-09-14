import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type AlertProps = {
  title: string;
  description: string;
  onClose: () => void;
};

export function Alert({ title, description, onClose }: AlertProps) {
  return (
    <div className="fixed flex flex-col top-4 w-[512px] h-[160px] p-[20px] bg-destructive-background rounded-sm border-2 border-alert-border animate-in slide-in-from-top-5">
      <div className="flex flex-row gap-2 text-destructive">
        <p className="font-bold">{title}</p>
        <AlertCircleIcon />
      </div>

      <div className="flex gap-4">
        <p className="text-destructive">{description}</p>
      </div>

      <div className="flex justify-end mt-auto">
        <Button
          className="primary rounded-sm"
          type="button"
          size="lg"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
