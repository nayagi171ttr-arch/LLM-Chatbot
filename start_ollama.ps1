$env:OLLAMA_MODELS = "F:\OllamaModels"

Write-Host "Starting Ollama..."
Write-Host "Model location: F:\OllamaModels"
Write-Host ""

ollama serve

#######  How to run this script #######
### in powershell type this .\start_ollama.ps1     
### you will see something like this:
### Starting Ollama...
### Model location: F:\OllamaModels

### leave that terminal as it is and open anotherr terminal and activate the env    
###   .\venv\Scripts\Activate.ps1

###  then run     python test_chatbot.py
# Close the Ollama desktop app completely first.

# Then in PowerShell run:

# $env:OLLAMA_MODELS="F:\OllamaModels"
# ollama serve

# Keep this PowerShell window open.

# Then open a second PowerShell window and run:

# ollama list







# After restarting your PC
# Step 1 — Start Ollama
# 1. Start your PC.
# 2. Open PowerShell or VS Code terminal.
# 3. Check whether Ollama is running:
# ollama list


# You should see your installed models, including qwen3:1.7b.

# If the command works and the model appears, continue to Step 2. If Ollama is not running, start the Ollama application from the Windows Start menu.
# Step 2 — Run your local chatbot
# Open VS Code and open your project folder:
# F:\AI Chatbot using LLM\LLM chatbot


# Open a terminal in that folder and run:
# .\venv\Scripts\Activate.ps1
# python manage.py runserver


# Open this URL in your browser:

# http://127.0.0.1:8000/

# Your local chatbot should work directly with Ollama. You do not need to configure the proxy or Cloudflare Tunnel just to run locally.
# 2. Start your live chatbot website
# Your public website is:
# Open your live LLM chatbotTo make the live website generate AI responses, keep three things running on your PC.

# Step 1 — Ollama

# Start the Ollama application and confirm your model is available with ollama list.




# Step 2 — Start the protected proxy

# Open a second VS Code terminal in your project folder and run:
#####   python ollama_proxy.py


# Keep this terminal open. If it says OLLAMA_PROXY_TOKEN environment variable is required, configure that variable with your existing secret before starting the proxy.
#######   $env:OLLAMA_PROXY_TOKEN = Read-Host "Enter your proxy token"



# Step 3 — Start Cloudflare Tunnel

# Open a third terminal and run:
####### & "F:\cloudflared\cloudflared-windows-amd64.exe" tunnel --url http://127.0.0.1:8765


# Keep this terminal open too.



# Step 4 — Check the Cloudflare URL
# After starting the tunnel, look for a URL ending in trycloudflare.com.

# Your previously reported URL was:

# https://request-grade-puerto-send.trycloudflare.com

# The URL may change whenever you restart the tunnel.
# - If it is unchanged, no URL update is needed.
# - If it changes, open your Render dashboard, select your chatbot web service, go to Environment, and update OLLAMA_PROXY_URL to the new URL.
# - Save the change and wait for Render to finish any required redeployment.
# Keep OLLAMA_PROXY_TOKEN configured in Render with the same secret used by your local proxy. Never share that secret publicly.
# Step 5 — Test your live website
# Open your live chatbot and send a test message.

# Remember: the live site depends on your PC, Ollama, proxy, and tunnel being available. If your PC shuts down or sleeps, live AI responses may stop until you restart the required services.