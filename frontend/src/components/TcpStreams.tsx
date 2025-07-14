import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TcpStreams({ streams }: { streams: any[] }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-xl font-semibold mb-4">TCP Streams</h2>
        {streams.map((stream, i) => (
          <div key={i} className="mb-4">
            <div className="font-medium">
              {stream.ip_src}:{stream.sport} → {stream.ip_dst}:{stream.dport}
            </div>
            <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40 mt-2 whitespace-pre-wrap">
              {stream.text}
            </pre>
            {i < streams.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
