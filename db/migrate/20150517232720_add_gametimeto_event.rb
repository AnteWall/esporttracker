class AddGametimetoEvent < ActiveRecord::Migration
  def change
    add_column :match_events, :log_time, :datetime
  end
end
