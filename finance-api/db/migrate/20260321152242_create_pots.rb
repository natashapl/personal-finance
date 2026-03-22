class CreatePots < ActiveRecord::Migration[8.1]
  def change
    create_table :pots do |t|
      t.string :name
      t.decimal :target_amount
      t.decimal :saved_amount
      t.string :theme_color

      t.timestamps
    end
  end
end
