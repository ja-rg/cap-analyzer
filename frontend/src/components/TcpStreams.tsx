import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { ArrowRight, Network } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TcpStreams({ streams }: { streams: any[] }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Título */}
        <div className="flex items-center gap-2 mb-2">
          <Network className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">TCP Streams ({streams.length})</h2>
        </div>

        {/* Contenedor con grid para evitar amontonamiento */}
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {streams.map((stream, i) => (
            <Accordion
              key={i}
              type="single"
              collapsible
              className="border rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
            >
              <AccordionItem value={`stream-${i}`} className="border-none">
                <AccordionTrigger className="px-3 py-2 hover:no-underline flex flex-wrap items-center gap-2 text-sm font-medium">
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
                </AccordionTrigger>
                <AccordionContent>
                  <pre className={cn(
                    "text-xs bg-black/90 text-green-300 p-3 rounded overflow-auto whitespace-pre-wrap border border-gray-800",
                    "max-h-60"
                  )}>
                    {stream.text}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
