# 🎥 AetherOS Hackathon Video Submission Script

This document contains a structured **3 to 4-minute video submission script** designed to present **AetherOS** to the Pharos Hackathon judging panel. Use this as a guide for your voiceover narration and screen capture cues.

* **Target Length:** ~3:30 - 4:00 minutes
* **Tone:** Energetic, technical, and forward-looking

---

## 🎬 Act I: The Hook & Core Vision (0:00 - 0:45)

| Time | Visual | Audio (Speaker Voiceover) |
| :--- | :--- | :--- |
| **0:00 - 0:15** | Screen shows the **AetherOS Next.js Dashboard** in dark mode, showing the real-time wavy price charts and active agent widgets. | "Hi everyone! Welcome to AetherOS—a complete, local-first decentralized AI Agent ecosystem custom-built for the Pharos Skill-to-Agent Dual Cascade Hackathon." |
| **0:15 - 0:30** | Show the **Mermaid Architecture Diagram** (either on the screen, in the README, or in slides). | "Today, on-chain AI is often built as monolithic, single-purpose bots. AetherOS breaks this mold by separating modular capability—which we call **Skills**—from execution logic—which we call **Agents**." |
| **0:30 - 0:45** | Zoom into the **Dashboard Agent Overview**, showing the four active roles (Trader, Social, Gov, Allocator). | "This results in a self-sustaining, circular machine-to-machine economy where autonomous agents transact, govern, and tip each other on-chain using native Pharos tokens." |

---

## 🛠️ Act II: Phase 1 — Composable Skills (0:45 - 1:30)

| Time | Visual | Audio (Speaker Voiceover) |
| :--- | :--- | :--- |
| **0:45 - 1:05** | Screen shares your IDE showing the [skills/](file:///Users/akashsunilsomsetwar/Desktop/AetherOS-main/skills) directory. Open one of the `skill.json` manifests (e.g., `skills/price-oracle/skill.json` or `skills/risk-scorer/skill.json`). | "Let's dive into **Phase 1: Composable Skills**. Under the hood, we developed 8 independent capability packages under the `@aetheros/*` workspace. Each skill ships with a standard `skill.json` manifest specifying its inputs, outputs, and dependencies." |
| **1:05 - 1:30** | Quickly cycle through the skill folders: `price-oracle`, `sentiment` (NLP/FinBERT), `risk-scorer`, `wallet` (HD keys), `social`, `governance`, `reputation`, and `llm-reasoning`. | "This means any developer can plug-and-play our price oracle, FinBERT sentiment score, or reputation NFT gate into a new project in seconds, realizing true code composability on the Pharos network." |

---

## 🤖 Act III: Phase 2 — Autonomous Agents & ML Models (1:30 - 2:30)

| Time | Visual | Audio (Speaker Voiceover) |
| :--- | :--- | :--- |
| **1:30 - 1:55** | Show the code of the **Trading Agent** ([agents/trading-agent/index.ts](file:///Users/akashsunilsomsetwar/Desktop/AetherOS-main/agents/trading-agent/index.ts)). Transition to show the dashboard line charts fluctuating. | "For **Phase 2**, we composed these skills into 4 active on-chain agents. Our **Trading Agent** runs on a 5-minute loop. It aggregates market feeds, Prophet forecasts, and FinBERT sentiment, feed-forwarding them into a custom Python-trained PPO Reinforcement Learning policy to execute BUY, SELL, or HOLD decisions." |
| **1:55 - 2:15** | Show the **Social Agent** and **Governance Agent** widgets on the dashboard. | "Simultaneously, our **Social Agent** drives market sentiment by posting trends and tipping high-reputation peers, while the **Governance Agent** automatically proposes and votes on system parameters on-chain." |
| **2:15 - 2:30** | Show the **Budget Allocator** code or visual panel. | "Finally, the **Budget Allocator** runs a daily cycle, querying the on-chain registry to fund active agents proportionally based on their reputation score." |

---

## 🛡️ Act IV: The Attacker & Security Gates (2:30 - 3:15)

| Time | Visual | Audio (Speaker Voiceover) |
| :--- | :--- | :--- |
| **2:30 - 2:55** | Show the dashboard's manual override panel and toggle the **Attacker Agent** on, or show the terminal running `npm run test:adversarial`. | "To prove the system's economic resilience, we implemented a red-team **Attacker Agent**. The attacker attempts to manipulate the market by injecting heavily biased, positive sentiment data into the database to trick the Trading Agent into a bad trade." |
| **2:55 - 3:15** | Show the console output or logs where the `risk-scorer` interceptor logs a blocked transaction due to high risk/anomalous sentiment. | "However, because our Trading Agent checks both the `risk-scorer` and `reputation` skills before signing any transaction, it dynamically detects the anomaly and blocks the trade. This proves that modular skills can safeguard autonomous on-chain assets." |

---

## ⛓️ Act V: On-Chain Integration & Dashboard Demo (3:15 - 3:45)

| Time | Visual | Audio (Speaker Voiceover) |
| :--- | :--- | :--- |
| **3:15 - 3:30** | Show your **Solidity Smart Contracts** ([AgentRegistry.sol](file:///Users/akashsunilsomsetwar/Desktop/AetherOS-main/contracts/src/AgentRegistry.sol), [ReputationNFT.sol](file:///Users/akashsunilsomsetwar/Desktop/AetherOS-main/contracts/src/ReputationNFT.sol)) or the Hardhat local node terminal logs showing transactions. | "All agent identities are registered on-chain via our Solidity contracts, and their performance is tracked by a Soulbound Reputation NFT contract deployed on the Pharos Atlantic Testnet." |
| **3:30 - 3:45** | Click around the Next.js UI, hover over the stock charts, scroll through the live WebSocket transaction event logs. | "And as you can see on our Next.js dashboard, all process feeds, agent logs, and market transactions are streamed live to the user interface via WebSockets for a seamless user experience." |

---

## 🏁 Act VI: Conclusion & Outro (3:45 - 4:00)

| Time | Visual | Audio (Speaker Voiceover) |
| :--- | :--- | :--- |
| **3:45 - 4:00** | Return to the main view of the dashboard, showing all agents online and the overall system reputation score. | "AetherOS demonstrates the full capability of the Pharos on-chain economy: modular, composable, and secure. Thanks for watching, and we look forward to building the future of the agent economy on Pharos!" |

---

### 🎥 Tips for Recording your Video:
1. **Ensure high audio quality:** Use a decent external microphone in a quiet room.
2. **Keep the pace lively:** Avoid long pauses; use visual transitions when switching between code, terminal, and dashboard.
3. **Highlight actual outputs:** Zoom into the terminal logs of a trade execution or the WebSocket charts updating in real-time.
