import calendar
from datetime import date, timedelta

STEP_DAYS = {"weekly": 7, "biweekly": 14}


def _add_months(d: date, months: int) -> date:
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    day = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def _next_occurrence(d: date, frequency: str) -> date:
    if frequency in STEP_DAYS:
        return d + timedelta(days=STEP_DAYS[frequency])
    if frequency == "yearly":
        return _add_months(d, 12)
    return _add_months(d, 1)  # monthly, and fallback


def build_forecast(
    starting_balance: float,
    recurring_items: list[dict],
    debts: list[dict],
    today: date,
    days: int,
) -> dict:
    """
    recurring_items: [{id, name, kind ("income"|"expense"), amount, frequency, next_due_date}]
    debts: [{id, name, minimum_payment, due_day}]
    """
    window_end = today + timedelta(days=days - 1)
    events_by_date: dict[date, list[dict]] = {}

    def add_event(d: date, name: str, kind: str, amount: float, category: str):
        events_by_date.setdefault(d, []).append(
            {"name": name, "kind": kind, "amount": round(amount, 2), "category": category}
        )

    for item in recurring_items:
        occurrence = item.get("next_due_date")
        if occurrence is None:
            continue
        # walk forward until we're inside the window (handles overdue next_due_date)
        guard = 0
        while occurrence < today and guard < 1000:
            occurrence = _next_occurrence(occurrence, item["frequency"])
            guard += 1
        while occurrence <= window_end:
            add_event(occurrence, item["name"], item["kind"], item["amount"], "recurring")
            occurrence = _next_occurrence(occurrence, item["frequency"])

    for debt in debts:
        if debt["minimum_payment"] <= 0:
            continue
        due_day = max(1, min(debt.get("due_day") or 1, 28))
        month_cursor = date(today.year, today.month, 1)
        guard = 0
        while month_cursor <= window_end and guard < 240:
            last_day = calendar.monthrange(month_cursor.year, month_cursor.month)[1]
            due_date = date(month_cursor.year, month_cursor.month, min(due_day, last_day))
            if today <= due_date <= window_end:
                add_event(due_date, f"{debt['name']} minimum payment", "expense", debt["minimum_payment"], "debt")
            month_cursor = _add_months(month_cursor, 1)
            guard += 1

    balance = starting_balance
    daily = []
    for i in range(days):
        d = today + timedelta(days=i)
        day_events = events_by_date.get(d, [])
        for e in day_events:
            balance += e["amount"] if e["kind"] == "income" else -e["amount"]
        daily.append({"date": d.isoformat(), "balance": round(balance, 2), "events": day_events})

    lowest = min(daily, key=lambda x: x["balance"])
    first_negative = next((d for d in daily if d["balance"] < 0), None)

    return {
        "starting_balance": round(starting_balance, 2),
        "ending_balance": daily[-1]["balance"] if daily else round(starting_balance, 2),
        "lowest_point": lowest,
        "first_negative_date": first_negative["date"] if first_negative else None,
        "days": daily,
    }
