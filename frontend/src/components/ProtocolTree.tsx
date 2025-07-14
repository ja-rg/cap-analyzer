export default function ProtocolTree({ tree }: { tree: any }) {
  const renderTree = (node: any, level = 0) =>
    Object.entries(node).map(([key, value]: any) => (
      <div key={key} style={{ marginLeft: level * 16 }}>
        <strong>{key}</strong> ({value.count})
        {value.children && Object.keys(value.children).length > 0 && renderTree(value.children, level + 1)}
      </div>
    ))

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Jerarquía de Protocolos</h2>
      {renderTree(tree)}
    </div>
  )
}
