from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from ollama import chat
from .models import Chat


def chat_page(request):

    # Get the currently selected chat
    chat_id = request.session.get("current_chat_id")

    # If there is no selected chat, create one
    if not chat_id:
        new_chat = Chat.objects.create(
            title="New conversation"
        )

        request.session["current_chat_id"] = new_chat.id

    return render(request, "chat/index.html")



@csrf_exempt
def send_message(request):

    if request.method != "POST":
        return JsonResponse({
            "error": "Only POST requests are allowed."
        }, status=405)

    user_message = request.POST.get("message", "").strip()

    if not user_message:
        return JsonResponse({
            "error": "Message cannot be empty."
        }, status=400)

    try:

        # Get the currently selected chat
        chat_id = request.session.get("current_chat_id")

        if not chat_id:
            return JsonResponse({
                "error": "No active chat found."
            }, status=400)

        current_chat = Chat.objects.get(id=chat_id)

        # Get messages from this chat
        messages = current_chat.messages

        # Add system prompt
        if not messages or messages[0].get("role") != "system":
            messages.insert(0, {
                "role": "system",
                "content": (
                    "You are a helpful, friendly AI chatbot. "
                    "Answer the user's latest question clearly and directly. "
                    "Use previous conversation only when it is relevant."
                )
            })

        # Add user's message
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Send conversation to Ollama
        response = chat(
            model="qwen3:1.7b",
            messages=messages
        )

        bot_message = response.message.content

        # Add AI response
        messages.append({
            "role": "assistant",
            "content": bot_message
        })

        # Save messages inside this chat
        current_chat.messages = messages

        # Give the chat a title using the first user message
        if current_chat.title == "New conversation":
            current_chat.title = user_message[:50]

        current_chat.save()

        return JsonResponse({
            "response": bot_message
        })

    except Chat.DoesNotExist:

        return JsonResponse({
            "error": "Chat not found."
        }, status=404)

    except Exception as e:

        return JsonResponse({
            "error": str(e)
        }, status=500)


def get_chats(request):

    chats = Chat.objects.order_by("-updated_at")

    chat_list = []

    for chat_item in chats:

        # Get only actual conversation messages
        real_messages = [
            message
            for message in chat_item.messages
            if message.get("role") in ["user", "assistant"]
        ]

        # Do not show empty conversations in Recent chats
        if not real_messages:
            continue

        chat_list.append({
            "id": chat_item.id,
            "title": chat_item.title
        })

    return JsonResponse({
        "chats": chat_list
    })


@csrf_exempt
def new_chat(request):

    # Check which chat is currently active
    current_chat_id = request.session.get("current_chat_id")

    if current_chat_id:

        try:
            current_chat = Chat.objects.get(id=current_chat_id)

            # If the current chat has no real user messages,
            # reuse it instead of creating another empty chat.
            real_messages = [
                message
                for message in current_chat.messages
                if message.get("role") in ["user", "assistant"]
            ]

            if not real_messages:

                return JsonResponse({
                    "success": True,
                    "chat_id": current_chat.id,
                    "title": current_chat.title
                })

        except Chat.DoesNotExist:
            pass

    # Current chat contains messages, so create a new conversation
    new_chat = Chat.objects.create(
        title="New conversation"
    )

    request.session["current_chat_id"] = new_chat.id
    request.session.modified = True

    return JsonResponse({
        "success": True,
        "chat_id": new_chat.id,
        "title": new_chat.title
    })



def load_chat(request, chat_id):

    try:
        selected_chat = Chat.objects.get(id=chat_id)

        # Make this the currently active chat
        request.session["current_chat_id"] = selected_chat.id
        request.session.modified = True

        return JsonResponse({
            "success": True,
            "chat": {
                "id": selected_chat.id,
                "title": selected_chat.title,
                "messages": selected_chat.messages
            }
        })

    except Chat.DoesNotExist:

        return JsonResponse({
            "error": "Chat not found."
        }, status=404)




@csrf_exempt
def rename_chat(request, chat_id):

    if request.method != "POST":
        return JsonResponse({
            "error": "Only POST requests are allowed."
        }, status=405)

    new_title = request.POST.get("title", "").strip()

    if not new_title:
        return JsonResponse({
            "error": "Chat name cannot be empty."
        }, status=400)

    try:

        selected_chat = Chat.objects.get(id=chat_id)

        selected_chat.title = new_title[:200]
        selected_chat.save()

        return JsonResponse({
            "success": True,
            "title": selected_chat.title
        })

    except Chat.DoesNotExist:

        return JsonResponse({
            "error": "Chat not found."
        }, status=404)


@csrf_exempt
def delete_chat(request, chat_id):

    if request.method != "POST":
        return JsonResponse({
            "error": "Only POST requests are allowed."
        }, status=405)

    try:

        selected_chat = Chat.objects.get(id=chat_id)

        # If this is the currently selected chat,
        # remove it from the session.
        if request.session.get("current_chat_id") == selected_chat.id:
            request.session.pop("current_chat_id", None)
            request.session.modified = True

        selected_chat.delete()

        return JsonResponse({
            "success": True
        })

    except Chat.DoesNotExist:

        return JsonResponse({
            "error": "Chat not found."
        }, status=404)
