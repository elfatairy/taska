import UnderDevelopment from "@/components/UnderDevelopment";

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

export default function DashboardPage({ params }: PageProps<'/dashboard/[pageName]'>) {
  return (
    <div className="h-full flex items-center justify-center pb-16">
      <UnderDevelopment />
    </div>
  )
}