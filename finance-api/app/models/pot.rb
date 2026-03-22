class Pot < ApplicationRecord
  belongs_to :user

  attribute :saved_amount, :decimal, default: 0

  validates :name, presence: true
  validates :target_amount, presence: true, numericality: { greater_than: 0 }
  validates :saved_amount, numericality: { greater_than_or_equal_to: 0 }
  validates :theme_color, presence: true

  def as_json(options = {})
    super(options).merge(
      "saved_amount" => saved_amount.to_f,
      "target_amount" => target_amount.to_f
    )
  end
end
