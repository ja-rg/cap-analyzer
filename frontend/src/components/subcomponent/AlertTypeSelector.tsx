import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AlertTypeSelectorProps = {
    selected: string[]
    onChange: (alerts: string[]) => void
}

const ALERT_TYPES = [
    { id: "scan-syn", label: "Escaneo SYN" },
    { id: "scan-null", label: "Escaneo NULL" },
    { id: "scan-xmas", label: "Escaneo Xmas" },
    { id: "exploit-smb", label: "Intentos de explotación SMB" },
    { id: "bruteforce-rdp", label: "Fuerza bruta RDP" },
    { id: "sql-injection", label: "SQL Injection" },
    { id: "xss", label: "XSS" },
    { id: "cmd-injection", label: "Command Injection" },
    { id: "malware-exe", label: "Descarga de malware (EXE)" },
    { id: "dns-tunnel", label: "DNS Tunneling" }
]


export default function AlertTypeSelector({ selected, onChange }: AlertTypeSelectorProps) {
    const toggleType = (id: string) => {
        if (selected.includes(id)) {
            onChange(selected.filter(t => t !== id))
        } else {
            onChange([...selected, id])
        }
    }

    const clearAll = () => onChange([])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    Tipos de alertas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    {ALERT_TYPES.map(alert => (
                        <Badge
                            key={alert.id}
                            onClick={() => toggleType(alert.id)}
                            className={cn(
                                "cursor-pointer select-none px-3 py-1 transition-colors",
                                selected.includes(alert.id)
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-primary/20"
                            )}
                        >
                            {alert.label}
                        </Badge>
                    ))}
                </div>
                {selected.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="text-xs text-muted-foreground"
                    >
                        Limpiar selección
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
