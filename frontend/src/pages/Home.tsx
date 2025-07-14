import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    setResult(data)
  }

  return (
    <div className="p-4">
      <Card>
        <CardContent className="space-y-4 p-4">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button onClick={handleUpload}>Analizar</Button>
        </CardContent>
      </Card>

      {result && (
        <pre className="mt-4 bg-black text-white p-4 rounded-lg overflow-auto max-h-[500px]">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default Home
