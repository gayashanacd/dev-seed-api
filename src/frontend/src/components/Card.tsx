import React from "react"

interface CardProps {
  title: string
  description: string
  code?: string
}

const Card: React.FC<CardProps> = ({ title, description, code }) => {
  return (
    <div className="border rounded p-4 shadow hover:shadow-lg transition">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="mb-2">{description}</p>
      {code && (
        <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-sm">
          {code}
        </pre>
      )}
    </div>
  )
}

export default Card