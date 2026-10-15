import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Search Console verifica la propietat https://ecoreti2030.com/ buscant aquest
// fitxer a l'arrel. Si desapareix, Google deixa de reconèixer-nos com a
// propietaris i es perd l'accés a les dades.
describe("verificació de Google Search Console", () => {
  it("serveix el fitxer de verificació amb el contingut que espera Google", () => {
    const fitxer = new URL("../../public/google39672827598e23a6.html", import.meta.url);
    expect(readFileSync(fitxer, "utf8").trim()).toBe("google-site-verification: google39672827598e23a6.html");
  });
});
