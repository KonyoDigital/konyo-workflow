# Install Konyo Workflow for Grok Build (optional)

**You do not need this for the Konyo Workflow method.**  
Claude-only users: install **`SKILL.md`** from the root README (one curl line). No Grok account required.

This folder is only if you use **Grok Build** and want the automated gate runner.  
Pingpong still means **host-LLM third-eye agents** (Grok agents reviewing Grok work) — not a second brand.

## If you use Grok Build

### 1) Download
- https://github.com/KonyoDigital/konyo-workflow → **Code** → **Download ZIP** → unzip  

### 2) Copy workflows (Mac)

```bash
mkdir -p ~/.grok/workflows
cp ~/Desktop/konyo-workflow-main/grok/.grok/workflows/*.rhai ~/.grok/workflows/
ls ~/.grok/workflows/
```

### Windows PowerShell

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.grok\workflows"
Copy-Item "$env:USERPROFILE\Desktop\konyo-workflow-main\grok\.grok\workflows\*.rhai" "$env:USERPROFILE\.grok\workflows\"
```

### 3) Run

```text
/workflow konyo-workflow {"objective":"My first ship check","target":"HEAD"}
```

Progress: `/workflows`

---

## One-liner from GitHub (Mac/Linux, no ZIP)

```bash
mkdir -p ~/.grok/workflows
curl -fsSL https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main/grok/.grok/workflows/konyo-workflow.rhai \
  -o ~/.grok/workflows/konyo-workflow.rhai
echo "✅ konyo-workflow.rhai installed"
```

Optional extras:

```bash
for f in review-changes security-pass ship-ready find-flaky-tests; do
  curl -fsSL "https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main/grok/.grok/workflows/${f}.rhai" \
    -o "$HOME/.grok/workflows/${f}.rhai"
done
```

---

## Install into one project (share on that repo)

```bash
cd /path/to/your-project
mkdir -p .grok/workflows
curl -fsSL https://raw.githubusercontent.com/KonyoDigital/konyo-workflow/main/grok/.grok/workflows/konyo-workflow.rhai \
  -o .grok/workflows/konyo-workflow.rhai
git add .grok/workflows/konyo-workflow.rhai && git commit -m "Add Konyo Workflow shipper"
```

---

## Verify

```bash
ls ~/.grok/workflows/konyo-workflow.rhai
```

You need **Grok Build** or Grok CLI with workflows enabled.
