class Budget < ApplicationRecord
  belongs_to :user

  validates :category, presence: true
  validates :max_amount, presence: true, numericality: { greater_than: 0 }
  validates :theme_color, presence: true

  def as_json(options = {})
    super(options).merge("max_amount" => max_amount.to_f)
  end
end
