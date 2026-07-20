export function NoDataMessage({ message }: { message: string }) {
  return (
    <div className="flex h-32 items-center justify-center text-center text-muted-foreground text-sm">
      {message}
    </div>
  );
}
