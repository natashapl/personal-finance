class CreateBudgets < ActiveRecord::Migration[8.1]
  def change
    create_table :budgets do |t|
      t.string :category
      t.decimal :max_amount
      t.string :theme_color

      t.timestamps
    end
  end
end
