import { Card, CardContent } from "@/components/ui/card"
import {
    ShieldAlert,
    FileSearch,
    Cpu,
    ServerCrash,
    AlertTriangle,
    CircleAlert,
    Bug,
} from "lucide-react"
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"


type SuricataInfoProps = {
    data: {
        eve?: string
        fast?: string
        stats?: string
        suricata?: string
    }
}

type ParsedStat = {
    name: string
    value: string
}

type ParsedAlert = {
    message: string
    priority: string
    line: string
}

// 🧠 Extrae nombre y valor de líneas tipo stats
function parseStats(raw: string): ParsedStat[] {
    return raw
        .split("\n")
        .filter((line) => line.includes("|") && line.includes("Total"))
        .map((line) => {
            const parts = line.split("|").map((s) => s.trim())
            return { name: parts[0], value: parts[2] }
        })
}

// 🚨 Agrupa alertas por prioridad
function parseFastLog(raw: string): Record<string, ParsedAlert[]> {
    const lines = raw.split("\n")
    const alerts: ParsedAlert[] = lines
        .map((line) => {
            const match = line.match(/\[Priority: (\d+)\]\s+\{(.*?)\}\s+(.*)/)
            const msgMatch = line.match(/\[\*\*\] (.*?) \[\*\*\]/)
            if (!match || !msgMatch) return null
            return {
                message: msgMatch[1],
                priority: match[1],
                line,
            }
        })
        .filter(Boolean) as ParsedAlert[]

    return alerts.reduce((acc, alert) => {
        const p = alert.priority
        if (!acc[p]) acc[p] = []
        acc[p].push(alert)
        return acc
    }, {} as Record<string, ParsedAlert[]>)
}

export default function SuricataInfo({ data }: SuricataInfoProps) {
    const stats = data.stats ? parseStats(data.stats) : []
    const alertsByPriority = data.fast ? parseFastLog(data.fast) : {}
    const chartData = Object.entries(alertsByPriority).map(([priority, alerts]) => ({
        priority,
        count: alerts.length,
    }))

    return (
        <Card>
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    <h2 className="leading-none">Resultados de Suricata</h2>
                </div>

                {data.suricata && (
                    <div className="flex gap-3 items-start">
                        <Cpu className="h-5 w-5 text-primary mt-1" />
                        <div>
                            <div className="text-xs uppercase font-semibold">Versión / Info</div>
                            <pre className="whitespace-pre-wrap text-xs">{data.suricata.trim()}</pre>
                        </div>
                    </div>
                )}

                {stats.length > 0 && (
                    <div>
                        <div className="flex gap-2 items-center mb-2">
                            <ServerCrash className="h-5 w-5 text-primary" />
                            <div className="text-xs uppercase font-semibold">Estadísticas clave</div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex justify-between border-b pb-1">
                                    <span className="text-muted-foreground">{stat.name}</span>
                                    <span className="font-medium">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {Object.keys(alertsByPriority).length > 0 && (
                    <div>
                        <div className="flex gap-2 items-center mb-2">
                            <Bug className="h-5 w-5 text-primary" />
                            <div className="text-xs uppercase font-semibold">Alertas agrupadas por prioridad</div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="priority" label={{ value: "Prioridad", position: "insideBottom", offset: -5 }} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {Object.entries(alertsByPriority).map(([priority, alerts]) => (
                                <div key={priority}>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-1">
                                        {priority === "1" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                                        {priority === "2" && <CircleAlert className="h-4 w-4 text-yellow-500" />}
                                        {priority === "3" && <ShieldAlert className="h-4 w-4 text-muted-foreground" />}
                                        Prioridad {priority} ({alerts.length} alerta{alerts.length !== 1 ? "s" : ""})
                                    </div>
                                    <ul className="text-xs pl-4 list-disc space-y-1">
                                        {alerts.map((alert, i) => (
                                            <li key={i} className="text-muted-foreground">{alert.message}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.eve && (() => {
                    let events: any[] = []

                    try {
                        events = data.eve
                            .trim()
                            .split("\n")
                            .map((line) => JSON.parse(line))
                            .filter((e) => e.event_type === "dns")
                    } catch (err) {
                        console.error("Error parsing EVE JSON", err)
                    }

                    if (events.length === 0) return null

                    return (
                        <div className="space-y-4">
                            <div className="flex gap-3 items-center">
                                <FileSearch className="h-5 w-5 text-primary" />
                                <h3 className="text-xs uppercase font-semibold">Consultas DNS (Suricata EVE)</h3>
                            </div>
                            <div className="overflow-auto max-h-[300px] border rounded-md">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="bg-muted text-muted-foreground sticky top-0 z-10">
                                        <tr>
                                            <th className="px-3 py-2">Timestamp</th>
                                            <th className="px-3 py-2">Cliente IP</th>
                                            <th className="px-3 py-2">Dominio</th>
                                            <th className="px-3 py-2">Tipo</th>
                                            <th className="px-3 py-2">Protocolo</th>
                                            <th className="px-3 py-2">Respuesta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map((e, i) => (
                                            <tr key={i} className="border-t">
                                                <td className="px-3 py-1">{new Date(e.timestamp).toLocaleTimeString()}</td>
                                                <td className="px-3 py-1">{e.src_ip}</td>
                                                <td className="px-3 py-1">{e.dns?.rrname}</td>
                                                <td className="px-3 py-1">{e.dns?.rrtype}</td>
                                                <td className="px-3 py-1">{e.proto}</td>
                                                <td className="px-3 py-1">
                                                    {e.dns?.answers?.map((a: any) => a.rdata).join(", ") || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                })()}

            </CardContent>
        </Card>
    )
}
