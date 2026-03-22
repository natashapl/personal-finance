class User < ApplicationRecord
  has_secure_password

  has_many :budgets, dependent: :destroy
  has_many :pots, dependent: :destroy
  has_many :transactions, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, if: -> { password.present? }

  before_save { self.email = email.downcase }
end
