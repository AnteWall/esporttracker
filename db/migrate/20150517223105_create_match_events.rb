class CreateMatchEvents < ActiveRecord::Migration
  def change
    create_table :match_events do |t|
      t.string :log

      t.timestamps null: false
    end
  end
end
