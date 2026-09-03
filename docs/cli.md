# CLI (`__ctrl__`)

`__ctrl__/` is the **control layer** for fast-next — the official interface for dev, test, deploy, and SSH ops. Prefer these commands over ad-hoc `docker compose` or manual process management.

Entry points:

```bat
__ctrl__\fast-next-ctrl.bat <command>
```

```bash
__ctrl__/fast-next-ctrl.sh <command>
```

Full reference: [`__ctrl__/README.md`](../__ctrl__/README.md)

## Local setup

```bat
fast-next-ctrl.bat setup-local
fast-next-ctrl.bat setup-local --force   # recreate .venv
```

Creates project `.venv`, installs `requirements.txt`, and runs `npm install` for the workspace.

## Development

```bat
fast-next-ctrl.bat dev run all
fast-next-ctrl.bat dev run all --slim
fast-next-ctrl.bat dev stop all
fast-next-ctrl.bat dev down all
fast-next-ctrl.bat dev purge infra
fast-next-ctrl.bat dev reset all
```

| Target | Meaning |
|--------|---------|
| `infra` | Docker: db, redis (full), proxy, adminer + migrations |
| `apps` | Host: uvicorn :8000, ARQ worker (full), Vite :5173 |
| `all` | Both (run order: infra → apps; stop: apps → infra) |

See [runtime-profiles.md](runtime-profiles.md) for `--slim`.

## Module scaffold

```bat
fast-next-ctrl.bat app create myfeature
```

## Tests

```bat
fast-next-ctrl.bat test all
fast-next-ctrl.bat test backend
fast-next-ctrl.bat test frontend
```

## Production (SSH from laptop)

```bat
fast-next-ctrl.bat setup
fast-next-ctrl.bat pubkey
fast-next-ctrl.bat clone
fast-next-ctrl.bat env
fast-next-ctrl.bat start
fast-next-ctrl.bat stop
fast-next-ctrl.bat update
fast-next-ctrl.bat status
fast-next-ctrl.bat connect
```

## Local prod smoke (Docker Desktop)

```bat
fast-next-ctrl.bat prod start
fast-next-ctrl.bat prod stop
fast-next-ctrl.bat prod reset
```

On-VM scripts: `__ctrl__/remote/` (invoked by SSH commands above).
