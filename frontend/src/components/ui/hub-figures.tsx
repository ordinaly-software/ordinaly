/**
 * Hub illustration figure presets.
 *
 * Each figure is an SVG fragment rendered inside a <g transform="translate(cx, cy)">
 * where (cx, cy) is the equator centre of the platform.
 * Top face spans roughly  y ∈ [−54, 0]  and  x ∈ [−108, 108].
 */

// ─── Existing figures (originally in hub-section.tsx) ────────────────────────

/** Sales & CRM: presenter, seated colleague, mini chart screen */
export const SalesCrmFigure = (
  <>
    <circle cx="-29" cy="-22" r="7.5" fill="#4F46E5"/>
    <path d="M-35,-14 Q-36,5 -29,5 Q-22,5 -23,-14 Z" fill="#4F46E5"/>
    <line x1="-23" y1="-10" x2="-11" y2="-16" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="23" cy="-17" r="7" fill="#6366F1"/>
    <rect x="17" y="-10" width="12" height="14" rx="3.5" fill="#6366F1"/>
    <rect x="-13" y="-12" width="26" height="18" rx="2.5" fill="#E0E7FF"/>
    <polyline points="-10,2 -6,-3 -1,-1 4,-7 9,-5"
      fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="-6" cy="-3" r="1.5" fill="#10B981"/>
    <circle cx="4"  cy="-7" r="1.5" fill="#10B981"/>
  </>
);

/** Cloud & Data: cloud shape, AI robot, floating data dots */
export const CloudDataFigure = (
  <>
    <ellipse cx="-7"  cy="-26" rx="13" ry="10" fill="#0EA5E9" opacity=".82"/>
    <ellipse cx="6"   cy="-30" rx="15" ry="12" fill="#0EA5E9" opacity=".9"/>
    <ellipse cx="19"  cy="-25" rx="11" ry="10" fill="#0EA5E9" opacity=".82"/>
    <rect x="-19" y="-24" width="38" height="9" rx="1" fill="#0EA5E9" opacity=".9"/>
    <polygon points="4,-38 -1,-26 3.5,-26 -2,-14 7,-29 2.5,-29" fill="white" opacity=".95"/>
    <rect x="-36" y="-20" width="18" height="17" rx="3" fill="#06B6D4"/>
    <rect x="-34" y="-27" width="14" height="13" rx="3" fill="#0EA5E9"/>
    <circle cx="-29" cy="-22" r="2.5" fill="white" opacity=".9"/>
    <circle cx="-23" cy="-22" r="2.5" fill="white" opacity=".9"/>
    <line x1="-27" y1="-27" x2="-27" y2="-32" stroke="#0EA5E9" strokeWidth="1.5"/>
    <circle cx="-27" cy="-34" r="2.5" fill="#38BDF8"/>
    <circle cx="32" cy="-12" r="4.5" fill="#06B6D4" opacity=".7"/>
    <circle cx="40" cy="-21" r="3.5" fill="#0EA5E9" opacity=".5"/>
    <circle cx="27" cy="-26" r="2.5" fill="#38BDF8" opacity=".4"/>
  </>
);

/** Finance: invoice document, euro symbol, analyst, bar chart */
export const FinanceFigure = (
  <>
    <rect x="-22" y="-39" width="21" height="27" rx="2.5" fill="#E0E7FF"/>
    <rect x="-19" y="-34" width="15" height="2" rx="1" fill="#4F46E5" opacity=".7"/>
    <rect x="-19" y="-29" width="11" height="2" rx="1" fill="#4F46E5" opacity=".5"/>
    <rect x="-19" y="-24" width="13" height="2" rx="1" fill="#4F46E5" opacity=".5"/>
    <text x="4" y="-14" fontFamily="'Segoe UI',system-ui" fontSize="22" fontWeight="800" fill="#4F46E5" opacity=".88">€</text>
    <circle cx="-35" cy="-34" r="7.5" fill="#7C3AED"/>
    <path d="M-41,-26 Q-42,-10 -35,-10 Q-28,-10 -29,-26 Z" fill="#7C3AED"/>
    <rect x="27" y="-24" width="5" height="10" rx="1" fill="#C7D2FE"/>
    <rect x="34" y="-28" width="5" height="14" rx="1" fill="#A5B4FC"/>
    <rect x="41" y="-33" width="5" height="19" rx="1" fill="#6366F1"/>
  </>
);

/** Teams & Ops: meeting table, three people, gear, chat bubble */
export const TeamsOpsFigure = (
  <>
    <ellipse cx="0" cy="-8" rx="22" ry="11" fill="#E0F2FE" opacity=".75"/>
    <circle cx="-19" cy="-25" r="7" fill="#0369A1"/>
    <path d="M-25,-18 Q-26,-4 -19,-4 Q-12,-4 -13,-18 Z" fill="#0369A1"/>
    <circle cx="0" cy="-30" r="7" fill="#0EA5E9"/>
    <path d="M-6,-23 Q-7,-9 0,-9 Q7,-9 6,-23 Z" fill="#0EA5E9"/>
    <circle cx="19" cy="-25" r="7" fill="#0284C7"/>
    <path d="M13,-18 Q12,-4 19,-4 Q26,-4 25,-18 Z" fill="#0284C7"/>
    <g transform="translate(-41,-37)">
      <circle cx="9" cy="9" r="9" fill="none" stroke="#0EA5E9" strokeWidth="2.5"/>
      <circle cx="9" cy="9" r="4" fill="#0EA5E9"/>
      <rect x="7.3" y="-2"  width="3.4" height="4" rx=".8" fill="#0EA5E9"/>
      <rect x="7.3" y="16"  width="3.4" height="4" rx=".8" fill="#0EA5E9"/>
      <rect x="-2"  y="7.3" width="4"   height="3.4" rx=".8" fill="#0EA5E9"/>
      <rect x="16"  y="7.3" width="4"   height="3.4" rx=".8" fill="#0EA5E9"/>
    </g>
    <rect x="37" y="-32" width="28" height="18" rx="5" fill="#E0F2FE"/>
    <circle cx="43" cy="-23" r="2" fill="#0EA5E9"/>
    <circle cx="51" cy="-23" r="2" fill="#0EA5E9"/>
    <circle cx="59" cy="-23" r="2" fill="#0EA5E9"/>
    <polygon points="41,-14 37,-8 45,-14" fill="#E0F2FE"/>
  </>
);

// ─── New theme figures ────────────────────────────────────────────────────────

/** Chatbot: AI robot with conversation bubbles */
export const ChatbotFigure = (
  <>
    {/* Robot head */}
    <rect x="-10" y="-44" width="20" height="16" rx="4" fill="#4F46E5"/>
    <circle cx="-4" cy="-36" r="2.5" fill="white" opacity=".9"/>
    <circle cx="4"  cy="-36" r="2.5" fill="white" opacity=".9"/>
    <line x1="0" y1="-44" x2="0" y2="-49" stroke="#4F46E5" strokeWidth="1.5"/>
    <circle cx="0" cy="-51" r="2.5" fill="#818CF8"/>
    {/* Robot body */}
    <rect x="-12" y="-28" width="24" height="18" rx="3" fill="#6366F1"/>
    <rect x="-7"  y="-24" width="6"  height="4"  rx="1" fill="white" opacity=".5"/>
    <rect x="1"   y="-24" width="6"  height="4"  rx="1" fill="white" opacity=".5"/>
    {/* Chat bubble — right */}
    <rect x="18" y="-38" width="28" height="14" rx="5" fill="#E0E7FF"/>
    <circle cx="25" cy="-31" r="2" fill="#4F46E5"/>
    <circle cx="32" cy="-31" r="2" fill="#4F46E5"/>
    <circle cx="39" cy="-31" r="2" fill="#4F46E5"/>
    <polygon points="18,-26 14,-21 22,-26" fill="#E0E7FF"/>
    {/* Response bubble — left */}
    <rect x="-46" y="-28" width="28" height="14" rx="4" fill="#C7D2FE"/>
    <text x="-32" y="-18" textAnchor="middle" fontFamily="system-ui" fontSize="8" fill="#3730A3" fontWeight="700">OK ✓</text>
  </>
);

/** WhatsApp Business: phone with clay chat interface */
export const WhatsAppFigure = (
  <>
    {/* Phone body */}
    <rect x="-14" y="-48" width="28" height="48" rx="5" fill="#3A231B"/>
    <rect x="-11" y="-43" width="22" height="36" rx="2" fill="white" opacity=".96"/>
    {/* Clay header bar */}
    <rect x="-11" y="-43" width="22" height="8" rx="2" fill="#D97757"/>
    {/* Chat messages */}
    <rect x="-9"  y="-32" width="16" height="6" rx="2" fill="#FBE2D8"/>
    <rect x="-9"  y="-24" width="12" height="6" rx="2" fill="#ECECEC"/>
    <rect x="-9"  y="-16" width="17" height="6" rx="2" fill="#FBE2D8"/>
    {/* Home button */}
    <circle cx="0" cy="-2" r="3" fill="#D97757" opacity=".7"/>
    {/* Send-arrow indicators */}
    <line x1="18" y1="-32" x2="30" y2="-37" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round"/>
    <polygon points="28,-38 33,-35 29,-31" fill="#D97757"/>
    <line x1="18" y1="-21" x2="32" y2="-21" stroke="#D97757" strokeWidth="2.5" strokeLinecap="round"/>
    <polygon points="30,-24 35,-21 30,-18" fill="#D97757"/>
  </>
);

/** Training / Formation: graduation cap, open book, laptop */
export const TrainingFigure = (
  <>
    {/* Graduation cap */}
    <polygon points="0,-50 -22,-42 0,-34 22,-42" fill="#4F46E5"/>
    <rect x="-3" y="-34" width="6" height="8" rx="1" fill="#4F46E5"/>
    <line x1="22" y1="-42" x2="22" y2="-30" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="22" cy="-28" r="3" fill="#6366F1"/>
    {/* Open book */}
    <rect x="-32" y="-28" width="17" height="20" rx="2" fill="#818CF8"/>
    <rect x="-30" y="-26" width="13" height="16" rx="1" fill="white" opacity=".9"/>
    <rect x="-28" y="-23" width="9"  height="2"  rx="1" fill="#4F46E5" opacity=".5"/>
    <rect x="-28" y="-19" width="7"  height="2"  rx="1" fill="#4F46E5" opacity=".4"/>
    <rect x="-28" y="-15" width="9"  height="2"  rx="1" fill="#4F46E5" opacity=".4"/>
    {/* Laptop */}
    <rect x="12" y="-26" width="28" height="18" rx="2" fill="#E0E7FF"/>
    <rect x="14" y="-24" width="24" height="14" rx="1" fill="#4F46E5" opacity=".8"/>
    <polyline points="18,-18 22,-14 26,-17 30,-12 34,-15"
      fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
    <rect x="10" y="-8"  width="32" height="4"  rx="1" fill="#C7D2FE"/>
  </>
);

/** Workflow / n8n: flow-chart nodes connected by arrows */
export const WorkflowFigure = (
  <>
    {/* Node A */}
    <rect x="-52" y="-38" width="22" height="14" rx="3" fill="#4F46E5"/>
    <rect x="-50" y="-35" width="8"  height="2"  rx="1" fill="white" opacity=".7"/>
    <rect x="-50" y="-31" width="13" height="2"  rx="1" fill="white" opacity=".5"/>
    {/* Arrow A → B */}
    <line x1="-30" y1="-31" x2="-18" y2="-31" stroke="#818CF8" strokeWidth="2" strokeLinecap="round"/>
    <polygon points="-18,-34 -12,-31 -18,-28" fill="#818CF8"/>
    {/* Node B (hub) */}
    <rect x="-12" y="-38" width="24" height="14" rx="3" fill="#6366F1"/>
    <circle cx="0" cy="-31" r="4.5" fill="white" opacity=".85"/>
    <text x="0" y="-28" textAnchor="middle" fontFamily="system-ui" fontSize="7" fill="#4F46E5" fontWeight="800">AI</text>
    {/* Arrow B → C */}
    <line x1="12" y1="-31" x2="24" y2="-31" stroke="#818CF8" strokeWidth="2" strokeLinecap="round"/>
    <polygon points="24,-34 30,-31 24,-28" fill="#818CF8"/>
    {/* Node C */}
    <rect x="30" y="-38" width="22" height="14" rx="3" fill="#4338CA"/>
    <rect x="32" y="-35" width="8"  height="2"  rx="1" fill="white" opacity=".7"/>
    <rect x="32" y="-31" width="13" height="2"  rx="1" fill="white" opacity=".5"/>
    {/* Arrow B ↓ → Done */}
    <line x1="0" y1="-24" x2="0" y2="-16" stroke="#818CF8" strokeWidth="2" strokeLinecap="round"/>
    <polygon points="-3,-16 0,-10 3,-16" fill="#818CF8"/>
    {/* Done node */}
    <rect x="-16" y="-10" width="32" height="12" rx="3" fill="#10B981"/>
    <text x="0" y="-1" textAnchor="middle" fontFamily="system-ui" fontSize="8" fill="white" fontWeight="700">✓ Done</text>
  </>
);

// ─── Registry ─────────────────────────────────────────────────────────────────

export const HUB_FIGURES = {
  "sales-crm":  SalesCrmFigure,
  "cloud-data": CloudDataFigure,
  "finance":    FinanceFigure,
  "teams-ops":  TeamsOpsFigure,
  "chatbot":    ChatbotFigure,
  "whatsapp":   WhatsAppFigure,
  "training":   TrainingFigure,
  "workflow":   WorkflowFigure,
} as const;

export type HubFigureKey = keyof typeof HUB_FIGURES;

export type HubBgTheme = "indigo" | "green" | "cyan" | "purple";

export type PlatformPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
