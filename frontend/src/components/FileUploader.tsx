import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud, Loader2, FileText } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type FileUploaderProps = {
  onUpload: (file: File) => void
}

export default function FileUploader({ onUpload }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = (file: File) => {
    const isValidType =
      file.type === "application/vnd.tcpdump.pcap" ||
      file.name.endsWith(".pcap") ||
      file.name.endsWith(".cap")
    const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB

    if (!isValidType) return setError("Tipo de archivo no permitido. Solo .pcap o .cap.")
    if (!isValidSize) return setError("El archivo es demasiado grande. Máximo 10MB.")

    setError(null)
    setFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = () => {
    if (!file) return
    setLoading(true)
    onUpload(file)
    setTimeout(() => setLoading(false), 1200) // Simulación de análisis
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <UploadCloud className="w-5 h-5 text-primary" />
          Subir archivo PCAP
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Área de arrastrar */}
        <div
          className={cn(
            "border border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
            isDragging ? "border-primary bg-muted" : "hover:border-muted"
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <p className="text-sm text-muted-foreground">
            Arrastra y suelta un archivo aquí o selecciónalo abajo.
          </p>
        </div>

        {/* Selector manual */}
        <div className="space-y-2">
          <Label htmlFor="file">Seleccionar archivo manualmente</Label>
          <Input
            id="file"
            type="file"
            accept=".pcap,.cap"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {/* Estado de archivo */}
        {file && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{file.name}</span>
            <span className="text-xs ml-auto">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Botón */}
        <Button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Analizando...
            </>
          ) : (
            "Analizar"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
