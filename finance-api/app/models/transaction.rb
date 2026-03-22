class Transaction < ApplicationRecord
  belongs_to :user

  validates :name, presence: true
  validates :amount, presence: true, numericality: true
  validates :category, presence: true
  validates :date, presence: true

  def as_json(options = {})
    super(options).merge("amount" => amount.to_f)
  end
end
