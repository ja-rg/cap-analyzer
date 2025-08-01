import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Network } from "lucide-react"

export default function TcpStreams({ streams }: { streams: any[] }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-6">
        {/* Título */}
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">TCP Streams</h2>
        </div>

        {/* Lista de streams */}
        {streams.map((stream, i) => (
          <div
            key={i}
            className="p-3 border rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors space-y-2"
          >
            {/* Encabezado de conexión */}
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-xs">
                {stream.ip_src}:{stream.sport}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 font-mono text-xs">
                {stream.ip_dst}:{stream.dport}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                Stream #{stream.stream_id ?? i}
              </span>
            </div>

            {/* Payload */}
            <pre className="text-xs bg-black/90 text-green-300 p-3 rounded overflow-auto max-h-60 whitespace-pre-wrap border border-gray-800">
              {stream.text}
            </pre>

            {i < streams.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
