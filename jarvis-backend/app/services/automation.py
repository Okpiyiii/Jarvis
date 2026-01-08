import os
import subprocess
import psutil
import platform
import pyautogui
import requests  # <--- NEW IMPORT

class AutomationService:
    def get_system_stats(self):
        """Returns CPU, RAM, and Battery stats"""
        cpu = psutil.cpu_percent(interval=None)
        ram = psutil.virtual_memory().percent
        try:
            battery = psutil.sensors_battery()
            battery_percent = battery.percent if battery else 100
        except:
            battery_percent = 100
        
        return {
            "type": "system_stats",
            "cpu": f"{cpu}%",
            "ram": f"{ram}%",
            "battery": f"{battery_percent}%"
        }

    def open_app(self, app_name: str):
        """Opens apps (Windows Only)"""
        if platform.system() != "Windows":
            return f"I cannot open {app_name} because I am running on a Cloud Server."

        app_name = app_name.lower()
        try:
            if "chrome" in app_name:
                subprocess.Popen("start chrome", shell=True) 
                return "Opening Chrome."
            elif "notepad" in app_name:
                subprocess.Popen("notepad")
                return "Opening Notepad."
            elif "youtube" in app_name:
                subprocess.Popen("start chrome https://www.youtube.com", shell=True)
                return "Opening YouTube."
            else:
                return f"I don't know the path for {app_name} yet."
        except Exception as e:
            return f"Failed to open app: {e}"

    def media_control(self, command: str):
        """Controls Volume/Media (Windows Only)"""
        if platform.system() != "Windows":
            return "Media controls are disabled on Cloud."

        try:
            if "play" in command or "pause" in command:
                pyautogui.press("playpause")
            elif "volume_up" in command:
                pyautogui.press("volumeup")
            elif "volume_down" in command:
                pyautogui.press("volumedown")
            elif "mute" in command:
                pyautogui.press("volumemute")
            return "Media command executed."
        except Exception as e:
            return f"Media error: {e}"

    # --- NEW WEATHER FUNCTION ---
    def get_weather(self, city: str):
        """Fetches live weather from wttr.in"""
        try:
            if not city or city == "null": 
                city = "Kolkata" # Default city if none mentioned
            
            # Requesting simplified format: Condition + Temperature
            url = f"https://wttr.in/{city}?format=%C+%t"
            response = requests.get(url)
            
            if response.status_code == 200:
                weather_data = response.text.strip()
                return f"The current weather in {city} is {weather_data}."
            else:
                return "I couldn't get the weather data right now."
        except Exception as e:
            return "I am unable to connect to the weather satellite, sir."

automation = AutomationService()