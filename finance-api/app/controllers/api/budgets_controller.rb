class Api::BudgetsController < ApplicationController
  before_action :require_non_demo!, only: [ :create, :update, :destroy ]

  def index
    budgets = current_user.budgets.all

    result = budgets.map do |budget|
      latest_transactions = current_user.transactions
                                        .where(category: budget.category)
                                        .order(date: :desc)
                                        .limit(3)
      spent = current_user.transactions
                          .where(category: budget.category)
                          .where("amount < 0")
                          .sum(:amount).abs
      {
        id: budget.id,
        category: budget.category,
        max_amount: budget.max_amount.to_f,
        theme_color: budget.theme_color,
        spent: spent.round(2).to_f,
        latest_transactions: latest_transactions
      }
    end

    render json: result
  end

  def create
    budget = current_user.budgets.new(budget_params)
    if budget.save
      render json: budget, status: :created
    else
      render json: { errors: budget.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    budget = current_user.budgets.find(params[:id])
    if budget.update(budget_params)
      render json: budget
    else
      render json: { errors: budget.errors.full_messages }, status: :unprocessable_entity
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Budget not found" }, status: :not_found
  end

  def destroy
    budget = current_user.budgets.find(params[:id])
    budget.destroy
    render json: { message: "Budget deleted" }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Budget not found" }, status: :not_found
  end

  private

  def budget_params
    params.require(:budget).permit(:category, :max_amount, :theme_color)
  end
end
