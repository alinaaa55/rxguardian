text = """
{
  "user_id": "69e9edb32c722b786955904f",
  "start_date": "2026-04-22",
  "end_date": "2026-04-28",
  "daily_summaries": [
    {
      "date": "2026-04-22",
      "taken_count": 0,
      "total_slots": 3,
      "adherence_pct": 0
    },
    {
      "date": "2026-04-23",
      "taken_count": 0,
      "total_slots": 3,
      "adherence_pct": 0
    },
    {
      "date": "2026-04-24",
      "taken_count": 0,
      "total_slots": 3,
      "adherence_pct": 0
    },
    {
      "date": "2026-04-25",
      "taken_count": 0,
      "total_slots": 3,
      "adherence_pct": 0
    },
    {
      "date": "2026-04-26",
      "taken_count": 0,
      "total_slots": 3,
      "adherence_pct": 0
    },
    {
      "date": "2026-04-27",
      "taken_count": 0,
      "total_slots": 3,
      "adherence_pct": 0
    },
    {
      "date": "2026-04-28",
      "taken_count": 2,
      "total_slots": 3,
      "adherence_pct": 66.7
    }
  ],
  "grid": [
    {
      "morning": "missed",
      "afternoon": "none",
      "evening": "missed"
    },
    {
      "morning": "missed",
      "afternoon": "none",
      "evening": "missed"
    },
    {
      "morning": "missed",
      "afternoon": "none",
      "evening": "missed"
    },
    {
      "morning": "missed",
      "afternoon": "none",
      "evening": "missed"
    },
    {
      "morning": "missed",
      "afternoon": "none",
      "evening": "missed"
    },
    {
      "morning": "missed",
      "afternoon": "none",
      "evening": "missed"
    },
    {
      "morning": "missed",
      "afternoon": "none",
      "evening": "taken"
    }
  ],
  "overall_adherence_pct": 9.5
}
"""

# Remove newline characters
clean_text = text.replace("\n", " ")

print(clean_text)