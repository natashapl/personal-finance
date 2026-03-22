Rails.application.routes.draw do
  namespace :api do
    # Auth
    post   "auth/login",   to: "auth#login"
    post   "auth/signup",  to: "auth#signup"
    post   "auth/demo",    to: "auth#demo"
    get    "auth/me",      to: "auth#me"

    # Resources
    resources :transactions, only: [ :index, :show, :create, :destroy ] do
      collection do
        get :recurring
      end
    end
    resources :budgets, only: [ :index, :create, :update, :destroy ]
    resources :pots, only: [ :index, :create, :update, :destroy ]
    get "overview", to: "overview#index"
  end
end
