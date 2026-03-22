class Api::OverviewController < ApplicationController
  def index
    user_transactions = current_user.transactions

    total_income   = user_transactions.where("amount > 0").sum(:amount)
    total_expenses = user_transactions.where("amount < 0").sum(:amount).abs
    current_balance = total_income - total_expenses

    latest_transactions = user_transactions.order(date: :desc).limit(5)

    budgets = current_user.budgets.map do |budget|
      spent = user_transactions.where(category: budget.category)
                               .where("amount < 0")
                               .sum(:amount).abs
      { id: budget.id, category: budget.category, max_amount: budget.max_amount.to_f,
        theme_color: budget.theme_color, spent: spent.round(2).to_f }
    end

    pots = current_user.pots.all
    total_saved = pots.sum(:saved_amount)

    latest_date = user_transactions.maximum(:date)
    recurring = current_user.transactions.where(recurring: true).order(date: :desc)
    unique_recurring = recurring.to_a.uniq(&:name)

    paid_total = 0
    upcoming_total = 0
    due_soon_total = 0

    unique_recurring.each do |bill|
      next unless bill.amount < 0

      day_of_month = bill.date.day
      paid = user_transactions
               .where(name: bill.name, recurring: true)
               .where("date >= ? AND date < ?", latest_date.beginning_of_month, latest_date.next_month.beginning_of_month)
               .exists?

      if paid
        paid_total += bill.amount.abs
      else
        upcoming_total += bill.amount.abs
        due_date = Date.new(latest_date.year, latest_date.month, [ day_of_month, Date.new(latest_date.year, latest_date.month, -1).day ].min)
        due_soon_total += bill.amount.abs if due_date >= latest_date && due_date <= latest_date + 5.days
      end
    end

    render json: {
      balance: {
        current: current_balance.round(2),
        income: total_income.round(2),
        expenses: total_expenses.round(2)
      },
      latest_transactions: latest_transactions,
      budgets: budgets,
      pots: { total_saved: total_saved.round(2), pots: pots },
      recurring_bills: {
        paid: paid_total.round(2),
        upcoming: upcoming_total.round(2),
        due_soon: due_soon_total.round(2)
      }
    }
  end
end
