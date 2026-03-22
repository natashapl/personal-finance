class ApplicationController < ActionController::API
  before_action :authenticate_user!

  private

  def authenticate_user!
    token = extract_token
    return render json: { error: "Unauthorized" }, status: :unauthorized unless token

    decoded = JsonWebToken.decode(token)
    return render json: { error: "Invalid or expired token" }, status: :unauthorized unless decoded

    @current_user = User.find_by(id: decoded[:user_id])
    render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
  end

  def current_user
    @current_user
  end

  def demo_user?
    current_user&.is_demo?
  end

  def require_non_demo!
    render json: { error: "Demo account is read-only" }, status: :forbidden if demo_user?
  end

  def extract_token
    header = request.headers["Authorization"]
    return nil unless header&.start_with?("Bearer ")

    header.split(" ").last
  end
end
