import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { useState } from "react";
import { Download, Loader2, AlertTriangle, CheckCircle2, Terminal } from "@/components/icons";
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" size="sm">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 text-base font-semibold">
          {status === "success" ? (
            <CheckCircle2 size={18} className="text-success" />
          ) : status === "error" ? (
            <AlertTriangle size={18} className="text-danger" />
          ) : (
            <Terminal size={18} />
          )}
          PDF 压缩需要 Ghostscript
        </ModalHeader>
        <ModalBody className="text-sm">
          {status === "idle" && (
            <div className="space-y-3">
              <p>
                Ghostscript 是 PDF 压缩所需的外部工具，尚未在系统中检测到。
                <br />
                点击「一键安装」自动下载安装。
              </p>
            </div>
          )}
          {status === "installing" && (
            <div className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>正在安装 Ghostscript，请稍候...</span>
            </div>
          )}
          {status === "success" && (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success shrink-0" />
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
        </ModalBody>
        <ModalFooter>
          {status === "idle" && (
            <>
              <Button variant="flat" size="sm" onPress={onClose}>取消</Button>
              <Button color="primary" size="sm" onPress={handleInstall}>
                <Download size={15} />
                一键安装
              </Button>
            </>
          )}
          {status === "installing" && (
            <Button variant="flat" size="sm" isDisabled>安装中...</Button>
          )}
          {status === "success" && (
            <Button color="primary" size="sm" onPress={() => { onInstalled(); onClose(); }}>
              继续压缩
            </Button>
          )}
          {status === "error" && (
            <Button variant="flat" size="sm" onPress={() => setStatus("idle")}>重试</Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function isGhostscriptMissingError(error: string | null): boolean {
  if (!error) return false;
  return error.includes("GhostscriptMissing") || error.includes("需要系统安装 Ghostscript");
}
", "filePath": "C:\\Users\\25482\\Desktop\\zipax\\zipax-cross\\src\\components\\GhostscriptInstallDialog.tsx"}