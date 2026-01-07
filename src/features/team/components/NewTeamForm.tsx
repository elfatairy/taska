'use client'

import { useNewTeamForm } from "@/features/team/hooks/useNewTeamForm";
import { Activity, useState } from "react";
import { NewTeamFormDetailsStep } from "./NewTeamFormDetailsStep";
import { NewTeamFormMembersStep } from "./NewTeamFormMembersStep";
import { usePathname } from "next/navigation";
import { Block } from "@/features/layout/components/Block";
import { NewTeamFormSuccess } from "./NewTeamFormSuccess";

export function NewTeamForm() {
  const pathname = usePathname();
  return (
    <NewTeamFormContent key={pathname} />
  )
}

function NewTeamFormContent() {
  const { form, successData, reset, error, defaultSlug, setDefaultSlug } = useNewTeamForm();
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