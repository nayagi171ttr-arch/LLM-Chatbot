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