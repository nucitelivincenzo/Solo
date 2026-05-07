import { supabase } from "@/lib/supabase";
import { isCompatComplete } from "@/lib/types";
import { calcularMatch } from "@/lib/match";
import type { Profile } from "@/lib/types";

export type CompatUser = Pick<Profile, "vibe" | "energia" | "grupo" | "ambiente" | "intencao" | "social_behavior"> & { user_id: string };

export function calcGroupAvgCompat(members: CompatUser[]): number {
  const viable = members.filter((m) => isCompatComplete(m));
  if (viable.length < 2) return 0;
  let total = 0, count = 0;
  for (let i = 0; i < viable.length; i++) {
    for (let j = i + 1; j < viable.length; j++) {
      total += calcularMatch(viable[i], viable[j]).percentage;
      count++;
    }
  }
  return count > 0 ? Math.round(total / count) : 0;
}

function buildOptimalGroup(users: CompatUser[], targetSize = 4): CompatUser[] {
  if (users.length < 3) return [];
  if (users.length === 3) return users;

  let bestPairScore = -1, seedI = 0, seedJ = 1;
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const { percentage } = calcularMatch(users[i], users[j]);
      if (percentage > bestPairScore) { bestPairScore = percentage; seedI = i; seedJ = j; }
    }
  }

  const group: CompatUser[] = [users[seedI], users[seedJ]];
  const pool = users.filter((_, i) => i !== seedI && i !== seedJ);

  while (group.length < Math.min(targetSize, users.length) && pool.length > 0) {
    let bestIdx = -1, bestScore = -1;
    for (let i = 0; i < pool.length; i++) {
      const score = calcGroupAvgCompat([...group, pool[i]]);
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
    if (bestIdx < 0) break;
    group.push(pool.splice(bestIdx, 1)[0]);
  }

  return group;
}

export async function tentarFormarGrupo(eventId: string): Promise<void> {
  try {
    const { data: interests } = await supabase
      .from("event_group_interest")
      .select("user_id")
      .eq("event_id", eventId);

    if (!interests || interests.length < 3) return;

    const allIds = interests.map((r: { user_id: string }) => r.user_id);

    // Find users already assigned to a group for this event
    const { data: existingGroups } = await supabase
      .from("groups")
      .select("id")
      .eq("event_id", eventId);

    const assignedIds = new Set<string>();
    if (existingGroups?.length) {
      const gids = existingGroups.map((g: { id: string }) => g.id);
      const { data: existingMembers } = await supabase
        .from("group_members")
        .select("user_id")
        .in("group_id", gids);
      existingMembers?.forEach((m: { user_id: string }) => assignedIds.add(m.user_id));
    }

    const unassigned = allIds.filter((id: string) => !assignedIds.has(id));
    if (unassigned.length < 3) return;

    const { data: rawProfiles } = await supabase
      .from("profiles")
      .select("user_id, vibe, energia, grupo, ambiente, intencao, social_behavior")
      .in("user_id", unassigned);

    if (!rawProfiles) return;

    const compatUsers = (rawProfiles as unknown as CompatUser[]).filter((p) =>
      isCompatComplete(p)
    );
    if (compatUsers.length < 3) return;

    const groupMembers = buildOptimalGroup(compatUsers);
    if (groupMembers.length < 3) return;

    const { data: newGroup, error } = await supabase
      .from("groups")
      .insert({ event_id: eventId, status: "forming" })
      .select()
      .single();

    if (error || !newGroup) return;

    await supabase
      .from("group_members")
      .insert(groupMembers.map((u) => ({ group_id: newGroup.id, user_id: u.user_id })));

  } catch {
    // group formation is non-critical
  }
}
