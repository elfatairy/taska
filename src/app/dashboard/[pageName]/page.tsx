import UnderDevelopment from "@/common/components/UnderDevelopment";

export async function generateStaticParams() {
  return [
    { pageName: "overview" },
    { pageName: "sales" },
    { pageName: "messages" },
    { pageName: "authentication" },
    { pageName: "documents" },
    { pageName: "components" },
    { pageName: "help" },
  ];
}

export default function DashboardPage() {
  return (
    <div className="h-full flex items-center justify-center pb-16">
      <UnderDevelopment />
    </div>
  )
}