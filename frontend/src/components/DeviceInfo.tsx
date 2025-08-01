import { Card, CardContent } from "@/components/ui/card"
import { HardDrive, Lock, Unlock, Network } from "lucide-react"
import clsx from "clsx"

export default function DeviceInfo({ data }: any) {
  // Ordenamos datos
  const macSorted = [...data.mac_addresses].sort((a, b) =>
    (a.manufacturer || "").localeCompare(b.manufacturer || "")
  )
  const ipSorted = [...data.ip_addresses].sort((a, b) => {
    if (a.type === b.type) return a.ip.localeCompare(b.ip)
    return a.type === "private" ? -1 : 1
  })

  // Contadores
  const totalMAC = macSorted.length
  const totalPrivateIP = ipSorted.filter(ip => ip.type === "private").length
  const totalPublicIP = ipSorted.filter(ip => ip.type === "public").length

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Título */}
        <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Network className="h-5 w-5 text-primary" />
          <h2>Dispositivos</h2>
        </div>

        {/* Resumen */}
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 border">
            <HardDrive className="h-4 w-4 text-gray-700" />
            <span className="font-medium">{totalMAC} MAC</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 border border-green-300">
            <Lock className="h-4 w-4 text-green-700" />
            <span className="font-medium">{totalPrivateIP} IP Privadas</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 border border-blue-300">
            <Unlock className="h-4 w-4 text-blue-700" />
            <span className="font-medium">{totalPublicIP} IP Públicas</span>
          </div>
        </div>

        {/* MAC */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Direcciones MAC</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {macSorted.map((mac, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-md border bg-muted/40 hover:bg-muted transition"
              >
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{mac.address}</span>
                </div>
                {mac.manufacturer && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 border text-primary">
                    {mac.manufacturer}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* IP */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
          {ipSorted.map((ip, i) => (
            <div
              key={i}
              className={clsx(
                "p-3 rounded-md border transition flex flex-col gap-1",
                ip.type === "private"
                  ? "bg-green-50 border-green-200 hover:bg-green-100"
                  : "bg-blue-50 border-blue-200 hover:bg-blue-100"
              )}
            >
              {/* Línea 1 → IP + tipo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {ip.type === "private" ? (
                    <Lock className="h-4 w-4 text-green-600" />
                  ) : (
                    <Unlock className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="font-mono text-xs">{ip.ip}</span>
                </div>
                <span
                  className={clsx(
                    "text-[10px] font-medium",
                    ip.type === "private" ? "text-green-700" : "text-blue-700"
                  )}
                >
                  {ip.type === "private" ? "Privada" : "Pública"}
                </span>
              </div>

              {/* Línea 2 → Host */}
              {ip.host && (
                <div
                  className={clsx(
                    "text-[10px] px-2 py-0.5 rounded border w-fit",
                    ip.type === "private"
                      ? "bg-green-100 border-green-300 text-green-800"
                      : "bg-blue-100 border-blue-300 text-blue-800"
                  )}
                >
                  {ip.host}
                </div>
              )}
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  )
}
