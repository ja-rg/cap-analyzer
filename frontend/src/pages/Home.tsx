import { useState } from "react"
import FileUploader from "@/components/FileUploader"
import CaptureInfo from "@/components/CaptureInfo"
import ProtocolTree from "@/components/ProtocolTree"
import DeviceInfo from "@/components/DeviceInfo"
import TcpStreams from "@/components/TcpStreams"
import Loader from "@/components/Loader"
import UdpStreams from "@/components/UdpStreams"
import SuricataInfo from "@/components/SuricataInfo"

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleAnalyze = async (file: File) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('http://200.13.89.91:3000', {
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
          <CaptureInfo info={result.capinfos} />
          <ProtocolTree data={result.protocol_hierarchy} />
          <DeviceInfo data={{ ip_addresses: result.ip_host_pairs, mac_addresses: result.mac_addresses }} />
          <SuricataInfo data={result.suricata} />

          {/* {result.tcp_streams.length > 0 && <TcpStreams streams={result.tcp_streams} />}
          {result.udp_streams.length > 0 && <UdpStreams streams={result.udp_streams} />} */}
        </>
      )}
    </div>
  )
}
