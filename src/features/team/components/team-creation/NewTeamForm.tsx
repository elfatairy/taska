'use client'

import { useNewTeamForm } from "@/features/team/hooks/useNewTeamForm";
import { Activity, useState } from "react";
import { NewTeamFormDetailsStep } from "@/features/team/components/team-creation/NewTeamFormDetailsStep";
import { NewTeamFormMembersStep } from "@/features/team/components/team-creation/NewTeamFormMembersStep";
import { Block } from "@/common/layout/Block";
import { NewTeamFormSuccess } from "@/features/team/components/team-creation/NewTeamFormSuccess";

export function NewTeamForm() {
  const { form, successData, error, defaultSlug, setDefaultSlug } = useNewTeamForm();
  const [step, setStep] = useState<"details" | "members">("details");

  if (successData) {
    return <NewTeamFormSuccess teamId={successData._id} teamName={successData.name} teamSlug={successData.slug} />;
  }

  return (
    <Block>
      {error && <div className="text-red-500 text-sm">{error}</div> /** TODO: Show a proper error ui */}
      <form
        className="p-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && step === "details") {
            e.preventDefault();
            setStep("members");
          }
        }}
      >
        <Activity mode={step === "details" ? "visible" : "hidden"}>
          <NewTeamFormDetailsStep form={form} defaultSlug={defaultSlug} setDefaultSlug={setDefaultSlug} nextStep={() => setStep("members")} />
        </Activity>
        <Activity mode={step === "members" ? "visible" : "hidden"}>
          <NewTeamFormMembersStep form={form} previousStep={() => setStep("details")} />
        </Activity>
      </form>
    </Block>
  )
}