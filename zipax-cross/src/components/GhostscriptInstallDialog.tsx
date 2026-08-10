import { Button, Spinner } from "@heroui/react";
import { useState } from "react";
import { Download, AlertTriangle, CheckCircle, Info } from "@/components/icons";
import { installGhostscript } from "@/lib/tauri";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInstalled: () => void;
}

export function GhostscriptInstallDialog({ isOpen, onClose, onInstalled }: Props) {
  const [status, setStatus] = useState<"idle" | "installing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleInstall = async () => {
    setStatus("installing");
    try {
      const result = await installGhostscript();
      setStatus("success");
      setMessage(result);
      setTimeout(() => {
        onInstalled();
        onClose();
      }, 1500);
    } catch (err) {
      setStatus("error");
      setMessage(String(err));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-xl border border-divider w-[360px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-5 pt-4 pb-2 text-base font-semibold">
          {status === "success" ? (
            <CheckCircle size={18} className="text-success shrink-0" />
          ) : status === "error" ? (
            <AlertTriangle size={18} className="text-danger shrink-0" />
          ) : (
            <Info size={18} className="shrink-0" />
          )}
          PDF 压缩需要 Ghostscript
        </div>
        <div className="px-5 py-3 text-sm space-y-3">
          {status === "idle" && (
            <p>
              Ghostscript 是 PDF 压缩所需的外部工具，尚未在系统中检测到。
              <br />
              点击「一键安装」自动下载安装。
            </p>
          )}
          {status === "installing" && (
            <div className="flex items-center gap-2">
              <Spinner size="sm" color="accent" />
              <span>正在安装 Ghostscript，请稍候...</span>
            </div>
          )}
          {status === "success" && (
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-success shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-2">
              <p className="whitespace-pre-wrap font-mono text-xs bg-danger-50 text-danger-700 rounded-lg p-3">
                {message}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-5 pt-2 pb-4">
          {status === "idle" && (
            <>
              <Button variant="ghost" size="sm" onPress={onClose}>取消</Button>
              <Button variant="primary" size="sm" onPress={handleInstall}>
                <Download size={15} />
                一键安装
              </Button>
            </>
          )}
          {status === "installing" && (
            <Button variant="primary" size="sm" isDisabled>安装中...</Button>
          )}
          {status === "success" && (
            <Button variant="primary" size="sm" onPress={() => { onInstalled(); onClose(); }}>
              继续压缩
            </Button>
          )}
          {status === "error" && (
            <Button variant="secondary" size="sm" onPress={() => setStatus("idle")}>重试</Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function isGhostscriptMissingError(error: string | null): boolean {
  if (!error) return false;
  return error.includes("GhostscriptMissing") || error.includes("需要系统安装 Ghostscript");
}