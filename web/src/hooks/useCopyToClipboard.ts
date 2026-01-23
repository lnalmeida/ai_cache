import { useState } from "react";

interface UseCopyToClipboardReturn {
    copiedId: string | null;
    copyToClipboard: (text: string, id: string) => void;
}

export const useCopyToClipboard = (): UseCopyToClipboardReturn => {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };
    return { copiedId, copyToClipboard };
};
