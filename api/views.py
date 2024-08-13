from django.http import JsonResponse
from rest_framework.views import APIView
import numpy as np
import scipy.optimize as opt

class OptimalLivingAPIView(APIView):
    def post(self, request):
        data = request.data
        initial_income = float(data.get('initial_income', 50000))
        wage_increase_pct = float(data.get('wage_increase_pct', 5))
        years = int(data.get('years', 1))
        initial_credit_pct = float(data.get('initial_credit_pct', 100))
        max_credit_utilization = float(data.get('max_credit_utilization', 100))
        interest_rate = float(data.get('interest_rate', 15))
        max_diff = float(data.get('max_diff', 0.01))
        initial_debt = float(data.get('initial_debt', 0))

        # Linear programming logic
        monthly_interest_rate = (1 + interest_rate / 100) ** (1 / 12) - 1
        monthly_income_years = calculate_monthly_income_years(initial_income, wage_increase_pct, years)
        annual_income_years = [initial_income * (1 + wage_increase_pct / 100) ** i for i in range(years)]
        annual_credit_limits = calculate_annual_credit_limits(annual_income_years, initial_credit_pct)
        num_months = len(monthly_income_years)
        num_vars = 2 * num_months + (num_months - 1)
        c = np.zeros(num_vars)
        c[:num_months] = -1
        A_eq = np.zeros((num_months, num_vars))
        b_eq = np.zeros(num_months)
        A_eq[0, num_months] = 1
        A_eq[0, 0] = -monthly_income_years[0]
        b_eq[0] = initial_debt * (1 + monthly_interest_rate)

        for i in range(1, num_months):
            A_eq[i, num_months + i] = 1
            A_eq[i, num_months + i - 1] = -1 * (1 + monthly_interest_rate)
            A_eq[i, i] = -monthly_income_years[i]
            b_eq[i] = 0

        A_ub = np.zeros((num_months, num_vars))
        b_ub = np.zeros(num_months)
        for i in range(num_months):
            annual_limit_index = i // 12
            annual_credit_limit = annual_credit_limits[annual_limit_index] * (max_credit_utilization / 100)
            A_ub[i, num_months + i] = 1
            b_ub[i] = annual_credit_limit

        for i in range(num_months - 1):
            A_ub = np.vstack([A_ub, np.zeros(num_vars)])
            A_ub[-1, i] = -1
            A_ub[-1, i + 1] = 1
            A_ub[-1, 2 * num_months + i] = -1
            b_ub = np.append(b_ub, 0)
            A_ub = np.vstack([A_ub, np.zeros(num_vars)])
            A_ub[-1, i] = 1
            A_ub[-1, i + 1] = -1
            A_ub[-1, 2 * num_months + i] = -1
            b_ub = np.append(b_ub, 0)
            A_ub = np.vstack([A_ub, np.zeros(num_vars)])
            A_ub[-1, 2 * num_months + i] = 1
            b_ub = np.append(b_ub, max_diff)

        bounds = [(None, None)] * num_months + [(0, None)] * num_months + [(None, None)] * (num_months - 1)
        res = opt.linprog(c, A_ub=A_ub, b_ub=b_ub, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
        optimal_spending_factors = res.x[:num_months]
        monthly_spending = []
        monthly_interest = []
        monthly_debt = []
        monthly_goods_spending = []
        debt = initial_debt

        for month, income in enumerate(monthly_income_years):
            goods_spending = (1 + optimal_spending_factors[month]) * income
            interest = debt * monthly_interest_rate
            new_debt = goods_spending - income + interest
            debt = debt + new_debt
            monthly_interest.append(interest)
            monthly_debt.append(debt)
            monthly_goods_spending.append(goods_spending)
            monthly_spending.append(goods_spending + interest)

        return JsonResponse({
            "optimal_spending_factors": optimal_spending_factors.tolist(),
            "monthly_spending": monthly_spending,
            "monthly_goods_spending": monthly_goods_spending,
            "monthly_interest": monthly_interest,
            "monthly_debt": monthly_debt,
            "monthly_income_years": monthly_income_years,
            "annual_credit_limits": annual_credit_limits
        })

def calculate_monthly_income_years(initial_income, wage_increase_pct, years):
    monthly_income_years = []
    for year in range(years):
        annual_income = initial_income * (1 + wage_increase_pct / 100) ** year
        monthly_income = annual_income / 12
        monthly_income_years.extend([monthly_income] * 12)
    return monthly_income_years

def calculate_annual_credit_limits(income_years, initial_credit_pct):
    return [income * (initial_credit_pct / 100) for income in income_years]
