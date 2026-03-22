class Api::AuthController < ApplicationController
  skip_before_action :authenticate_user!, only: [ :login, :signup, :demo ]

  def login
    user = User.find_by(email: params[:email]&.downcase)

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      render json: { token: token, user: user_json(user) }
    else
      render json: { error: "Invalid email or password" }, status: :unauthorized
    end
  end

  def signup
    user = User.new(
      name: params[:name],
      email: params[:email],
      password: params[:password],
      password_confirmation: params[:password]
    )

    if user.save
      token = JsonWebToken.encode(user_id: user.id)
      render json: { token: token, user: user_json(user) }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def demo
    user = User.find_by(is_demo: true)
    return render json: { error: "Demo account not configured" }, status: :not_found unless user

    token = JsonWebToken.encode(user_id: user.id)
    render json: { token: token, user: user_json(user) }
  end

  def me
    render json: { user: user_json(current_user) }
  end

  private

  def user_json(user)
    { id: user.id, name: user.name, email: user.email, is_demo: user.is_demo }
  end

  def seed_demo_data_for(user)
    demo_user = User.find_by(is_demo: true)
    return unless demo_user

    demo_user.transactions.each do |t|
      user.transactions.create!(
        name: t.name, amount: t.amount, category: t.category,
        date: t.date, avatar: t.avatar, recurring: t.recurring
      )
    end

    demo_user.budgets.each do |b|
      user.budgets.create!(
        category: b.category, max_amount: b.max_amount, theme_color: b.theme_color
      )
    end

    demo_user.pots.each do |p|
      user.pots.create!(
        name: p.name, target_amount: p.target_amount,
        saved_amount: p.saved_amount, theme_color: p.theme_color
      )
    end
  end
end
