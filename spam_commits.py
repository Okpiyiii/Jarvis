import os
import subprocess
import time

# How many commits you want?
total_files = 50 

print(f"🚀 Starting automation for {total_files} commits...")

for i in range(1, total_files + 1):
    filename = f"auto_file_{i}.txt"
    
    # 1. Create a dummy file
    with open(filename, "w") as f:
        f.write(f"This is an automated file number {i}\n")
    
    # 2. Git Add
    subprocess.run(["git", "add", filename], shell=True)
    
    # 3. Git Commit
    commit_message = f"Auto commit {i}: Adding {filename} 🤖"
    subprocess.run(["git", "commit", "-m", commit_message], shell=True)
    
    print(f"✅ Committed: {filename}")
    # Optional: chotto delay to keep timestamps distinct
    time.sleep(0.1) 

print("\n🎉 All commits ready locally!")
print("Now pushing to remote... hold tight!")

# 4. Git Push
subprocess.run(["git", "push"], shell=True)

print("🔥 Mission Accomplished! Check your GitHub profile.")