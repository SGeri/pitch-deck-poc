interface MarkerPromptPair {
    marker: string;
    prompt: string;
}

interface FormValues {
    slideNumber: number;
    generalContext: string;
    contentPrompt: string;
    prompts: MarkerPromptPair[];
}

export const AFR_PRESET: FormValues = {
    slideNumber: 2,
    generalContext: `KONTEXTUS – AFR PROJEKT STÁTUSZ FRISSÍTÉS

Egy PowerPoint státusz riport diájához kell szöveget generálnod az AFR (AI-based Financial/Document Review) POC projektről a MOL számára.

A dia minden héten frissül, és négy fő szövegdobozt + egy mérföldkő táblázatot + egy dátum mezőt tartalmaz:

1) Általános státusz – executive szintű, 2 bulletpontos, összefoglaló leírás a projekt állapotáról.
2) Múlt héten elvégzett munka – 3 rövid bulletpont arról, hogy mi történt ténylegesen az előző héten.
3) Fő feladatok a hétre – 3 rövid bulletpont a következő hét prioritásairól.
4) Nyitott kérdések és kockázatok – max. 2 nagyon rövid bulletpont a lényegi nyitott témákról.
5) Mérföldkő / fő leszállítandó táblázat – 6 soros táblázat, soronként:
   - készültségi százalék (0–100 közötti egész szám),
   - max. 3 szavas komment.
   A sorok fixek, az alábbi logikai területekhez tartoznak:
   1. sor: UX és UI alapok definiálása
   2. sor: Alkalmazás- és adat alapstruktúra kialakítása
   3. sor: Dokumentum-feltöltés és -kezelés modul implementálása
   4. sor: AI-alapú dokumentum-feldarabolás (chunking) implementálása
   5. sor: Validációs engine és szabálykészlet (6 kategória) implementálása
   6. sor: AI workflow és prompting optimalizálása
6) Dátum mező – a riport generálásának napja, fix formátumban:
   "DÁTUM: ÉÉÉÉ.HH.NN."

STÍLUS ÉS HANGNEM
- Mindig magyar nyelven fogalmazz.
- Rövid, tömör, üzleti tanácsadói hangnem, fölösleges mellébeszélés nélkül.
- Főleg jelen időben, harmadik személyben írj (pl. "A rendszer támogatja...", "A csapat befejezte...").
- Executive szint: a lényegre koncentrálj, ne menj technikai részletekbe a kelleténél jobban.
- Kerüld az érzelmi, marketinges túlzásokat; maradj tárgyilagos, de pozitív/megoldásfókuszú.
- Tartsd tiszteletben a megadott szókereteket (max. szó- és bulletpont-szám mezőnként).

KOHERENCIA
- A "Múlt héten elvégzett munka" mező rezonáljon a megelőző heti "Fő feladatok a hétre" mező tartalmára, ha az információ rendelkezésre áll.
- A "Fő feladatok a hétre" szorosan a felhasználó által megadott aktuális fókuszokra épüljön.
- A "Nyitott kérdések és kockázatok" csak valóban lényeges, még nem lezárt témákat tartalmazzon; ha nincs ilyen, ezt röviden jelezd.
- A mérföldkő táblázat készültségi százalékai legyenek összhangban a szövegdobozokkal és a projekt általános állapotával.
- Mindig ügyelj arra, hogy a teljes dia tartalma logikus, egymással összhangban álló képet adjon a projektről.`,
    contentPrompt: '',
    prompts: [
        {
            marker: '[1]',
            prompt: `Feladatod az "Általános státusz" szövegdobozt kitölteni az AFR POC projekthez.

– Írj PONTOSAN 2 bulletpontot.
– Minden bullet legfeljebb kb. 15 szóból álljon.
– Executive szinten foglald össze:
  • hol tart a projekt összességében,
  • mi a fő fókusz jelenleg,
  • milyen fontos mérföldkő(ke)t ért el a csapat.
– Maradj tárgyilagos, üzleti tanácsadói hangnemben.


Használd fel a felhasználó által megadott aktuális státuszinformációkat, és ügyelj arra, hogy a szöveg összhangban legyen a mérföldkő táblázat készültségével.`,
        },
        {
            marker: '[2]',
            prompt: `Feladatod a "Múlt héten elvégzett munka" szövegdobozt kitölteni.

– Írj legfeljebb 3 bulletpontot (ha kevés dolog történt, elég 1–2 is).
– A HÁROM bullet ÖSSZESEN legfeljebb kb. 30 szóból álljon.
– Csak ténylegesen megtörtént, lezárt vagy érdemben előrehaladt munkákat írj ide.
– Lehetőleg csengjen össze az előző heti "Fő feladatok a hétre" mező tartalmával, ha az információ rendelkezésre áll.

– Fogalmazz tömören, múlt időben (pl. "Befejeztük…", "Finomhangoltuk…").

A fókusz legyen a legfontosabb 1–3 eredményen, ne részletezd túl.`,
        },
        {
            marker: '[3]',
            prompt: `Feladatod a "Fő feladatok a hétre" szövegdobozt kitölteni.

– Írj legfeljebb 3 bulletpontot.
– A HÁROM bullet ÖSSZESEN legfeljebb kb. 30 szóból álljon.
– Csak a következő hét konkrét, legfontosabb prioritásaira fókuszálj (pl. tesztek, finomhangolás, döntések, integrációk).

– Jelen időt vagy jövő időt használj (pl. "Futtatjuk…", "Előkészítjük…", "Véglegesítjük…").
– A tartalom alapja a felhasználó által megadott aktuális fókusz- és feladatlista.

Kerüld a túl általános megfogalmazást; legyen egyértelmű, mit csinál a csapat a héten.`,
        },
        {
            marker: '[4]',
            prompt: `Feladatod a "Nyitott kérdések és kockázatok" szövegdobozt kitölteni.

– Írj legfeljebb 2 bulletpontot.
– A KÉT bullet EGYÜTT legfeljebb kb. 15 szóból álljon.
– Csak valóban lényeges, még nem lezárt kérdéseket vagy kockázatokat emelj ki.
– Ha nincsenek érdemi nyitott kérdések/kockázatok, írj EGY rövid bulletet, pl.:
  "- Nincs kiemelt nyitott kérdés vagy kockázat."

– Fogalmazz nagyon tömören, kulcsszószerűen, de érthetően.

Az itt szereplő elemek legyenek konzisztenssek az általános státusszal és a heti feladatokkal.`,
        },
        {
            marker: '[5]',
            prompt: `Feladatod a "UX és UI alapok definiálása" nevű mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot. (pl. "75%").
– A szám tükrözze, hogy a UX/UI alapok (folyamatok, képernyők, vizuális keretrendszer) milyen arányban tekinthetők késznek.
– Vedd figyelembe az általános státuszt, a múlt heti munkákat és az aktuális heti fókuszt.

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[6]',
            prompt: `Feladatod egy rövid kommentet adni a "UX és UI alapok definiálása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar nyelvű kommentet adj.
– Fogalmazz állapotleíróan (pl. "Kész", "Majdnem kész", "Finomhangolás alatt", "Folyamatban").
– Ne használj írásjeleket, számokat.

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[7]',
            prompt: `Feladatod az "Alkalmazás- és adat alapstruktúra kialakítása" mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot.
– A szám tükrözze, hogy a fogalmi adatmodell, entitások, kapcsolatok és riport/audit mezők mennyire tekinthetők késznek.
– Vedd figyelembe a státusz szövegdobozokat és a felhasználó által jelzett előrehaladást.

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[8]',
            prompt: `Feladatod egy rövid kommentet adni az "Alkalmazás- és adat alapstruktúra kialakítása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar kommentet adj.
– Legyen állapotleíró és tömör (pl. "Adatmodell kész", "Finomhangolás alatt").

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[9]',
            prompt: `Feladatod a "Dokumentum-feltöltés és -kezelés modul implementálása" mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot.
– A szám tükrözze, mennyire működik teljeskörűen a feltöltés, metaadat-kezelés, listázás és státuszkövetés.

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[10]',
            prompt: `Feladatod egy rövid kommentet adni a "Dokumentum-feltöltés és -kezelés modul implementálása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar kommentet adj.
– Lehet pl. "Teljes funkcionalitás", "Stabil működés", "Apró javítások".

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[11]',
            prompt: `Feladatod az "AI-alapú dokumentum-feldarabolás (chunking) implementálása" mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot.
– A szám tükrözze, mennyire képes az AI üzletileg értelmes szekciókra (fejezetek, táblázatok, lábjegyzetek) bontani a dokumentumokat MOL-terminológiával.

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[12]',
            prompt: `Feladatod egy rövid kommentet adni az "AI-alapú dokumentum-feldarabolás (chunking) implementálása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar kommentet adj.
– Lehet pl. "AI működik", "Jó szekcionálás", "Finomhangolás maradt".

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[13]',
            prompt: `Feladatod a "Validációs engine és szabálykészlet (6 kategória) implementálása" mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot.
– A szám tükrözze a 6 validációs kategória szabálykészletének, futtatásának és hibakezelésének készültségét (beleértve a dinamikus kategóriaszámlálót és szűrést).

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[14]',
            prompt: `Feladatod egy rövid kommentet adni a "Validációs engine és szabálykészlet (6 kategória) implementálása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar kommentet adj.
– Lehet pl. "Szabályok készek", "V1 elfogadva", "Stabil futások".

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[15]',
            prompt: `Feladatod az "AI workflow és prompting optimalizálása" mérföldkő készültségi százalékát megadni.

– Adj vissza PONTOSAN egy egész számot 0 és 100 között.
– Írj százalékjelet is, ne csak a számot.
– A szám tükrözze, mennyire kiforrott a MOL-specifikus példákra, minőségmutatókra és visszacsatolásra épülő AI workflow és prompting.

Kimenet: Százalékjel és a szám, semmi más.`,
        },
        {
            marker: '[16]',
            prompt: `Feladatod egy rövid kommentet adni az "AI workflow és prompting optimalizálása" mérföldkőhöz.

– Legfeljebb 3 szóból álló, magyar kommentet adj.
– Lehet pl. "Folyamatos tuning", "Közel kész", "Pilotra kész".

Kimenet: csak a rövid komment, semmi más.`,
        },
        {
            marker: '[17]',
            prompt: `Formátum:
 DÁTUM: ÉÉÉÉ.HH.NN. (pl. DÁTUM: 2026.01.30.)
Feladatod a státusz riport dátummezőjének kitöltése.

– Használd a riport generálásának napját (a futtatás dátumát).
– A formátum legyen PONTOSAN:
  DÁTUM: ÉÉÉÉ.HH.NN.
– Év, hónap, nap mindig kétjegyű hónap/nap formában, ponttal elválasztva.
– Csak ezt az egy sort add vissza, semmi mást.
– Mindig magyar notációt használj, arab számokkal.

Példa (NE ezt írd ki, csak a formátum illusztrációjára):
DÁTUM: 2026.01.30.`,
        },
    ],
};

export const MOL_GENERAL_CONTEXT = `CONTEXT – MOL GROUP QUARTERLY RESULTS PRESENTATION (Q-REPORT)

You are generating text for a fixed PowerPoint template that presents MOL Group's quarterly financial and operational results across multiple countries.

The presentation is produced once per quarter and always evaluates the year-to-date performance:
- Q2 report covers H1 (Q1+Q2),
- Q3 report covers Q1–Q3,
- Q4 report covers the full year (if used).

All content must be in ENGLISH.

The slides in scope:

1) COVER SLIDE (Slide 1)
   - Textbox 1: Main title – e.g. "SECOND QUARTER 2025 RESULTS".
   - Textbox 2: Report date – e.g. "31 JULY 2025".
   Both fields are written in ALL CAPS.

2) SLIDE 2 – EXECUTIVE & FINANCIAL OVERVIEW
   - Textbox 1: Action title about CLEAN CCS EBITDA movement in the quarter.
   - Textbox 2: Subtitle explaining the main cash flow / business driver behind the results.
   - Textbox 3: "FINANCIALS" bullet list explaining the financial performance (segment-level EBITDA, revenue drivers, etc.).
   - Textbox 4: "OPERATIONAL AND OTHER DEVELOPMENTS" bullet list summarising key operational and other business developments.

3) SLIDE 3 – TRIR (SAFETY) KPI
   - Textbox 1: Action title summarising TRIR (Total Recordable Injury Rate) level and movement.
   - Textbox 2: Comment bullets explaining TRIR performance and main drivers.
   (The bar chart on the slide is NOT your responsibility; you only generate text based on the TRIR values provided as input.)

4) SLIDE 4 – UPSTREAM OPERATIONAL UPDATE 1 (APPENDIX-TYPE SLIDE)
   - The slide is structured by country: HUNGARY, CROATIA, AZERBAIJAN, EGYPT.
   - Under each country there are fixed category headers (Exploration, Field development, Production optimisation, Geothermal, etc.).
   - For each country/category, you generate short bullet points describing key operational updates in that area (drilling, field development, production optimisation, geothermal activities, etc.).

STYLE AND TONE
- Language: ENGLISH.
- Tone: executive, concise, factual, similar to an investor or quarterly management presentation.
- Avoid hype or marketing language; be neutral, analytical, and precise.
- Use present or simple past tense as appropriate (e.g. "EBITDA increased...", "TRIR rose...", "Workovers were completed...").
- Respect ALL CAPS requirements where specified.
- Use clear bullet points for all bullet lists. Do NOT include any prefix like "-" or "•" — the template engine adds those automatically.

COHERENCE AND DATA DEPENDENCY
- You will receive structured input for a given quarter (Q2, Q3, etc.) containing:
  - Clean CCS EBITDA figures and main drivers,
  - Segmental (Upstream, Downstream, Consumer Services, Circular Economy Services) financial performance,
  - TRIR values for current period vs. prior period,
  - Country-level upstream operational updates.
- Your generated text for each textbox must be:
  - Consistent with these numeric and qualitative inputs,
  - Internally coherent across the slide (titles must match bullet content),
  - Reflective of year-to-date performance (H1, Q1–Q3, etc.), not just a single quarter, when that is how the KPI is reported.

FORMAT LIMITS (VERY IMPORTANT)
- When a prompt specifies maximum words per bullet or per textbox, you MUST respect those limits.
- When a prompt specifies the exact number of bullets, generate exactly that number.
- When ALL CAPS is required, every letter in that textbox must be uppercase.

Your job is to fill each textbox independently but consistently, based on the quarter's data and the detailed instructions provided per textbox in separate prompts.`;

export const MOL_CONTENT_PROMPT = `MOL GROUP – Q3 2025 RESULTS
CONTEXT UPDATE FOR 4-SLIDE AI TEMPLATE
1. Cover slide – basic info
Quarter: Q3 2025
Year-to-date period covered: Q1–Q3 2025
Official report date: 7 November 2025



2. Executive & financial overview (Clean CCS EBITDA + key segments)
Clean CCS EBITDA headline
Clean CCS EBITDA in Q3 2025 increased by about 15% year-on-year to USD 974 mn.
Subtitle / key driver
Operating cash flow before working capital for the first nine months is above USD 1.8 bn.
Financials – segment highlights
Profit before tax in Q3 2025 is around USD 503 mn, roughly flat versus the same quarter last year.
Clean CCS EBITDA for the quarter rises about 15% YoY to roughly USD 974 mn, driven mostly by refining margins; Q1–Q3 operating cash flow before working capital exceeds USD 1.8 bn.
Upstream EBITDA is broadly stable, with around 3% quarter-on-quarter growth in a largely unchanged external price environment.
Downstream Clean CCS EBITDA grows about 51% YoY to roughly USD 452 mn, supported mainly by significantly wider refining margins (diesel and other products).
Consumer Services EBITDA increases about 28% YoY to around USD 317 mn, helped by a strong driving season and better pricing, especially in Romania and Croatia.
Circular Economy Services EBITDA is negative at about USD -64 mn in Q3, reflecting seasonality, high redemption activity in the deposit-return system and weaker secondary raw material sales.
Operational and other developments – group level
In Kurdistan, developments are positive: the export pipeline to Turkey has reopened and the KM250 gas expansion facility reached completion, enabling higher gas processing capacity at Khor Mor.
MOL plans to change its legal structure to a holding structure; an extraordinary general meeting is scheduled for 27 November 2025 to decide on the changes.
A fire incident occurred at the Danube Refinery on 20 October 2025; one of the three atmospheric vacuum distillation units (AV3) was heavily damaged, while the rest of the refinery remained intact.
Units unaffected by the fire have been restarted; the refinery is expected to run at roughly 50–55% of capacity until AV3 is repaired, implying around 250–300 kt per month of lost crude processing in the interim.

3. TRIR slide – safety KPI
TRIR (Total Recordable Injury Rate) for Q1–Q3 2025 stands at 1.44, above the public full-year guidance level of 1.3.
The deterioration versus the previous year is partly linked to a single significant incident in Pakistan.
There were no injuries associated with the Danube Refinery fire in October.

4. Upstream Operational Update 1 – country inputs
All points below refer to Q3 2025 operational updates.
4.1 Hungary
Exploration (Hungary)
The Galga-4 well delivered a successful oil discovery in partnership with O&GD, with gross production of about 1.0 mboepd, roughly half attributable to MOL.
The Nagykörű-É-1 well was spudded on 8 September; due to poor reservoir quality it was plugged and abandoned after evaluation.
Field development (Hungary)
Construction of the Vecsés gathering station has started, progressing field development in the area.
Production optimisation (Hungary)
Around 14 well workovers were completed during the quarter to optimise production.
Geothermal / other (Hungary)
The Murakeresztúr-Őrtilos geothermal licence has been relinquished; at the same time, MOL submitted an application for a new geothermal exploration licence in the Szeged area.

4.2 Croatia
Exploration (Croatia)
An offshore drilling campaign is in progress: at Ika A, drilling activities started on 22 August 2025.
Field development and production (Croatia)
The Jamarice-183 well has been tied-in and started production in July.
A re-entry at Gola-4 commenced on 13 July 2025; attempts to remove production equipment were unsuccessful and the well has been plugged and abandoned.
At Zalata-Dravica, permitting activities are ongoing to progress the project.
Production optimisation (Croatia)
About 10 workovers were executed on onshore fields to support production optimisation.
Geothermal (Croatia)
At Leščan, drilling operations finished and the team is evaluating whether to continue the geothermal project.

4.3 Azerbaijan
Operational update (Azerbaijan)
ACG oil production is impacted by the natural decline of the field, unplanned trips at the ACG plant and the oil price-linked effect on entitlement volumes.
Drilling activities on the ACG field continue.
For Gobustan, an onshore operated exploration asset, the EDPSA signing is expected in Q4 2025.

4.4 Egypt
Operational update (Egypt)
Workover activities were performed on several assets: four wells in North Bahariya, one in Ras Qattara and one in West Abu Gharadig.
Two new wells were drilled in North Bahariya, and drilling of an additional well started in Ras Qattara during the quarter.`;

export const MOL_QUARTERLY_SLIDE_1_PRESET: FormValues = {
    slideNumber: 1,
    generalContext: MOL_GENERAL_CONTEXT,
    contentPrompt: MOL_CONTENT_PROMPT,
    prompts: [
        {
            marker: '[1]',
            prompt: `You are filling Slide 1, Textbox 1 (main title) of the MOL Group quarterly results presentation.

REQUIREMENTS:
- Content: action-type main title stating which quarter's results are presented.
- Format example: "SECOND QUARTER 2025 RESULTS" or "THIRD QUARTER 2025 RESULTS".
- Use ordinal number + "QUARTER", then the YEAR, then "RESULTS".
- MAXIMUM 4 WORDS.
- ALL CAPS ONLY (no lowercase letters).
- The quarter (Q1/Q2/Q3/Q4) and year will be provided in the input; use those values.

OUTPUT:
- Return ONLY the title as a single line, no bullet and no extra explanation.`,
        },
        {
            marker: '[2]',
            prompt: `You are filling Slide 1, Textbox 2 (report date) of the MOL Group quarterly results presentation.

REQUIREMENTS:
- Content: the report generation date.
- Format: "<DAY> <MONTH NAME> <YEAR>", e.g. "31 JULY 2025".
- DAY: 1–31 as a number with no leading zero.
- MONTH NAME: English month name fully spelled, e.g. "JULY".
- YEAR: 4-digit year.
- ALL CAPS ONLY (no lowercase letters).
- Use the reporting date provided in the input. If no date is provided, use the current date.

OUTPUT:
- Return ONLY the date line in the specified format, no extra text.`,
        },
    ],
};

export const MOL_QUARTERLY_SLIDE_2_PRESET: FormValues = {
    slideNumber: 2,
    generalContext: MOL_GENERAL_CONTEXT,
    contentPrompt: MOL_CONTENT_PROMPT,
    prompts: [
        {
            marker: '[1]',
            prompt: `You are filling Slide 2, Textbox 1: the main action title for the quarter.

REQUIREMENTS:
- Content: a one-line action title about CLEAN CCS EBITDA movement in the reported period (e.g. H1 2025, Q1–Q3 2025).
- It should state whether Clean CCS EBITDA rises, declines, remains stable, etc., and in which quarter/period.
- MAXIMUM 8 WORDS.
- ALL CAPS ONLY (no lowercase letters).
- Style: short, impactful, executive. Example patterns (for inspiration only):
  - "SLOWING REGIONAL MACRO TAKES Q2 CLEAN CCS EBITDA"
  - "CLEAN CCS EBITDA RISES IN Q3 ON STRONG MARGINS"
- Must be consistent with the input data on Clean CCS EBITDA (trend and main driver).

OUTPUT:
- Return ONLY the title line, no bullets and no extra explanation.`,
        },
        {
            marker: '[2]',
            prompt: `You are filling Slide 2, Textbox 2: the subtitle under the Clean CCS EBITDA action title.

REQUIREMENTS:
- Content: a short explanatory line elaborating on the main driver(s) behind the quarter's performance, e.g. cash flow, specific business segments, margins.
- Approximately 10–11 words (do not exceed 12 words).
- ALL CAPS ONLY (no lowercase letters).
- Focus on 1–2 key drivers, e.g. "OPERATING CASH FLOW ABOVE USD X.X BILLION IN FIRST NINE MONTHS".
- Must be consistent with the quarter's financial and operational inputs.

OUTPUT:
- Return ONLY the subtitle line, no bullets and no extra explanation.`,
        },
        {
            marker: '[3]',
            prompt: `You are filling Slide 2, Textbox 3: the "FINANCIALS" bullet section.

REQUIREMENTS:
- Content: bullet points explaining the main financial performance drivers for the period.
- Focus areas (if data is available): 
  - Upstream EBITDA,
  - Downstream EBITDA,
  - Consumer Services EBITDA,
  - Circular Economy Services EBITDA,
  - Any notable corporate/other financial effects.
- NUMBER OF BULLETS: 5 to 7 bullets.
- EACH BULLET: MAXIMUM 15 words. NEVER exceed 15 words per bullet. MAXIMUM 100 characters per bullet including spaces.
- If a bullet is too long, shorten it aggressively. Brevity is more important than detail.
- Style: factual, segment-focused, linking performance to drivers (prices, volumes, margins, FX, etc.).
- Do NOT use ALL CAPS; use normal sentence case (capitalise first letter, proper nouns).

FORMAT:

- One bullet per line.

OUTPUT:
- Only the bullet list, nothing else.`,
        },
        {
            marker: '[4]',
            prompt: `You are filling Slide 2, Textbox 4: the "OPERATIONAL AND OTHER DEVELOPMENTS" bullet section.

REQUIREMENTS:
- Content: key operational and strategic developments in the period, across MOL Group (refining, retail, upstream, projects, regulation, etc.).
- NUMBER OF BULLETS: exactly 4 bullets.
- EACH BULLET: MAXIMUM 12 words. NEVER exceed 12 words per bullet. MAXIMUM 80 characters per bullet including spaces.
- If a bullet is too long, shorten it aggressively. Brevity is more important than detail.
- Style: concise, factual, highlight-type items (e.g. major outages, new projects, regulatory changes, strategic milestones).
- Do NOT use ALL CAPS; use normal sentence case.

FORMAT:

- One bullet per line.

OUTPUT:
- Only the bullet list, nothing else.`,
        },
    ],
};

export const MOL_QUARTERLY_SLIDE_3_PRESET: FormValues = {
    slideNumber: 3,
    generalContext: MOL_GENERAL_CONTEXT,
    contentPrompt: MOL_CONTENT_PROMPT,
    prompts: [
        {
            marker: '[1]',
            prompt: `You are filling Slide 3, Textbox 1: the action title for the TRIR KPI.

REQUIREMENTS:
- Content: a one-line action title describing TRIR level and movement over the reported period (e.g. H1 2025, Q1–Q3 2025).
- Mention the approximate TRIR level and whether it is up, down, or around guidance.
- Example patterns (for inspiration only):
  - "TRIR AROUND 1.3, FY GUIDANCE IN H1 2025"
  - "TRIR ROSE TO 1.44 IN Q1–Q3 2025"
- MAXIMUM 12 WORDS.
- ALL CAPS ONLY (no lowercase letters).
- Use the TRIR values and guidance given in the input.

OUTPUT:
- Return ONLY the title line, no bullets and no extra explanation.`,
        },
        {
            marker: '[2]',
            prompt: `You are filling Slide 3, Textbox 2: comment bullets explaining TRIR performance.

REQUIREMENTS:
- Content: short comments explaining:
  - how TRIR compares to guidance or prior period,
  - what types of incidents dominate,
  - any notable patterns (e.g. slip/trip vs. process safety).
- NUMBER OF BULLETS: 2 or 3 bullets.
- EACH BULLET: between 5 and 15 words.
- Style: factual, safety-focused, non-alarmist but transparent.

FORMAT:
- One bullet per line.
- Normal sentence case (not all caps).

OUTPUT:
- Only the bullet list, nothing else.`,
        },
    ],
};

export const MOL_QUARTERLY_SLIDE_4_PRESET: FormValues = {
    slideNumber: 4,
    generalContext: MOL_GENERAL_CONTEXT,
    contentPrompt: MOL_CONTENT_PROMPT,
    prompts: [
        {
            marker: '[1]',
            prompt: `You are filling Slide 4, Textbox 1: HUNGARY – Exploration.

REQUIREMENTS:
- Content: key exploration updates in Hungary for the period (e.g. bid rounds, concessions, drilling, evaluations).
- NUMBER OF BULLETS: 2 or 3 bullets.
- EACH BULLET: MAXIMUM 10 words. NEVER exceed 10 words. MAXIMUM 70 characters per bullet including spaces.
- If a bullet is too long, shorten it aggressively. Brevity is more important than detail.
- Style: short, factual operational updates.

FORMAT:

- One bullet per line.

OUTPUT:
- Only the bullet list, nothing else.`,
        },
        {
            marker: '[2]',
            prompt: `You are filling Slide 4, Textbox 2: HUNGARY – Field development.

REQUIREMENTS:
- Content: a single bullet capturing the main field development activity in Hungary (e.g. permitting, tendering, facilities, tie-ins).
- NUMBER OF BULLETS: exactly 1 bullet.
- BULLET LENGTH: MAXIMUM 12 words. NEVER exceed 12 words. MAXIMUM 80 characters including spaces.
- If too long, shorten aggressively. Brevity is more important than detail.
- Style: factual, describing status or progress.

FORMAT:

- One bullet only.

OUTPUT:
- Only that single bullet, nothing else.`,
        },
        {
            marker: '[3]',
            prompt: `You are filling Slide 4, Textbox 3: HUNGARY – Production optimisation.

REQUIREMENTS:
- Content: a single bullet describing production optimisation measures or results (e.g. workovers completed, efficiency gains).
- NUMBER OF BULLETS: exactly 1 bullet.
- BULLET LENGTH: MAXIMUM 8 words. NEVER exceed 8 words. MAXIMUM 60 characters including spaces.
- If too long, shorten aggressively. Brevity is more important than detail.

FORMAT:

- One bullet only.

OUTPUT:
- Only that single bullet, nothing else.`,
        },
        {
            marker: '[4]',
            prompt: `You are filling Slide 4, Textbox 4: HUNGARY – Other.

REQUIREMENTS:
- Content: a single bullet with another relevant upstream-related update, often geothermal-related (e.g. seismic measurements, pilot projects).
- NUMBER OF BULLETS: exactly 1 bullet.
- BULLET LENGTH: MAXIMUM 10 words. NEVER exceed 10 words. MAXIMUM 70 characters including spaces.
- If too long, shorten aggressively. Brevity is more important than detail.

FORMAT:

- One bullet only.

OUTPUT:
- Only that single bullet, nothing else.`,
        },
        {
            marker: '[5]',
            prompt: `You are filling Slide 4, Textbox 5: CROATIA – Exploration.

REQUIREMENTS:
- Content: a single bullet about exploration activity in Croatia (e.g. licensing, drilling, seismic).
- NUMBER OF BULLETS: exactly 1 bullet.
- BULLET LENGTH: MAXIMUM 12 words. NEVER exceed 12 words. MAXIMUM 80 characters including spaces.
- If too long, shorten aggressively. Brevity is more important than detail.

FORMAT:

- One bullet only.

OUTPUT:
- Only that single bullet, nothing else.`,
        },
        {
            marker: '[6]',
            prompt: `You are filling Slide 4, Textbox 6: CROATIA – Field development and production.

REQUIREMENTS:
- Content: multiple bullets summarising key field development and production updates in Croatia.
- NUMBER OF BULLETS: exactly 3 bullets.
- EACH BULLET: MAXIMUM 10 words. NEVER exceed 10 words per bullet. MAXIMUM 70 characters per bullet including spaces.
- MAX WORDS TOTAL: 30 words across all 3 bullets.
- If a bullet is too long, shorten it aggressively. Brevity is more important than detail.
- Style: factual, covering topics like facilities, wells, production trends, project status.

FORMAT:

- One bullet per line.

OUTPUT:
- Only the bullet list, nothing else.`,
        },
        {
            marker: '[7]',
            prompt: `You are filling Slide 4, Textbox 7: CROATIA – Production optimisation.

REQUIREMENTS:
- Content: a single bullet about production optimisation actions or results in Croatia.
- NUMBER OF BULLETS: exactly 1 bullet.
- BULLET LENGTH: MAXIMUM 8 words. NEVER exceed 8 words. MAXIMUM 60 characters including spaces.
- If too long, shorten aggressively. Brevity is more important than detail.

FORMAT:

- One bullet only.

OUTPUT:
- Only that single bullet, nothing else.`,
        },
        {
            marker: '[8]',
            prompt: `You are filling Slide 4, Textbox 8: CROATIA – Geothermal.

REQUIREMENTS:
- Content: geothermal-related operational updates in Croatia.
- NUMBER OF BULLETS: exactly 2 bullets.
- EACH BULLET: MAXIMUM 8 words. NEVER exceed 8 words per bullet. MAXIMUM 60 characters per bullet including spaces.
- If a bullet is too long, shorten it aggressively. Brevity is more important than detail.
- Style: factual, short status updates (e.g. measurements, studies, pilot phases).

FORMAT:

- One bullet per line.

OUTPUT:
- Only the bullet list, nothing else.`,
        },
        {
            marker: '[9]',
            prompt: `You are filling Slide 4, Textbox 9: AZERBAIJAN – Operational update.

REQUIREMENTS:
- Content: upstream operational updates in Azerbaijan for the period.
- NUMBER OF BULLETS: 2 or 3 bullets.
- EACH BULLET: MAXIMUM 12 words. NEVER exceed 12 words per bullet. MAXIMUM 80 characters per bullet including spaces.
- If a bullet is too long, shorten it aggressively. Brevity is more important than detail.
- Style: high-level but concrete (e.g. production trends, key project milestones, notable events).

FORMAT:

- One bullet per line.

OUTPUT:
- Only the bullet list, nothing else.`,
        },
        {
            marker: '[10]',
            prompt: `You are filling Slide 4, Textbox 10: EGYPT – Operational update.

REQUIREMENTS:
- Content: upstream operational updates in Egypt for the period.
- NUMBER OF BULLETS: 3 or 4 bullets.
- EACH BULLET: MAXIMUM 12 words. NEVER exceed 12 words per bullet. MAXIMUM 80 characters per bullet including spaces.
- If a bullet is too long, shorten it aggressively. Brevity is more important than detail.
- Style: similar to Azerbaijan: high-level operational status, key events, production or project changes.

FORMAT:

- One bullet per line.

OUTPUT:
- Only the bullet list, nothing else.`,
        },
    ],
};
