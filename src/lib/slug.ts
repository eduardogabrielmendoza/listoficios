const combiningMarks = /[\u0300-\u036f]/g;
const invalidSlugCharacters = /[^a-z0-9]+/g;

export function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(combiningMarks, "")
    .toLowerCase()
    .trim()
    .replace(invalidSlugCharacters, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
