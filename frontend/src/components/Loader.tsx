import { Skeleton } from "@/components/ui/skeleton"

export default function Loader() {
  return (
    <div className="space-y-4 mt-6">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded" />
      ))}
    </div>
  )
}
