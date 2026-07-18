import type { PlateElementProps } from 'platejs/react'
import { createPlatePlugin } from 'platejs/react'

export type CitationNode = {
  type: 'citation'
  number: number
  sourceId: string
  children: [{ text: '' }]
}

function CitationElement({ attributes, children, element }: PlateElementProps) {
  const citation = element as unknown as CitationNode

  return (
    <span {...attributes} className="citation-node">
      <button
        type="button"
        className="citation-chip"
        contentEditable={false}
        data-citation-source={citation.sourceId}
        aria-label={`Open source ${citation.number}`}
        onMouseDown={(event) => event.preventDefault()}
      >
        [{citation.number}]
      </button>
      {children}
    </span>
  )
}

export const CitationPlugin = createPlatePlugin({
  key: 'citation',
  node: {
    component: CitationElement,
    isElement: true,
    isInline: true,
    isVoid: true,
  },
})
