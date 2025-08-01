import { Card, CardContent } from "@/components/ui/card"
import {
    ShieldAlert,
    FileSearch,
    Cpu,
    ServerCrash,
    AlertTriangle,
    CircleAlert,
    Bug,
    Circle,
    Info,
} from "lucide-react"
import type { JSX } from "react"
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
                    <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                            <Cpu className="h-5 w-5 text-primary" />
                            <div className="text-xs uppercase font-semibold">Suricata — Versión / Info</div>
                        </div>

                        <div className="border rounded-md bg-muted/30 divide-y">
                            {data.suricata.trim().split("\n").map((line, i) => {
                                // Extraemos fecha, tipo y mensaje
                                const match = line.match(/^([\d/:\s-]+)\s+-\s+<(\w+)> - (.*)$/);
                                if (!match) {
                                    return (
                                        <div key={i} className="p-1 text-xs font-mono text-muted-foreground">
                                            {line}
                                        </div>
                                    );
                                }
                                type SuricataLevel = "Notice" | "Info" | "Warning";

                                const [, date, _, message] = match;
                                const level = match[2] as SuricataLevel; // 👈 ya sabe que es uno de los tres

                                // Colores por nivel

                                const colorMap: Record<SuricataLevel, string> = {
                                    Notice: "bg-blue-50 border-blue-200 text-blue-800",
                                    Info: "bg-green-50 border-green-200 text-green-800",
                                    Warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
                                };
                                const iconMap: Record<SuricataLevel, JSX.Element> = {
                                    Notice: <Info className="h-4 w-4 text-blue-500" />,
                                    Info: <Circle className="h-4 w-4 text-green-500" />,
                                    Warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
                                };


                                return (
                                    <div
                                        key={i}
                                        className={`flex gap-2 items-start p-2 text-xs font-mono border-l-4 ${colorMap[level] || ""}`}
                                    >
                                        {iconMap[level] || <Circle className="h-4 w-4 text-gray-400" />}
                                        <div className="flex flex-col">
                                            <span className="text-[10px] opacity-70">{date}</span>
                                            <span>{message}</span>
                                        </div>
                                    </div>
                                );
                            })}
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

                            {Object.entries(alertsByPriority).map(([priority, alerts]) => {
                                const priorityColors = [
                                    "bg-red-100 text-red-800 border-red-300",
                                    "bg-yellow-100 text-yellow-800 border-yellow-300",
                                    "bg-gray-100 text-gray-800 border-gray-300",
                                ];

                                const priorityIcons = [
                                    <AlertTriangle className="h-4 w-4 text-red-600" />,
                                    <CircleAlert className="h-4 w-4 text-yellow-500" />,
                                    <ShieldAlert className="h-4 w-4 text-gray-500" />,
                                ];

                                // Función para parsear el mensaje
                                const parseAlertMessage = (raw: string) => {
                                    const match = raw.match(/^\[(\d+):(\d+):(\d+)\]\s+(.*)$/);
                                    if (!match) return { priority: null, sid: null, rev: null, message: raw };
                                    const [, prio, sid, rev, msg] = match;
                                    const [family, ...descParts] = msg.split(" ");
                                    return {
                                        priority: Number(prio),
                                        sid,
                                        rev,
                                        family,
                                        description: descParts.join(" "),
                                        message: msg
                                    };
                                };
                                const idx = Number(priority) - 1

                                return (
                                    <div key={priority} className="space-y-2">
                                        {/* Encabezado de prioridad */}
                                        <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                                            {priorityIcons[idx]}
                                            <span>
                                                Prioridad {priority} ({alerts.length} alerta
                                                {alerts.length !== 1 ? "s" : ""})
                                            </span>
                                        </div>

                                        {/* Lista de alertas */}
                                        <div className="flex flex-col gap-2">
                                            {alerts.map((alert, i) => {
                                                const parsed = parseAlertMessage(alert.message);
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`p-2 rounded-md border flex flex-col gap-1 ${priorityColors[idx]}`}
                                                    >
                                                        <div className="flex gap-2 flex-wrap items-center">
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/70 border">
                                                                P{parsed.priority}
                                                            </span>
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/70 border">
                                                                SID: {parsed.sid}
                                                            </span>
                                                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/70 border">
                                                                Rev: {parsed.rev}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-medium">
                                                            <strong>{parsed.family}</strong> — {parsed.description}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

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
