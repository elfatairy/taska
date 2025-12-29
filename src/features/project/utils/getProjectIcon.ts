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