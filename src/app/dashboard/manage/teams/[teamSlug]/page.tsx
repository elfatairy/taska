import UnderDevelopment from "@/components/UnderDevelopment";

export default function ManageTeamPage({ params }: PageProps<'/dashboard/manage/teams/[teamSlug]'>) {
  return (
    <div className="h-full flex items-center justify-center pb-16">
      <UnderDevelopment />
    </div>
  )
}