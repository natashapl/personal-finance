class Api::PotsController < ApplicationController
  before_action :require_non_demo!, only: [ :create, :update, :destroy ]

  def index
    render json: current_user.pots.all
  end

  def create
    pot = current_user.pots.new(pot_params)
    if pot.save
      render json: pot, status: :created
    else
      render json: { errors: pot.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    pot = current_user.pots.find(params[:id])

    if params[:add_amount].present?
      pot.saved_amount += params[:add_amount].to_f
      pot.save ? render(json: pot) : render(json: { errors: pot.errors.full_messages }, status: :unprocessable_entity)
    elsif params[:withdraw_amount].present?
      new_amount = pot.saved_amount - params[:withdraw_amount].to_f
      if new_amount < 0
        render json: { error: "Cannot withdraw more than saved amount" }, status: :unprocessable_entity
      else
        pot.saved_amount = new_amount
        pot.save ? render(json: pot) : render(json: { errors: pot.errors.full_messages }, status: :unprocessable_entity)
      end
    else
      pot.update(pot_params) ? render(json: pot) : render(json: { errors: pot.errors.full_messages }, status: :unprocessable_entity)
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Pot not found" }, status: :not_found
  end

  def destroy
    pot = current_user.pots.find(params[:id])
    pot.destroy
    render json: { message: "Pot deleted" }
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Pot not found" }, status: :not_found
  end

  private

  def pot_params
    params.require(:pot).permit(:name, :target_amount, :saved_amount, :theme_color)
  end
end
