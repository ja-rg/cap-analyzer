import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"
import { Network } from "lucide-react"

type Protocol = {
  protocol: string
  frames: number
  bytes: number
}

type ProtocolTreeProps = {
  protocols: Protocol[]
}

export default function ProtocolTree({ protocols }: ProtocolTreeProps) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg font-semibold">
          Jerarquía de Protocolos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {protocols.map((p, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b pb-1 last:border-none"
          >
            <div className="text-muted-foreground">{p.protocol}</div>
            <div className="font-mono text-xs text-right text-muted-foreground">
              {p.frames} frames • {p.bytes.toLocaleString()} bytes
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
