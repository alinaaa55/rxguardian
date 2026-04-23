text = """
GET
/api/v1/chat/history
Get chat history for the current user
input == async def get_history(
    limit: int = Query(default=50, ge=1, le=200, description="Max messages to return"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
)

response == [
  {
    "id": 0,
    "user_id": "string",
    "message": "string",
    "sender": "user",
    "timestamp": "2026-04-23T10:39:08.663Z"
  }
]
"""

# Remove newline characters
clean_text = text.replace("\n", " ")

print(clean_text)