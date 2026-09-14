import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

type SuccessAlertProps = {
  message: string;
  onClose: () => void;
};

type AlertVariant = "error" | "info";

type AlertProps = {
  title: string;
  description: string;
  onClose: () => void;
  variant?: AlertVariant;
};

export function Alert({
  title,
  description,
  onClose,
  variant = "error",
}: AlertProps) {
  const isError = variant === "error";

  return (
    <div
      className={`fixed flex flex-col top-4 w-[512px] h-[160px] p-[20px] rounded-sm border-2 animate-in slide-in-from-top-5 ${
        isError
          ? "bg-destructive-background border-alert-border"
          : "bg-surface border-alert-border"
      }`}
    >
      <div
        className={`flex flex-row gap-2 ${
          isError ? "text-destructive" : "text-black"
        }`}
      >
        <p className="font-bold">{title}</p>
        {isError && <AlertCircleIcon />}
      </div>

      <div className="flex gap-4 font-light">
        <p className={isError ? "text-destructive" : "text-sidebar-middle"}>
          {description}
        </p>
      </div>

      <div className="flex justify-end mt-auto">
        <Button type="button" className="bg-focus" size="lg" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}

export function SuccessAlert({ message, onClose }: SuccessAlertProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="flex fixed top-4 w-[270px] h-[75px] p-[20px] items-center justify-center text-background rounded-sm bg-success">
      <p>{message}</p>
    </div>
  );
}
