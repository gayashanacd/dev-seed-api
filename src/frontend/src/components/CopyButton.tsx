import React, { useState } from "react"

interface CopyButtonProps {
    text: string
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)

            setTimeout(() => {
                setCopied(false)
            }, 2000)
        } catch (err) {
            console.error("Failed to copy")
        }
    }

    return (
        <button
            onClick={copyToClipboard}
            className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 dark:bg-gray-800 dark:border-gray-600"
        >
            {copied ? "Copied!" : "Copy"}
        </button>
    )
}

export default CopyButton