class Api::TransactionsController < ApplicationController
  before_action :require_non_demo!, only: [ :create, :destroy ]

  def index
    transactions = current_user.transactions

    if params[:search].present?
      transactions = transactions.where("name LIKE ?", "%#{params[:search]}%")
    end

    if params[:category].present? && params[:category] != "All"
      transactions = transactions.where(category: params[:category])
    end

    case params[:sort]
    when "latest"   then transactions = transactions.order(date: :desc)
    when "oldest"   then transactions = transactions.order(date: :asc)
    when "a_to_z"   then transactions = transactions.order(name: :asc)
    when "z_to_a"   then transactions = transactions.order(name: :desc)
    when "highest"  then transactions = transactions.order(amount: :desc)
    when "lowest"   then transactions = transactions.order(amount: :asc)
    else                 transactions = transactions.order(date: :desc)
    end

    page = (params[:page] || 1).to_i
    per_page = 10
    total = transactions.count
    transactions = transactions.offset((page - 1) * per_page).limit(per_page)

    render json: {
      transactions: transactions,
      meta: { total: total, page: page, per_page: per_page, total_pages: (total.to_f / per_page).ceil }
    }
  end

  def show
    transaction = current_user.transactions.find(params[:id])
    render json: transaction
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Transaction not found" }, status: :not_found
  end

  def create
    transaction = current_user.transactions.build(transaction_params)
    if transaction.save
      render json: transaction, status: :created
    else
      render json: { errors: transaction.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    transaction = current_user.transactions.find(params[:id])
    transaction.destroy
    head :no_content
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Transaction not found" }, status: :not_found
  end

  def recurring
    bills = current_user.transactions.where(recurring: true)

    case params[:sort]
    when "a_to_z"   then bills = bills.order(name: :asc)
    when "z_to_a"   then bills = bills.order(name: :desc)
    when "highest"  then bills = bills.order(amount: :asc)
    when "lowest"   then bills = bills.order(amount: :desc)
    else                 bills = bills.order(date: :desc)
    end

    bills = bills.where("name LIKE ?", "%#{params[:search]}%") if params[:search].present?

    # Deduplicate by name, keeping the most recent
    unique_bills = bills.to_a.uniq(&:name)

    # Latest overall transaction date to determine "due soon" (within 5 days)
    latest_date = current_user.transactions.maximum(:date)

    result = unique_bills.map do |bill|
      day_of_month = bill.date.day
      paid = current_user.transactions
                         .where(name: bill.name, recurring: true)
                         .where("date >= ? AND date < ?", latest_date.beginning_of_month, latest_date.next_month.beginning_of_month)
                         .exists?

      due_date = Date.new(latest_date.year, latest_date.month, [ day_of_month, Date.new(latest_date.year, latest_date.month, -1).day ].min)
      due_soon = !paid && due_date >= latest_date && due_date <= latest_date + 5.days

      {
        id: bill.id,
        name: bill.name,
        amount: bill.amount,
        date: bill.date,
        avatar: bill.avatar,
        recurring: bill.recurring,
        category: bill.category,
        paid: paid,
        due_soon: due_soon,
        day_of_month: day_of_month
      }
    end

    render json: result
  end

  private

  def transaction_params
    params.require(:transaction).permit(:name, :amount, :category, :date, :recurring, :avatar)
  end
end
