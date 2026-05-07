export type Ambiente = 'bar' | 'happy' | 'balada' | 'evento';
export type Intencao = 'amizade' | 'social' | 'romantico' | 'experiencia';

export interface Profile {
  id?: string;
  user_id: string;
  night_styles: string[] | null;
  looking_for: string[] | null;
  group_size: string | null;
  onboarding_completed: boolean | null;
  vibe: number | null;      // 1–4
  energia: number | null;   // 1–4
  grupo: number | null;     // 1–4
  ambiente: Ambiente | null;
  intencao: Intencao | null;
  social_behavior: number | null; // 1–4
}

export function isCompatComplete(
  profile: Partial<Profile> | null | undefined
): boolean {
  if (!profile) return false;
  return (
    profile.vibe != null &&
    profile.energia != null &&
    profile.grupo != null &&
    profile.ambiente != null &&
    profile.intencao != null &&
    profile.social_behavior != null
  );
}
