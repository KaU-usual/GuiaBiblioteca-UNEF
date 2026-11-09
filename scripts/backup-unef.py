from pathlib import Path
from datetime import datetime
import shutil
import sys

if len(sys.argv) < 3 or sys.argv[1] not in ("index", "planta"):
    print("Uso: python3 scripts/backup-unef.py index|planta arquivo")
    raise SystemExit(1)

origem = Path(sys.argv[2])
if not origem.is_file():
    print(f"Arquivo não encontrado: {origem}")
    raise SystemExit(1)

pasta = Path("backups") / sys.argv[1]
pasta.mkdir(parents=True, exist_ok=True)

nome = f"{origem.name}.{datetime.now().strftime('%Y%m%d-%H%M%S')}.bak"
destino = pasta / nome
shutil.copy2(origem, destino)
print(f"Backup criado: {destino}")
