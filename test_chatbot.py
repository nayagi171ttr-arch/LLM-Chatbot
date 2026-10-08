from ollama import chat

messages = [
    {
        "role": "system",
        "content": (
            "You are a helpful, friendly AI chatbot. "
            "Answer the user's latest question clearly and directly. "
            "Use previous conversation only when it is relevant."
        )
    }
]

while True:
    user_message = input("You: ")

    if user_message.lower() == "exit":
        print("\nBot: Goodbye! 👋")
        break

    messages.append({
        "role": "user",
        "content": user_message
    })

    # Show Thinking on the same line
    print("Bot: Thinking...", end="", flush=True)

    response = chat(
        model="qwen3:1.7b",
        messages=messages
    )

    bot_message = response.message.content

    messages.append({
        "role": "assistant",
        "content": bot_message
    })

    # Remove Thinking...
    print("\r" + " " * 50 + "\r", end="")

    # Show actual answer
    print("Bot:", bot_message)