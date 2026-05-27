import os
import shutil

src = r"C:\Program Files\nodejs"
dst = r"d:\kuiv1\design-build-studio\node_bin"

print(f"Copying from {src} to {dst}...")

try:
    if os.path.exists(dst):
        print(f"Removing existing {dst}...")
        shutil.rmtree(dst)
    
    # We want to copy everything except node_modules to keep it small, or copy it all.
    # Actually, npm is in node_modules/npm, so we need node_modules.
    shutil.copytree(src, dst)
    print("Copy completed successfully!")
except Exception as e:
    print(f"Error copying files: {e}")
