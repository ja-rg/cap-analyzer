import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronRight, Network } from "lucide-react"

type ProtocolNode = {
  protocol: string
  frames: number
  bytes: number
  children: ProtocolNode[]
}

type ProtocolTreeProps = {
  data: ProtocolNode[]
}

function ProtocolItem({
  node,
  level = 0
}: {
  node: ProtocolNode
  level?: number
}) {
  return (
    <div className={cn("border-l pl-3", level > 0 && "ml-4")}>
      <div className="flex justify-between items-center py-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ChevronRight
            className="w-4 h-4 opacity-50"
          />
          <span>{node.protocol}</span>
        </div>
        <div className="font-mono text-xs text-right text-muted-foreground">
          {node.frames} frames • {node.bytes.toLocaleString()} bytes
        </div>
      </div>
      {node.children?.length > 0 && (
        <div className="space-y-1">
          {node.children.map((child, i) => (
            <ProtocolItem key={i} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProtocolTree({ data }: ProtocolTreeProps) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg font-semibold">
          Jerarquía de Protocolos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {data.map((node, i) => (
          <ProtocolItem key={i} node={node} />
        ))}
      </CardContent>
    </Card>
  )
}
