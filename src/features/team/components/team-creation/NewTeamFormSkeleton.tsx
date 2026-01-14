import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Search } from "@/common/components/icons";
import { Skeleton } from "@/common/components/ui/skeleton";

export function NewTeamFormMembersStepSkeleton({ previousStep }: {
  previousStep: () => void,
}) {
  return (
    <>
      <div className="mb-4 gap-1 flex flex-col">
        <h2 className="text-lg leading-none font-semibold">New Team</h2>
        <p className="text-muted-foreground text-sm">Assign team members to this team now, or continue and invite more members after team creation.</p>
      </div>

      <div className="flex flex-col gap-2 my-4">
        <Input
          type="text"
          placeholder="Search for a project"
          disabled
          icon={Search}
          iconProps={{ behavior: 'prepend' }}
        />

        <div className="flex flex-col gap-1">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col max-h-[350px] overflow-y-auto gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <UserSkeletonItem key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button variant="outline" onClick={previousStep}>Previous</Button>
        <Button disabled>Create</Button>
      </div>
    </>
  )
}

function UserSkeletonItem() {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md px-2 py-1 border border-transparent">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <Skeleton className="h-5 w-5 rounded-full" />
    </div>
  )
}
