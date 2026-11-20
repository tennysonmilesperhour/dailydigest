// The Field Guide entries, color notes and Classifieds protocols.

/* ---------- Field guide ---------- */
export const GUIDE = [
  { type: 1, means: "Hard separate lumps signaling long transit time. The usual culprits: dehydration, low fiber, or stress clamping the system shut.", flags: "Regular straining warrants the Plumber's Protocol.", protocol: "plumber" },
  { type: 2, means: "Lumpy and compacted. Mild constipation. Fiber and water are running behind schedule.", flags: "Same remedy as Type 1, applied with less urgency.", protocol: "plumber" },
  { type: 3, means: "A sausage bearing surface cracks. Functional but dry. The subject stands one water bottle from greatness.", flags: "Raise hydration, hold everything else steady.", protocol: "hydration" },
  { type: 4, means: "Smooth, soft, serpentine. The gold standard. Gut flora thriving, transit time ideal. Suitable for framing.", flags: "Maintain the regimen. Pride is permitted.", protocol: "maintain" },
  { type: 5, means: "Soft blobs with defined edges. Passage adequate but hasty. Frequently a shortage of soluble fiber.", flags: "Add oats, chia, cooked vegetables. Audit the caffeine.", protocol: "soluble" },
  { type: 6, means: "Fluffy, ragged, mushy. Rapid transit. May indicate irritation, a food sensitivity, stress, or a passing bug.", flags: "Two consecutive days demands the Gut Reset.", protocol: "reset" },
  { type: 7, means: "Entirely liquid. Nothing absorbed. Acute irritation, infection, or an emergency evacuation of last night's decisions.", flags: "Hydrate aggressively. Past 48 hours, or with fever or blood, consult a physician rather than this publication.", protocol: "flood" },
];

export const COLOR_NOTES = [
  { c: "#47301A", name: "Brown", note: "Normal. The bile has done its duty." },
  { c: "#4E5A2C", name: "Green", note: "Fast transit or an abundance of leafy greens. Rarely cause for alarm." },
  { c: "#B08A3A", name: "Yellow, greasy", note: "Possible fat malabsorption. Recurring cases merit a physician." },
  { c: "#17130E", name: "Black, tarry", note: "Iron supplements may be responsible. Otherwise, see a doctor promptly." },
  { c: "#77241D", name: "Red streaks", note: "Beets are innocent until proven guilty. Blood is not. When in doubt, get checked." },
];

/* ---------- Classifieds (protocols) ---------- */
export const PROTOCOLS = [
  { id: "plumber", name: "The Plumber's Protocol", target: "For Types 1 & 2", days: "Runs 5 to 7 days",
    steps: ["16 to 24 oz water within 30 minutes of waking, pinch of salt or electrolytes added", "2 kiwis or 4 to 5 prunes daily. Both outperform psyllium in constipation trials.", "Fiber ladder: add 5g per day until reaching 30 to 35g. Slow ramp spares the bloat.", "Magnesium citrate, 200 to 400mg, taken in the evening", "10 to 15 minute walk following the largest meal", "Feet on a stool during proceedings. Knees above hips. Physics is undefeated."] },
  { id: "hydration", name: "Hydration Bump", target: "For Type 3", days: "Runs 3 days",
    steps: ["Add 20 to 30 oz water to current daily intake", "One electrolyte serving mid-day for proper absorption", "Alcohol halved. Caffeine ends at noon.", "One water-dense food per meal: cucumber, melon, soup, citrus"] },
  { id: "maintain", name: "Golden Snake Maintenance", target: "For Type 4", days: "Runs indefinitely",
    steps: ["30+ distinct plants weekly. Diversity feeds diverse bacteria.", "One fermented food daily: kefir, kimchi, sauerkraut, yogurt", "Fiber held at 30g+, protein kept consistent", "Publish your Type 4s on the front page. Assert dominance."] },
  { id: "soluble", name: "Soluble Fiber Stack", target: "For Type 5", days: "Runs 7 days",
    steps: ["Breakfast of oats or chia pudding. Soluble fiber gels and slows transit.", "Cooked vegetables in place of raw for the week", "Green banana or cooled rice daily for resistant starch", "Coffee capped at one cup. It speeds motility."] },
  { id: "reset", name: "The Gut Reset", target: "For Type 6", days: "Runs 5 to 10 days",
    steps: ["Simplify: cooked proteins, cooked vegetables, rice, bone broth. Boring by design.", "Suspend the usual suspects for 7 days: alcohol, fried food, artificial sweeteners, and dairy if under suspicion", "Keep a food and stool journal. Reintroduce one suspect every 2 to 3 days and watch the record.", "Ginger or peppermint tea after meals", "Sleep prioritized. Poor sleep alone can wreck motility."] },
  { id: "flood", name: "Flood Response", target: "For Type 7", days: "Runs 24 to 48 hours",
    steps: ["Electrolytes every few hours. Small sips beat chugging.", "Bananas, rice, applesauce, toast, plain crackers", "Dairy, fat, fiber, and caffeine suspended until conditions firm up", "Fermented foods reintroduced after 24 solid hours", "Fever, blood, severe pain, or 48+ hours without improvement: a doctor, immediately. This publication loves you but cannot prescribe."] },
  { id: "cleanse", name: "7-Day Whole Food Cleanse", target: "Open to all readers", days: "Runs 7 days",
    steps: ["No packaged food exceeding 5 ingredients", "Cruciferous vegetables daily for liver support", "2 to 3 liters of water, front-loaded in the morning", "One meal daily is a large salad or vegetable soup", "A daily sweat: walk, sauna, or training"] },
  { id: "fermentation", name: "Fermented Food Rotation", target: "For microbiome construction", days: "Runs 14 days",
    steps: ["Weekly rotation: kefir, kimchi, sauerkraut, miso, yogurt, kombucha, tempeh", "Newcomers start at 1 to 2 tbsp and ramp to full servings", "Paired with prebiotic fiber: garlic, onion, leeks, asparagus, oats", "Stool type logged daily. Expect gas in week one, improvement in week two."] },
];
