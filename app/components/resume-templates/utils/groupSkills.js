export function groupSkills(skillsObj) {
  if (!skillsObj || typeof skillsObj !== "object") return {};

  return Object.fromEntries(
    Object.entries(skillsObj).filter(([_, list]) => Array.isArray(list) && list.length > 0)
  );
}
