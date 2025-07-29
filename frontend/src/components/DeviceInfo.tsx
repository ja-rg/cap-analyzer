import { Card, CardContent } from "@/components/ui/card"
import { HardDrive, Globe, Network } from "lucide-react"

type DeviceInfoProps = {
  data: {
    mac_addresses: { address: string; manufacturer: string | null }[]
    ip_addresses: {
      ip: string
      host: string | null
      type: "public" | "private"
    }[]
  }
}

export default function DeviceInfo({ data }: { data: DeviceInfoProps["data"] }) {
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Network className="h-5 w-5 text-primary" />
          <h2 className="leading-none">Dispositivos</h2>
        </div>

        {/* MAC Addresses */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Direcciones MAC</h3>
          <ul className="space-y-1 text-sm">
            {data.mac_addresses.map((mac, i) => (
              <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{mac.address}</span>
                </div>

                {mac.manufacturer && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground sm:ml-4 border">
                    <Network className="w-3 h-3" />
                    {mac.manufacturer}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* IP Addresses */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Direcciones IP</h3>
          <ul className="space-y-1 text-sm">
            {data.ip_addresses.map((ip, i) => (
              <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono">{ip.ip}</span>
                  <span className="text-xs text-muted-foreground">
                    ({ip.type === "private" ? "Privada" : "Pública"})
                  </span>
                </div>
                {ip.host && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-muted text-muted-foreground sm:ml-4 border">
                    <Globe className="w-3 h-3" />
                    {ip.host}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
