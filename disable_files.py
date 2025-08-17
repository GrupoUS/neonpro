import os
from pathlib import Path

def disable_problematic_files():
    """Disable problematic files by renaming them"""
    
    domain_src = Path("E:/neonpro/packages/domain/src")
    
    # Folders to disable temporarily
    disable_folders = [
        "hooks/analytics",
        "hooks/appointments-legacy", 
        "hooks/auth-legacy",
        "hooks/compliance-legacy",
        "hooks/inventory",
        "hooks/legacy",
        "hooks/patient-legacy",
        "api"
    ]
    
    for folder in disable_folders:
        folder_path = domain_src / folder
        if folder_path.exists():
            for file in folder_path.glob("*.ts"):
                if not file.name.endswith('.disabled'):
                    new_name = file.with_suffix('.ts.disabled')
                    file.rename(new_name)
                    print(f"Disabled: {file}")

if __name__ == "__main__":
    disable_problematic_files()