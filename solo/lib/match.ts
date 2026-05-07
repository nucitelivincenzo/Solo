import { isCompatComplete } from "@/lib/types";
import type { Profile } from "@/lib/types";

type CompatProfile = Pick<Profile, "vibe" | "energia" | "grupo" | "ambiente" | "intencao" | "social_behavior">;

const MAX_SCORE = 15;

export function calcularMatch(
  userA: CompatProfile,
  userB: CompatProfile
): { score: number; percentage: number } {
  if (!isCompatComplete(userA) || !isCompatComplete(userB)) {
    return { score: 0, percentage: 0 };
  }

  let score = 0;

  // vibe: +3 if diff <= 1
  if (Math.abs(userA.vibe! - userB.vibe!) <= 1) score += 3;

  // energia: +3 if diff <= 1
  if (Math.abs(userA.energia! - userB.energia!) <= 1) score += 3;

  // grupo: +2 if diff <= 1
  if (Math.abs(userA.grupo! - userB.grupo!) <= 1) score += 2;

  // ambiente: +2 if equal
  if (userA.ambiente === userB.ambiente) score += 2;

  // intencao: +2 if equal
  if (userA.intencao === userB.intencao) score += 2;

  // social_behavior: diff 1 → +3, diff 0 → +2, diff >= 2 → +0
  const sbDiff = Math.abs(userA.social_behavior! - userB.social_behavior!);
  if (sbDiff === 1) score += 3;
  else if (sbDiff === 0) score += 2;

  const percentage = Math.round((score / MAX_SCORE) * 100);

  return { score, percentage };
}
