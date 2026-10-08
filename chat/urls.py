from django.urls import path
from . import views

urlpatterns = [
    path("", views.chat_page, name="chat_page"),
    path("send-message/", views.send_message, name="send_message"),
    path("chats/", views.get_chats, name="get_chats"),
    path("new-chat/", views.new_chat, name="new_chat"),
    path("chats/<int:chat_id>/", views.load_chat, name="load_chat"),
    path("chats/<int:chat_id>/rename/", views.rename_chat, name="rename_chat"),
    path("chats/<int:chat_id>/delete/", views.delete_chat, name="delete_chat"),


]