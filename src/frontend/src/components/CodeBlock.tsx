import React from "react"
import CopyButton from "./CopyButton"

interface CodeBlockProps {
    code: string
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
    return (
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded p-4 ">

        <div className="absolute top-2 right-2">
            <CopyButton text={code} />
        </div>

        <pre className="text-sm overflow-x-auto">
            <code>{code}</code>
        </pre>

        </div>
    )
}

export default CodeBlock