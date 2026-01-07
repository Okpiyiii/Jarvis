import os
import subprocess
import psutil
import platform

class AutomationService:
    def get_system_stats(self):
        """Returns CPU and RAM usage for the HUD"""
        cpu = psutil.cpu_percent(interval=None)
        ram = psutil.virtual_memory().percent
        battery = psutil.sensors_battery()
        
        battery_percent = battery.percent if battery else 100
        
        return {
            "type": "system_stats",
            "cpu": f"{cpu}%",
            "ram": f"{ram}%",
            "battery": f"{battery_percent}%"
        }

    def open_app(self, app_name: str):
        """Opens basic Windows apps"""
        app_name = app_name.lower()
        
        try:
            if "chrome" in app_name:
                # Windows specific command
                subprocess.Popen("start chrome", shell=True) 
                return "Opening Chrome, sir."
            
            elif "notepad" in app_name:
                subprocess.Popen("notepad")
                return "Opening Notepad."
            
            elif "calculator" in app_name:
                subprocess.Popen("calc")
                return "Opening Calculator."
                
            elif "youtube" in app_name:
                subprocess.Popen("start chrome https://www.youtube.com", shell=True)
                return "Opening YouTube."
            
            else:
                return f"I don't know how to open {app_name} yet, boss."
                
        except Exception as e:
            print(f"Error opening app: {e}")
            return "I tried to open it, but something went wrong."

# Create a singleton instance
automation = AutomationService()