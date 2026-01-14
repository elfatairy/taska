import UnderDevelopment from "@/common/components/UnderDevelopment";

export async function generateStaticParams() {
  return [
    { pageName: "profile" },
    { pageName: "settings" },
    { pageName: "pricing" },
    { pageName: "calendar" },
    { pageName: "kanban" },
  ];
}

export default function DashboardPage({ params }: PageProps<'/dashboard/pages/[pageName]'>) {
  return (
    <div className="h-full flex items-center justify-center pb-16">
      <ParamAwait params={params} />
      <UnderDevelopment />
    </div>
  )
}

async function ParamAwait({ params }: {params: PageProps<'/dashboard/pages/[pageName]'>['params']}) {
  await params
  return null
}