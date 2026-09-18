MAX_MONTHS = 600  # 50 years — simulation safety cap


def simulate_payoff(debts: list[dict], strategy: str, extra_payment: float) -> dict:
    """
    debts: [{id, name, balance, interest_rate (APR %), minimum_payment}]
    strategy: "avalanche" (highest interest first) or "snowball" (lowest balance first)
    """
    if not debts:
        return {
            "strategy": strategy,
            "months_to_debt_free": 0,
            "total_interest_paid": 0.0,
            "total_paid": 0.0,
            "timeline": [],
            "payoff_order": [],
        }

    remaining = {d["id"]: d["balance"] for d in debts}
    monthly_rate = {d["id"]: (d["interest_rate"] / 100.0) / 12.0 for d in debts}
    min_payment = {d["id"]: d["minimum_payment"] for d in debts}
    name = {d["id"]: d["name"] for d in debts}

    if strategy == "snowball":
        order = sorted(debts, key=lambda d: d["balance"])
    else:
        strategy = "avalanche"
        order = sorted(debts, key=lambda d: -d["interest_rate"])

    total_interest = 0.0
    total_paid = 0.0
    timeline = []
    payoff_month: dict[int, int] = {}
    interest_paid_per_debt = {d["id"]: 0.0 for d in debts}

    month = 0
    while sum(remaining.values()) > 0.01 and month < MAX_MONTHS:
        month += 1

        for d in debts:
            did = d["id"]
            if remaining[did] <= 0:
                continue
            interest = remaining[did] * monthly_rate[did]
            remaining[did] += interest
            total_interest += interest
            interest_paid_per_debt[did] += interest

            pay = min(min_payment[did], remaining[did])
            remaining[did] -= pay
            total_paid += pay

        pool = extra_payment
        for d in order:
            if pool <= 0:
                break
            did = d["id"]
            if remaining[did] <= 0:
                continue
            pay = min(pool, remaining[did])
            remaining[did] -= pay
            total_paid += pay
            pool -= pay

        for d in debts:
            did = d["id"]
            if remaining[did] <= 0.01 and did not in payoff_month:
                payoff_month[did] = month

        timeline.append({"month": month, "total_balance": round(max(sum(remaining.values()), 0.0), 2)})

    payoff_order = [
        {
            "debt_id": did,
            "name": name[did],
            "payoff_month": payoff_month.get(did, -1),
            "interest_paid": round(interest_paid_per_debt[did], 2),
        }
        for did in sorted(payoff_month, key=lambda k: payoff_month[k])
    ]

    return {
        "strategy": strategy,
        "months_to_debt_free": month if sum(remaining.values()) <= 0.01 else -1,
        "total_interest_paid": round(total_interest, 2),
        "total_paid": round(total_paid, 2),
        "timeline": timeline,
        "payoff_order": payoff_order,
    }
