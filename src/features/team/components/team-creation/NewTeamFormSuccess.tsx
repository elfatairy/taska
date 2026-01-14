import { CheckCircle2 } from "lucide-react"
import { Button } from "@/common/components/ui/button";
import { Block } from "@/common/layout/Block";
import Link from "next/link";
import { TeamId } from "@/common/types";

export const NewTeamFormSuccess = ({
  teamName,
  teamSlug,
}: { teamId: TeamId; teamName: string; teamSlug: string }) => {
  return (
    <Block fullHeight>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="space-y-6 py-8 px-6 max-w-md mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-4 mb-2">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-semibold text-center">Team Created Successfully!</h2>
            <p className="text-base text-muted-foreground text-center">
              The new team{" "}
              <span className="font-medium text-green-700 dark:text-green-300">{teamName}</span>{" "}
              has been added.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/dashboard/manage/teams">
                See all teams
              </Link>
            </Button>
            <Button
              variant="default"
              className="w-full sm:w-auto"
              asChild
            >
              <Link
                href={`/dashboard/manage/teams/${teamSlug}`}
              >
                See Team &quot;{teamName}&quot; Details
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Block>
  );
};