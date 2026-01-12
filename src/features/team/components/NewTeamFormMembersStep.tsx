'use client'

import { useNewTeamForm } from "@/features/team/hooks/useNewTeamForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "@/components/icons";
import { useState } from "react";
import { api } from "@convex/_generated/api";
import { useAccountQuery } from "@/features/account/useAccount";
import { Doc } from "@convex/_generated/dataModel";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, X, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewTeamFormMembersStepSkeleton } from "./NewTeamFormMembersStepSkeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function NewTeamFormMembersStep({ form, previousStep }: {
  form: ReturnType<typeof useNewTeamForm>['form'],
  previousStep: () => void,
}) {
  const usersQuery = useAccountQuery(api.user.getUsers);
  const [searchValue, setSearchValue] = useState("");

  if (!usersQuery) {
    return <NewTeamFormMembersStepSkeleton previousStep={previousStep} />;
  }

  if (usersQuery.error) {
    return <div>Error: {usersQuery.error}</div>; // TODO: Make ui better
  }

  return (
    <>
      <div className="mb-4 gap-1 flex flex-col">
        <h2 className="text-lg leading-none font-semibold">New Team</h2>
        <p className="text-muted-foreground text-sm">Assign team members to this team now, or continue and invite more members after team creation.</p>
      </div>

      <div className="flex flex-col gap-2 my-4">
        <Input
          type="text"
          placeholder="Search for a user"
          onChange={(e) => setSearchValue(e.target.value)}
          icon={Search}
          iconProps={{ behavior: 'prepend' }}
        />

        <div className="flex flex-col gap-1">
          <form.AppField name="members">
            {(membersField) => (
              <form.AppField name="teamLeadId">
                {(leadField) => (
                  <NewTeamFormMembersStepContent
                    selectedMembers={membersField.state.value}
                    teamLeadId={leadField.state.value}
                    users={usersQuery.data}
                    searchValue={searchValue}
                    addMember={(member) => membersField.setValue([...membersField.state.value, member])}
                    removeMember={(member) => {
                      membersField.setValue(membersField.state.value.filter((m) => m !== member));
                      if (member === leadField.state.value) {
                        leadField.setValue("");
                      }
                    }}
                    setTeamLead={(leadId) => leadField.setValue(leadId)}
                  />
                )}
              </form.AppField>
            )}
          </form.AppField>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button variant="outline" onClick={previousStep} type="button">Previous</Button>
        <form.AppForm>
          <form.AppField name="members">
            {(membersField) => (
              <form.SubscribeButton
                loadingLabel="Creating..."
                label={membersField.state.value.length > 0 ? "Create" : "Skip & Create"}
              />
            )}
          </form.AppField>
        </form.AppForm>
      </div>
    </>
  )
}

function NewTeamFormMembersStepContent({ selectedMembers, teamLeadId, users, searchValue, addMember, removeMember, setTeamLead }: { selectedMembers: string[], teamLeadId: string | null, users: Doc<"users">[], searchValue: string, addMember: (member: string) => void, removeMember: (member: string) => void, setTeamLead: (leadId: string) => void }) {
  let filteredUsers = users.filter((user) => !['CTO', 'Product Manager'].includes(user.role));
  filteredUsers = [
    ...filteredUsers.filter((user) => user.name.toLowerCase().includes(searchValue.toLowerCase())),
    ...filteredUsers.filter((user) => (user.email + user.role).toLowerCase().includes(searchValue.toLowerCase()) && !user.name.toLowerCase().includes(searchValue.toLowerCase()))
  ]

  return (
    <div className="flex flex-col gap-3">
      {selectedMembers.length > 0 && <SelectedMembersList selectedMembers={selectedMembers} teamLeadId={teamLeadId} users={users} removeMember={removeMember} setTeamLead={setTeamLead} />}

      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No users found matching your search
        </div>
      ) : (
        <div className="flex flex-col max-h-[350px] overflow-y-auto gap-1">
          {filteredUsers.map((user) => (
            <UsersListItem
              key={user._id}
              user={user}
              selectedMembers={selectedMembers}
              teamLeadId={teamLeadId}
              addMember={() => addMember(user._id)}
              removeMember={() => removeMember(user._id)}
            />
          ))}
        </div>
      )
      }
    </div>
  )
}

function SelectedMembersList({ selectedMembers, teamLeadId, users, removeMember, setTeamLead }: { selectedMembers: string[], teamLeadId: string | null, users: Doc<"users">[], removeMember: (member: string) => void, setTeamLead: (leadId: string) => void }) {
  const sortedMembers = [...selectedMembers].sort((a, b) => {
    if (a === teamLeadId) return -1;
    if (b === teamLeadId) return 1;
    return 0;
  });

  return (
    <div className="flex items-center gap-2 overflow-x-auto p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md">
      <span className="text-sm font-medium text-green-900 dark:text-green-100 shrink-0">
        Selected ({selectedMembers.length}):
      </span>
      {sortedMembers.map((member) => {
        const user = users.find((user) => user._id === member);
        if (!user) return null;
        const isLead = member === teamLeadId;

        return (
          <div
            key={member}
            className={cn(
              "flex items-center shrink-0 gap-1.5 rounded-full pl-2 pr-1 py-1 shadow-sm",
              isLead
                ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50 border-2 border-yellow-400 dark:border-yellow-600"
                : "bg-white dark:bg-green-950/50 border border-green-300 dark:border-green-800"
            )}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user.imageUrl} />
              <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col shrink-0">
              <p className="text-xs font-medium">{user.name}</p>
              {isLead && (
                <span className="text-[10px] font-semibold text-yellow-700 dark:text-yellow-500 leading-none">
                  LEAD
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isLead) {
                  setTeamLead("");
                } else {
                  setTeamLead(member);
                }
              }}
              type="button"
              className="h-4 w-4 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 flex items-center justify-center transition-colors"
              aria-label={isLead ? "Remove as team lead" : "Make team lead"}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Star className={cn(
                    "h-3 w-3",
                    isLead
                      ? "fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400"
                      : "text-gray-400 dark:text-gray-500"
                  )} />
                </TooltipTrigger>
                <TooltipContent>
                  {isLead ? "Remove as team lead" : "Make team lead"}
                </TooltipContent>
              </Tooltip>
            </button>
            <button
              onClick={() => removeMember(member)}
              type="button"
              className="h-4 w-4 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors"
              aria-label={`Remove ${user.name}`}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <X className="h-3 w-3 text-red-950" />
                </TooltipTrigger>
                <TooltipContent>
                  Remove {user.name} from the team
                </TooltipContent>
              </Tooltip>
            </button>
          </div>
        )
      })}
    </div>
  )
}

function UsersListItem({ user, selectedMembers, teamLeadId, addMember, removeMember }: { user: Doc<"users">, selectedMembers: string[], teamLeadId: string | null, addMember: () => void, removeMember: () => void }) {
  const isMember = selectedMembers.includes(user._id);
  const isLead = user._id === teamLeadId;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-md px-2 py-1 group border transition-colors cursor-pointer",
        isMember
          ? isLead
            ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border-yellow-400 dark:border-yellow-600 hover:from-yellow-100 hover:to-amber-100 dark:hover:from-yellow-950/50 dark:hover:to-amber-950/50"
            : "bg-green-50 border-green-500 hover:bg-green-100 dark:bg-green-950/30 dark:border-green-700 dark:hover:bg-green-950/50"
          : "border-transparent hover:bg-accent"
      )}
      onClick={() => isMember ? removeMember() : addMember()}
    >
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{user.name}</p>
            {isLead && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-700 dark:text-yellow-400 dark:border-yellow-600 capitalize gap-1">
                <Crown className="h-3 w-3" />
                Lead
              </Badge>
            )}
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {isMember ? (
        isLead ? (
          <Star className="h-5 w-5 fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
        ) : (
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
        )
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground/40" />
      )}
    </div>
  )
}