import { Card, CardContent } from "@/components/ui/card"
import {
    Clock,
    Timer,
    Package as PackageIcon,
    CalendarClock,
    BrainCircuit,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

type CaptureInfoProps = {
    info: {
        "Earliest packet time": string
        "Latest packet time": string
        "Capture duration": string
        "Number of packets": number
    }
}

export default function CaptureInfo({ info }: CaptureInfoProps) {
    // "11.383317 seconds"
    const formatDuration = (duration: string) => {
        const match = duration.match(/(\d+(\.\d+)?)\s*seconds/)
        return match ? parseFloat(match[1]).toFixed(2) : "N/A"
    }

    const formatDate = (iso?: string) => {
        // Format like " 2015-02-23 22:04:07.801709\r"
        const date = iso?.replace(/\r/g, "").trim()
        return date ? format(parseISO(date), "PPpp", { locale: es }) : "No disponible"
    }

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                    <BrainCircuit className="h-5 w-5 text-primary" />
                    <h2 className="leading-none">Información de captura</h2>
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <CalendarClock className="h-5 w-5 text-primary" />
                        <div>
                            <div className="text-xs uppercase font-semibold text-muted-foreground">Inicio</div>
                            <div>{formatDate(info["Earliest packet time"])}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                            <div className="text-xs uppercase font-semibold text-muted-foreground">Fin</div>
                            <div>{formatDate(info["Latest packet time"])}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Timer className="h-5 w-5 text-primary" />
                        <div>
                            <div className="text-xs uppercase font-semibold text-muted-foreground">Duración</div>
                            <div>{formatDuration(info["Capture duration"])} segundos</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <PackageIcon className="h-5 w-5 text-primary" />
                        <div>
                            <div className="text-xs uppercase font-semibold text-muted-foreground">Total Paquetes</div>
                            <div>{info["Number of packets"] ?? "N/A"}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
