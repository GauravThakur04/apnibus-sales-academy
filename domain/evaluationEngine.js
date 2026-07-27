/**
 * 12-Rubric Parametric Evaluation Engine
 * Evaluates learner conversation history across 12 sales competencies.
 */

export function evaluateSessionParametric(messages = [], ctx = {}) {
  const userMsgs = messages.filter(m => m.role === "user").map(m => m.content);
  const combinedUserText = userMsgs.join(" ").toLowerCase();

  // 1. Greeting & Permission
  const hasGreeting = /namaste|namaskar|hello|hi|good morning|pranam|नमस्ते|नमस्कार/i.test(combinedUserText);
  const hasPermission = /2 minute|do minute|two minute|permission|chalega|time/i.test(combinedUserText);
  let greetingScore = 5;
  if (hasGreeting) greetingScore += 3;
  if (hasPermission) greetingScore += 2;
  greetingScore = Math.min(10, greetingScore);

  // 2. Rapport & Respect
  const hasRespectWords = /sir|ji|bhaiya|aap|apka|aapka|भैया|जी|सर/i.test(combinedUserText);
  const isPolite = !/pagal|nonsense|chup|bad|bakwas/i.test(combinedUserText);
  let rapportScore = isPolite ? 7 : 3;
  if (hasRespectWords) rapportScore += 3;
  rapportScore = Math.min(10, rapportScore);

  // 3. Pain Discovery
  const discoveryKeywords = [/collection/g, /hisaab/g, /leakage/g, /chori/g, /pooch/g, /kaise pata/g, /full amount/g];
  let discoveryMatches = 0;
  discoveryKeywords.forEach(regex => {
    if (regex.test(combinedUserText)) discoveryMatches++;
  });
  let painScore = Math.min(10, 4 + discoveryMatches * 2);

  // 4. Business App Mention
  const hasApp = /business app|app|free app|free|screen|mobile app|बिजनेस ऐप|फ्री/i.test(combinedUserText);
  let appScore = hasApp ? 9 : 4;

  // 5. POS Solution Mapping
  const hasPOS = /pos|machine|ticketing|ticket|digital|print|मशीन|टिकट/i.test(combinedUserText);
  let posScore = hasPOS ? 9 : 5;

  // 6. Commando Tooling
  const hasCommando = /commando|lead|order|meeting|visit|कमांडो/i.test(combinedUserText);
  let commandoScore = hasCommando ? 8 : 6;

  // 7. Objection Handling
  const hasObjectionHandling = /mehnga|sasta|investment|kharcha|training|support|repair|24x7|button|बटन|महंगा|सस्ता/i.test(combinedUserText);
  let objectionScore = hasObjectionHandling ? 8 : 5;

  // 8. Price Deflection
  const hasPriceDeflection = /value|leakage|free app|saving|faida|bachat/i.test(combinedUserText);
  let priceDeflectionScore = hasPriceDeflection ? 8 : 5;

  // 9. Active Listening
  const avgLen = userMsgs.length ? combinedUserText.length / userMsgs.length : 0;
  let listeningScore = avgLen > 30 && avgLen < 300 ? 9 : 6;

  // 10. Sales Confidence
  let confidenceScore = userMsgs.length >= 3 ? 9 : 6;

  // 11. Value Proposition
  const hasValueProp = /bachat|save|control|digital|hisaab/i.test(combinedUserText);
  let valuePropScore = hasValueProp ? 9 : 5;

  // 12. Closing & Next Step
  const hasClosing = /demo|live demo|kal|subah|shaam|setup|aaj|डेमो|कल|सुबह|शाम/i.test(combinedUserText);
  let closingScore = hasClosing ? 9 : 4;

  const totalSum = greetingScore + rapportScore + painScore + appScore + posScore + commandoScore + 
                   objectionScore + priceDeflectionScore + listeningScore + confidenceScore + valuePropScore + closingScore;
  
  const overallPct = Math.round((totalSum / 120) * 100);

  let verdict = "FIELD READY 🎉";
  if (overallPct < 70) verdict = "NEEDS RETRAINING ⚠️";
  else if (overallPct < 85) verdict = "NEEDS PRACTICE 📈";

  const scoresMap = {
    "Greeting & Permission": greetingScore,
    "Rapport & Respect": rapportScore,
    "Pain Discovery": painScore,
    "Business App Mention": appScore,
    "POS Solution Mapping": posScore,
    "Commando Tooling": commandoScore,
    "Objection Handling": objectionScore,
    "Price Deflection": priceDeflectionScore,
    "Active Listening": listeningScore,
    "Sales Confidence": confidenceScore,
    "Value Proposition": valuePropScore,
    "Closing & Next Step": closingScore
  };

  const lowestCategory = Object.keys(scoresMap).reduce((a, b) => scoresMap[a] < scoresMap[b] ? a : b);
  const recommendation = `Focus on improving **${lowestCategory}** (scored ${scoresMap[lowestCategory]}/10).`;

  return {
    overallPct,
    verdict,
    recommendation,
    rubrics: scoresMap
  };
}
