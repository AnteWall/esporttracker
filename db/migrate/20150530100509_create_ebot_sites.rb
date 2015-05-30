class CreateEbotSites < ActiveRecord::Migration
  def change
    create_table :ebot_sites do |t|
      t.string :url

      t.timestamps null: false
    end
  end
end
