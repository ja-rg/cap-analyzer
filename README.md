# cap-analyzer

**cap-analyzer** is a lightweight packet-capture analysis tool that lets you upload a PCAP, parse it server-side, and visualize key insights like **protocol hierarchy**, **devices (MAC/IP)**, **TCP/UDP flows**, and **Suricata IDS findings** — all in one clean dashboard.

> Built to be fast, auditable, and easy to run locally for study, demos, or blue-team workflows.

<div align="center">
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/2d40011b-2ac2-40c1-a99a-b145bf2e10df" />
</div>

---

## ✨ Features

- **PCAP Upload & Parse**
  - Local processing (no third‑party uploads) and clear capture metadata (start, end, duration, packets).  
- **Protocol Hierarchy**
  - Tree view by layers (eth → llc/cdp/ip/eigrp/udp/tcp/telnet/loop/MPLS/RSVP…) with frames/bytes breakdown.
- **Assets & Addressing**
  - MAC vendors, private/public IP detection, quick device cards, and host tally.
- **Flows**
  - TCP/UDP session overview, syn/ack counts, and flow state snapshots (init/new/established/closed).
- **Suricata Integration**
  - Run **Suricata 7.x** inline on the capture and surface logs (`fast.log`, `eve.json`, stats).  
  - Key metrics: decoder stats, memuse, reassembly counters, signatures loaded, alerts (if any).
- **Modern UI**
  - Minimal, keyboard-friendly interface designed for quick triage.

---

## 🧱 Architecture

- **Server:** [Bun](https://bun.sh/) + TypeScript
  - PCAP ingestion, parsing, and orchestration of Suricata as a child process.
- **Analysis:**
  - Custom parsers and summaries for **IPs, MACs, protocols**, and **flows**.
  - Suricata output normalization from `eve.json`/`fast.log`/`stats.log`.
- **Frontend:** TypeScript + lightweight components
  - Tree/summary widgets for protocol hierarchy, devices, and Suricata stats.

```
PCAP → Bun server → (parse + summarize) → Suricata run → collect logs → JSON API → UI
```

---

## 🚀 Quickstart

### Prerequisites
- **Bun** (latest)  
- **Suricata 7.0+** available in `$PATH`  
- A sample **.pcap**

On macOS:
```bash
brew install bun
brew install suricata
```

On Debian/Ubuntu:
```bash
curl -fsSL https://bun.sh/install | bash
sudo apt-get update && sudo apt-get install -y suricata
```

### Install & Run
```bash
bun install
bun dev
# open http://localhost:3000
```

> The app runs Suricata locally in “USF/PCAP” mode for one-off analysis. No external uploads.

---

## 🧪 Usage

1. **Upload a PCAP** from the dashboard (“Subir archivo PCAP”).  
2. Click **Analizar**. The server parses capture metadata and launches Suricata.  
3. Review:
   - **Información de captura**: start/end/duration/packets.
   - **Jerarquía de Protocolos**: frames/bytes per layer.
   - **Dispositivos**: MAC vendors + private/public IPs.
   - **Resultados de Suricata**: version, engine init, rules loaded, alerts, stats (decoder, tcp/udp, reassembly, memuse).

If you need to inspect raw Suricata outputs, check the working directory (fast/eve/stats).

---

## ⚙️ Configuration

Environment variables (optional):
```
# Port to run the web server
PORT=3000

# Where temporary PCAP/Suricata artifacts are stored
WORK_DIR=.cap-analyzer

# Suricata binary path (if not in PATH)
SURICATA_BIN=/usr/bin/suricata

# Max upload size (e.g. '100mb')
MAX_UPLOAD_SIZE=50mb
```

Suricata:
- Uses **pcap-file** run mode with ephemeral work dirs per analysis.
- Loads the default ruleset available to your Suricata installation.  
- To add custom rules, place them under `rules/` and point Suricata via a custom config or `--set` flag (see roadmap).

---

## 📡 API (local)

```
POST /api/pcap
  - form-data: file=<pcap>
  - returns: { capture, hierarchy, devices, flows, suricata: { version, logs, stats } }
```

> The UI consumes this JSON to render the dashboard.

---

## 🔒 Security Notes

- All processing is **local**; files are not sent to external services.
- Uploaded PCAPs and artifacts are cleaned after analysis (configurable retention).
- Avoid analyzing sensitive or proprietary captures on shared machines.

---

## 🗺️ Roadmap

- [ ] Stream live **pcap** from interface (not just file) for near‑real‑time triage.
- [ ] Add **rule-set selection** and **per-run custom rules**.
- [ ] EVE events visualization (tables + filters + severity chips).
- [ ] Flow graph and time-based packet charts.
- [ ] Export reports (PDF/JSON) and **threat advisory** summaries.
- [ ] Optional **Docker** image for one‑command deployment.

---

## 🤝 Contributing

PRs welcome! If you have captures or corner cases that break parsing, please open an issue with a redacted sample and steps to reproduce.

---

## 📄 License

MIT © 2025 J. Alejandro Rosales
