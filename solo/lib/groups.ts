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

// Returns true if any group action occurred (new group created or existing filled)
export async function tentarFormarGrupo(eventId: string): Promise<boolean> {
  try {
    // 1. All users who expressed interest
    const { data: interests } = await supabase
      .from("event_group_interest")
      .select("user_id")
      .eq("event_id", eventId);

    if (!interests || interests.length < 3) return false;

    const allIds = interests.map((r: { user_id: string }) => r.user_id);

    // 2. Existing groups + members for this event
    const { data: existingGroups } = await supabase
      .from("groups")
      .select("id, status")
      .eq("event_id", eventId);

    const assignedIds = new Set<string>();
    type MemberRow = { group_id: string; user_id: string };
    let allExistingMembers: MemberRow[] = [];

    if (existingGroups?.length) {
      const gids = existingGroups.map((g: { id: string }) => g.id);
      const { data: existingMembers } = await supabase
        .from("group_members")
        .select("group_id, user_id")
        .in("group_id", gids);
      allExistingMembers = (existingMembers as MemberRow[]) ?? [];
      allExistingMembers.forEach((m) => assignedIds.add(m.user_id));
    }

    // 3. Fetch compat profiles for everyone interested
    const { data: rawProfiles } = await supabase
      .from("profiles")
      .select("user_id, vibe, energia, grupo, ambiente, intencao, social_behavior")
      .in("user_id", allIds);

    if (!rawProfiles) return false;

    const profileMap = new Map(
      (rawProfiles as unknown as CompatUser[]).map((p) => [p.user_id, p])
    );

    let acted = false;

    // 4. Try to fill existing "forming" groups first
    const formingGroups = (existingGroups ?? [])
      .filter((g: { id: string; status: string }) => g.status === "forming")
      .map((g: { id: string; status: string }) => ({
        id: g.id,
        memberIds: allExistingMembers.filter((m) => m.group_id === g.id).map((m) => m.user_id),
      }))
      .filter((g) => g.memberIds.length < 5);

    // Track remaining unassigned as a mutable array
    const unassigned = allIds.filter((id: string) => !assignedIds.has(id));

    for (const fg of formingGroups) {
      if (unassigned.length === 0) break;

      const fgProfiles = fg.memberIds
        .map((id) => profileMap.get(id))
        .filter((p): p is CompatUser => !!p && isCompatComplete(p));

      const candidates = unassigned
        .map((id) => profileMap.get(id))
        .filter((p): p is CompatUser => !!p && isCompatComplete(p));

      if (fgProfiles.length === 0 || candidates.length === 0) continue;

      let best: CompatUser | null = null, bestScore = -1;
      for (const c of candidates) {
        const score = calcGroupAvgCompat([...fgProfiles, c]);
        if (score > bestScore) { bestScore = score; best = c; }
      }
      if (!best) continue;

      await supabase.from("group_members").insert({ group_id: fg.id, user_id: best.user_id });
      assignedIds.add(best.user_id);
      unassigned.splice(unassigned.indexOf(best.user_id), 1);
      acted = true;

      // Mark complete when group reaches 4+
      if (fg.memberIds.length + 1 >= 4) {
        await supabase.from("groups").update({ status: "complete" }).eq("id", fg.id);
      }
    }

    // 5. Form new groups from remaining unassigned users
    const remaining = allIds.filter((id: string) => !assignedIds.has(id));
    if (remaining.length >= 3) {
      const compatPool = remaining
        .map((id) => profileMap.get(id))
        .filter((p): p is CompatUser => !!p && isCompatComplete(p));

      if (compatPool.length >= 3) {
        const newMembers = buildOptimalGroup(compatPool);
        if (newMembers.length >= 3) {
          const status = newMembers.length >= 4 ? "complete" : "forming";
          const { data: newGroup, error } = await supabase
            .from("groups")
            .insert({ event_id: eventId, status })
            .select()
            .single();

          if (!error && newGroup) {
            await supabase
              .from("group_members")
              .insert(newMembers.map((u) => ({ group_id: newGroup.id, user_id: u.user_id })));
            acted = true;
          }
        }
      }
    }

    return acted;
  } catch {
    return false;
  }
}
