import os

def find_file(filename, search_paths):
    found = []
    for path in search_paths:
        if not os.path.exists(path):
            continue
        print(f"Searching in: {path} for {filename}")
        for root, dirs, files in os.walk(path):
            # Avoid traversing huge directories like node_modules or system32 unnecessarily
            if "node_modules" in dirs:
                dirs.remove("node_modules")
            if "Windows" in root or "System32" in root or "WinSxS" in root:
                continue
            if filename in files:
                full_path = os.path.join(root, filename)
                print(f"FOUND: {full_path}")
                found.append(full_path)
    return found

search_paths = [
    r"C:\Program Files\nodejs",
    os.path.expandvars(r"%APPDATA%\nvm"),
    os.path.expandvars(r"%APPDATA%\npm"),
    os.path.expandvars(r"%USERPROFILE%\.bun"),
    os.path.expandvars(r"%USERPROFILE%\AppData\Local\Programs"),
    os.path.expandvars(r"%USERPROFILE%\AppData\Local\nvm"),
    r"D:\kuiv1"
]

print("Looking for node.exe...")
find_file("node.exe", search_paths)

print("\nLooking for bun.exe...")
find_file("bun.exe", search_paths)

print("\nLooking for pnpm.cmd...")
find_file("pnpm.cmd", search_paths)

print("\nLooking for yarn.cmd...")
find_file("yarn.cmd", search_paths)

print("\nEnvironment PATH:")
for p in os.environ.get("PATH", "").split(os.pathsep):
    print(f"  {p}")
