import { useState } from "react"
import FileUploader from "@/components/FileUploader"
import CaptureInfo from "@/components/CaptureInfo"
import ProtocolTree from "@/components/ProtocolTree"
import DeviceInfo from "@/components/DeviceInfo"
import TcpStreams from "@/components/TcpStreams"
import Loader from "@/components/Loader"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async (file: File) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      body: formData,
    })

    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <FileUploader onUpload={handleAnalyze} />
      {loading && <Loader />}
      {!loading && result && (
        <>
          <CaptureInfo info={result.capture_info} />
          <ProtocolTree tree={result.protocols} />
          <DeviceInfo data={result.device_info} />
          {result.tcp_streams.length > 0 && <TcpStreams streams={result.tcp_streams} />}
        </>
      )}
    </div>
  )
}
