class CreateTransactions < ActiveRecord::Migration[8.1]
  def change
    create_table :transactions do |t|
      t.string :name
      t.decimal :amount
      t.string :category
      t.date :date
      t.string :avatar
      t.boolean :recurring

      t.timestamps
    end
  end
end
