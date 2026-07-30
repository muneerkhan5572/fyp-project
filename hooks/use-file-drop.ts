"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

function isCsvFile(file: File) {
  return file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
}

export function useFileDrop(
  onFile: (file: File) => void,
  options?: { disabled?: boolean },
) {
  const disabled = options?.disabled ?? false;
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled) {
        setIsDraggingOver(true);
      }
    },
    [disabled],
  );

  const onDragEnter = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled) {
        setIsDraggingOver(true);
      }
    },
    [disabled],
  );

  const onDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDraggingOver(false);
      if (disabled) {
        return;
      }

      const file = event.dataTransfer.files?.[0];
      if (!file) {
        return;
      }
      if (!isCsvFile(file)) {
        toast.error("Please drop a CSV file.");
        return;
      }
      onFile(file);
    },
    [disabled, onFile],
  );

  return {
    isDraggingOver,
    dropzoneProps: { onDragOver, onDragEnter, onDragLeave, onDrop },
  };
}
