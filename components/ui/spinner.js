"use client"

import { 
  ClipLoader, 
  BeatLoader, 
  PulseLoader, 
  RingLoader,
  HashLoader 
} from "react-spinners"

const variants = {
  clip: ClipLoader,
  beat: BeatLoader,
  pulse: PulseLoader,
  ring: RingLoader,
  hash: HashLoader
}

const sizes = {
  sm: {
    size: 15,
    margin: 2
  },
  md: {
    size: 25,
    margin: 4
  },
  lg: {
    size: 35,
    margin: 6
  }
}

export function Spinner({ 
  variant = "clip",
  size = "md", 
  color = "currentColor",
  className = "",
  center = false
}) {
  const LoaderComponent = variants[variant] || variants.clip
  const sizeConfig = sizes[size] || sizes.md

  const wrapperClasses = `
    ${className}
    ${center ? 'flex items-center justify-center' : ''}
  `.trim()

  return (
    <div className={wrapperClasses}>
      <LoaderComponent
        color={color}
        size={sizeConfig.size}
        margin={sizeConfig.margin}
        loading={true}
      />
    </div>
  )
}

// Loading overlay component
export function LoadingOverlay({
  variant = "hash",
  color = "currentColor",
  text = "Loading...",
  transparent = false
}) {
  return (
    <div className={`
      fixed inset-0 z-50
      flex flex-col items-center justify-center
      ${transparent ? 'bg-background/80' : 'bg-background'}
    `}>
      <Spinner
        variant={variant}
        size="lg"
        color={color}
      />
      {text && (
        <p className="mt-4 text-sm text-muted-foreground">
          {text}
        </p>
      )}
    </div>
  )
}

// Table loading component
export function TableRowsLoader({
  rows = 5,
  columns = 4,
  variant = "pulse",
  color = "currentColor"
}) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <tr key={rowIndex} className="animate-pulse">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <td key={colIndex} className="p-4">
          <Spinner
            variant={variant}
            size="sm"
            color={color}
          />
        </td>
      ))}
    </tr>
  ))
}

// Button loading spinner
export function ButtonSpinner({
  variant = "beat",
  size = "sm",
  color = "currentColor"
}) {
  return (
    <Spinner
      variant={variant}
      size={size}
      color={color}
    />
  )
} 