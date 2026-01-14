export function formatDuration(duration: number) {
  const days = Math.floor(duration / (1000 * 60 * 60 * 24))
  const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((duration % (1000 * 60)) / 1000)
  return `${days ? `${days}d ` : ""}${hours ? `${hours}h ` : ""}${minutes ? `${minutes}m ` : ""}${seconds ? `${seconds}s` : ""}`
}

export function getProjectIcon(type: string): 'Laptop' | 'Mobile' | 'Web' | 'Server' | 'Shine' | 'Game' | 'HorizDots' | 'Unknown' {
  switch (type) {
    case "desktop":
      return "Laptop";
    case "mobile":
      return "Mobile";
    case "web":
      return "Web";
    case "backend":
      return "Server";
    case "ai":
      return "Shine";
    case "game":
      return "Game";
    case "other":
      return "HorizDots";
  }

  return "Unknown";
}

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "draft":
      return { variant: "secondary" as const, className: "bg-gray-100 text-gray-700 hover:bg-gray-200" }
    case "in_progress":
      return { variant: "default" as const, className: "bg-blue-100 text-blue-700 hover:bg-blue-200" }
    case "on_hold":
      return { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" }
    case "cancelled":
      return { variant: "destructive" as const, className: "bg-red-100 text-red-700 hover:bg-red-200" }
    case "completed":
      return { variant: "secondary" as const, className: "bg-green-100 text-green-700 hover:bg-green-200" }
    default:
      return { variant: "secondary" as const, className: "" }
  }
}

export const formatStatusText = (status: string) => {
  return status.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
}