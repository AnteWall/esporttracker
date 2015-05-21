class AddMatchToMatchEvent < ActiveRecord::Migration
  def change
    add_column :match_events, :match_id, :integer
  end
end
