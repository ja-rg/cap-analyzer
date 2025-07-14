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
        start_time?: string
        end_time?: string
        duration?: number
        total_packets?: number
    }
}

export default function CaptureInfo({ info }: CaptureInfoProps) {
    const formatDate = (iso?: string) =>
        iso ? format(parseISO(iso), "PPpp", { locale: es }) : "No disponible"

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
                            <div>{formatDate(info.start_time)}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                            <div className="text-xs uppercase font-semibold text-muted-foreground">Fin</div>
                            <div>{formatDate(info.end_time)}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Timer className="h-5 w-5 text-primary" />
                        <div>
                            <div className="text-xs uppercase font-semibold text-muted-foreground">Duración</div>
                            <div>{info.duration?.toFixed(2)} segundos</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <PackageIcon className="h-5 w-5 text-primary" />
                        <div>
                            <div className="text-xs uppercase font-semibold text-muted-foreground">Total Paquetes</div>
                            <div>{info.total_packets ?? "N/A"}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
