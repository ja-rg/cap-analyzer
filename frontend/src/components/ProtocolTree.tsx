import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  ChevronDown,
  ChevronRight,
  Network
} from "lucide-react"
import { Button } from "@/components/ui/button"

type ProtocolNode = {
  count: number
  children?: Record<string, ProtocolNode>
}

type ProtocolTreeProps = {
  tree: Record<string, ProtocolNode>
}

function TreeNode({
  name,
  node,
  level
}: {
  name: string
  node: ProtocolNode
  level: number
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && Object.keys(node.children).length > 0

  return (
    <div style={{ marginLeft: level * 16 }}>
      <div className="flex items-center gap-2 mb-1">
        {hasChildren ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-sm">
          <span className="font-medium text-foreground">{name}</span>{" "}
          <span className="text-muted-foreground">({node.count})</span>
        </span>
      </div>

      {expanded &&
        hasChildren &&
        Object.entries(node.children!).map(([childKey, childNode]) => (
          <TreeNode
            key={childKey}
            name={childKey}
            node={childNode}
            level={level + 1}
          />
        ))}
    </div>
  )
}

export default function ProtocolTree({ tree }: ProtocolTreeProps) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        <Network className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg font-semibold">
          Jerarquía de Protocolos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {Object.entries(tree).map(([key, node]) => (
          <TreeNode key={key} name={key} node={node} level={0} />
        ))}
      </CardContent>
    </Card>
  )
}
