class CreateMatches < ActiveRecord::Migration
  def change
    create_table :matches do |t|
      t.string :log_path
      t.datetime :start_time

      t.timestamps null: false
    end
  end
end
